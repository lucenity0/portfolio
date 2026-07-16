/* ------------------------------------------------------------------ *
 * boot — the BIOS-style startup sequence. Types a few lines on load,
 * then hands control to the user. Reduced-motion collapses the typing.
 * Content is a placeholder; expand the personality in Phase 1.
 * ------------------------------------------------------------------ */

import type { Terminal } from "@/core/terminal";
import type { LineVariant } from "@/types";
import { prefersReducedMotion, sleep } from "@/core/fx";

const BOOT_LINES: ReadonlyArray<[string, LineVariant]> = [
  ["lucenityOS v0.1.0 — cold boot", "dim"],
  ["● cpu ................ ok", "sub"],
  ["● memory ............. ok", "sub"],
  ["● pixel shaders ...... ok", "sub"],
  ["● cat daemon ......... asleep", "sub"],
  ["mounting /home/visitor", "dim"],
];

export async function runBootSequence(term: Terminal): Promise<void> {
  term.setBusy(true);
  for (const [text, variant] of BOOT_LINES) {
    await term.typeLine(text, variant);
    if (!prefersReducedMotion()) await sleep(80);
  }
  term.print();
  term.print("welcome. type `help` to see what i can do.", "default");
  term.print();
  term.setBusy(false);
  term.focusInput();
}
