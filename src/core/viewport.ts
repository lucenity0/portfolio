/* ------------------------------------------------------------------ *
 * viewport — publishes the *visual* viewport (the part not covered by
 * an on-screen keyboard) to CSS, so layout can react to the keyboard
 * instead of guessing.
 *
 * Two browsers, two behaviours: Chrome/Android honours the
 * `interactive-widget=resizes-content` in index.html and genuinely
 * shrinks the layout viewport, while iOS Safari leaves layout alone and
 * scrolls the document under the keyboard. `--vv-top` covers the second
 * case — it's the offset an element must add to stay on screen.
 *
 * Exposed on <html>:
 *   --vv-height  visible height in px
 *   --vv-top     how far the visual viewport is scrolled down
 * and on <body>:
 *   .is-keyboard-open
 * ------------------------------------------------------------------ */

/** Below this fraction of the layout height, assume a keyboard is up. */
const KEYBOARD_RATIO = 0.75;

export function mountViewportTracking(): () => void {
  const root = document.documentElement;
  const vv = window.visualViewport;

  let raf = 0;
  const apply = (): void => {
    const height = vv?.height ?? window.innerHeight;
    const top = vv?.offsetTop ?? 0;
    root.style.setProperty("--vv-height", `${height}px`);
    root.style.setProperty("--vv-top", `${top}px`);
    // innerHeight stays at the full layout height on iOS even with the
    // keyboard up, which is exactly what makes this ratio a usable signal.
    document.body.classList.toggle(
      "is-keyboard-open",
      height < window.innerHeight * KEYBOARD_RATIO,
    );
  };

  // Coalesce bursts (the keyboard animates open) the same way the GUI
  // taskbar does — the repo has no debounce helper and doesn't need one.
  const schedule = (): void => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(apply);
  };

  if (vv) {
    vv.addEventListener("resize", schedule);
    vv.addEventListener("scroll", schedule);
  }
  // Fallback for browsers without visualViewport, and for rotation.
  window.addEventListener("resize", schedule);
  window.addEventListener("orientationchange", schedule);
  apply();

  return () => {
    cancelAnimationFrame(raf);
    if (vv) {
      vv.removeEventListener("resize", schedule);
      vv.removeEventListener("scroll", schedule);
    }
    window.removeEventListener("resize", schedule);
    window.removeEventListener("orientationchange", schedule);
  };
}
