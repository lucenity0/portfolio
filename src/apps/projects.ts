/* ------------------------------------------------------------------ *
 * projects — the launcher window: a list of project cards. Clicking a
 * card opens that project in its own window (see project-window.ts).
 * v1 skeleton: simple list; grid + thumbnails in Phase 3.
 * ------------------------------------------------------------------ */

import type { CommandContext } from "@/types";
import { PROJECTS } from "@/data/projects";
import { openProjectWindow } from "@/apps/project-window";

export function openProjects(ctx: CommandContext): void {
  const list = document.createElement("div");
  list.className = "app-list";

  for (const project of PROJECTS) {
    const card = document.createElement("button");
    card.className = "app-card";
    card.type = "button";

    const title = document.createElement("strong");
    title.textContent = project.name;
    const blurb = document.createElement("span");
    blurb.textContent = project.blurb;
    const tag = document.createElement("span");
    tag.className = "app-card__tag";
    tag.textContent = project.kind;

    card.append(title, blurb, tag);
    card.addEventListener("click", () => openProjectWindow(ctx, project.slug));
    list.append(card);
  }

  ctx.windows.open({
    id: "projects",
    title: "projects",
    content: list,
    width: 480,
    height: 360,
  });
  ctx.terminal.print(`opened: projects (${PROJECTS.length})`, "dim");
}
