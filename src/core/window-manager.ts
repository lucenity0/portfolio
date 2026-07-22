/* ------------------------------------------------------------------ *
 * window-manager — owns the set of open windows: creation, focus (raise
 * to top), close, drag-by-title-bar, resize (all edges + corners), and
 * minimize → fold into the top-right MinimizedTray, restore → unfold.
 * ------------------------------------------------------------------ */

import type {
  OpenWindowOptions,
  WindowInstance,
  WindowManager,
} from "@/types";
import { createWindowChrome } from "@/core/window";
import { MinimizedTray } from "@/core/minimized-tray";
import { playOnce, prefersReducedMotion } from "@/core/fx";

const DEFAULTS = { width: 420, height: 300 } as const;
const MIN_W = 260;
const MIN_H = 160;
const EDGE_GAP = 8; // breathing room between a window and the desktop edge
const SPAWN_INSET = 16; // most a freshly-opened window may fill the desktop

interface WinRecord {
  instance: WindowInstance;
  el: HTMLElement;
  title: string;
  /** The pre-maximize rect, present only while maximized. */
  savedRect?: { left: string; top: string; width: string; height: string };
}

const MAX_MARGIN = 12; // gap around a maximized window

export class DesktopWindowManager implements WindowManager {
  private readonly root: HTMLElement;
  private readonly tray: MinimizedTray;
  private readonly records = new Map<string, WinRecord>();
  private readonly minimized = new Set<string>();
  /** Most-recently-focused window ids, front = most recent. Drives `cycle()`. */
  private mru: string[] = [];
  private topZ = 100;
  private spawnCount = 0;
  /** The desktop area windows may occupy — the container minus shell chrome. */
  private area = { w: 0, h: 0 };
  /** Held on the instance so it outlives the constructor scope. */
  private readonly ro: ResizeObserver;

  constructor(root: HTMLElement) {
    this.root = root;
    this.tray = new MinimizedTray(root);

    // Screens change size under open windows (phone rotation, browser
    // resize, keyboard). Re-clamp every window so none is stranded
    // off-glass or left wider than the desktop.
    //
    // The container is watched directly, not just the viewport: #app resizes
    // without a `resize` event whenever the rig's padding/border/chin come
    // and go (tty ⇄ gui). The window listener stays for the converse case —
    // a viewport change that leaves #app's own box alone.
    this.ro = new ResizeObserver(() => this.remeasure());
    this.ro.observe(root);
    window.addEventListener("resize", () => this.remeasure());
    this.measure();
  }

  /**
   * Recompute the work area from the container's *rendered* size, minus the
   * chrome the current shell reserves (`--desktop-inset-bottom` — the GUI
   * taskbar, which paints above windows and would otherwise clip them).
   *
   * Deliberately clientWidth/clientHeight rather than getBoundingClientRect:
   * .rig__screen runs a scaleY keyframe on every tty→gui switch, and a
   * rect-based read would measure that squash and mis-clamp every window.
   */
  private measure(): void {
    const inset = parseFloat(
      getComputedStyle(this.root).getPropertyValue("--desktop-inset-bottom"),
    );
    this.area = {
      w: this.root.clientWidth,
      h: Math.max(MIN_H, this.root.clientHeight - (Number.isFinite(inset) ? inset : 0)),
    };
  }

  /**
   * Public so shells can force a recompute right after swapping chrome
   * (tty ⇄ gui) instead of waiting on the ResizeObserver to notice — see
   * `syncShell` in main.ts and `toggleMaximize` below, both of which can
   * run against a stale `this.area` otherwise.
   */
  remeasure(): void {
    this.measure();
    this.reclampAll();
  }

  /** Fit every open window back inside the current desktop bounds. */
  private reclampAll(): void {
    const { w: W, h: H } = this.area;
    if (W === 0 || H === 0) return;
    for (const [id, rec] of this.records) {
      if (this.minimized.has(id)) continue;
      const el = rec.el;
      if (el.classList.contains("is-maximized")) {
        el.style.left = `${MAX_MARGIN}px`;
        el.style.top = `${MAX_MARGIN}px`;
        el.style.width = `${W - MAX_MARGIN * 2}px`;
        el.style.height = `${H - MAX_MARGIN * 2}px`;
        continue;
      }
      const w = Math.min(el.offsetWidth, Math.max(MIN_W, W - SPAWN_INSET));
      const h = Math.min(el.offsetHeight, Math.max(MIN_H, H - SPAWN_INSET));
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      const x = Math.min(el.offsetLeft, Math.max(EDGE_GAP, W - w - EDGE_GAP));
      const y = Math.min(el.offsetTop, Math.max(EDGE_GAP, H - h - EDGE_GAP));
      el.style.left = `${Math.max(0, x)}px`;
      el.style.top = `${Math.max(0, y)}px`;
    }
  }

  open(opts: OpenWindowOptions): WindowInstance {
    const singleton = opts.singleton ?? true;
    const existing = this.records.get(opts.id);
    if (singleton && existing) {
      if (this.minimized.has(opts.id)) this.restore(opts.id);
      else existing.instance.focus();
      return existing.instance;
    }

    const chrome = createWindowChrome(opts.title);
    const { el, bodyEl, barEl, closeBtn, minimizeBtn, maximizeBtn, resizeHandles } =
      chrome;

    // Clamp to the desktop so windows never spawn off-screen or wider
    // than a phone viewport (near-fullscreen on small screens).
    const { w: W, h: H } = this.area;
    const maxW = Math.max(MIN_W, W - SPAWN_INSET);
    const maxH = Math.max(MIN_H, H - SPAWN_INSET);
    const w = Math.min(opts.width ?? DEFAULTS.width, maxW);
    const h = Math.min(opts.height ?? DEFAULTS.height, maxH);
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;

    const offset = (this.spawnCount++ % 6) * 26;
    const x = opts.x ?? Math.max(EDGE_GAP, W / 2 - w / 2 + offset);
    const y = opts.y ?? Math.max(EDGE_GAP, H / 2 - h / 2 + offset);
    el.style.left = `${Math.min(x, Math.max(EDGE_GAP, W - w - EDGE_GAP))}px`;
    el.style.top = `${Math.min(y, Math.max(EDGE_GAP, H - h - EDGE_GAP))}px`;

    if (typeof opts.content === "string") {
      bodyEl.textContent = opts.content;
    } else {
      bodyEl.appendChild(opts.content);
    }

    const instance: WindowInstance = {
      id: opts.id,
      el,
      bodyEl,
      close: () => this.close(opts.id),
      focus: () => this.focus(opts.id),
    };

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.close(opts.id);
    });
    minimizeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.minimize(opts.id);
    });
    maximizeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMaximize(opts.id);
    });
    // Double-click the title bar (not its buttons) toggles maximize.
    barEl.addEventListener("dblclick", (e) => {
      if ((e.target as HTMLElement).closest(".window__dot, .window__btn")) return;
      this.toggleMaximize(opts.id);
    });
    el.addEventListener("pointerdown", () => this.focus(opts.id));
    // Esc closes the window when focus is inside it — except while typing
    // in a text field (liffy's input etc.), where Esc should be inert.
    el.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      e.stopPropagation();
      this.close(opts.id);
    });
    this.enableDrag(el, barEl);
    this.enableResize(opts.id, el, resizeHandles);

    this.records.set(opts.id, { instance, el, title: opts.title });
    this.root.appendChild(el);
    this.focus(opts.id);
    return instance;
  }

  close(id: string): void {
    const rec = this.records.get(id);
    if (!rec) return;
    // Book-keeping first, so the window is logically gone even while
    // its power-off animation still plays.
    this.records.delete(id);
    const wasMinimized = this.minimized.delete(id);
    this.mru = this.mru.filter((x) => x !== id);
    if (this.tray.has(id)) this.tray.remove(id);

    if (prefersReducedMotion() || wasMinimized) {
      rec.el.remove();
      return;
    }
    rec.el.classList.add("is-closing");
    rec.el.addEventListener("animationend", () => rec.el.remove(), {
      once: true,
    });
    // Safety net: if the animation never fires (e.g. display:none), drop it.
    window.setTimeout(() => rec.el.remove(), 600);
  }

  /** Fill the desktop, or restore the previous rect. */
  toggleMaximize(id: string): void {
    const rec = this.records.get(id);
    if (!rec || this.minimized.has(id)) return;
    this.measure(); // the shell may have swapped its chrome since the last resize
    if (!prefersReducedMotion()) {
      rec.el.classList.add("is-snapping");
      window.setTimeout(() => rec.el.classList.remove("is-snapping"), 300);
    }
    if (rec.savedRect) {
      const r = rec.savedRect;
      rec.el.style.left = r.left;
      rec.el.style.top = r.top;
      rec.el.style.width = r.width;
      rec.el.style.height = r.height;
      delete rec.savedRect;
      rec.el.classList.remove("is-maximized");
    } else {
      rec.savedRect = {
        left: rec.el.style.left,
        top: rec.el.style.top,
        width: rec.el.style.width,
        height: rec.el.style.height,
      };
      rec.el.style.left = `${MAX_MARGIN}px`;
      rec.el.style.top = `${MAX_MARGIN}px`;
      rec.el.style.width = `${this.area.w - MAX_MARGIN * 2}px`;
      rec.el.style.height = `${this.area.h - MAX_MARGIN * 2}px`;
      rec.el.classList.add("is-maximized");
    }
    const btn = rec.el.querySelector<HTMLButtonElement>(".window__btn--max");
    if (btn) {
      const maxed = rec.el.classList.contains("is-maximized");
      btn.textContent = maxed ? "❐" : "□";
      btn.title = maxed ? "restore" : "maximize";
      btn.setAttribute("aria-label", maxed ? "restore window" : "maximize window");
    }
    this.focus(id);
  }

  focus(id: string): void {
    const rec = this.records.get(id);
    if (!rec) return;
    for (const [otherId, other] of this.records) {
      other.el.classList.toggle(
        "is-active",
        otherId === id && !this.minimized.has(otherId),
      );
    }
    rec.el.style.zIndex = String(++this.topZ);
    this.mru = [id, ...this.mru.filter((x) => x !== id)];
  }

  /** Focus the next (1) or previous (-1) open, non-minimized window. */
  cycle(dir: 1 | -1): void {
    const open = this.mru.filter(
      (id) => this.records.has(id) && !this.minimized.has(id),
    );
    if (open.length < 2) return;
    const next = dir === 1 ? open[1] : open[open.length - 1];
    if (next) this.focus(next);
  }

  get(id: string): WindowInstance | undefined {
    return this.records.get(id)?.instance;
  }

  /** Fold a window into the top-right tray. */
  minimize(id: string): void {
    const rec = this.records.get(id);
    if (!rec || this.minimized.has(id)) return;
    this.minimized.add(id);
    rec.el.classList.remove("is-active");
    this.tray.add(id, rec.title, () => this.restore(id));

    if (prefersReducedMotion()) {
      rec.el.style.display = "none";
      return;
    }
    rec.el.classList.add("is-minimizing");
    rec.el.addEventListener(
      "animationend",
      () => {
        rec.el.style.display = "none";
        rec.el.classList.remove("is-minimizing");
      },
      { once: true },
    );
  }

  /** Every open window — lets shells (the GUI taskbar) mirror state. */
  list(): Array<{ id: string; title: string; el: HTMLElement; minimized: boolean }> {
    return [...this.records.entries()].map(([id, rec]) => ({
      id,
      title: rec.el.querySelector(".window__title")?.textContent ?? id,
      el: rec.el,
      minimized: this.minimized.has(id),
    }));
  }

  /** Unfold a window back from the tray. */
  restore(id: string): void {
    const rec = this.records.get(id);
    if (!rec) return;
    this.minimized.delete(id);
    if (this.tray.has(id)) this.tray.remove(id);
    rec.el.style.display = "";
    rec.el.classList.remove("is-minimizing");
    this.focus(id);
    playOnce(rec.el, "is-opening");
  }

  /** Drag the window by its title bar using pointer events. */
  private enableDrag(el: HTMLElement, handle: HTMLElement): void {
    let startX = 0;
    let startY = 0;
    let originLeft = 0;
    let originTop = 0;
    let dragging = false;

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const nx = originLeft + (e.clientX - startX);
      const ny = originTop + (e.clientY - startY);
      el.style.left = `${Math.min(Math.max(nx, -el.clientWidth + 80), this.area.w - 80)}px`;
      el.style.top = `${Math.min(Math.max(ny, 0), this.area.h - 40)}px`;
    };

    // Also the pointercancel handler: WebKit fires cancel *instead of* up
    // whenever it takes the gesture over (edge swipe, multi-touch). Cleaning
    // up only on pointerup left `dragging` true with the window-level
    // listeners still attached, so every later touch anywhere re-entered
    // onMove — the window jumped and the tap never reached its target.
    const onUp = (e: PointerEvent) => {
      dragging = false;
      handle.releasePointerCapture?.(e.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    handle.addEventListener("pointerdown", (e: PointerEvent) => {
      // Never start a drag from a title-bar control (min/max/close).
      if ((e.target as HTMLElement).closest(".window__btn")) return;
      if (el.classList.contains("is-maximized")) return;
      this.measure(); // the shell may have swapped its chrome since the last resize
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      originLeft = el.offsetLeft;
      originTop = el.offsetTop;
      handle.setPointerCapture?.(e.pointerId);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    });
  }

  /**
   * Resize from any edge or corner, clamped to the desktop and a minimum size.
   *
   * North and west drags move the window's origin, so each gesture works from
   * the starting rect and pins the *opposite* edge: dragging `w` holds
   * `left + width` steady, `n` holds `top + height`.
   */
  private enableResize(
    id: string,
    el: HTMLElement,
    handles: HTMLElement[],
  ): void {
    for (const handle of handles) {
      handle.addEventListener("pointerdown", (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (el.classList.contains("is-maximized")) return;
        this.focus(id);
        this.measure(); // the shell may have swapped its chrome since the last resize
        const dir = handle.dataset.dir ?? "se";
        const startX = e.clientX;
        const startY = e.clientY;
        const startL = el.offsetLeft;
        const startT = el.offsetTop;
        const startW = el.offsetWidth;
        const startH = el.offsetHeight;
        const { w: areaW, h: areaH } = this.area;
        // The pinned far edges, for the origin-moving directions.
        const right = startL + startW;
        const bottom = startT + startH;

        const onMove = (ev: PointerEvent) => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          let l = startL;
          let t = startT;
          let w = startW;
          let h = startH;

          if (dir.includes("e")) {
            w = Math.min(
              Math.max(MIN_W, startW + dx),
              Math.max(MIN_W, areaW - startL - EDGE_GAP),
            );
          }
          if (dir.includes("s")) {
            h = Math.min(
              Math.max(MIN_H, startH + dy),
              Math.max(MIN_H, areaH - startT - EDGE_GAP),
            );
          }
          if (dir.includes("w")) {
            l = Math.min(Math.max(0, startL + dx), right - MIN_W);
            w = right - l;
          }
          if (dir.includes("n")) {
            t = Math.min(Math.max(0, startT + dy), bottom - MIN_H);
            h = bottom - t;
          }

          el.style.left = `${l}px`;
          el.style.top = `${t}px`;
          el.style.width = `${w}px`;
          el.style.height = `${h}px`;
        };
        // Bound to pointercancel as well as pointerup — see enableDrag.
        const onUp = (ev: PointerEvent) => {
          handle.releasePointerCapture?.(ev.pointerId);
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("pointercancel", onUp);
        };
        handle.setPointerCapture?.(e.pointerId);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
      });
    }
  }
}
