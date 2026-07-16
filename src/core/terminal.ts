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

const PROMPT = "visitor@lucenity:~$";

const VARIANT_CLASS: Record<LineVariant, string> = {
  default: "terminal__line",
  dim: "terminal__line terminal__line--dim",
  sub: "terminal__line terminal__line--sub",
};

export class Terminal implements ITerminal {
  private readonly scrollEl: HTMLElement;
  private readonly inputRow: HTMLElement;
  private readonly inputEl: HTMLInputElement;
  private readonly ghostText: Text;
  private readonly registry: CommandRegistry;
  private readonly windows: WindowManager;

  private readonly history: string[] = [];
  private historyIndex = 0;
  private busy = false;

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
      default:
        if (e.key === "l" && e.ctrlKey) {
          e.preventDefault();
          this.clear();
        }
    }
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

  private async submit(raw: string): Promise<void> {
    const line = raw.trim();
    this.echoPrompt(raw);
    this.inputEl.value = "";
    this.renderGhost();
    if (line === "") return;

    this.history.push(line);
    this.historyIndex = this.history.length;

    const parts = line.split(/\s+/);
    const name = parts[0] ?? "";
    const args = parts.slice(1);
    const cmd = this.registry.get(name);

    if (!cmd) {
      this.print(`command not found: ${name} — type \`help\``, "dim");
      return;
    }

    this.setBusy(true);
    try {
      await cmd.run({ terminal: this, windows: this.windows, args, raw: line });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.print(`error: ${msg}`, "dim");
    } finally {
      this.setBusy(false);
      this.focusInput();
    }
  }
}
