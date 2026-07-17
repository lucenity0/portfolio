/* ------------------------------------------------------------------ *
 * boot — the BIOS-style startup sequence. A boxed logo snaps in, then
 * a handful of self-checks type out with slightly uneven timing (real
 * hardware never boots at a steady rhythm). Total < ~2.5s; under
 * reduced motion every line lands instantly.
 * ------------------------------------------------------------------ */

import type { Terminal } from "@/core/terminal";
import type { LineVariant } from "@/types";
import { prefersReducedMotion, sleep } from "@/core/fx";

const LOGO = [
  "┌───────────────────────────┐",
  "│   l u c e n i t y O S     │",
  "│   bios v1.1 — mono/64k    │",
  "└───────────────────────────┘",
];

// [text, variant, extra pause after (ms)] — pauses vary so the boot
// feels like real self-checks, not a metronome.
const BOOT_LINES: ReadonlyArray<[string, LineVariant, number]> = [
  ["● cpu ................ ok", "sub", 30],
  ["● memory ............. 640k (plenty)", "sub", 30],
  ["● pixel shaders ...... ok", "sub", 40],
  ["● crt scanlines ...... flickering nicely", "sub", 30],
  ["● liffy.service ...... loaded", "sub", 60],
  ["● cat daemon ......... asleep (do not wake)", "sub", 120],
  ["mounting /home/visitor ... done", "dim", 60],
];

export async function runBootSequence(term: Terminal): Promise<void> {
  term.setBusy(true);

  // Logo prints instantly — it's a stamp, not a message.
  for (const row of LOGO) term.print(row, "dim");
  if (!prefersReducedMotion()) await sleep(180);

  for (const [text, variant, pause] of BOOT_LINES) {
    await term.typeLine(text, variant, 6);
    if (!prefersReducedMotion()) await sleep(pause);
  }
  term.print();
  term.print("welcome. type `help` to see what i can do.", "default");
  term.print();
  term.setBusy(false);
  term.focusInput();
}
