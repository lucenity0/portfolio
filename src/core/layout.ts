/* ------------------------------------------------------------------ *
 * layout — window sizes that suit the screen they open on.
 *
 * Every app used to open at a fixed pixel size, which was picked on a
 * laptop and reads as a postage stamp on a large display. These sizes
 * are a fraction of the desktop instead, clamped at both ends: never
 * smaller than the layout needs, never so large the window swallows the
 * desk it sits on.
 * ------------------------------------------------------------------ */

export interface FitOptions {
  /** Fraction of the desktop to aim for. */
  wFrac: number;
  hFrac: number;
  /** Floors — below these the app's own layout starts to break. */
  minW: number;
  minH: number;
  /** Ceilings — past these a window stops feeling like a window. */
  maxW: number;
  maxH: number;
}

const clamp = (v: number, lo: number, hi: number): number =>
  Math.round(Math.max(lo, Math.min(hi, v)));

export function fitWindow(
  desk: { w: number; h: number },
  o: FitOptions,
): { width: number; height: number } {
  return {
    width: clamp(desk.w * o.wFrac, o.minW, o.maxW),
    height: clamp(desk.h * o.hFrac, o.minH, o.maxH),
  };
}
