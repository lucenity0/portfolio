/* ------------------------------------------------------------------ *
 * parse-command — a small quote-aware tokenizer for the terminal input.
 * Replaces naive whitespace-splitting so `project "some slug"` and
 * `project foo\ bar` behave like a real shell would.
 * ------------------------------------------------------------------ */

/**
 * Tokenize a command line: unquoted whitespace separates tokens; `"..."`
 * supports `\"`/`\\` escapes; `'...'` is fully literal; a bare `\X` outside
 * quotes escapes the next character. An unterminated quote is treated
 * leniently — the rest of the line becomes part of that token rather than
 * raising a parse error (a hard failure is bad UX for a portfolio toy).
 */
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inToken = false;
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;

    if (quote) {
      if (ch === quote) {
        quote = null;
      } else if (quote === '"' && ch === "\\" && (line[i + 1] === '"' || line[i + 1] === "\\")) {
        current += line[++i];
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === "\\" && i + 1 < line.length) {
      current += line[++i];
      inToken = true;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      inToken = true;
      continue;
    }

    if (/\s/.test(ch)) {
      if (inToken) {
        tokens.push(current);
        current = "";
        inToken = false;
      }
      continue;
    }

    current += ch;
    inToken = true;
  }

  if (inToken) tokens.push(current);
  return tokens;
}
