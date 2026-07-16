/* ------------------------------------------------------------------ *
 * resume — renders resume.md as a documentation window. If a
 * public/resume.pdf exists, adds a download link (checked at runtime).
 * Content lives in src/data/resume.md.
 * ------------------------------------------------------------------ */

import type { CommandContext } from "@/types";
import { renderMarkdown } from "@/core/md";
import resumeMd from "@/data/resume.md?raw";

export function openResume(ctx: CommandContext): void {
  const body = document.createElement("div");
  body.className = "docs";
  body.innerHTML = renderMarkdown(resumeMd);

  // Offer a PDF download only if one is actually present in public/.
  const pdfUrl = `${import.meta.env.BASE_URL}resume.pdf`;
  fetch(pdfUrl, { method: "HEAD" })
    .then((r) => {
      // Dev servers often return 200 (index.html) for missing files, so
      // require an actual PDF content-type before offering the download.
      const type = r.headers.get("content-type") ?? "";
      if (!r.ok || !type.includes("pdf")) return;
      const bar = document.createElement("div");
      bar.className = "docs__toolbar";
      const dl = document.createElement("a");
      dl.className = "docs__download";
      dl.href = pdfUrl;
      dl.target = "_blank";
      dl.rel = "noreferrer noopener";
      dl.textContent = "↓ download PDF";
      bar.append(dl);
      body.prepend(bar);
    })
    .catch(() => {
      /* no PDF — the markdown already hints at adding one */
    });

  ctx.windows.open({
    id: "resume",
    title: "resume — nafees",
    content: body,
    width: 560,
    height: 480,
  });
  ctx.terminal.print("opened: resume", "dim");
}
