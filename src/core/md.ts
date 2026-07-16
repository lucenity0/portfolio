/* ------------------------------------------------------------------ *
 * md — a tiny, dependency-free Markdown → HTML renderer for the subset
 * we author ourselves: headings, paragraphs, bold/italic, inline and
 * fenced code, ordered/unordered lists, blockquotes, hr, and links.
 *
 * Content comes from trusted static `.md` files bundled at build time,
 * but we still HTML-escape everything and only emit a known tag set.
 * If we ever need tables/footnotes, swap in `marked`.
 * ------------------------------------------------------------------ */

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Inline formatting for a plain-text segment (no code spans inside). */
function formatSegment(part: string): string {
  let t = escapeHtml(part);
  // Links: [text](url)
  t = t.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, label: string, url: string) =>
      `<a href="${url}" target="_blank" rel="noreferrer noopener">${label}</a>`,
  );
  // Bold, then italic.
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  t = t.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  t = t.replace(/(^|[^_])_([^_\s][^_]*)_/g, "$1<em>$2</em>");
  return t;
}

/**
 * Inline formatting. Split on code spans so their contents are escaped
 * but never re-formatted; format only the plain-text segments between.
 */
function inline(text: string): string {
  return text
    .split(/(`[^`]+`)/g)
    .map((part) =>
      part.length >= 2 && part.startsWith("`") && part.endsWith("`")
        ? `<code>${escapeHtml(part.slice(1, -1))}</code>`
        : formatSegment(part),
    )
    .join("");
}

/**
 * Reduce markdown to readable plain text (for the terminal/CLI typewriter):
 * drop formatting markers, keep link text, turn list bullets into "• ".
 */
export function stripMarkdown(src: string): string {
  return src
    .replace(/```[^\n]*\n?/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^>\s?/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const LIST_RE = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;

export function renderMarkdown(src: string): string {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    // Fenced code block.
    if (/^```/.test(line.trim())) {
      const fence = line.trim().slice(0, 3);
      i++;
      const buf: string[] = [];
      while (i < lines.length && !lines[i]!.trim().startsWith(fence)) {
        buf.push(lines[i]!);
        i++;
      }
      i++; // consume closing fence
      out.push(
        `<pre class="md-pre"><code>${escapeHtml(buf.join("\n"))}</code></pre>`,
      );
      continue;
    }

    // Blank line.
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Heading.
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1]!.length;
      out.push(`<h${level}>${inline(h[2]!.trim())}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule.
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      out.push("<hr />");
      i++;
      continue;
    }

    // Blockquote (consume consecutive lines).
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i]!)) {
        buf.push(lines[i]!.replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
      continue;
    }

    // List (ordered or unordered).
    if (LIST_RE.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const tag = ordered ? "ol" : "ul";
      const items: string[] = [];
      while (i < lines.length && LIST_RE.test(lines[i]!)) {
        const m = LIST_RE.exec(lines[i]!)!;
        items.push(`<li>${inline(m[3]!)}</li>`);
        i++;
      }
      out.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    // Paragraph (consume consecutive non-block lines).
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== "" &&
      !/^```/.test(lines[i]!.trim()) &&
      !/^#{1,6}\s/.test(lines[i]!) &&
      !/^>\s?/.test(lines[i]!) &&
      !LIST_RE.test(lines[i]!) &&
      !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i]!.trim())
    ) {
      para.push(lines[i]!);
      i++;
    }
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }

  return out.join("\n");
}
