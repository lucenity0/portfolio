/* ------------------------------------------------------------------ *
 * project-window — opens a window for one project. Projects with a site
 * show it live in an <iframe> wrapped in a faux retro browser (URL bar +
 * loading bar). Projects that are only source can't be framed at all —
 * GitHub refuses it outright — so they open in the repo reader instead
 * (repo-window.ts), which fetches the README and renders it here.
 * ------------------------------------------------------------------ */

import type { CommandContext, Project } from "@/types";
import { getProject } from "@/data/projects";
import { buildRepoView } from "@/apps/repo-window";
import { fitWindow } from "@/core/layout";

/** The viewport a site is assumed to be designed for, absent its own. */
const DEFAULT_VIEWPORT = { width: 1280, height: 800 } as const;
/** Room the browser chrome (URL bar) steals from the stage. */
const CHROME_H = 34;
/** Below this fraction of the design width, stop scaling and go responsive. */
const MIN_SCALE = 0.5;

export function openProjectWindow(ctx: CommandContext, slug: string): void {
  const project = getProject(slug);
  if (!project) {
    ctx.terminal.print(`no such project: ${slug} — try \`projects\``, "dim");
    return;
  }

  const body = project.embeddable ? buildEmbed(project) : buildRepoView(project);

  const desk = ctx.windows.desktop();
  let width: number;
  let height: number;

  if (project.embeddable) {
    // Open at the site's own proportions: the stage matches the design
    // viewport's ratio, plus the faux URL bar above it. The width comes
    // from the desktop, so a big screen gets a big preview.
    const vp = project.viewport ?? DEFAULT_VIEWPORT;
    width = Math.round(Math.max(700, Math.min(1320, desk.w * 0.72)));
    height = Math.round((width * vp.height) / vp.width) + CHROME_H;
  } else {
    // A README is prose, so it wants a column rather than a canvas.
    ({ width, height } = fitWindow(desk, {
      wFrac: 0.46, hFrac: 0.78, minW: 560, minH: 420, maxW: 900, maxH: 900,
    }));
  }

  const win = ctx.windows.open({
    id: `project:${project.slug}`,
    title: `project — ${project.name}`,
    content: body,
    width,
    height,
    aspect: project.embeddable ? width / height : undefined,
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

  // Render at the site's design width and scale the whole frame down to the
  // stage, the way a responsive preview does. Without this a 900px window
  // hands the site a 900px viewport and gets its tablet layout back — the
  // desktop design, which is the thing worth showing, never appears.
  // Scaling *up* is never right: past the design width the frame just runs
  // native, so a maximized window shows the site at 1:1.
  const vp = project.viewport ?? DEFAULT_VIEWPORT;
  const fitFrame = (): void => {
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    if (sw === 0 || sh === 0) return;
    let scale = Math.min(1, sw / vp.width);
    // Past a point the desktop layout is just small — a phone-width window
    // showing a 1440px design at 24% is a screenshot, not a site. Below the
    // floor, hand the site the real width and let its own responsive layout
    // do the job it was written for.
    if (scale < MIN_SCALE) scale = 1;
    frame.style.width = `${sw / scale}px`;
    frame.style.height = `${sh / scale}px`;
    frame.style.transform = scale === 1 ? "" : `scale(${scale})`;
  };
  // Fires on open, on window resize, and on maximize — the stage is the one
  // element that knows all three.
  new ResizeObserver(fitFrame).observe(stage);

  stage.append(frame, loader);
  wrap.append(stage);
  return wrap;
}
