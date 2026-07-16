/* ------------------------------------------------------------------ *
 * RetrievalEngine — a client-side, keyword-scored retrieval bot.
 * Splits liffy.md into chunks by heading, scores each against the
 * question (token overlap + a title-match boost), and returns the best
 * chunk above a threshold. Below threshold → a graceful, on-brand
 * fallback. A few built-in intents handle greetings/thanks/identity.
 *
 * Strictly grounded: it never invents — it only echoes the profile MD.
 * ------------------------------------------------------------------ */

import type { ChatTurn, LiffyEngine, LiffyReply } from "@/core/liffy/engine";
import { stripMarkdown } from "@/core/md";

interface Chunk {
  title: string;
  body: string;
  tokens: Set<string>;
  titleTokens: Set<string>;
}

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "do",
  "does", "did", "of", "to", "in", "on", "for", "and", "or", "but", "with",
  "at", "by", "from", "as", "it", "its", "this", "that", "these", "those",
  "i", "you", "he", "she", "they", "we", "me", "him", "her", "them", "his",
  "your", "my", "our", "their", "what", "which", "who", "whom", "how", "when",
  "where", "why", "can", "could", "would", "should", "will", "shall", "have",
  "has", "had", "about", "tell", "know", "any", "some", "does", "into", "so",
]);

/**
 * Very light stemmer so "build"/"builds"/"building" and "project"/"projects"
 * all match. Deliberately conservative to avoid mangling short words
 * (e.g. "ios", "css", "js" are left alone).
 */
function stem(t: string): string {
  if (t.length <= 3) return t;
  if (t.endsWith("ies")) return `${t.slice(0, -3)}y`;
  if (t.endsWith("ing") && t.length > 5) return t.slice(0, -3);
  if (t.endsWith("ed") && t.length > 4) return t.slice(0, -2);
  if (t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.replace(/^[.]+|[.]+$/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

function parseChunks(markdown: string): Chunk[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const raw: Array<{ title: string; body: string[] }> = [];
  let title = "about";
  let body: string[] = [];
  const flush = () => {
    if (body.join("").trim()) raw.push({ title, body });
  };
  for (const line of lines) {
    const h = /^#{1,3}\s+(.*)$/.exec(line);
    if (h) {
      flush();
      title = h[1]!.trim();
      body = [];
    } else {
      body.push(line);
    }
  }
  flush();

  return raw.map(({ title: t, body: b }) => {
    const text = b.join("\n").trim();
    return {
      title: t,
      body: text,
      tokens: new Set(tokenize(`${t} ${text}`)),
      titleTokens: new Set(tokenize(t)),
    };
  });
}

const THRESHOLD = 0.28;

export class RetrievalEngine implements LiffyEngine {
  private readonly chunks: Chunk[];

  constructor(markdown: string) {
    this.chunks = parseChunks(markdown);
  }

  async ask(question: string, _history: ChatTurn[]): Promise<LiffyReply> {
    const intent = matchIntent(question);
    if (intent) return { text: intent, grounded: true };

    const qTokens = tokenize(question);
    if (qTokens.length === 0) return this.fallback();

    let best: Chunk | null = null;
    let bestScore = 0;
    for (const chunk of this.chunks) {
      let raw = 0;
      for (const t of qTokens) {
        if (chunk.titleTokens.has(t)) raw += 2;
        else if (chunk.tokens.has(t)) raw += 1;
      }
      const score = raw / qTokens.length;
      if (score > bestScore) {
        bestScore = score;
        best = chunk;
      }
    }

    if (!best || bestScore < THRESHOLD) return this.fallback();
    return {
      text: stripMarkdown(best.body),
      grounded: true,
      sources: [best.title],
    };
  }

  private fallback(): LiffyReply {
    const topics = this.chunks
      .map((c) => c.title.toLowerCase())
      .slice(0, 8)
      .join(", ");
    return {
      text: `hmm, that's not in my notes. try asking me about: ${topics}.`,
      grounded: false,
    };
  }
}

function matchIntent(q: string): string | null {
  const s = q.toLowerCase().trim();
  if (/^(hi|hey|hello|yo|sup|howdy|hiya)\b/.test(s))
    return "hey! i'm liffy — nafees's terminal sidekick. ask me anything about him. try \"what does he build?\"";
  if (/\b(thanks|thank you|thx|ty|appreciate)\b/.test(s)) return "anytime :)";
  if (/(who|what) are you|your name|what.*liffy/.test(s))
    return "i'm liffy, a lil assistant that knows nafees. ask away — projects, skills, contact, whatever.";
  if (/\b(bye|cya|goodbye|see ya|later)\b/.test(s))
    return "catch you later! (close the window when you're done)";
  return null;
}
