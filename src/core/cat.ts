/* ------------------------------------------------------------------ *
 * cat — THE cat. The exact sleeping-cat sprite from the original
 * under-construction page (head on the right, back sloping down-left,
 * closed-eye gaps, paw poking out), ported from canvas pixels to text
 * blocks so it can nap anywhere a <pre> fits.
 *
 * Frames are patches on the face rows (10–12) of the base matrix:
 *   sleep    — closed-eye slits (the original)
 *   awake    — 2×2 open eyes
 *   think    — squinted slits + a raised-brow pixel
 *   munch-a/b— eyes closed happy + alternating mouth hole (chewing)
 *   peek     — one eye open, one still closed
 * ------------------------------------------------------------------ */

export type CatFrame =
  | "sleep"
  | "awake"
  | "think"
  | "munch-a"
  | "munch-b"
  | "peek";

/** The original 26×16 pixel matrix (`#` body, `.` transparent).
 *  Exported for canvas renderers (the GUI wallpaper scene). */
export const CAT_ROWS = [
  "..#.......#...............",
  ".###.....###..............",
  ".#.##....#.##.............",
  ".#..##..##..##............",
  ".#.########..##...........",
  ".################.........",
  ".#################........",
  ".##################.......",
  ".##################.......",
  "###################.......",
  "###################.#####.", // row 10 — brow line (col 19 gap + tail)
  "##...####...##############", // row 11 — eye line (closed slits)
  "##########################", // row 12 — mouth line
  "####################...###",
  ".################.........",
  "..#############...........",
];

/** Per-frame row overrides. Rows not listed fall back to the base. */
const FRAME_PATCHES: Record<CatFrame, Partial<Record<number, string>>> = {
  sleep: {},
  awake: {
    10: "##..#####..########.#####.",
    11: "##..#####..###############",
  },
  think: {
    10: "##########.########.#####.",
    11: "##..####..################",
  },
  "munch-a": {
    12: "#####...##################",
  },
  "munch-b": {
    12: "######..##################",
  },
  peek: {
    10: "##..###############.#####.",
    11: "##..#####...##############",
  },
};

/**
 * The cat as text. Each pixel becomes two block characters so the
 * ~2:1 character aspect ratio keeps the original proportions.
 */
export function catAscii(frame: CatFrame = "sleep"): string {
  const patch = FRAME_PATCHES[frame];
  return CAT_ROWS.map((row, i) => patch[i] ?? row)
    .map((row) => [...row].map((c) => (c === "#" ? "██" : "  ")).join(""))
    .join("\n");
}

/** Swap the face on an element previously built by `buildCat`. */
export function setCatFrame(catEl: HTMLElement, frame: CatFrame): void {
  const art = catEl.querySelector(".cat__art");
  if (art) art.textContent = catAscii(frame);
  catEl.dataset.frame = frame;
}

/**
 * A ready-to-mount cat: the sprite in a <pre> plus three floating "z"
 * glyphs anchored above its head (which is on the right). The z's only
 * animate via CSS that is reduced-motion gated, and only show while the
 * frame is "sleep" (see hero.css).
 */
export function buildCat(className = "cat", frame: CatFrame = "sleep"): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = className;
  wrap.dataset.frame = frame;

  const art = document.createElement("pre");
  art.className = "cat__art";
  art.textContent = catAscii(frame);
  art.setAttribute("aria-hidden", "true");

  const zzz = document.createElement("span");
  zzz.className = "cat__zzz";
  zzz.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 3; i++) {
    const z = document.createElement("span");
    z.className = "cat__z";
    z.textContent = "z";
    z.style.animationDelay = `${i * 0.9}s`;
    zzz.append(z);
  }

  wrap.append(zzz, art);
  return wrap;
}
