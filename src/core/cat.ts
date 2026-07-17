/* ------------------------------------------------------------------ *
 * cat — THE cat. The exact sleeping-cat sprite from the original
 * under-construction page (head on the right, back sloping down-left,
 * closed-eye gaps, paw poking out), ported from canvas pixels to text
 * blocks so it can nap anywhere a <pre> fits: the desktop hero, the
 * terminal, and Liffy's chat window. It is always asleep.
 * ------------------------------------------------------------------ */

/** The original 26×16 pixel matrix (`#` body, `.` transparent). */
const CAT_ROWS = [
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
  "###################.#####.",
  "##...####...##############",
  "##########################",
  "####################...###",
  ".################.........",
  "..#############...........",
] as const;

/**
 * The cat as text. Each pixel becomes two block characters so the
 * ~2:1 character aspect ratio keeps the original proportions.
 */
export function catAscii(): string {
  return CAT_ROWS.map((row) =>
    [...row].map((c) => (c === "#" ? "██" : "  ")).join(""),
  ).join("\n");
}

/**
 * A ready-to-mount cat: the sprite in a <pre> plus three floating "z"
 * glyphs anchored above its head (which is on the right). The z's only
 * animate via CSS that is reduced-motion gated; with motion off they
 * sit as a static "zZz".
 */
export function buildCat(className = "cat"): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = className;

  const art = document.createElement("pre");
  art.className = "cat__art";
  art.textContent = catAscii();
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
