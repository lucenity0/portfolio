/* ------------------------------------------------------------------ *
 * project-window — opens a window for one project. Embeddable projects
 * show a live <iframe> wrapped in a faux retro browser (URL bar +
 * loading bar). Non-embeddable ones (iOS/App-Store pages, sites that
 * block framing via X-Frame-Options / CSP) fall back to a preview card
 * with an "open in new tab" action.
 *
 * v1 skeleton: structure + fallback wired; richer loading FX in Phase 3.
 * ------------------------------------------------------------------ */

import type { CommandContext, Project } from "@/types";
import { getProject } from "@/data/projects";

export function openProjectWindow(ctx: CommandContext, slug: string): void {
  const project = getProject(slug);
  if (!project) {
    ctx.terminal.print(`no such project: ${slug} — try \`projects\``, "dim");
    return;
  }

  const body = project.embeddable
    ? buildEmbed(project)
    : buildFallback(project);

  const win = ctx.windows.open({
    id: `project:${project.slug}`,
    title: `project — ${project.name}`,
    content: body,
    width: 720,
    height: 500,
  });
  // The project chrome manages its own padding/scroll.
  win.bodyEl.style.padding = "0";
  ctx.terminal.print(`opened: ${project.name}`, "dim");
}

function browserBar(url: string): HTMLElement {
  const bar = document.createElement("div");
  bar.className = "project__bar";
  const dots = document.createElement("span");
  dots.className = "project__dots";
  dots.textContent = "◦ ◦ ◦";
  const addr = document.createElement("span");
  addr.className = "project__url";
  addr.textContent = url;
  bar.append(dots, addr);
  return bar;
}

const LOAD_TIMEOUT_MS = 10_000;

function buildEmbed(project: Project): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "project";
  wrap.append(browserBar(project.url));

  const stage = document.createElement("div");
  stage.className = "project__stage";

  const frame = document.createElement("iframe");
  frame.className = "project__frame";
  frame.src = project.url;
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer";
  // Sandbox: allow scripts + same-origin behaviours the embedded app needs,
  // without letting it navigate the top window.
  frame.setAttribute(
    "sandbox",
    "allow-scripts allow-same-origin allow-forms allow-popups",
  );
  frame.title = project.name;

  // Dithered loading veil — sits over the iframe until it loads.
  const loader = document.createElement("div");
  loader.className = "project__loading";
  const label = document.createElement("span");
  label.className = "project__loading-label";
  label.textContent = `loading ${project.name}…`;
  const bar = document.createElement("span");
  bar.className = "project__loadbar";
  bar.append(document.createElement("i"));
  loader.append(label, bar);

  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timeout);
    loader.classList.add("is-done");
    // Let the fade play, then drop the veil entirely.
    window.setTimeout(() => loader.remove(), 400);
  };
  frame.addEventListener("load", settle);

  // Cross-origin frames can't tell us they were refused (X-Frame-Options /
  // CSP show an error page that still "loads"). What we *can* catch is a
  // hung network: if nothing loads in time, offer the way out.
  const timeout = window.setTimeout(() => {
    if (settled) return;
    settled = true;
    loader.classList.add("is-error");
    label.textContent = "this is taking too long — the site may not want to be framed.";
    bar.remove();
    const open = document.createElement("a");
    open.className = "project__open";
    open.href = project.url;
    open.target = "_blank";
    open.rel = "noreferrer noopener";
    open.textContent = "open in new tab ↗";
    loader.append(open);
  }, LOAD_TIMEOUT_MS);

  stage.append(frame, loader);
  wrap.append(stage);
  return wrap;
}

function buildFallback(project: Project): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "project project--fallback";
  wrap.append(browserBar(project.url));

  const card = document.createElement("div");
  card.className = "project__fallback";
  card.innerHTML = `
    <p class="muted">this one can't be embedded (${project.kind === "ios" ? "iOS / App&nbsp;Store" : "the site blocks framing"}).</p>
    <p><strong>${project.name}</strong></p>
    <p class="muted">${project.blurb}</p>
  `;
  const open = document.createElement("a");
  open.className = "project__open";
  open.href = project.url;
  open.target = "_blank";
  open.rel = "noreferrer noopener";
  open.textContent = "open in new tab ↗";
  card.append(open);
  wrap.append(card);
  return wrap;
}
