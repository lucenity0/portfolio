/* ------------------------------------------------------------------ *
 * mode — the site runs in one of two shells:
 *
 *   "tty" (default)  the full-bleed terminal desktop, exactly as ever.
 *   "gui"            the CRT monitor rig with a point-and-click OS
 *                    inside its screen: desktop icons, taskbar, apps.
 *
 * A fixed chip in the bottom-left toggles between them; the choice
 * persists per visitor. The mode is expressed as a body class
 * (`mode-gui`) so CSS swaps the chrome, and subscribers (main.ts)
 * mount/unmount the GUI layer.
 * ------------------------------------------------------------------ */

import { prefersReducedMotion } from "@/core/fx";

export type ShellMode = "tty" | "gui";

const STORAGE_KEY = "lucenity-shell-mode";

export class ModeManager {
  private mode: ShellMode;
  private readonly listeners: Array<(mode: ShellMode) => void> = [];
  private readonly toggleBtn: HTMLButtonElement;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    this.mode = saved === "gui" ? "gui" : "tty";

    this.toggleBtn = document.createElement("button");
    this.toggleBtn.type = "button";
    this.toggleBtn.className = "mode-toggle";
    this.toggleBtn.addEventListener("click", () => {
      this.set(this.mode === "tty" ? "gui" : "tty");
    });
    document.body.append(this.toggleBtn);

    this.apply(false);
  }

  get current(): ShellMode {
    return this.mode;
  }

  set(mode: ShellMode): void {
    if (mode === this.mode) return;
    this.mode = mode;
    localStorage.setItem(STORAGE_KEY, mode);
    this.apply(true);
    for (const fn of this.listeners) fn(mode);
  }

  onChange(fn: (mode: ShellMode) => void): void {
    this.listeners.push(fn);
  }

  private apply(animate: boolean): void {
    document.body.classList.toggle("mode-gui", this.mode === "gui");
    this.toggleBtn.textContent =
      this.mode === "tty" ? "[ gui ]" : "[ terminal ]";
    this.toggleBtn.title =
      this.mode === "tty"
        ? "switch to the GUI desktop"
        : "switch back to the terminal";
    this.toggleBtn.setAttribute("aria-pressed", String(this.mode === "gui"));

    // A quick CRT settle when the monitor takes over.
    if (animate && this.mode === "gui" && !prefersReducedMotion()) {
      const screen = document.querySelector(".rig__screen");
      if (screen) {
        screen.classList.remove("is-powering");
        // restart the animation if it was mid-flight
        void (screen as HTMLElement).offsetWidth;
        screen.classList.add("is-powering");
        screen.addEventListener(
          "animationend",
          () => screen.classList.remove("is-powering"),
          { once: true },
        );
      }
    }
  }
}
