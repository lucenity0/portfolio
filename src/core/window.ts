/* ------------------------------------------------------------------ *
 * window — builds the DOM for a single retro window "panel": title bar
 * (drag handle) with control dots, a title, a close button, and a body
 * slot apps render into. Pure view construction; behaviour (drag,
 * focus, z-index) is wired by the window-manager.
 * ------------------------------------------------------------------ */

export interface WindowChrome {
  /** The outer .window element. */
  el: HTMLElement;
  /** The title bar — used as the drag handle. */
  barEl: HTMLElement;
  /** The content slot apps render into. */
  bodyEl: HTMLElement;
  /** The close control. */
  closeBtn: HTMLElement;
}

export function createWindowChrome(title: string): WindowChrome {
  const el = document.createElement("section");
  el.className = "window brackets is-opening";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", title);

  const bar = document.createElement("header");
  bar.className = "window__bar";

  const dots = document.createElement("span");
  dots.className = "window__dots";
  const closeDot = document.createElement("span");
  closeDot.className = "window__dot window__dot--close";
  closeDot.title = "close";
  closeDot.setAttribute("aria-label", "close window");
  closeDot.setAttribute("role", "button");
  const dot2 = document.createElement("span");
  dot2.className = "window__dot";
  const dot3 = document.createElement("span");
  dot3.className = "window__dot";
  dots.append(closeDot, dot2, dot3);

  const titleEl = document.createElement("span");
  titleEl.className = "window__title";
  titleEl.textContent = title;

  const controls = document.createElement("span");
  controls.className = "window__controls";
  // Placeholder for minimize/maximize (Phase 2). Kept minimal for v1.

  bar.append(dots, titleEl, controls);

  const body = document.createElement("div");
  body.className = "window__body";

  el.append(bar, body);

  return { el, barEl: bar, bodyEl: body, closeBtn: closeDot };
}
