/* ------------------------------------------------------------------ *
 * gui-wallpaper — the GUI desktop's night scene, drawn on a low-res
 * canvas scaled up pixel-crisp (same technique as the original
 * under-construction page, whose stars / crescent moon / Zzz math is
 * ported here verbatim-ish). The grid "check" background shows through
 * the transparent sky; on top of it:
 *
 *   · twinkling stars (seeded, three brightness levels, big ones cross)
 *   · a crescent moon with craters, top-right
 *   · a grassy floor above the taskbar, blades swaying ever so slightly
 *   · THE cat, asleep in the grass, breathing, Zzz rising
 *   · a cup of coffee beside it, still steaming — long night
 *
 * All motion collapses to a single static frame under reduced motion.
 * ------------------------------------------------------------------ */

import { CAT_ROWS } from "@/core/cat";
import { prefersReducedMotion } from "@/core/fx";

const SCALE = 5; // css px per scene pixel
const TASKBAR_PX = 42; // .gui__taskbar height the grass must sit above

/* Monochrome palette (token values, as literals for the canvas). */
const C = {
  bright: "#f4f4f4",
  light: "#c8c8c8",
  mid: "#808080",
  dim: "#9a9a9a",
  far: "#3a3a3a",
  shadow: "#222222",
  ground: "#121212",
  groundLine: "#2a2a2a",
  liquid: "#1a1a1a",
};

/* Little 3x5 "Z" glyph, straight from the under-construction page. */
const Z = ["###", "..#", ".#.", "#..", "###"];

export interface GuiWallpaper {
  destroy(): void;
}

export function mountGuiWallpaper(layer: HTMLElement): GuiWallpaper {
  const canvas = document.createElement("canvas");
  canvas.className = "gui__wallpaper";
  canvas.setAttribute("aria-hidden", "true");
  layer.append(canvas);

  const g = canvas.getContext("2d")!;
  const reduce = prefersReducedMotion();

  let W = 0; // scene width in logical pixels
  let H = 0;
  let stars: Array<{ x: number; y: number; ph: number; sp: number; big: boolean }> = [];
  let blades: Array<{ x: number; h: number; ph: number }> = [];
  let raf = 0;

  const px = (x: number, y: number, w: number, h: number, col: string) => {
    g.fillStyle = col;
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  const drawZ = (cx: number, cy: number, s: number, alpha: number) => {
    g.globalAlpha = Math.max(0, Math.min(1, alpha));
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 3; c++)
        if (Z[r]![c] === "#") px(cx + c * s, cy + r * s, s, s, C.light);
    g.globalAlpha = 1;
  };

  /** Re-derive scene geometry from the layer's current size. */
  const init = () => {
    const w = layer.clientWidth || 1;
    const h = layer.clientHeight || 1;
    W = Math.ceil(w / SCALE);
    H = Math.ceil(h / SCALE);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = `${W * SCALE}px`;
    canvas.style.height = `${H * SCALE}px`;

    // Seeded star field (same LCG as the under-construction page) so the
    // sky is identical every visit.
    let s = 1337;
    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    stars = [];
    const skyH = Math.max(10, Math.floor(H * 0.55));
    const count = Math.floor((W * skyH) / 260);
    for (let i = 0; i < count; i++) {
      const x = 2 + Math.floor(rnd() * (W - 4));
      const y = 2 + Math.floor(rnd() * skyH);
      if (x > W - 34 && y < 24) continue; // keep clear of the moon
      stars.push({ x, y, ph: rnd() * Math.PI * 2, sp: 0.6 + rnd() * 1.6, big: rnd() > 0.86 });
    }

    // Grass blades along the horizon, seeded off the same generator.
    blades = [];
    for (let x = 1; x < W; x += 2 + Math.floor(rnd() * 3)) {
      blades.push({ x, h: 2 + Math.floor(rnd() * 3), ph: rnd() * Math.PI * 2 });
    }
  };

  const draw = (t: number) => {
    g.clearRect(0, 0, W, H); // transparent sky — the grid shows through

    const groundTop = H - Math.ceil(TASKBAR_PX / SCALE) - 10;

    // ---- stars (twinkle) ----
    for (const st of stars) {
      const tw = reduce ? 0.8 : 0.45 + 0.55 * Math.sin(t * 0.002 * st.sp + st.ph);
      if (tw < 0.28) continue;
      const col = tw > 0.8 ? C.bright : tw > 0.55 ? C.light : C.mid;
      px(st.x, st.y, 1, 1, col);
      if (st.big && tw > 0.7) {
        px(st.x - 1, st.y, 1, 1, C.mid);
        px(st.x + 1, st.y, 1, 1, C.mid);
        px(st.x, st.y - 1, 1, 1, C.mid);
        px(st.x, st.y + 1, 1, 1, C.mid);
      }
    }

    // ---- crescent moon (top-right; cutout keeps the sky transparent) ----
    const mx = W - 20;
    const my = 14;
    const mr = 8;
    g.fillStyle = C.dim;
    g.beginPath();
    g.arc(mx, my, mr, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = "destination-out";
    g.beginPath();
    g.arc(mx + 3.4, my - 1.6, mr, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = "source-over";
    px(mx - 4, my + 2, 1, 1, C.mid); // craters
    px(mx - 6, my - 2, 1, 1, C.mid);

    // ---- grassy floor ----
    px(0, groundTop, W, H - groundTop, C.ground);
    px(0, groundTop, W, 1, C.groundLine);
    for (let x = 3; x < W; x += 11) px(x, groundTop + 4 + ((x * 7) % 5), 1, 1, C.far);

    // ---- grass blades, drawn here so they sit behind the cat ----
    for (const b of blades) {
      const sway = reduce ? 0 : Math.round(Math.sin(t * 0.0016 + b.ph) * 0.6);
      px(b.x + sway, groundTop - b.h, 1, b.h, b.h > 3 ? C.far : C.shadow);
      px(b.x, groundTop - 1, 1, 1, C.far);
    }

    // ---- the sleeping cat, in the grass (left of center) ----
    const catX = Math.max(6, Math.floor(W * 0.16));
    const breathe = reduce ? 0 : Math.sin(t * 0.0022) > 0.3 ? -1 : 0;
    const catY = groundTop - CAT_ROWS.length + 3 + breathe; // paws sunk in grass
    px(catX + 3, groundTop + 2, 17, 1, C.shadow); // soft shadow in the blades
    for (let r = 0; r < CAT_ROWS.length; r++) {
      const row = CAT_ROWS[r]!;
      for (let c = 0; c < row.length; c++) {
        if (row[c] === "#") px(catX + c, catY + r, 1, 1, C.light);
      }
    }

    // ---- Zzz rising above the cat's head ----
    if (!reduce) {
      const cyc = 2600;
      for (let i = 0; i < 3; i++) {
        const p = ((t + i * 860) % cyc) / cyc;
        const a = p < 0.18 ? p / 0.18 : p > 0.7 ? (1 - p) / 0.3 : 1;
        drawZ(catX + 9 + p * 6, catY - 1 - p * 16, 1 + (i > 1 ? 1 : 0), a);
      }
    } else {
      drawZ(catX + 11, catY - 5, 2, 0.9);
    }

    // ---- the coffee, within paw's reach ----
    const cupX = catX + CAT_ROWS[0]!.length + 6;
    const cupY = groundTop - 6;
    px(cupX, cupY, 7, 6, C.light); // mug body
    px(cupX + 6, cupY + 1, 1, 4, C.mid); // side shade
    px(cupX + 7, cupY + 1, 2, 1, C.mid); // handle
    px(cupX + 8, cupY + 2, 1, 2, C.mid);
    px(cupX + 7, cupY + 4, 2, 1, C.mid);
    px(cupX + 1, cupY, 5, 1, C.liquid); // coffee, black as the sky
    px(cupX + 1, cupY + 6, 6, 1, C.shadow); // resting in the grass
    // steam, wavering up
    if (!reduce) {
      for (let i = 0; i < 2; i++) {
        const sx = cupX + 2 + i * 3;
        for (let k = 0; k < 4; k++) {
          const p = ((t * 0.0012 + i * 0.4 + k * 0.25) % 1 + 1) % 1;
          const a = k === 0 ? 0.5 : 0.5 - p * 0.4;
          g.globalAlpha = Math.max(0.08, a);
          px(sx + Math.round(Math.sin(t * 0.003 + k + i) * 1), cupY - 2 - k * 2, 1, 1, C.mid);
        }
      }
      g.globalAlpha = 1;
    } else {
      px(cupX + 2, cupY - 3, 1, 1, C.mid);
      px(cupX + 5, cupY - 5, 1, 1, C.mid);
    }

  };

  /* ---- lifecycle ---------------------------------------------------- */

  init();
  if (reduce) {
    draw(1800);
  } else {
    const start = performance.now();
    const loop = (now: number) => {
      draw(now - start);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  const ro = new ResizeObserver(() => {
    init();
    if (reduce) draw(1800);
  });
  ro.observe(layer);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.remove();
    },
  };
}
