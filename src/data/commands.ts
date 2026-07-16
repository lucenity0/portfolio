/* ------------------------------------------------------------------ *
 * commands — the command table. Each entry maps a typed word to an
 * action (usually opening an app window). `help` closes over the list
 * so it always reflects what's registered.
 * ------------------------------------------------------------------ */

import type { Command, CommandContext } from "@/types";
import { openAbout } from "@/apps/about";
import { openContact } from "@/apps/contact";
import { openProjects } from "@/apps/projects";
import { openProjectWindow } from "@/apps/project-window";
import { PROJECTS } from "@/data/projects";

export function buildCommands(): Command[] {
  const commands: Command[] = [];

  const printHelp = (ctx: CommandContext): void => {
    ctx.terminal.print("available commands:");
    for (const c of commands.filter((cmd) => !cmd.hidden)) {
      const label = (c.usage ?? c.name).padEnd(18);
      ctx.terminal.print(`  ${label}${c.summary}`, "dim");
    }
  };

  commands.push(
    { name: "help", summary: "list available commands", run: printHelp },
    { name: "about", summary: "who is lucenity", run: openAbout },
    { name: "projects", summary: "browse my work", run: openProjects },
    {
      name: "project",
      summary: "open a specific project",
      usage: "project <slug>",
      run: (ctx: CommandContext) => {
        const slug = ctx.args[0];
        if (!slug) {
          ctx.terminal.print("usage: project <slug>", "dim");
          ctx.terminal.print(
            `slugs: ${PROJECTS.map((p) => p.slug).join(", ")}`,
            "sub",
          );
          return;
        }
        openProjectWindow(ctx, slug);
      },
    },
    { name: "contact", summary: "how to reach me", run: openContact },
    {
      name: "clear",
      summary: "clear the screen",
      run: (ctx: CommandContext) => ctx.terminal.clear(),
    },
    {
      name: "whoami",
      summary: "print the current session identity",
      run: (ctx: CommandContext) =>
        ctx.terminal.print("visitor@lucenity — guest session", "dim"),
    },
    // --- easter eggs (hidden from help) ---
    {
      name: "cat",
      summary: "",
      hidden: true,
      run: (ctx: CommandContext) =>
        ctx.terminal.print("the cat is asleep. it is always asleep. =^..^=", "dim"),
    },
    {
      name: "sudo",
      summary: "",
      hidden: true,
      run: (ctx: CommandContext) =>
        ctx.terminal.print("nice try. you're a guest here :)", "dim"),
    }
  );

  return commands;
}
