/* ------------------------------------------------------------------ *
 * about — the "whoami" window. Placeholder copy for v1; real bio +
 * personality lands in Phase 3.
 * ------------------------------------------------------------------ */

import type { CommandContext } from "@/types";

export function openAbout(ctx: CommandContext): void {
  const body = document.createElement("div");
  body.className = "about";
  body.innerHTML = `
    <h2>whoami</h2>
    <p>hi, i'm <strong>Nafees</strong> (aka <span class="muted">lucenity0</span>) —
    i build things for the web and iOS.</p>
    <p class="muted">this is placeholder text. real bio, timeline, and a
    little pixel avatar arrive in Phase 3.</p>
  `;
  ctx.windows.open({
    id: "about",
    title: "about — whoami",
    content: body,
    width: 460,
    height: 300,
  });
  ctx.terminal.print("opened: about", "dim");
}
