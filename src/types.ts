/* ------------------------------------------------------------------ *
 * Shared contracts for the terminal + window-manager system.
 * These interfaces are the seams between modules — implementations
 * (Terminal, WindowManager) fulfil them; commands/apps depend on them.
 * ------------------------------------------------------------------ */

export type LineVariant = "default" | "dim" | "sub";

/** A live window on the desktop. */
export interface WindowInstance {
  readonly id: string;
  readonly el: HTMLElement;
  /** The content area an app renders into. */
  readonly bodyEl: HTMLElement;
  close(): void;
  focus(): void;
}

export interface OpenWindowOptions {
  /** Stable id; with `singleton`, re-opening focuses the existing window. */
  id: string;
  title: string;
  /** String is treated as text; pass an element for rich content. */
  content: HTMLElement | string;
  width?: number;
  height?: number;
  /**
   * Preferred width ÷ height. When set, a window too big for the desktop is
   * scaled down on both axes together instead of clamped per-axis, so an
   * embed keeps the proportions it was designed for.
   */
  aspect?: number;
  x?: number;
  y?: number;
  /** If true (default), only one window per id may exist at a time. */
  singleton?: boolean;
}

export interface WindowManager {
  open(opts: OpenWindowOptions): WindowInstance;
  close(id: string): void;
  focus(id: string): void;
  get(id: string): WindowInstance | undefined;
  /** Focus the next (1) or previous (-1) open, non-minimized window in MRU order. */
  cycle(dir: 1 | -1): void;
  minimize(id: string): void;
  restore(id: string): void;
  /** Every open window, for shells (taskbar) that mirror manager state. */
  list(): Array<{ id: string; title: string; el: HTMLElement; minimized: boolean }>;
  /**
   * The desktop area windows may occupy, so an app can size itself to
   * the screen it opened on rather than to a number picked on a laptop.
   */
  desktop(): { w: number; h: number };
}

/** The terminal surface commands write back to. */
export interface Terminal {
  print(text?: string, variant?: LineVariant): void;
  /** Print an element as a block of output (e.g. a rendered table). */
  printEl(el: HTMLElement): void;
  clear(): void;
  focusInput(): void;
}

/** Passed to every command's `run`. */
export interface CommandContext {
  terminal: Terminal;
  windows: WindowManager;
  /** Tokenised positional arguments after the command name (flags excluded). */
  args: string[];
  /** Parsed `--flag` / `--flag=value` tokens; a bare `--flag` is `true`. */
  flags: Record<string, string | boolean>;
  /** The full raw line the user typed. */
  raw: string;
}

export interface Command {
  name: string;
  /** One-line description shown in `help`. */
  summary: string;
  /** Optional usage string, e.g. "project <name>". */
  usage?: string;
  /** Hidden commands (easter eggs) don't appear in `help`. */
  hidden?: boolean;
  run(ctx: CommandContext): void | Promise<void>;
  /** Optional: return the full candidate pool for the arg position being completed. */
  complete?(partialArgs: string[]): string[];
}

/** How a project is presented inside its window. */
export type ProjectKind = "web" | "ios";

export interface Project {
  /** Slug used by `project <slug>`. */
  slug: string;
  name: string;
  blurb: string;
  kind: ProjectKind;
  /** Where the project lives: its site, or its repo when it has no site. */
  url: string;
  /** Source, when there is one. Shown alongside a live site. */
  repo?: string;
  /**
   * Whether the URL permits iframe embedding. iOS/App-Store pages and any
   * site sending X-Frame-Options/CSP frame-ancestors are `false` → the
   * project window falls back to a preview card + "open in new tab".
   */
  embeddable: boolean;
  /**
   * The logical browser viewport this site is designed for. Drives both the
   * window's opening proportions and the embed's render width — a 900px
   * window rendering at 1280 logical px shows the desktop layout rather than
   * the site's mobile breakpoint. Defaults to a laptop viewport.
   */
  viewport?: { width: number; height: number };
  /**
   * Screenshot of the project's site, shown on its card. Projects with
   * no site leave this unset and get a GitHub mark instead.
   */
  thumb?: string;
  tags?: string[];
}
