/* ------------------------------------------------------------------ *
 * main — boot the desktop. Wires the window manager, command registry,
 * and terminal together, then runs the startup sequence.
 * ------------------------------------------------------------------ */

import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/terminal.css";
import "@/styles/window.css";
import "@/styles/apps.css";
import "@/styles/liffy.css";
import "@/styles/hero.css";

import { CommandRegistry } from "@/core/command-registry";
import { DesktopWindowManager } from "@/core/window-manager";
import { Terminal } from "@/core/terminal";
import { runBootSequence } from "@/core/boot";
import { mountHero } from "@/core/hero";
import { buildCommands } from "@/data/commands";

const mount = document.getElementById("app");
if (!mount) {
  throw new Error("#app mount element not found");
}

const windows = new DesktopWindowManager(mount);
const registry = new CommandRegistry();
registry.registerAll(buildCommands());

const terminal = new Terminal(mount, registry, windows);

void runBootSequence(terminal).then(() => {
  const hero = mountHero(mount);
  terminal.onTyping = (len) => hero.companion.onTyping(len);
  terminal.onSend = () => hero.companion.onSend();
  terminal.onClear = () => hero.restore();
});
