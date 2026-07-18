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
  /** Resize handles, each tagged with `data-dir` — all four edges + corners. */
  resizeHandles: HTMLElement[];
}

const RESIZE_DIRS = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;

/** A resize direction: the edge or corner a handle drags. */
export type ResizeDir = (typeof RESIZE_DIRS)[number];

export function createWindowChrome(title: string): WindowChrome {
  const el = document.createElement("section");
  el.className = "window brackets is-opening";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", title);

  const bar = document.createElement("header");
  bar.className = "window__bar";

  const dots = document.createElement("span");
  dots.className = "window__dots";
  // Purely decorative traffic lights — the real, keyboard-focusable
  // controls (incl. close) live in .window__controls on the right.
  const dot1 = document.createElement("span");
  dot1.className = "window__dot";
  const dot2 = document.createElement("span");
  dot2.className = "window__dot";
  const dot3 = document.createElement("span");
  dot3.className = "window__dot";
  dots.append(dot1, dot2, dot3);

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
  // NOTE: must NOT reuse the --max modifier — the manager finds the
  // maximize button by `.window__btn--max` to flip its ❐/□ glyph.
  const closeBtn = document.createElement("button");
  closeBtn.className = "window__btn window__btn--close";
  closeBtn.type = "button";
  closeBtn.title = "close";
  closeBtn.setAttribute("aria-label", "close window");
  closeBtn.textContent = "×";
  controls.append(minimizeBtn, maximizeBtn, closeBtn);

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
    closeBtn: closeBtn,
    minimizeBtn: minimizeBtn,
    maximizeBtn: maximizeBtn,
    resizeHandles: resizeHandles,
  };
}
