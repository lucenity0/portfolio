/* ------------------------------------------------------------------ *
 * window-manager — owns the set of open windows: creation, focus (raise
 * to top), close, drag-by-title-bar, resize (e/s/se handles), and
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

  constructor(root: HTMLElement) {
    this.root = root;
    this.tray = new MinimizedTray(root);

    // Screens change size under open windows (phone rotation, browser
    // resize, keyboard). Re-clamp every window so none is stranded
    // off-glass or left wider than the desktop.
    window.addEventListener("resize", () => this.reclampAll());
  }

  /** Fit every open window back inside the current desktop bounds. */
  private reclampAll(): void {
    const W = this.root.clientWidth;
    const H = this.root.clientHeight;
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
      const w = Math.min(el.offsetWidth, Math.max(MIN_W, W - 16));
      const h = Math.min(el.offsetHeight, Math.max(MIN_H, H - 16));
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      const x = Math.min(el.offsetLeft, Math.max(8, W - w - 8));
      const y = Math.min(el.offsetTop, Math.max(8, H - h - 8));
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
    const maxW = Math.max(MIN_W, this.root.clientWidth - 16);
    const maxH = Math.max(MIN_H, this.root.clientHeight - 16);
    const w = Math.min(opts.width ?? DEFAULTS.width, maxW);
    const h = Math.min(opts.height ?? DEFAULTS.height, maxH);
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;

    const offset = (this.spawnCount++ % 6) * 26;
    const x = opts.x ?? Math.max(8, this.root.clientWidth / 2 - w / 2 + offset);
    const y = opts.y ?? Math.max(8, this.root.clientHeight / 2 - h / 2 + offset);
    el.style.left = `${Math.min(x, Math.max(8, this.root.clientWidth - w - 8))}px`;
    el.style.top = `${Math.min(y, Math.max(8, this.root.clientHeight - h - 8))}px`;

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
      rec.el.style.width = `${this.root.clientWidth - MAX_MARGIN * 2}px`;
      rec.el.style.height = `${this.root.clientHeight - MAX_MARGIN * 2}px`;
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
      el.style.left = `${Math.min(Math.max(nx, -el.clientWidth + 80), this.root.clientWidth - 80)}px`;
      el.style.top = `${Math.min(Math.max(ny, 0), this.root.clientHeight - 40)}px`;
    };

    const onUp = (e: PointerEvent) => {
      dragging = false;
      handle.releasePointerCapture?.(e.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    handle.addEventListener("pointerdown", (e: PointerEvent) => {
      // Never start a drag from a title-bar control (min/max/close).
      if ((e.target as HTMLElement).closest(".window__btn")) return;
      if (el.classList.contains("is-maximized")) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      originLeft = el.offsetLeft;
      originTop = el.offsetTop;
      handle.setPointerCapture?.(e.pointerId);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  }

  /** Resize from the e/s/se handles, clamped to a minimum size. */
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
        const dir = handle.dataset.dir ?? "se";
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = el.offsetWidth;
        const startH = el.offsetHeight;

        const onMove = (ev: PointerEvent) => {
          if (dir.includes("e")) {
            el.style.width = `${Math.max(MIN_W, startW + (ev.clientX - startX))}px`;
          }
          if (dir.includes("s")) {
            el.style.height = `${Math.max(MIN_H, startH + (ev.clientY - startY))}px`;
          }
        };
        const onUp = (ev: PointerEvent) => {
          handle.releasePointerCapture?.(ev.pointerId);
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };
        handle.setPointerCapture?.(e.pointerId);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      });
    }
  }
}
