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
}

export class DesktopWindowManager implements WindowManager {
  private readonly root: HTMLElement;
  private readonly tray: MinimizedTray;
  private readonly records = new Map<string, WinRecord>();
  private readonly minimized = new Set<string>();
  private topZ = 100;
  private spawnCount = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    this.tray = new MinimizedTray(root);
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
    const { el, bodyEl, barEl, closeBtn, minimizeBtn, resizeHandles } = chrome;

    el.style.width = `${opts.width ?? DEFAULTS.width}px`;
    el.style.height = `${opts.height ?? DEFAULTS.height}px`;

    const offset = (this.spawnCount++ % 6) * 26;
    const x = opts.x ?? Math.max(24, this.root.clientWidth / 2 - 260 + offset);
    const y = opts.y ?? Math.max(24, this.root.clientHeight / 2 - 200 + offset);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

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
    el.addEventListener("pointerdown", () => this.focus(opts.id));
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
    rec.el.remove();
    this.records.delete(id);
    this.minimized.delete(id);
    if (this.tray.has(id)) this.tray.remove(id);
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
      if ((e.target as HTMLElement).closest(".window__dot--close, .window__btn"))
        return;
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
