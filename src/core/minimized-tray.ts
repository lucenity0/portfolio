/* ------------------------------------------------------------------ *
 * minimized-tray — the top-right "folder" that collects minimized
 * windows. Hidden until at least one window is minimized. Clicking the
 * folder opens a list; clicking an entry restores that window.
 * ------------------------------------------------------------------ */

interface TrayItem {
  title: string;
  onRestore: () => void;
}

export class MinimizedTray {
  private readonly root: HTMLElement;
  private readonly folderBtn: HTMLButtonElement;
  private readonly countEl: HTMLElement;
  private readonly listEl: HTMLElement;
  private readonly items = new Map<string, TrayItem>();
  private open = false;

  constructor(parent: HTMLElement) {
    this.root = document.createElement("div");
    this.root.className = "tray";
    this.root.hidden = true;

    this.folderBtn = document.createElement("button");
    this.folderBtn.className = "tray__folder";
    this.folderBtn.type = "button";
    this.folderBtn.setAttribute("aria-label", "minimized windows");
    this.folderBtn.innerHTML =
      '<span class="tray__glyph" aria-hidden="true">▚</span><span class="tray__count">0</span>';
    this.countEl = this.folderBtn.querySelector(".tray__count")!;

    this.listEl = document.createElement("div");
    this.listEl.className = "tray__list";
    this.listEl.hidden = true;

    this.folderBtn.addEventListener("click", () => this.toggle());
    this.root.append(this.folderBtn, this.listEl);
    parent.append(this.root);
  }

  add(id: string, title: string, onRestore: () => void): void {
    this.items.set(id, { title, onRestore });
    this.render();
  }

  remove(id: string): void {
    this.items.delete(id);
    if (this.items.size === 0) this.open = false;
    this.render();
  }

  has(id: string): boolean {
    return this.items.has(id);
  }

  private toggle(): void {
    this.open = !this.open && this.items.size > 0;
    this.render();
  }

  private render(): void {
    const count = this.items.size;
    this.root.hidden = count === 0;
    this.countEl.textContent = String(count);
    this.listEl.hidden = !this.open || count === 0;
    this.folderBtn.classList.toggle("is-open", this.open);

    this.listEl.replaceChildren();
    for (const [id, item] of this.items) {
      const row = document.createElement("button");
      row.className = "tray__item";
      row.type = "button";
      row.textContent = item.title;
      row.addEventListener("click", () => {
        // The manager's restore() calls back into remove(), updating us.
        item.onRestore();
        this.open = false;
        this.render();
      });
      this.listEl.append(row);
      void id;
    }
  }
}
