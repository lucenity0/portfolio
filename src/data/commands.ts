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
import { openLiffy } from "@/apps/liffy";
import { openResume } from "@/apps/resume";
import { buildCat } from "@/core/cat";
import { prefersReducedMotion, sleep, startSpinner } from "@/core/fx";
import { PROJECTS } from "@/data/projects";

/**
 * Wrap a window-opening command in a brief CLI spinner ("⠹ waking about…")
 * so opening an app feels like the machine is doing something. Kept short
 * (~0.4s) so it reads as texture, not lag; skipped under reduced motion.
 */
function theatrical(
  label: string,
  open: (ctx: CommandContext) => void,
): (ctx: CommandContext) => Promise<void> {
  return async (ctx) => {
    if (prefersReducedMotion()) {
      open(ctx);
      return;
    }
    const el = document.createElement("div");
    el.className = "terminal__line terminal__line--sub";
    ctx.terminal.printEl(el);
    const spin = startSpinner(el, label);
    await sleep(320 + Math.random() * 260);
    spin.stop();
    el.remove();
    open(ctx);
  };
}

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
    {
      name: "about",
      summary: "who is lucenity",
      run: theatrical("waking about", openAbout),
    },
    {
      name: "resume",
      summary: "view my résumé",
      run: theatrical("dusting off the résumé", openResume),
    },
    {
      name: "projects",
      summary: "browse my work",
      run: theatrical("indexing projects", openProjects),
    },
    {
      name: "project",
      summary: "open a specific project",
      usage: "project <slug>",
      run: async (ctx: CommandContext) => {
        const slug = ctx.args[0];
        if (!slug) {
          ctx.terminal.print("usage: project <slug>", "dim");
          ctx.terminal.print(
            `slugs: ${PROJECTS.map((p) => p.slug).join(", ")}`,
            "sub",
          );
          return;
        }
        await theatrical(`spinning up ${slug}`, (c) =>
          openProjectWindow(c, slug),
        )(ctx);
      },
      complete: (partialArgs) =>
        partialArgs.length > 1 ? [] : PROJECTS.map((p) => p.slug),
    },
    {
      name: "contact",
      summary: "how to reach me",
      run: theatrical("opening channels", openContact),
    },
    {
      name: "liffy",
      summary: "chat with liffy, my lil assistant",
      run: theatrical("poking liffy awake", openLiffy),
    },
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
      run: (ctx: CommandContext) => {
        const wrap = buildCat("cat terminal__cat");
        ctx.terminal.printEl(wrap);
        ctx.terminal.print("the cat is asleep. it is always asleep. =^..^=", "dim");
      },
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
