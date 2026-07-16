/* ------------------------------------------------------------------ *
 * about — renders about.md as an aesthetic "documentation" window.
 * Content lives in src/data/about.md (edit there, not here).
 * ------------------------------------------------------------------ */

import type { CommandContext } from "@/types";
import { renderMarkdown } from "@/core/md";
import aboutMd from "@/data/about.md?raw";

export function openAbout(ctx: CommandContext): void {
  const body = document.createElement("div");
  body.className = "docs";
  body.innerHTML = renderMarkdown(aboutMd);
  ctx.windows.open({
    id: "about",
    title: "about — nafees",
    content: body,
    width: 540,
    height: 460,
  });
  ctx.terminal.print("opened: about", "dim");
}
