/* ------------------------------------------------------------------ *
 * liffy — the persona chatbot window. Reads like a Claude-CLI chat
 * (`you>` / `liffy>`), grounded only in liffy.md via the RetrievalEngine.
 * The engine is behind the LiffyEngine interface, so a real Claude
 * backend can replace it later without touching this UI.
 *
 * The cat rides along as a CatCompanion: awake while idle, retreats to
 * the top-left and naps while you type, squints while liffy thinks,
 * head-bobs while the reply types out. Feed it via the meter; it also
 * hides a few easter eggs (meow, cookie, pet, stare).
 * ------------------------------------------------------------------ */

import type { CommandContext } from "@/types";
import type { ChatTurn, LiffyEngine } from "@/core/liffy/engine";
import { RetrievalEngine } from "@/core/liffy/retrieval";
import { CatCompanion } from "@/core/cat-companion";
import { prefersReducedMotion, sleep, startSpinner, typewriter } from "@/core/fx";
import liffyMd from "@/data/liffy.md?raw";

// One engine instance for the session (parses the MD once).
let engine: LiffyEngine | null = null;
const getEngine = (): LiffyEngine => (engine ??= new RetrievalEngine(liffyMd));

const GREETING =
  'hey, i\'m liffy — nafees\'s lil terminal sidekick. ask me anything about him. try: "what does he build?"';

const MEOW_RE = /^me+o+w+[\s.!?~]*$/i;
const COOKIE_RE = /\b(cookie|treat)\b/i;
const MEOW_REPLY =
  "meow. mrrp. purrrr. (translation: hi. i like you. bring snacks.)";

export function openLiffy(ctx: CommandContext): void {
  const eng = getEngine();
  const history: ChatTurn[] = [];
  let busy = false;

  const root = document.createElement("div");
  root.className = "liffy";

  const log = document.createElement("div");
  log.className = "liffy__log";
  log.setAttribute("role", "log");
  log.setAttribute("aria-live", "polite");

  const form = document.createElement("form");
  form.className = "liffy__inputrow";
  const promptEl = document.createElement("span");
  promptEl.className = "liffy__prompt";
  promptEl.textContent = "you>";
  const input = document.createElement("input");
  input.className = "liffy__input";
  input.type = "text";
  input.setAttribute("aria-label", "ask liffy");
  input.autocomplete = "off";
  input.autocapitalize = "off";
  input.spellcheck = false;
  form.append(promptEl, input);

  root.append(log, form);

  const scroll = () => {
    log.scrollTop = log.scrollHeight;
  };

  const addLine = (who: string, whoClass: string): HTMLElement => {
    const line = document.createElement("div");
    line.className = "liffy__line";
    const w = document.createElement("span");
    w.className = `liffy__who ${whoClass}`;
    w.textContent = who;
    const text = document.createElement("span");
    text.className = "liffy__text";
    line.append(w, text);
    log.append(line);
    scroll();
    return text;
  };

  const say = async (text: string): Promise<void> => {
    const el = addLine("liffy>", "liffy__who--bot");
    if (prefersReducedMotion()) {
      el.textContent = text;
    } else {
      // Type faster as answers get longer, so a full topic never crawls.
      const speed = text.length > 320 ? 4 : text.length > 160 ? 6 : 9;
      await typewriter(el, text, { speed });
    }
    scroll();
  };

  // Claude-CLI-style pondering verbs, cycled per question.
  const VERBS = [
    "thinking",
    "pondering",
    "purring",
    "consulting the cat",
    "rummaging through notes",
    "recalling",
  ];
  let verbIdx = 0;

  const ask = async (q: string): Promise<void> => {
    if (busy) return;
    busy = true;
    input.disabled = true;
    addLine("you>", "liffy__who--user").textContent = q;
    history.push({ role: "user", text: q });

    // meow → answered on instinct, no retrieval involved.
    if (MEOW_RE.test(q)) {
      const receipt = addLine("", "liffy__who--bot");
      receipt.classList.add("liffy__thinking");
      receipt.textContent = "✳ thought for 0.0s (instinct)";
      history.push({ role: "liffy", text: MEOW_REPLY });
      companion.hop();
      await say(MEOW_REPLY);
      busy = false;
      input.disabled = false;
      input.focus();
      return;
    }

    // A visible beat of "thinking" — spinner line that collapses into a
    // dim "✳ thought for X.Xs" receipt, like a real agent CLI. The cat
    // squints along with it, then head-bobs while the reply types.
    const thinkEl = addLine("", "liffy__who--bot");
    thinkEl.classList.add("liffy__thinking");
    const spin = startSpinner(thinkEl, VERBS[verbIdx++ % VERBS.length]!);
    companion.think(true);
    if (!prefersReducedMotion()) await sleep(650 + Math.random() * 750);
    const reply = await eng.ask(q, history);
    const secs = spin.stop();
    companion.think(false);
    thinkEl.textContent = `✳ thought for ${Math.max(secs, 0.1).toFixed(1)}s`;

    history.push({ role: "liffy", text: reply.text });
    companion.bob(true);
    await say(reply.text);
    companion.bob(false);
    busy = false;
    input.disabled = false;
    input.focus();
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q || busy) return;
    input.value = "";
    companion.onSend();
    void ask(q);
  });

  const win = ctx.windows.open({
    id: "liffy",
    title: "liffy — ask about nafees",
    content: root,
    width: 520,
    height: 420,
  });
  win.bodyEl.style.padding = "0";

  // The cat rides along: awake by the greeting, napping once you type.
  const companion = new CatCompanion({
    mount: root,
    mode: "liffy",
    idleFrame: "awake",
  });
  input.addEventListener("input", () => {
    const v = input.value;
    if (COOKIE_RE.test(v)) companion.fillNow();
    else companion.onTyping(v.length);
  });

  void say(GREETING);
  window.setTimeout(() => input.focus(), 60);
  ctx.terminal.print("opened: liffy", "dim");
}
