/* ------------------------------------------------------------------ *
 * window-manager — owns the set of open windows: creation, focus (raise
 * to top), close, and drag-by-title-bar. v1 covers the essentials;
 * minimize/maximize/resize + a dock are Phase 2 (see ROADMAP).
 * ------------------------------------------------------------------ */

import type {
  OpenWindowOptions,
  WindowInstance,
  WindowManager,
} from "@/types";
import { createWindowChrome } from "@/core/window";

const DEFAULTS = { width: 420, height: 300 } as const;

export class DesktopWindowManager implements WindowManager {
  private readonly root: HTMLElement;
  private readonly windows = new Map<string, WindowInstance>();
  private topZ = 100;
  /** Cascade offset so successive windows don't stack exactly. */
  private spawnCount = 0;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  open(opts: OpenWindowOptions): WindowInstance {
    const singleton = opts.singleton ?? true;
    const existing = this.windows.get(opts.id);
    if (singleton && existing) {
      existing.focus();
      return existing;
    }

    const chrome = createWindowChrome(opts.title);
    const { el, bodyEl, barEl, closeBtn } = chrome;

    // Size.
    el.style.width = `${opts.width ?? DEFAULTS.width}px`;
    el.style.height = `${opts.height ?? DEFAULTS.height}px`;

    // Position: explicit, else a gentle cascade near the centre.
    const offset = (this.spawnCount++ % 6) * 26;
    const x = opts.x ?? Math.max(24, this.root.clientWidth / 2 - 260 + offset);
    const y = opts.y ?? Math.max(24, this.root.clientHeight / 2 - 200 + offset);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    // Content.
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

    // Wire behaviour.
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.close(opts.id);
    });
    el.addEventListener("pointerdown", () => this.focus(opts.id));
    this.enableDrag(el, barEl);

    this.windows.set(opts.id, instance);
    this.root.appendChild(el);
    this.focus(opts.id);
    return instance;
  }

  close(id: string): void {
    const w = this.windows.get(id);
    if (!w) return;
    w.el.remove();
    this.windows.delete(id);
  }

  focus(id: string): void {
    const w = this.windows.get(id);
    if (!w) return;
    for (const other of this.windows.values()) {
      other.el.classList.toggle("is-active", other === w);
    }
    w.el.style.zIndex = String(++this.topZ);
  }

  get(id: string): WindowInstance | undefined {
    return this.windows.get(id);
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
      // Keep the bar reachable within the viewport.
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
      // Ignore drags that start on a control (e.g. the close dot).
      if ((e.target as HTMLElement).closest(".window__dot--close")) return;
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
}
