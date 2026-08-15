/* ------------------------------------------------------------------ *
 * projects — the launcher window: a filterable grid of project cards.
 * A project with a site gets a screenshot of it (public/thumbs); one
 * that is only source gets the GitHub mark. Clicking a card opens that
 * project in its own window (see project-window.ts).
 * ------------------------------------------------------------------ */

import type { CommandContext, Project } from "@/types";
import { PROJECTS } from "@/data/projects";
import { openProjectWindow } from "@/apps/project-window";
import { fitWindow } from "@/core/layout";

/** Tags worth filtering by (drop bookkeeping tags like "placeholder"). */
function filterTags(): string[] {
  const tags = new Set<string>();
  for (const p of PROJECTS) {
    for (const t of p.tags ?? []) if (t !== "placeholder") tags.add(t);
  }
  return [...tags].sort();
}

/**
 * The GitHub mark, for projects that are source and nothing else. Drawn
 * from Octicons (MIT), which is the mark GitHub publishes for exactly
 * this: pointing at something that lives on GitHub.
 */
function githubMark(): HTMLElement {
  const wrap = document.createElement("span");
  wrap.className = "pgrid__mark";
  wrap.innerHTML = `<svg viewBox="0 0 16 16" width="34" height="34" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z"/></svg>`;
  return wrap;
}

function buildCard(ctx: CommandContext, project: Project): HTMLElement {
  const card = document.createElement("button");
  card.className = "pgrid__card";
  card.type = "button";

  // A project with a site shows a shot of it; one that is only source
  // shows the mark of the place it lives. Either way the dithered field
  // stays behind it, so a slow image doesn't open a hole in the grid.
  const thumb = document.createElement("span");
  thumb.className = "pgrid__thumb";
  thumb.setAttribute("aria-hidden", "true");
  if (project.thumb) {
    const shot = document.createElement("img");
    shot.className = "pgrid__shot";
    shot.src = project.thumb;
    shot.alt = "";
    shot.loading = "lazy";
    // A missing screenshot shouldn't leave a broken-image glyph in a
    // grid this tidy — drop back to the mark instead.
    shot.addEventListener("error", () => {
      shot.remove();
      thumb.append(githubMark());
    });
    thumb.append(shot);
  } else {
    thumb.append(githubMark());
  }

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
    ...fitWindow(ctx.windows.desktop(), {
      // The grid is the one window that earns real estate: more width
      // means more cards per row rather than just bigger padding.
      wFrac: 0.68, hFrac: 0.78, minW: 560, minH: 420, maxW: 1180, maxH: 900,
    }),
  });
  ctx.terminal.print(`opened: projects (${PROJECTS.length})`, "dim");
}
