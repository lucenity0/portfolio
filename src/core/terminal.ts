/* ------------------------------------------------------------------ *
 * terminal — the always-present command surface. Builds its own DOM,
 * captures input, keeps a command history, and dispatches lines to the
 * CommandRegistry. Output is printed to a scrollback above the prompt.
 *
 * Implements the `Terminal` contract (types.ts) that commands depend on,
 * plus a few extras (typeLine) used by the boot sequence.
 * ------------------------------------------------------------------ */

import type {
  LineVariant,
  Terminal as ITerminal,
  WindowManager,
} from "@/types";
import type { CommandRegistry } from "@/core/command-registry";
import { typewriter } from "@/core/fx";
import { parseFlags, tokenize } from "@/core/parse-command";

const PROMPT = "visitor@lucenity:~$";
const HISTORY_KEY = "lucenity:history";
const HISTORY_CAP = 200;

const VARIANT_CLASS: Record<LineVariant, string> = {
  default: "terminal__line",
  dim: "terminal__line terminal__line--dim",
  sub: "terminal__line terminal__line--sub",
};

function longestCommonPrefix(words: string[]): string {
  if (words.length === 0) return "";
  let prefix = words[0]!;
  for (const w of words.slice(1)) {
    while (!w.startsWith(prefix)) prefix = prefix.slice(0, -1);
    if (prefix === "") break;
  }
  return prefix;
}

/**
 * Damerau-Levenshtein distance (optimal string alignment): like Levenshtein
 * but an adjacent-character swap costs 1, not 2. Command-name typos are
 * overwhelmingly transpositions ("hlep" → "help"), so this matters — plain
 * Levenshtein would price those out of a tight typo budget.
 */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) d[i]![0] = i;
  for (let j = 0; j <= b.length; j++) d[0]![j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(
        d[i - 1]![j]! + 1,
        d[i]![j - 1]! + 1,
        d[i - 1]![j - 1]! + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, d[i - 2]![j - 2]! + 1);
      }
      d[i]![j] = v;
    }
  }
  return d[a.length]![b.length]!;
}

/** The closest known name to `word` within a small typo budget, or null. */
function closestMatch(word: string, candidates: string[]): string | null {
  if (word.length < 2) return null;
  const budget = word.length >= 6 ? 2 : 1;
  let best: { name: string; dist: number } | null = null;
  for (const c of candidates) {
    const d = editDistance(word, c, budget);
    if (d <= budget && (!best || d < best.dist)) best = { name: c, dist: d };
  }
  return best?.name ?? null;
}

/** Read persisted command history from localStorage (empty on any failure). */
function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

/** Persist command history (best-effort — private mode/quota can throw). */
function saveHistory(history: string[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // storage unavailable — history just won't survive a reload
  }
}

export class Terminal implements ITerminal {
  private readonly scrollEl: HTMLElement;
  private readonly inputRow: HTMLElement;
  private readonly inputEl: HTMLInputElement;
  private readonly ghostText: Text;
  private readonly registry: CommandRegistry;
  private readonly windows: WindowManager;

  private history: string[] = [];
  private historyIndex = 0;
  private busy = false;

  /** Fires with the live input length on every input change (cat hooks). */
  onTyping?: (len: number) => void;
  /** Fires when a line is submitted (or the input is cleared by submit). */
  onSend?: () => void;
  /** Fires when the scrollback is cleared (`clear` command / Ctrl+L). */
  onClear?: () => void;

  constructor(
    mount: HTMLElement,
    registry: CommandRegistry,
    windows: WindowManager,
  ) {
    this.registry = registry;
    this.windows = windows;

    const container = document.createElement("div");
    container.className = "terminal";

    const surface = document.createElement("div");
    surface.className = "terminal__surface";

    const scroll = document.createElement("div");
    scroll.className = "terminal__scroll";
    scroll.setAttribute("role", "log");
    scroll.setAttribute("aria-live", "polite");

    // --- live input row: prompt + ghost(text + caret) + real input ---
    const row = document.createElement("div");
    row.className = "terminal__input-row";

    const prompt = document.createElement("span");
    prompt.className = "terminal__prompt";
    prompt.textContent = PROMPT;

    const field = document.createElement("span");
    field.className = "terminal__field";

    const ghost = document.createElement("span");
    ghost.className = "terminal__ghost";
    const ghostText = document.createTextNode("");
    const caret = document.createElement("span");
    caret.className = "caret";
    ghost.append(ghostText, caret);

    const input = document.createElement("input");
    input.className = "terminal__input";
    input.type = "text";
    input.setAttribute("aria-label", "terminal input");
    input.autocomplete = "off";
    input.autocapitalize = "off";
    input.spellcheck = false;

    field.append(ghost, input);
    row.append(prompt, field);
    scroll.append(row);
    surface.append(scroll);
    container.append(surface);
    mount.append(container);

    this.scrollEl = scroll;
    this.inputRow = row;
    this.inputEl = input;
    this.ghostText = ghostText;

    this.history = loadHistory();
    this.historyIndex = this.history.length;

    // --- wiring ---
    input.addEventListener("input", () => this.renderGhost());
    input.addEventListener("keydown", (e) => this.onKeydown(e));
    surface.addEventListener("click", () => {
      // Don't steal focus mid-selection of printed output.
      if ((window.getSelection()?.toString() ?? "") !== "") return;
      this.focusInput();
    });
    // Keep the terminal "always ready": if focus drifts to the empty desktop
    // and the user starts typing, pull focus back. Leaves window/iframe
    // inputs and browser shortcuts (⌘/ctrl/alt combos) untouched.
    document.addEventListener("keydown", (e) => {
      // Ctrl+]/Ctrl+[ cycle window focus — punch through before the
      // modifier-key guard below (which exists for a different purpose:
      // not stealing focus during OS/browser chords typed elsewhere).
      if (e.ctrlKey && (e.key === "]" || e.key === "[")) {
        e.preventDefault();
        this.windows.cycle(e.key === "]" ? 1 : -1);
        return;
      }
      if (this.busy || e.metaKey || e.ctrlKey || e.altKey) return;
      const active = document.activeElement;
      if (active === this.inputEl) return;
      if (active instanceof Element && active.closest(".window")) return;
      if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") {
        this.focusInput();
      }
    });

    this.renderGhost();
  }

  // ---- Terminal contract ----

  print(text = "", variant: LineVariant = "default"): void {
    const el = this.makeLine(variant);
    el.textContent = text;
    this.insertLine(el);
  }

  printEl(el: HTMLElement): void {
    this.insertLine(el);
  }

  clear(): void {
    for (const child of [...this.scrollEl.children]) {
      if (child !== this.inputRow) child.remove();
    }
    this.onClear?.();
  }

  focusInput(): void {
    this.inputEl.focus();
  }

  // ---- extras used by the boot sequence ----

  /** Type a line character-by-character (reduced-motion aware). */
  async typeLine(text: string, variant: LineVariant = "default"): Promise<void> {
    const el = this.makeLine(variant);
    this.insertLine(el);
    await typewriter(el, text, { speed: 12 });
    this.scrollToBottom();
  }

  /** Lock/unlock input (used while the boot sequence runs). */
  setBusy(busy: boolean): void {
    this.busy = busy;
    this.inputEl.disabled = busy;
  }

  echoPrompt(text: string): void {
    const el = this.makeLine("default");
    const p = document.createElement("span");
    p.className = "terminal__prompt";
    p.textContent = `${PROMPT} `;
    el.append(p, document.createTextNode(text));
    this.insertLine(el);
  }

  // ---- internals ----

  private makeLine(variant: LineVariant): HTMLElement {
    const el = document.createElement("div");
    el.className = VARIANT_CLASS[variant];
    return el;
  }

  private insertLine(el: HTMLElement): void {
    this.scrollEl.insertBefore(el, this.inputRow);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
  }

  private renderGhost(): void {
    this.ghostText.textContent = this.inputEl.value;
    this.onTyping?.(this.inputEl.value.length);
  }

  private onKeydown(e: KeyboardEvent): void {
    if (this.busy) {
      e.preventDefault();
      return;
    }
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        void this.submit(this.inputEl.value);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.recallHistory(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        this.recallHistory(1);
        break;
      case "Tab":
        e.preventDefault();
        this.handleTab();
        break;
      default:
        if (e.key === "l" && e.ctrlKey) {
          e.preventDefault();
          this.clear();
        }
    }
  }

  /** Record a submitted line: de-dupe consecutive repeats, cap length, persist. */
  private pushHistory(line: string): void {
    if (this.history[this.history.length - 1] !== line) {
      this.history.push(line);
      if (this.history.length > HISTORY_CAP) {
        this.history = this.history.slice(this.history.length - HISTORY_CAP);
      }
      saveHistory(this.history);
    }
    this.historyIndex = this.history.length;
  }

  private recallHistory(dir: -1 | 1): void {
    if (this.history.length === 0) return;
    this.historyIndex = Math.min(
      Math.max(this.historyIndex + dir, 0),
      this.history.length,
    );
    const val = this.history[this.historyIndex] ?? "";
    this.inputEl.value = val;
    this.renderGhost();
    const end = val.length;
    this.inputEl.setSelectionRange(end, end);
  }

  /**
   * Bash-style completion. Only handles the caret-at-end-of-input case
   * (mid-line completion is real-shell behavior, out of scope here).
   */
  private handleTab(): void {
    const value = this.inputEl.value;
    const parts = tokenize(value);
    const trailingSpace = /\s$/.test(value);
    const completingFirst = parts.length === 0 || (parts.length === 1 && !trailingSpace);
    const partial = trailingSpace ? "" : (parts[parts.length - 1] ?? "");

    let pool: string[];
    if (completingFirst) {
      pool = this.registry.visible().map((c) => c.name);
    } else {
      const cmd = this.registry.get(parts[0] ?? "");
      if (!cmd?.complete) return;
      const argsSoFar = trailingSpace ? parts.slice(1) : parts.slice(1, -1);
      pool = cmd.complete(argsSoFar);
    }

    const candidates = pool.filter((c) => c.startsWith(partial)).sort();
    if (candidates.length === 0) return;

    if (candidates.length === 1) {
      const completed = candidates[0]!;
      const base = completingFirst
        ? []
        : trailingSpace
          ? parts
          : parts.slice(0, -1);
      this.setInput([...base, completed].join(" ") + " ");
      return;
    }

    const lcp = longestCommonPrefix(candidates);
    if (lcp.length > partial.length) {
      const base = completingFirst
        ? []
        : trailingSpace
          ? parts
          : parts.slice(0, -1);
      this.setInput([...base, lcp].join(" "));
      return;
    }

    this.print(candidates.join("  "), "dim");
  }

  private setInput(value: string): void {
    this.inputEl.value = value;
    this.renderGhost();
    const end = value.length;
    this.inputEl.setSelectionRange(end, end);
  }

  private async submit(raw: string): Promise<void> {
    const line = raw.trim();
    this.echoPrompt(raw);
    this.inputEl.value = "";
    this.renderGhost();
    this.onSend?.();
    if (line === "") return;

    this.pushHistory(line);

    const parts = tokenize(line);
    if (parts.length === 0) return;
    // Accept an optional leading slash, so `/liffy` works like `liffy`.
    const name = (parts[0] ?? "").replace(/^\//, "");
    const { args, flags } = parseFlags(parts.slice(1));
    const cmd = this.registry.get(name);

    if (!cmd) {
      const suggestion = closestMatch(
        name,
        this.registry.visible().map((c) => c.name),
      );
      this.print(
        suggestion
          ? `command not found: ${name} — did you mean \`${suggestion}\`?`
          : `command not found: ${name} — type \`help\``,
        "dim",
      );
      return;
    }

    this.setBusy(true);
    try {
      await cmd.run({ terminal: this, windows: this.windows, args, flags, raw: line });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.print(`error: ${msg}`, "dim");
    } finally {
      this.setBusy(false);
      this.focusInput();
    }
  }
}
