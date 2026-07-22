/* ------------------------------------------------------------------ *
 * gui-desktop — the point-and-click shell that lives inside the CRT
 * monitor when the site is in "gui" mode. Desktop icons open the same
 * app windows the terminal commands do; a taskbar mirrors open windows
 * (click to focus / minimize / restore), with a start-style menu on the
 * left and a cat + clock tray on the right.
 *
 * The terminal desktop stays mounted underneath (hidden by CSS), so
 * windows opened in one shell survive a switch to the other.
 * ------------------------------------------------------------------ */

import type { CommandContext } from "@/types";
import type { ModeManager } from "@/core/mode";
import { mountGuiWallpaper } from "@/apps/gui-wallpaper";
import { openAbout } from "@/apps/about";
import { openContact } from "@/apps/contact";
import { openLiffy } from "@/apps/liffy";
import { openProjects } from "@/apps/projects";
import { openResume } from "@/apps/resume";

interface IconSpec {
  id: string;
  label: string;
  glyph: string; // text drawn inside the CSS icon box
  kind: "file" | "folder" | "app" | "sys";
  open: (ctx: CommandContext) => void;
}

export interface GuiDesktop {
  destroy(): void;
}

export function mountGuiDesktop(
  root: HTMLElement,
  ctx: CommandContext,
  mode: ModeManager,
): GuiDesktop {
  const layer = document.createElement("div");
  layer.className = "gui";

  /* ---- wallpaper: the night scene behind everything ----------------- */

  const wallpaper = mountGuiWallpaper(layer);

  /* ---- desktop icons ---------------------------------------------- */

  const ICONS: IconSpec[] = [
    { id: "about", label: "about.txt", glyph: "≡", kind: "file", open: openAbout },
    { id: "projects", label: "projects", glyph: "", kind: "folder", open: openProjects },
    { id: "resume", label: "resume.pdf", glyph: "PDF", kind: "file", open: openResume },
    { id: "liffy", label: "liffy", glyph: "=^..^=", kind: "app", open: openLiffy },
    { id: "contact", label: "contact", glyph: "@", kind: "file", open: openContact },
    {
      id: "tty",
      label: "terminal",
      glyph: ">_",
      kind: "sys",
      open: () => mode.set("tty"),
    },
  ];

  const icons = document.createElement("div");
  icons.className = "gui__icons";
  for (const spec of ICONS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `gui__icon gui__icon--${spec.kind}`;
    const art = document.createElement("span");
    art.className = "gui__icon-art";
    art.textContent = spec.glyph;
    const label = document.createElement("span");
    label.className = "gui__icon-label";
    label.textContent = spec.label;
    btn.append(art, label);
    btn.addEventListener("click", () => spec.open(ctx));
    icons.append(btn);
  }

  /* ---- taskbar ----------------------------------------------------- */

  const bar = document.createElement("div");
  bar.className = "gui__taskbar";

  // start button + menu
  const start = document.createElement("button");
  start.type = "button";
  start.className = "gui__start";
  start.textContent = "⌂ lucenity";
  start.setAttribute("aria-haspopup", "true");
  start.setAttribute("aria-expanded", "false");

  const menu = document.createElement("div");
  menu.className = "gui__menu";
  menu.hidden = true;
  for (const spec of ICONS) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "gui__menu-item";
    item.textContent = spec.label;
    item.addEventListener("click", () => {
      closeMenu();
      spec.open(ctx);
    });
    menu.append(item);
  }

  const closeMenu = () => {
    menu.hidden = true;
    start.setAttribute("aria-expanded", "false");
  };
  start.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    start.setAttribute("aria-expanded", String(!menu.hidden));
  });
  const onDocClick = (e: MouseEvent) => {
    if (!menu.hidden && !menu.contains(e.target as Node)) closeMenu();
  };
  document.addEventListener("click", onDocClick);

  // running-window buttons
  const tasks = document.createElement("div");
  tasks.className = "gui__tasks";

  // tray: resident cat + clock
  const tray = document.createElement("div");
  tray.className = "gui__tray";
  const trayCat = document.createElement("span");
  trayCat.className = "gui__tray-cat";
  trayCat.textContent = "=^..^=";
  trayCat.title = "the cat is asleep. it is always asleep.";
  const clock = document.createElement("span");
  clock.className = "gui__clock";
  const tickClock = () => {
    const d = new Date();
    clock.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes(),
    ).padStart(2, "0")}`;
  };
  tickClock();
  const clockTimer = window.setInterval(tickClock, 15_000);
  tray.append(trayCat, clock);

  bar.append(start, tasks, tray);
  layer.append(icons, menu, bar);
  root.append(layer);

  /* ---- taskbar ⇄ window-manager sync ------------------------------- */

  const renderTasks = () => {
    tasks.textContent = "";
    for (const win of ctx.windows.list()) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "gui__task";
      if (win.minimized) b.classList.add("is-min");
      else if (win.el.classList.contains("is-active")) b.classList.add("is-on");
      b.textContent = win.title;
      b.title = win.minimized ? `restore ${win.title}` : win.title;
      b.addEventListener("click", () => {
        if (win.minimized) ctx.windows.restore(win.id);
        else if (win.el.classList.contains("is-active")) ctx.windows.minimize(win.id);
        else ctx.windows.focus(win.id);
      });
      tasks.append(b);
    }
  };

  // Mirror manager state without touching the manager: watch the desktop
  // for windows appearing/leaving and for focus/minimize class flips.
  // Mutations inside our own layer are ignored — re-rendering the taskbar
  // must never re-trigger the observer (infinite loop).
  //
  // `renderTasks` only reads classes (is-active/is-min) and the open-window
  // list, never `style` — so `style` is deliberately left out of the filter.
  // Watching it caught every drag frame's left/top writes *and* the zIndex
  // bump `focus()` makes on literally every pointerdown, which reliably
  // fired a taskbar rebuild mid-touch on mobile and ate the synthetic
  // `click` that was supposed to follow (WebKit drops it if the DOM churns
  // under the finger). A live pointer is also tracked so that even a
  // legitimate class-driven render (switching focus between two open
  // windows) waits for the gesture to end instead of firing mid-touch.
  let raf = 0;
  let pointerDown = false;
  let renderPending = false;
  const scheduleRender = () => {
    if (pointerDown) {
      renderPending = true;
      return;
    }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(renderTasks);
  };
  const onPointerDown = () => {
    pointerDown = true;
  };
  const onPointerUp = () => {
    pointerDown = false;
    if (renderPending) {
      renderPending = false;
      scheduleRender();
    }
  };
  document.addEventListener("pointerdown", onPointerDown, { capture: true });
  document.addEventListener("pointerup", onPointerUp, { capture: true });
  document.addEventListener("pointercancel", onPointerUp, { capture: true });

  const observer = new MutationObserver((records) => {
    if (records.every((r) => layer.contains(r.target))) return;
    scheduleRender();
  });
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  renderTasks();

  return {
    destroy() {
      observer.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerdown", onPointerDown, { capture: true });
      document.removeEventListener("pointerup", onPointerUp, { capture: true });
      document.removeEventListener("pointercancel", onPointerUp, { capture: true });
      window.clearInterval(clockTimer);
      document.removeEventListener("click", onDocClick);
      wallpaper.destroy();
      layer.remove();
    },
  };
}
