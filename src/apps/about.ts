/* ------------------------------------------------------------------ *
 * about — renders about.md as an aesthetic "documentation" window.
 * Content lives in src/data/about.md (edit there, not here).
 * ------------------------------------------------------------------ */

import type { CommandContext } from "@/types";
import { renderMarkdown } from "@/core/md";
import { buildCat } from "@/core/cat";
import aboutMd from "@/data/about.md?raw";
import { fitWindow } from "@/core/layout";

export function openAbout(ctx: CommandContext): void {
  const body = document.createElement("div");
  body.className = "docs";
  body.innerHTML = renderMarkdown(aboutMd);
  // The house pixel avatar, floated beside the intro.
  body.prepend(buildCat("cat docs__avatar"));
  ctx.windows.open({
    id: "about",
    title: "about — nafees",
    content: body,
    ...fitWindow(ctx.windows.desktop(), {
      // Prose: wide enough to read, narrow enough not to sprawl.
      wFrac: 0.42, hFrac: 0.72, minW: 540, minH: 460, maxW: 820, maxH: 860,
    }),
  });
  ctx.terminal.print("opened: about", "dim");
}
