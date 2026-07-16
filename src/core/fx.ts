/* ------------------------------------------------------------------ *
 * fx — shared motion helpers. Everything here is reduced-motion aware:
 * when the user prefers reduced motion, animations collapse to their
 * final state instantly. Keep all timing-based effects behind these.
 * ------------------------------------------------------------------ */

export const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

export interface TypewriterOptions {
  /** Milliseconds per character. */
  speed?: number;
  /** Optional delay before typing starts. */
  delay?: number;
}

/**
 * Type `text` into `el` one character at a time. Resolves when done.
 * Under reduced-motion, sets the text immediately.
 */
export async function typewriter(
  el: HTMLElement,
  text: string,
  opts: TypewriterOptions = {},
): Promise<void> {
  const { speed = 18, delay = 0 } = opts;

  if (prefersReducedMotion()) {
    el.textContent = text;
    return;
  }

  if (delay > 0) await sleep(delay);

  el.textContent = "";
  for (const ch of text) {
    el.textContent += ch;
    await sleep(speed);
  }
}

/** Trigger a one-shot CSS animation class, cleaning it up when finished. */
export function playOnce(el: HTMLElement, className: string): void {
  if (prefersReducedMotion()) return;
  el.classList.add(className);
  el.addEventListener(
    "animationend",
    () => el.classList.remove(className),
    { once: true },
  );
}
