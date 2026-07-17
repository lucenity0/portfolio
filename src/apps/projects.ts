/* ------------------------------------------------------------------ *
 * projects — the launcher window: a filterable grid of project cards.
 * Each card has a generated retro "thumbnail" (dither + initial) until
 * real thumbs land with the finalized catalogue (#14). Clicking a card
 * opens that project in its own window (see project-window.ts).
 * ------------------------------------------------------------------ */

import type { CommandContext, Project } from "@/types";
import { PROJECTS } from "@/data/projects";
import { openProjectWindow } from "@/apps/project-window";

/** Tags worth filtering by (drop bookkeeping tags like "placeholder"). */
function filterTags(): string[] {
  const tags = new Set<string>();
  for (const p of PROJECTS) {
    for (const t of p.tags ?? []) if (t !== "placeholder") tags.add(t);
  }
  return [...tags].sort();
}

function buildCard(ctx: CommandContext, project: Project): HTMLElement {
  const card = document.createElement("button");
  card.className = "pgrid__card";
  card.type = "button";

  // Generated thumbnail: dithered field + the project's initial.
  const thumb = document.createElement("span");
  thumb.className = "pgrid__thumb";
  thumb.setAttribute("aria-hidden", "true");
  const initial = document.createElement("span");
  initial.className = "pgrid__initial";
  initial.textContent = project.name.slice(0, 1).toUpperCase();
  thumb.append(initial);

  const title = document.createElement("strong");
  title.className = "pgrid__name";
  title.textContent = project.name;

  const blurb = document.createElement("span");
  blurb.className = "pgrid__blurb";
  blurb.textContent = project.blurb;

  const meta = document.createElement("span");
  meta.className = "pgrid__meta";
  meta.textContent = [project.kind, ...(project.tags ?? []).filter((t) => t !== "placeholder" && t !== project.kind)].join(" · ");

  card.append(thumb, title, blurb, meta);
  card.addEventListener("click", () => openProjectWindow(ctx, project.slug));
  return card;
}

export function openProjects(ctx: CommandContext): void {
  const root = document.createElement("div");
  root.className = "pgrid";

  // --- filter chips ---
  const bar = document.createElement("div");
  bar.className = "pgrid__filters";
  const grid = document.createElement("div");
  grid.className = "pgrid__grid";

  const cards = new Map<Project, HTMLElement>();
  for (const p of PROJECTS) cards.set(p, buildCard(ctx, p));

  let active = "all";
  const chips: HTMLButtonElement[] = [];
  const applyFilter = (tag: string) => {
    active = tag;
    for (const chip of chips) {
      chip.classList.toggle("is-active", chip.dataset.tag === tag);
    }
    let shown = 0;
    for (const [p, el] of cards) {
      const match =
        tag === "all" || (p.tags ?? []).includes(tag) || p.kind === tag;
      el.hidden = !match;
      if (match) shown++;
    }
    empty.hidden = shown > 0;
  };

  for (const tag of ["all", ...filterTags()]) {
    const chip = document.createElement("button");
    chip.className = "pgrid__chip";
    chip.type = "button";
    chip.dataset.tag = tag;
    chip.textContent = tag;
    chip.addEventListener("click", () => applyFilter(tag));
    chips.push(chip);
    bar.append(chip);
  }

  const empty = document.createElement("p");
  empty.className = "pgrid__empty muted";
  empty.textContent = "nothing tagged that (yet).";
  empty.hidden = true;

  for (const el of cards.values()) grid.append(el);
  root.append(bar, grid, empty);
  applyFilter(active);

  ctx.windows.open({
    id: "projects",
    title: "projects",
    content: root,
    width: 560,
    height: 420,
  });
  ctx.terminal.print(`opened: projects (${PROJECTS.length})`, "dim");
}
