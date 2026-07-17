/* ------------------------------------------------------------------ *
 * window — builds the DOM for a single retro window "panel": title bar
 * (drag handle) with control dots, a title, minimize/close controls, a
 * body slot apps render into, and resize handles. Pure view; behaviour
 * (drag, focus, resize, minimize) is wired by the window-manager.
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
  /** The minimize control. */
  minimizeBtn: HTMLElement;
  /** The maximize/restore control. */
  maximizeBtn: HTMLElement;
  /** Resize handles, each tagged with `data-dir` (e | s | se). */
  resizeHandles: HTMLElement[];
}

const RESIZE_DIRS = ["e", "s", "se"] as const;

export function createWindowChrome(title: string): WindowChrome {
  const el = document.createElement("section");
  el.className = "window brackets is-opening";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", title);

  const bar = document.createElement("header");
  bar.className = "window__bar";

  const dots = document.createElement("span");
  dots.className = "window__dots";
  // A real <button> so it's keyboard-focusable and SR-operable.
  const closeDot = document.createElement("button");
  closeDot.className = "window__dot window__dot--close";
  closeDot.type = "button";
  closeDot.title = "close";
  closeDot.setAttribute("aria-label", "close window");
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
  const minimizeBtn = document.createElement("button");
  minimizeBtn.className = "window__btn window__btn--min";
  minimizeBtn.type = "button";
  minimizeBtn.title = "minimize";
  minimizeBtn.setAttribute("aria-label", "minimize window");
  minimizeBtn.textContent = "–";
  const maximizeBtn = document.createElement("button");
  maximizeBtn.className = "window__btn window__btn--max";
  maximizeBtn.type = "button";
  maximizeBtn.title = "maximize";
  maximizeBtn.setAttribute("aria-label", "maximize window");
  maximizeBtn.textContent = "□";
  controls.append(minimizeBtn, maximizeBtn);

  bar.append(dots, titleEl, controls);

  const body = document.createElement("div");
  body.className = "window__body";

  el.append(bar, body);

  const resizeHandles = RESIZE_DIRS.map((dir) => {
    const h = document.createElement("span");
    h.className = `window__resize window__resize--${dir}`;
    h.dataset.dir = dir;
    el.append(h);
    return h;
  });

  return {
    el,
    barEl: bar,
    bodyEl: body,
    closeBtn: closeDot,
    minimizeBtn,
    maximizeBtn,
    resizeHandles,
  };
}
