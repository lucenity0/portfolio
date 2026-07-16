/* ------------------------------------------------------------------ *
 * command-registry — a tiny lookup of terminal commands by name.
 * Commands are registered at boot (see data/commands.ts) and dispatched
 * by the terminal.
 * ------------------------------------------------------------------ */

import type { Command } from "@/types";

export class CommandRegistry {
  private readonly map = new Map<string, Command>();

  register(cmd: Command): void {
    this.map.set(cmd.name.toLowerCase(), cmd);
  }

  registerAll(cmds: Command[]): void {
    for (const cmd of cmds) this.register(cmd);
  }

  get(name: string): Command | undefined {
    return this.map.get(name.toLowerCase());
  }

  /** All registered commands. */
  all(): Command[] {
    return [...this.map.values()];
  }

  /** Commands shown in `help` (excludes hidden easter eggs). */
  visible(): Command[] {
    return this.all().filter((c) => !c.hidden);
  }

  /** Names for tab-completion (Phase 1). */
  names(): string[] {
    return [...this.map.keys()];
  }
}
