/* ------------------------------------------------------------------ *
 * RetrievalEngine — a client-side, grounded retriever for liffy.md.
 * No LLM, no keys: it reads Nafees's notes and answers from them.
 *
 * How it stays *smart* despite being pure lexical retrieval:
 *   1. Chunking     — split liffy.md by heading. Each heading is a
 *                     pipe/slash list of question keywords → aliases.
 *   2. Ranking      — BM25 + IDF over chunk bodies, so rare, telling
 *                     terms ("regret", "schedulr") outweigh common ones
 *                     ("app", "built"); heading aliases and distinctive
 *                     name-phrases ("hateful meme detection") get boosts.
 *   3. Focusing     — a second, extractive pass ranks *sentences* inside
 *                     the winning chunk, so a pointed question ("askcal's
 *                     stack?") returns the stack line, not 3 paragraphs.
 *   4. Memory       — follow-ups ("tell me more") and anaphora ("how does
 *                     it work?") resolve against the last topic discussed.
 *   5. Robustness   — typo rescue (edit distance) for names, graceful
 *                     on-brand fallback, and it never speaks the file's
 *                     HTML comments or author TODOs.
 *
 * It only ever echoes the profile MD — it cannot invent.
 * ------------------------------------------------------------------ */

import type { ChatTurn, LiffyEngine, LiffyReply } from "@/core/liffy/engine";
import { stripMarkdown } from "@/core/md";

/* ---- tuning knobs --------------------------------------------------- */

const K1 = 1.4; // BM25 term-frequency saturation
const B = 0.72; // BM25 length normalization
const ALIAS_WEIGHT = 2.4; // heading-keyword match is a strong signal
const PHRASE_BONUS = 3.0; // a distinctive name-phrase appears verbatim
const IDF_FLOOR = 0.75; // a match must clear this to answer alone
const EXTRACT_IDF_FLOOR = 0.9; // a facet term must be at least this telling
const LEAD_SENTENCES = 5; // how much of a topic to open with
const MORE_SENTENCES = 4; // how much each "tell me more" adds
const MAX_EXTRACT = 3; // sentences returned for a pointed question

/* ---- language helpers ----------------------------------------------- */

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "do",
  "does", "did", "of", "to", "in", "on", "for", "and", "or", "but", "with",
  "at", "by", "from", "as", "it", "its", "this", "that", "these", "those",
  "i", "you", "he", "she", "they", "we", "me", "him", "her", "them", "his",
  "your", "my", "our", "their", "what", "which", "who", "whom", "how", "when",
  "where", "why", "can", "could", "would", "should", "will", "shall", "have",
  "has", "had", "about", "tell", "know", "any", "some", "into", "so", "u",
  "does", "did", "get", "got", "give", "us", "please", "hey", "im",
]);

/**
 * Function-y verbs that describe *asking about* a topic rather than naming a
 * facet of it — dropped from sentence extraction so "how does it work?" gets
 * the overview instead of cherry-picking sentences that merely say "work".
 */
const GENERIC = new Set([
  "work", "use", "using", "make", "made", "build", "built", "run", "get",
  "got", "thing", "stuff", "look", "like", "happen", "involve", "mean",
  "explain", "describe", "show",
]);

/**
 * Conservative stemmer so "build"/"builds"/"building" and
 * "project"/"projects" collapse together. Left alone for short tokens so
 * "ios", "css", "js", "ppo" survive intact.
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

const uniq = (xs: string[]): string[] => [...new Set(xs)];

/** Alnum-only, single-spaced — used for whole-phrase substring matching. */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
const pad = (s: string): string => ` ${s} `;

/** Bounded Levenshtein — enough to catch a one/two-key typo in a name. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
      curr.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1; // whole row already over budget
    prev = curr;
  }
  return prev[b.length]!;
}

/* ---- corpus model --------------------------------------------------- */

interface Sentence {
  text: string;
  terms: Set<string>;
}

interface Chunk {
  /** Friendly one-word-ish label for fallbacks / "more" prompts. */
  label: string;
  /** All heading alias phrases, normalized (e.g. "askcal", "pulse"). */
  aliases: string[];
  /** Distinctive alias phrases matched verbatim (names, multi-word). */
  namePhrases: string[];
  /** Tokens from every heading alias — deliberately authored keywords. */
  aliasTokens: Set<string>;
  /** Tokens from the FIRST alias — identifies the topic by its own name. */
  nameTokens: Set<string>;
  /** Clean spoken text (HTML comments + author TODOs removed). */
  sentences: Sentence[];
  /** Body term frequencies, for BM25. */
  tf: Map<string, number>;
  /** Body length in tokens. */
  length: number;
}

/** Words too generic to treat as a verbatim "name" hit. */
const WEAK_NAMES = new Set(["about", "work", "works", "fun", "intro", "bio", "apps"]);

function isDistinctivePhrase(alias: string): boolean {
  if (alias.includes(" ")) return true; // multi-word aliases are specific
  return alias.length >= 5 && !WEAK_NAMES.has(alias) && !STOPWORDS.has(alias);
}

const DOT = ""; // sentinel: a period we must NOT treat as a sentence end
const ABBR =
  /\b(?:[A-Za-z]\.){2,}|\b(?:prof|dr|mr|mrs|ms|sr|jr|st|vs|etc|fig|no|ph|approx|e\.g|i\.e|a\.m|p\.m)\.|\b[A-Z]\.(?=\s+[A-Z0-9])/g;

/** Hide abbreviation/initial dots so they don't split "B.M.S." or "Prof.". */
const shield = (s: string): string =>
  s.replace(ABBR, (m) => m.replace(/\./g, DOT));
const unshield = (s: string): string => s.replace(new RegExp(DOT, "g"), ".");

/** Split a chunk body into sentences (unwrapping hard-wraps first). */
function toSentences(body: string): Sentence[] {
  const out: Sentence[] = [];
  for (const para of body.split(/\n{2,}/)) {
    const joined = shield(para.replace(/\s*\n\s*/g, " ").trim());
    if (!joined) continue;
    // Break on . ! ? that are followed by whitespace + a new sentence start.
    for (const part of joined.split(/(?<=[.!?])\s+(?=[A-Z0-9("'*])/)) {
      const text = unshield(part).trim();
      if (text) out.push({ text, terms: new Set(tokenize(text)) });
    }
  }
  return out;
}

function pickLabel(aliases: string[]): string {
  const first = aliases[0] ?? "topic";
  if (!first.includes(" ")) return first; // already a tidy single word
  // Otherwise the shortest single-word, non-stopword alias reads best.
  const singles = aliases
    .filter((a) => !a.includes(" ") && a.length >= 3 && !STOPWORDS.has(a))
    .sort((a, b) => a.length - b.length);
  return singles[0] ?? first;
}

/** Drop TODO paragraphs whole (they hard-wrap across lines) so Liffy
 *  never reads authoring notes aloud. Runs to the next blank line/heading. */
function stripTodoBlocks(src: string): string {
  const out: string[] = [];
  let skipping = false;
  for (const line of src.split("\n")) {
    if (skipping) {
      if (line.trim() === "" || /^#{1,3}\s/.test(line)) skipping = false;
      else continue;
    }
    if (/^\s*todo\b/i.test(line)) {
      skipping = true;
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

function parseChunks(markdown: string): Chunk[] {
  const src = stripTodoBlocks(
    markdown
      .replace(/\r\n?/g, "\n")
      .replace(/<!--[\s\S]*?-->/g, ""), // never speak authoring comments
  );

  const lines = src.split("\n");
  const raw: Array<{ heading: string; body: string[] }> = [];
  let heading = "";
  let body: string[] = [];
  const flush = () => {
    if (heading && body.join("").trim()) raw.push({ heading, body });
  };
  for (const line of lines) {
    const h = /^#{1,3}\s+(.*)$/.exec(line);
    if (h) {
      flush();
      heading = h[1]!.trim();
      body = [];
    } else if (heading) {
      body.push(line);
    }
  }
  flush();

  return raw.map(({ heading: head, body: b }) => {
    const aliases = uniq(
      head
        .split(/\s*[/|]\s*/)
        .map((a) => normalize(a))
        .filter(Boolean),
    );
    const sentences = toSentences(stripMarkdown(b.join("\n")).trim());

    const tf = new Map<string, number>();
    let length = 0;
    for (const sent of sentences) {
      for (const t of tokenize(sent.text)) {
        tf.set(t, (tf.get(t) ?? 0) + 1);
        length++;
      }
    }

    return {
      label: pickLabel(aliases),
      aliases,
      namePhrases: aliases.filter(isDistinctivePhrase),
      aliasTokens: new Set(aliases.flatMap((a) => tokenize(a))),
      nameTokens: new Set(tokenize(aliases[0] ?? "")),
      sentences,
      tf,
      length,
    };
  });
}

/* ---- the engine ----------------------------------------------------- */

interface Ranked {
  chunk: Chunk;
  index: number;
  score: number;
  matched: number; // # of distinct query terms this chunk hit
  bestIdf: number; // strongest single term match
  phraseHit: boolean;
}

/** Where we are in the conversation, so follow-ups have something to hold. */
interface TopicState {
  index: number;
  shown: Set<number>; // sentence indices already spoken from this chunk
}

const MORE_RE =
  /^(tell me more|more|more please|go on|continue|keep going|say more|elaborate|expand|and\??|and then\??|what else\??|anything else\??|\.\.\.|…)$/;

const ANAPHORA_RE =
  /\b(it|its|it's|that|this|they|them|those|these|the (app|project|tool|thing|system|paper|model|one|setup))\b/;

export class RetrievalEngine implements LiffyEngine {
  private readonly chunks: Chunk[];
  private readonly idf = new Map<string, number>();
  private readonly avgdl: number;
  private readonly names: Array<{ token: string; index: number }> = [];
  private topic: TopicState | null = null;

  constructor(markdown: string) {
    this.chunks = parseChunks(markdown);

    // IDF over chunks (document = chunk body ∪ heading keywords).
    const N = this.chunks.length || 1;
    const df = new Map<string, number>();
    let totalLen = 0;
    for (const c of this.chunks) {
      totalLen += c.length;
      for (const t of new Set([...c.tf.keys(), ...c.aliasTokens])) {
        df.set(t, (df.get(t) ?? 0) + 1);
      }
    }
    for (const [t, d] of df) {
      this.idf.set(t, Math.log(1 + (N - d + 0.5) / (d + 0.5)));
    }
    this.avgdl = totalLen / N;

    // Index of distinctive single-word names, for typo rescue.
    this.chunks.forEach((c, index) => {
      for (const p of c.namePhrases) {
        if (!p.includes(" ")) this.names.push({ token: p, index });
      }
    });
  }

  async ask(question: string, _history: ChatTurn[]): Promise<LiffyReply> {
    const raw = question.trim();
    const low = raw.toLowerCase();

    const intent = matchIntent(low);
    if (intent) return { text: intent, grounded: true }; // topic state untouched

    const qTerms = uniq(tokenize(raw));
    const norm = normalize(raw);
    const wantsMore = MORE_RE.test(low.replace(/[!.?]+$/, "").trim());

    // "tell me more" / bare acknowledgements → continue the current topic.
    if ((wantsMore || qTerms.length === 0) && this.topic) return this.continueTopic();
    if (qTerms.length === 0) return this.reprompt();

    // An explicit anaphoric pronoun ("how does IT work?", "what's ITS stack?")
    // resolves to whatever we're already discussing — even if the question
    // also contains a topic keyword ("stack") that belongs elsewhere.
    if (this.topic && ANAPHORA_RE.test(low)) {
      return this.answerFrom(this.chunks[this.topic.index]!, this.topic.index, qTerms);
    }

    // Otherwise rank every chunk against the question on its own merits.
    const ranked = this.chunks
      .map((chunk, index) => this.scoreChunk(chunk, index, qTerms, norm))
      .sort((a, b) => b.score - a.score);

    let best = ranked[0];
    const strong =
      best != null &&
      (best.phraseHit || best.bestIdf >= IDF_FLOOR || best.matched >= 2);

    if (!best || !strong) {
      const rescued = this.rescueTypo(qTerms);
      if (rescued == null) return this.fallback();
      best = ranked.find((r) => r.index === rescued)!;
    }

    return this.answerFrom(best.chunk, best.index, qTerms);
  }

  /* -- scoring -------------------------------------------------------- */

  private scoreChunk(
    chunk: Chunk,
    index: number,
    qTerms: string[],
    norm: string,
  ): Ranked {
    let score = 0;
    let matched = 0;
    let bestIdf = 0;

    for (const t of qTerms) {
      const idf = this.idf.get(t) ?? 0;
      const f = chunk.tf.get(t) ?? 0;
      const tfPart =
        f === 0
          ? 0
          : (f * (K1 + 1)) /
            (f + K1 * (1 - B + B * (chunk.length / this.avgdl)));
      const bodyScore = idf * tfPart;
      const aliasScore = chunk.aliasTokens.has(t) ? idf * ALIAS_WEIGHT : 0;
      if (bodyScore > 0 || aliasScore > 0) {
        matched++;
        if (idf > bestIdf) bestIdf = idf;
      }
      score += bodyScore + aliasScore;
    }

    let phraseHit = false;
    for (const p of chunk.namePhrases) {
      if (pad(norm).includes(pad(p))) {
        score += PHRASE_BONUS;
        phraseHit = true;
      }
    }

    return { chunk, index, score, matched, bestIdf, phraseHit };
  }

  /** Map a mistyped token onto a known name if it's within a key or two. */
  private rescueTypo(qTerms: string[]): number | null {
    let best: { index: number; dist: number } | null = null;
    for (const t of qTerms) {
      if (t.length < 4) continue;
      const budget = t.length >= 7 ? 2 : 1;
      for (const { token, index } of this.names) {
        const d = editDistance(t, token, budget);
        if (d <= budget && (!best || d < best.dist)) best = { index, dist: d };
      }
    }
    return best?.index ?? null;
  }

  /* -- answer construction ------------------------------------------- */

  private answerFrom(chunk: Chunk, index: number, qTerms: string[]): LiffyReply {
    // A pointed question carries a *facet* term: something beyond the topic's
    // own name, that isn't a generic verb ("work", "use"), and that is
    // distinctive enough to single out sentences. Otherwise it's a broad ask
    // ("tell me about X", "how does it work?") → open with the lead.
    const focus = qTerms.filter(
      (t) =>
        !chunk.nameTokens.has(t) &&
        !GENERIC.has(t) &&
        (this.idf.get(t) ?? 0) >= EXTRACT_IDF_FLOOR,
    );

    if (focus.length > 0) {
      const picked = this.extract(chunk, focus);
      if (picked.length > 0) {
        this.topic = { index, shown: new Set(picked) };
        return {
          text: picked.map((i) => chunk.sentences[i]!.text).join(" "),
          grounded: true,
          sources: [chunk.label],
        };
      }
    }

    // Generic ask (or nothing specific matched) → open with the lead.
    const lead = chunk.sentences.slice(0, LEAD_SENTENCES);
    const shown = new Set(lead.map((_, i) => i));
    this.topic = { index, shown };
    let text = lead.map((s) => s.text).join(" ");
    if (chunk.sentences.length > lead.length) text += ` — say "more" for the rest.`;
    return { text, grounded: true, sources: [chunk.label] };
  }

  /** Rank sentences inside a chunk by IDF-weighted overlap with the query. */
  private extract(chunk: Chunk, qTerms: string[]): number[] {
    const scored = chunk.sentences
      .map((s, i) => {
        let sc = 0;
        for (const t of qTerms) if (s.terms.has(t)) sc += this.idf.get(t) ?? 0.5;
        return { i, sc };
      })
      .filter((x) => x.sc > 0)
      .sort((a, b) => b.sc - a.sc)
      .slice(0, MAX_EXTRACT)
      .sort((a, b) => a.i - b.i); // restore reading order
    return scored.map((x) => x.i);
  }

  /** Serve the next unseen slice of the current topic. */
  private continueTopic(): LiffyReply {
    const state = this.topic!;
    const chunk = this.chunks[state.index]!;
    const remaining: number[] = [];
    for (let i = 0; i < chunk.sentences.length; i++) {
      if (!state.shown.has(i)) remaining.push(i);
    }
    if (remaining.length === 0) {
      return {
        text: `that's everything in my notes on ${chunk.label}. ask me something specific — its stack, how it works, who's involved.`,
        grounded: true,
        sources: [chunk.label],
      };
    }
    const take = remaining.slice(0, MORE_SENTENCES);
    take.forEach((i) => state.shown.add(i));
    let text = take.map((i) => chunk.sentences[i]!.text).join(" ");
    if (state.shown.size < chunk.sentences.length) text += ` — more?`;
    return { text, grounded: true, sources: [chunk.label] };
  }

  /* -- graceful degradation ------------------------------------------ */

  private reprompt(): LiffyReply {
    return {
      text: `ask me something about nafees — try: ${this.topicList()}.`,
      grounded: false,
    };
  }

  private fallback(): LiffyReply {
    return {
      text: `hmm, that's not in my notes. i can talk about: ${this.topicList()}.`,
      grounded: false,
    };
  }

  private topicList(): string {
    return this.chunks
      .slice(0, 8)
      .map((c) => c.label)
      .join(", ");
  }
}

/* ---- built-in small talk / meta ------------------------------------- */

function matchIntent(s: string): string | null {
  const t = s.replace(/[!.?]+$/, "").trim();
  if (/^(hi|hey|hello|yo|sup|howdy|hiya|heya|hii+|hey there|good (morning|evening|afternoon))\b/.test(t))
    return 'hey! i\'m liffy — nafees\'s terminal sidekick. ask me anything about him. try: "what does he build?"';
  if (/^(thanks|thank you|thx|ty|tysm|appreciate it|cheers|nice|cool|awesome|great)\b/.test(t))
    return "anytime :)";
  if (/^(bye|cya|goodbye|see ya|see you|later|gtg|good night|gn)\b/.test(t))
    return "catch you later! (close the window whenever)";
  if (/\b(how are you|how's it going|hows it going|you good|wyd)\b/.test(t))
    return "just vibing in the terminal, waiting for questions about nafees. what do you want to know?";
  if (/(are|r) you (a )?(bot|ai|robot|real|human|person|chatgpt|claude)/.test(t))
    return "i'm a lil retrieval bot — no LLM, no keys. i only know what's in nafees's notes, and i answer straight from them.";
  if (/(who|what) are you|your name|are you liffy(?!\s*(review|the))/.test(t))
    return "i'm liffy, a tiny assistant that knows nafees. ask away — projects, skills, research, contact, whatever.";
  if (/^(help|what can you do|commands|options|menu|\?)$/.test(t))
    return "i answer questions about nafees from his notes. try: \"what does he build?\", \"tell me about askcal\", \"what's his stack?\", or just a topic name.";
  if (/(who (made|built|created) you)/.test(t))
    return "nafees built me for this site — a grounded retriever over his own notes. ask me about him next.";
  return null;
}
