/* ------------------------------------------------------------------ *
 * md — a tiny, dependency-free Markdown → HTML renderer for the subset
 * we author ourselves: headings, paragraphs, bold/italic, inline and
 * fenced code, ordered/unordered lists, blockquotes, hr, and links.
 *
 * Content is our own static `.md` files bundled at build time *and*
 * READMEs fetched from GitHub at runtime (see repo-window), so it is
 * not all trusted: everything is HTML-escaped and only a known tag set
 * is ever emitted. The one place source HTML survives is <img>, and
 * even there the tag is rebuilt from scratch with a fixed attribute
 * list, so nothing from the source can arrive as an event handler.
 * If we ever need footnotes, swap in `marked`.
 * ------------------------------------------------------------------ */

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * A URL safe to put in an href/src. Relative paths are kept (repo-window
 * rewrites those against the repo afterwards); anything carrying a scheme
 * other than http/https/mailto — `javascript:` above all — is dropped, so
 * a fetched README can't turn a link into a script.
 */
const SCHEMED_RE = /^[a-z][a-z0-9+.-]*:/i;
const safeUrl = (url: string): string =>
  !SCHEMED_RE.test(url) || /^(https?|mailto):/i.test(url) ? url : "#";

/** Inline formatting for a plain-text segment (no code spans inside). */
function formatSegment(part: string): string {
  let t = escapeHtml(part);
  // Images: ![alt](url). Must run before links, or the link rule below
  // matches the same text and leaves a stray "!" in front of it.
  t = t.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (_m, alt: string, url: string) =>
      `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy" />`,
  );
  // Links: [text](url)
  t = t.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, label: string, url: string) =>
      `<a href="${safeUrl(url)}" target="_blank" rel="noreferrer noopener">${label}</a>`,
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
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^>\s?/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const LIST_RE = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;

/** A separator row: `|---|:--:|`, with or without the outer pipes. */
const TABLE_SEP_RE = /^\s*\|?[\s:-]*-[\s|:-]*\|?\s*$/;

/** Cells of one row, outer pipes dropped. */
const splitRow = (row: string): string[] =>
  row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

/** Colons in the separator set a column's alignment. */
const alignOf = (spec: string): string => {
  const left = spec.startsWith(":");
  const right = spec.endsWith(":");
  if (left && right) return "is-center";
  return right ? "is-right" : "";
};

/**
 * A line made of nothing but image-carrying HTML. READMEs centre their
 * hero shot with `<p align="center"><img ...></p>` because Markdown has
 * no way to say "centred", and escaping that prints the tag at the
 * reader instead of the picture.
 */
const HTML_IMG_LINE_RE = /^\s*(<\/?(?:p|div|br|a)\b[^>]*>|<img\b[^>]*>|\s)+\s*$/i;

/**
 * Whether a run of raw-HTML lines starts here *and* carries a picture.
 * Both halves matter: a run with no <img> in it is left to the paragraph
 * rule to escape, and if this said otherwise neither rule would take the
 * line and the loop would never advance.
 */
function isImageBlock(lines: string[], i: number): boolean {
  let hasImg = false;
  for (let j = i; j < lines.length && HTML_IMG_LINE_RE.test(lines[j]!); j++) {
    if (/<img\b/i.test(lines[j]!)) hasImg = true;
  }
  return hasImg && HTML_IMG_LINE_RE.test(lines[i]!);
}

/**
 * The images inside a run of raw HTML, rebuilt as our own tags. Only src
 * and alt are carried across, and both are escaped — the source's own
 * attributes (onerror, style, anything) never reach the DOM.
 */
function htmlImages(html: string): string {
  const out: string[] = [];
  for (const m of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = m[1]!;
    const src = /\bsrc\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1];
    if (!src) continue;
    const alt = /\balt\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] ?? "";
    out.push(
      `<img src="${escapeHtml(safeUrl(src))}" alt="${escapeHtml(alt)}" loading="lazy" />`,
    );
  }
  return out.join("");
}

/** A table begins where a row of cells sits above a separator row. */
function isTableStart(lines: string[], i: number): boolean {
  const head = lines[i];
  const sep = lines[i + 1];
  return (
    head !== undefined &&
    sep !== undefined &&
    head.includes("|") &&
    sep.includes("-") &&
    sep.includes("|") &&
    TABLE_SEP_RE.test(sep)
  );
}

/**
 * Whether line `i` opens a new block — the shared answer to "does the
 * paragraph/list item I'm accumulating stop here?", so the two callers
 * can't drift apart on what counts as a break.
 */
function startsBlock(lines: string[], i: number): boolean {
  const line = lines[i]!;
  return (
    line.trim() === "" ||
    /^```/.test(line.trim()) ||
    /^#{1,6}\s/.test(line) ||
    /^>\s?/.test(line) ||
    LIST_RE.test(line) ||
    isTableStart(lines, i) ||
    isImageBlock(lines, i) ||
    /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())
  );
}

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
        const buf = [LIST_RE.exec(lines[i]!)![3]!];
        i++;
        // A hard-wrapped bullet continues on the following lines. Without
        // this, every wrapped item ends the list and drops its own tail
        // into a loose paragraph — which is what most READMEs look like.
        while (i < lines.length && !startsBlock(lines, i)) {
          buf.push(lines[i]!.trim());
          i++;
        }
        items.push(`<li>${inline(buf.join(" "))}</li>`);
      }
      out.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    // Table: a header row, a |---|---| separator, then body rows. Worth
    // supporting because READMEs fetched from GitHub lean on them, and
    // without this a table collapses into one run-on paragraph.
    if (isTableStart(lines, i)) {
      const head = splitRow(line);
      const align = splitRow(lines[i + 1]!).map(alignOf);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && lines[i]!.trim() !== "" && lines[i]!.includes("|")) {
        body.push(splitRow(lines[i]!));
        i++;
      }
      const cell = (tag: "th" | "td", text: string, col: number): string => {
        const cls = align[col] ? ` class="${align[col]}"` : "";
        return `<${tag}${cls}>${inline(text)}</${tag}>`;
      };
      // Body rows are laid out against the header, so a row with too few
      // or too many cells can't shear the rest of the table.
      const rows = body
        .map((r) => `<tr>${head.map((_, c) => cell("td", r[c] ?? "", c)).join("")}</tr>`)
        .join("");
      out.push(
        `<table class="md-table"><thead><tr>${head
          .map((h, c) => cell("th", h, c))
          .join("")}</tr></thead><tbody>${rows}</tbody></table>`,
      );
      continue;
    }

    // A raw-HTML image block. Any other HTML falls through to the
    // paragraph rule below, which escapes it.
    if (isImageBlock(lines, i)) {
      const buf: string[] = [];
      while (i < lines.length && HTML_IMG_LINE_RE.test(lines[i]!)) {
        buf.push(lines[i]!);
        i++;
      }
      out.push(`<p class="md-figure">${htmlImages(buf.join(" "))}</p>`);
      continue;
    }

    // Paragraph (consume consecutive non-block lines).
    const para: string[] = [];
    while (i < lines.length && !startsBlock(lines, i)) {
      para.push(lines[i]!);
      i++;
    }
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }

  return out.join("\n");
}
