/* ------------------------------------------------------------------ *
 * main — boot the desktop. Wires the window manager, command registry,
 * and terminal together, runs the startup sequence, and manages the
 * tty ⇄ gui shell modes (terminal page vs. CRT monitor with a
 * point-and-click OS inside).
 * ------------------------------------------------------------------ */

import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/rig.css";
import "@/styles/terminal.css";
import "@/styles/window.css";
import "@/styles/apps.css";
import "@/styles/liffy.css";
import "@/styles/hero.css";
import "@/styles/gui.css";

import type { CommandContext } from "@/types";
import { CommandRegistry } from "@/core/command-registry";
import { DesktopWindowManager } from "@/core/window-manager";
import { Terminal } from "@/core/terminal";
import { runBootSequence } from "@/core/boot";
import { mountHero } from "@/core/hero";
import { ModeManager } from "@/core/mode";
import { mountViewportTracking } from "@/core/viewport";
import { buildCommands } from "@/data/commands";
import { mountGuiDesktop, type GuiDesktop } from "@/apps/gui-desktop";

const mount = document.getElementById("app");
if (!mount) {
  throw new Error("#app mount element not found");
}

// Publish visual-viewport geometry before anything lays out against it.
mountViewportTracking();

const windows = new DesktopWindowManager(mount);
const registry = new CommandRegistry();
registry.registerAll(buildCommands());

const terminal = new Terminal(mount, registry, windows);

/* ---- shell modes --------------------------------------------------- */

const mode = new ModeManager();

// A bare context for GUI icons/menu — they open the same app windows the
// terminal commands do (their `opened: x` receipts land in the hidden
// terminal scrollback, which is exactly where they belong).
const guiCtx: CommandContext = {
  terminal,
  windows,
  args: [],
  flags: {},
  raw: "",
};

let gui: GuiDesktop | null = null;
const syncShell = () => {
  if (mode.current === "gui" && !gui) {
    gui = mountGuiDesktop(mount, guiCtx, mode);
  } else if (mode.current === "tty" && gui) {
    gui.destroy();
    gui = null;
    terminal.focusInput();
  }
};
mode.onChange(syncShell);
syncShell(); // honour a persisted "gui" choice on load

// `gui` from the prompt does what the bottom-left toggle does.
registry.register({
  name: "gui",
  summary: "switch to the GUI desktop",
  run: (ctx) => {
    ctx.terminal.print("switching to gui — the toggle brings you back.", "dim");
    mode.set("gui");
  },
});

/* ---- boot ----------------------------------------------------------- */

void runBootSequence(terminal).then(() => {
  const hero = mountHero(mount);
  terminal.bindCatOverlap(hero.companion.el);
  terminal.onTyping = (len) => hero.companion.onTyping(len);
  terminal.onSend = () => hero.companion.onSend();
  terminal.onClear = () => hero.restore();
});
