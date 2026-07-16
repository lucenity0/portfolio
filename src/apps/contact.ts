/* ------------------------------------------------------------------ *
 * contact — socials + email window. Placeholder links for v1.
 * ------------------------------------------------------------------ */

import type { CommandContext } from "@/types";

export function openContact(ctx: CommandContext): void {
  const body = document.createElement("div");
  body.className = "contact";
  body.innerHTML = `
    <h2>contact</h2>
    <ul class="contact__list">
      <li><span class="muted">github</span> —
        <a href="https://github.com/lucenity0" target="_blank" rel="noreferrer noopener">github.com/lucenity0</a></li>
      <li><span class="muted">email</span> —
        <a href="mailto:hello@lucenity.dev">hello@lucenity.dev</a></li>
    </ul>
    <p class="muted">placeholder — swap in real handles in Phase 3.</p>
  `;
  ctx.windows.open({
    id: "contact",
    title: "contact",
    content: body,
    width: 420,
    height: 260,
  });
  ctx.terminal.print("opened: contact", "dim");
}
