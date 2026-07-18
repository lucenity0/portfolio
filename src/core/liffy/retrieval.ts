/* ------------------------------------------------------------------ *
 * RetrievalEngine — a client-side, grounded retriever for liffy.md.
 * No LLM, no keys: it reads Nafees's notes and answers from them.
 *
 * v2 — `ask()` is now a staged pipeline, run like a tiny agent loop:
 *
 *   intent → clarify-resolution → follow-up → query rewrite (typo
 *   correction against the whole vocabulary) → compound split →
 *   BM25 ranking → cross-chunk aggregation → anaphora resolution →
 *   near-tie clarification → yes/no absence → fallback
 *
 * What makes it *smart* despite being pure lexical retrieval:
 *   1. Chunking     — split liffy.md by heading. Each heading is a
 *                     pipe/slash list of question keywords → aliases.
 *   2. Ranking      — BM25 + IDF over chunk bodies, so rare, telling
 *                     terms ("regret", "schedulr") outweigh common ones;
 *                     heading aliases and name-phrases get boosts.
 *   3. Focusing     — a second, extractive pass ranks *sentences* inside
 *                     the winning chunk, so a pointed question ("askcal's
 *                     stack?") returns the stack line, not 3 paragraphs.
 *   4. Aggregation  — "which projects use fastapi?" scans EVERY chunk
 *                     for the pivot term and answers across them.
 *   5. Compound     — "askcal and tiket?" splits, answers both parts.
 *   6. Clarifying   — a genuine tie ("the swiftui app"?) asks which one
 *                     you meant and resolves your next message against
 *                     the offered options — a real conversational loop.
 *   7. Memory       — follow-ups ("more", "yes") and anaphora ("how does
 *                     it work?") resolve against the last topic; naming
 *                     a *different* topic always wins over stickiness.
 *   8. Robustness   — typo correction over the full vocabulary (edit
 *                     distance, IDF-weighted), graceful yes/no "can't
 *                     confirm" replies, on-brand fallback, and it never
 *                     speaks the file's HTML comments or author TODOs.
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
const IDF_SUM_FLOOR = 1.2; // …or several matches must add up to this
const EXTRACT_IDF_FLOOR = 0.9; // a facet term must be at least this telling
const LEAD_SENTENCES = 5; // how much of a topic to open with
const MORE_SENTENCES = 4; // how much each "tell me more" adds
const MAX_EXTRACT = 3; // sentences returned for a pointed question
const CLARIFY_RATIO = 0.8; // runner-up this close to the top → a tie
const PRIORITY_BONUS = 4.0; // "alias!" — this chunk owns the term on ties
const AGG_MAX_CHUNKS = 4; // cross-chunk answers cap
const AGG_DF_MAX = 8; // pivot term may live in at most this many chunks

/* ---- language helpers ----------------------------------------------- */

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "do",
  "does", "did", "of", "to", "in", "on", "for", "and", "or", "but", "with",
  "at", "by", "from", "as", "it", "its", "this", "that", "these", "those",
  "i", "you", "he", "she", "they", "we", "me", "him", "her", "them", "his",
  "your", "my", "our", "their", "what", "which", "who", "whom", "how", "when",
  "where", "why", "can", "could", "would", "should", "will", "shall", "have",
  "has", "had", "about", "tell", "know", "any", "some", "into", "so", "u",
  "get", "got", "give", "us", "please", "hey", "im",
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
    .map(stem)
    .filter((t) => !STOPWORDS.has(t)); // "whats" stems to "what" — drop again
}

const uniq = (xs: string[]): string[] => [...new Set(xs)];

/** Alnum-only, single-spaced — used for whole-phrase substring matching. */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
const pad = (s: string): string => ` ${s} `;

/** Bounded Damerau-Levenshtein — catches one/two-key typos in a word,
 *  counting adjacent transpositions ("regert" → "regret") as ONE edit. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2: number[] | null = null;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
      if (
        prev2 &&
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        v = Math.min(v, prev2[j - 2]! + 1); // transposition
      }
      curr.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1; // whole row already over budget
    prev2 = prev;
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
  /**
   * Tokens from aliases marked with a trailing "!" in the heading — the
   * author's ruling on what MOST askers mean by that word. A term like
   * "gmail" can appear in several chunks (contact info vs. askcal's Gmail
   * integration); the priority chunk wins the tie, and the answer points
   * at the other context instead of silently dropping it.
   */
  priorityTokens: Set<string>;
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

/**
 * Did the question literally NAME this chunk — its first alias, its label,
 * or one of its multi-word phrases? Single-word facet aliases ("stack")
 * deliberately don't count: "what's its stack?" is anaphora, not naming.
 */
function isNamedPhraseIn(norm: string, chunk: Chunk): boolean {
  const hay = pad(norm);
  const first = chunk.aliases[0];
  if (first && hay.includes(pad(first))) return true;
  if (hay.includes(pad(chunk.label))) return true;
  for (const p of chunk.namePhrases) {
    if (p.includes(" ") && hay.includes(pad(p))) return true;
  }
  return false;
}

const DOT = "\u0001"; // sentinel: a period we must NOT treat as a sentence end (control char, never in prose)
const ABBR =
  /\b(?:[A-Za-z]\.){2,}|\b(?:prof|dr|mr|mrs|ms|sr|jr|st|vs|etc|fig|no|ph|approx|e\.g|i\.e|a\.m|p\.m)\.|\b[A-Z]\.(?=\s+[A-Z0-9])/gi;

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
    // An alias ending in "!" is a PRIORITY alias — detect before normalize
    // strips the punctuation.
    const rawAliases = head.split(/\s*[/|]\s*/);
    const priorityTokens = new Set(
      rawAliases
        .filter((a) => /!\s*$/.test(a))
        .flatMap((a) => tokenize(normalize(a))),
    );
    const aliases = uniq(rawAliases.map((a) => normalize(a)).filter(Boolean));
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
      // Priority aliases are contested FACET words ("gmail"), not this
      // chunk's name — granting them the verbatim name-phrase bonus on
      // top of the priority bonus would double-count and let "does
      // askcal use gmail?" land on contact instead of askcal.
      namePhrases: aliases
        .filter(isDistinctivePhrase)
        .filter((a) => a.includes(" ") || !priorityTokens.has(stem(a))),
      aliasTokens: new Set(aliases.flatMap((a) => tokenize(a))),
      priorityTokens,
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
  idfSum: number; // total IDF of matched terms — 2 weak hits ≠ 1 strong
  phraseHit: boolean;
  /** The query term this chunk owns via a "!" priority alias, if any. */
  priorityTerm: string | null;
}

/** Where we are in the conversation, so follow-ups have something to hold. */
interface TopicState {
  index: number;
  shown: Set<number>; // sentence indices already spoken from this chunk
}

/** An unanswered "did you mean A or B?" — resolved by the next message. */
interface PendingClarify {
  options: Array<{ index: number; label: string }>;
}

const MORE_RE =
  /^(tell me more|more|more please|go on|continue|keep going|say more|elaborate|expand|and\??|and then\??|what else\??|anything else\??|\.\.\.|…)$/;

const YES_RE =
  /^(yes|yeah|yep|yup|ya|sure|ok|okay|okie|mhm|please|pls|go ahead|do it|hit me|why not)$/;

const ANAPHORA_RE =
  /\b(it|its|it's|that|this|they|them|those|these|the (app|project|tool|thing|system|paper|model|one|setup))\b/;

const YESNO_RE =
  /^(does|do|did|is|are|was|were|has|have|had|can|could|will|would)\b/;

/** Question shapes that suggest scanning ACROSS topics, not into one. */
const AGG_SHAPE_RE =
  /\b(which|what|who|list|all|any|anything|every|everything|how many|uses?d?|using|built with|written in|made with|know[sn]?|familiar)\b/;

/** Bare ordinal references ("the first one") — follow-ups, not questions. */
const ORDINALS = new Set([
  "first", "second", "third", "one", "two", "three", "last", "latter",
  "former", "next", "other", "previous", "previou",
]);

/** "who …?" questions hunt for people — nudge extraction toward the
 *  sentences that credit them (Team:, co-developed, guided by, …). */
const WHO_HINTS = ["team", "guid", "develop", "coordinator"];

/** The asker is hunting for a *thing* — safe to offer a disambiguation. */
const SEEKING_RE = /\b(project|app|apps|tool|paper|research|thing|one|work)\b/;

export class RetrievalEngine implements LiffyEngine {
  private readonly chunks: Chunk[];
  private readonly idf = new Map<string, number>();
  private readonly df = new Map<string, number>();
  private readonly avgdl: number;
  /** Every alias token across all chunks — authored keywords have a home. */
  private readonly allAliasTokens = new Set<string>();
  /** Correctable vocabulary: telling terms, for typo rescue. */
  private readonly vocab: Array<{ token: string; idf: number }> = [];
  private topic: TopicState | null = null;
  private pending: PendingClarify | null = null;
  private offeredMore = false;

  constructor(markdown: string) {
    this.chunks = parseChunks(markdown);

    // IDF over chunks (document = chunk body ∪ heading keywords).
    const N = this.chunks.length || 1;
    let totalLen = 0;
    for (const c of this.chunks) {
      totalLen += c.length;
      for (const t of new Set([...c.tf.keys(), ...c.aliasTokens])) {
        this.df.set(t, (this.df.get(t) ?? 0) + 1);
      }
      for (const t of c.aliasTokens) this.allAliasTokens.add(t);
    }
    for (const [t, d] of this.df) {
      this.idf.set(t, Math.log(1 + (N - d + 0.5) / (d + 0.5)));
    }
    this.avgdl = totalLen / N;

    // Correctable vocabulary: any reasonably telling term of length ≥ 4.
    for (const [t, idfV] of this.idf) {
      if (t.length >= 4 && idfV >= 0.5) this.vocab.push({ token: t, idf: idfV });
    }
  }

  async ask(question: string, _history: ChatTurn[]): Promise<LiffyReply> {
    const raw = question.trim();
    const low = raw.toLowerCase();
    const cleaned = low.replace(/[!.?]+$/, "").trim();

    /* stage 1 — small talk / meta, no retrieval involved */
    const intent = matchIntent(low);
    if (intent) return { text: intent, grounded: true }; // topic state untouched

    /* stage 2 — an open "did you mean A or B?" resolves this message */
    if (this.pending) {
      const resolved = this.resolveClarify(cleaned);
      this.pending = null;
      if (resolved != null) {
        return this.answerFrom(this.chunks[resolved]!, resolved, []);
      }
      // Not an answer to the clarification — treat as a fresh question.
    }

    const offered = this.offeredMore;
    this.offeredMore = false;

    /* stage 3 — follow-ups continue the current topic */
    const qTermsRaw = uniq(tokenize(raw));
    const wantsMore =
      MORE_RE.test(cleaned) || (offered && YES_RE.test(cleaned));
    if ((wantsMore || qTermsRaw.length === 0) && this.topic) {
      return this.continueTopic();
    }
    if (qTermsRaw.length === 0) return this.reprompt();
    // "the first one" with nothing pending is a reference, not a question.
    if (this.topic && qTermsRaw.every((t) => ORDINALS.has(t))) {
      return this.continueTopic();
    }

    /* stage 4 — query rewrite: fix typos against the whole vocabulary */
    const notes: string[] = [];
    const qTerms = qTermsRaw.map((t) => {
      if (this.idf.has(t)) return t;
      const fix = this.correct(t);
      if (fix) notes.push(`reading "${t}" as "${fix}"`);
      return fix ?? t;
    });
    const norm = normalize(raw);

    /* stage 5 — compound questions answer each part */
    const compound = this.tryCompound(raw);
    if (compound) return this.decorate(compound, notes);

    /* stage 6 — rank every chunk against the (corrected) question */
    const ranked = this.rank(qTerms, norm);
    const best = ranked[0];
    const strong =
      best != null &&
      (best.phraseHit ||
        best.bestIdf >= IDF_FLOOR ||
        (best.matched >= 2 && best.idfSum >= IDF_SUM_FLOOR));

    // Did the question NAME a topic (its own name, not just any keyword)?
    const namedTopic =
      qTerms.some(
        (t) =>
          !GENERIC.has(t) &&
          (this.idf.get(t) ?? 0) >= IDF_FLOOR &&
          this.chunks.some((c) => c.nameTokens.has(t)),
      ) || this.chunks.some((c) => isNamedPhraseIn(norm, c));

    // "who …?" → steer extraction toward the people-crediting sentences.
    const hints = /\bwho\b/.test(low) ? WHO_HINTS : [];

    /* stage 7 — cross-chunk aggregation ("which projects use fastapi?").
       Safe to try eagerly: a pivot must be a telling term that lives in
       SEVERAL chunk bodies yet is nobody's authored alias — so questions
       aimed at one topic ("askcal's stack?") never produce a pivot. */
    if (AGG_SHAPE_RE.test(low)) {
      const agg = this.tryAggregate(low, qTerms);
      if (agg) return this.decorate(agg, notes);
    }

    /* stage 8 — anaphora: "how does IT work?" sticks to the current topic,
       unless the question names a different topic outright. */
    if (this.topic && ANAPHORA_RE.test(low) && !namedTopic) {
      const t = this.topic;
      return this.decorate(
        this.answerFrom(this.chunks[t.index]!, t.index, qTerms, hints),
        notes,
      );
    }

    /* stage 9 — a genuine tie between two topics → just ask */
    if (strong && !best!.phraseHit && !namedTopic) {
      const second = ranked[1];
      if (
        second &&
        second.index !== best!.index &&
        second.score >= best!.score * CLARIFY_RATIO &&
        second.matched > 0 &&
        SEEKING_RE.test(low)
      ) {
        this.pending = {
          options: [
            { index: best!.index, label: best!.chunk.label },
            { index: second.index, label: second.chunk.label },
          ],
        };
        return {
          text: `that could mean ${best!.chunk.label} or ${second.chunk.label} — which one?`,
          grounded: true,
        };
      }
    }

    if (strong) {
      const reply = this.decorate(
        this.answerFrom(best!.chunk, best!.index, qTerms, hints),
        notes,
      );
      // Structured dual-context: a "!" priority alias decided this answer,
      // but the same word genuinely lives elsewhere too ("gmail" → contact
      // info, yet askcal integrates Gmail). Say so instead of hiding it.
      const pTerm = best!.priorityTerm;
      if (pTerm && !namedTopic) {
        const rival = ranked.find(
          (r) =>
            r.index !== best!.index &&
            (r.chunk.aliasTokens.has(pTerm) || (r.chunk.tf.get(pTerm) ?? 0) > 0),
        );
        if (rival) {
          const word =
            low
              .split(/[^a-z0-9+#.]+/)
              .filter((w) => w.length > 1)
              .find((w) => stem(w.replace(/^[.]+|[.]+$/g, "")) === pTerm) ??
            pTerm;
          reply.text += `\n\n(${word} also comes up in ${rival.chunk.label} — ask about ${rival.chunk.label} if that's what you meant.)`;
        }
      }
      return reply;
    }

    /* stage 10 — graceful degradation */
    if (YESNO_RE.test(cleaned)) {
      return {
        text: `hmm, nothing in my notes about that, so i can't confirm either way. i can talk about: ${this.topicList()}.`,
        grounded: false,
      };
    }
    return this.fallback();
  }

  /* -- scoring -------------------------------------------------------- */

  private rank(qTerms: string[], norm: string): Ranked[] {
    return this.chunks
      .map((chunk, index) => this.scoreChunk(chunk, index, qTerms, norm))
      .sort((a, b) => b.score - a.score);
  }

  private scoreChunk(
    chunk: Chunk,
    index: number,
    qTerms: string[],
    norm: string,
  ): Ranked {
    let score = 0;
    let matched = 0;
    let bestIdf = 0;
    let idfSum = 0;
    let priorityTerm: string | null = null;

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
      // "alias!" — the author ruled that this chunk is what most people
      // mean by this word; outweigh another chunk's body-frequency lead.
      const priorityScore = chunk.priorityTokens.has(t) ? PRIORITY_BONUS : 0;
      if (priorityScore > 0) priorityTerm = t;
      if (bodyScore > 0 || aliasScore > 0) {
        matched++;
        idfSum += idf;
        if (idf > bestIdf) bestIdf = idf;
      }
      score += bodyScore + aliasScore + priorityScore;
    }

    let phraseHit = false;
    for (const p of chunk.namePhrases) {
      if (pad(norm).includes(pad(p))) {
        score += PHRASE_BONUS;
        phraseHit = true;
      }
    }

    return { chunk, index, score, matched, bestIdf, idfSum, phraseHit, priorityTerm };
  }

  /** Map a mistyped token onto the closest telling vocabulary term.
   *  Typos almost never change the first letter, so require it to match —
   *  this stops short common words drifting ("like" must not become "live"). */
  private correct(t: string): string | null {
    // Short real words drift into other short real words ("rust" → "rest");
    // only correct tokens long enough that a near-miss is plausibly a typo.
    if (t.length < 5) return null;
    const budget = t.length >= 7 ? 2 : 1;
    let best: { token: string; dist: number; idf: number } | null = null;
    for (const v of this.vocab) {
      if (v.token[0] !== t[0]) continue;
      const d = editDistance(t, v.token, budget);
      if (d > budget) continue;
      if (!best || d < best.dist || (d === best.dist && v.idf > best.idf)) {
        best = { token: v.token, dist: d, idf: v.idf };
      }
    }
    return best?.token ?? null;
  }

  /* -- compound questions --------------------------------------------- */

  /**
   * "askcal and tiket?" / "his research vs his apps" — split on light
   * connectors and answer each part, but ONLY when every part stands on
   * its own (phrase or high-IDF hit) and they land on different topics.
   * Anything less falls back to answering the question whole.
   */
  private tryCompound(raw: string): LiffyReply | null {
    const parts = raw
      .split(/\s*(?:\band\b|\bvs\.?\b|\bversus\b|[;,&])\s*/i)
      .map((s) => s.trim())
      .filter((s) => s.length >= 3);
    if (parts.length < 2 || parts.length > 3) return null;

    const hits: Array<{ part: string; r: Ranked; terms: string[] }> = [];
    for (const part of parts) {
      const terms = uniq(tokenize(part)).map((t) =>
        this.idf.has(t) ? t : this.correct(t) ?? t,
      );
      if (terms.length === 0) return null;
      const r = this.rank(terms, normalize(part))[0];
      if (!r || !(r.phraseHit || r.bestIdf >= IDF_FLOOR)) return null;
      hits.push({ part, r, terms });
    }
    const indices = new Set(hits.map((h) => h.r.index));
    if (indices.size < 2) return null; // same topic — answer it whole

    const pieces: string[] = [];
    const sources: string[] = [];
    for (const h of hits) {
      const reply = this.answerFrom(h.r.chunk, h.r.index, h.terms);
      pieces.push(`${h.r.chunk.label}: ${reply.text}`);
      sources.push(h.r.chunk.label);
    }
    this.offeredMore = false; // a joint answer's trailing "more?" is ambiguous
    return {
      text: pieces.join("\n\n").replace(/ — say "more" for the rest\./g, ""),
      grounded: true,
      sources,
    };
  }

  /* -- cross-chunk aggregation ---------------------------------------- */

  /**
   * "which projects use fastapi?" — the pivot term ("fastapi") lives in
   * several chunk BODIES but is nobody's authored alias, so no single
   * chunk owns it. Scan all of them and answer with one line each.
   */
  private tryAggregate(rawLow: string, qCorrected: string[]): LiffyReply | null {
    let pivot: { term: string; idf: number } | null = null;
    for (const t of qCorrected) {
      const d = this.df.get(t) ?? 0;
      const idfV = this.idf.get(t) ?? 0;
      if (
        d >= 2 &&
        d <= AGG_DF_MAX &&
        idfV >= IDF_FLOOR &&
        !this.allAliasTokens.has(t) &&
        !GENERIC.has(t) &&
        (!pivot || idfV > pivot.idf)
      ) {
        pivot = { term: t, idf: idfV };
      }
    }
    if (!pivot) return null;

    // Echo the asker's own word, not the stemmed index form ("redis", not
    // "redi"). Falls back to the stem only if a typo-correction produced it.
    const display =
      rawLow
        .split(/[^a-z0-9+#.]+/)
        .filter((w) => w.length > 1)
        .find((w) => stem(w.replace(/^[.]+|[.]+$/g, "")) === pivot.term) ??
      pivot.term;

    const holders = this.chunks
      .map((chunk, index) => ({ chunk, index, tf: chunk.tf.get(pivot.term) ?? 0 }))
      .filter((h) => h.tf > 0)
      .sort((a, b) => b.tf - a.tf)
      .slice(0, AGG_MAX_CHUNKS);
    if (holders.length < 2) return null; // one home → the normal path is better

    const lines = holders.map((h) => {
      const picked = this.extract(h.chunk, [pivot.term]).slice(0, 1);
      const sent = picked.length > 0 ? h.chunk.sentences[picked[0]!]!.text : "";
      return `${h.chunk.label}: ${sent}`;
    });
    this.topic = null; // the conversation moved to a cross-cutting view
    return {
      text: `${display} shows up in ${holders.length} of my notes —\n\n${lines.join("\n\n")}`,
      grounded: true,
      sources: holders.map((h) => h.chunk.label),
    };
  }

  /* -- clarification loop --------------------------------------------- */

  /** Try to read the user's next message as an answer to "A or B?". */
  private resolveClarify(cleaned: string): number | null {
    const opts = this.pending!.options;
    const norm = pad(normalize(cleaned));
    for (const o of opts) {
      if (norm.includes(pad(normalize(o.label)))) return o.index;
    }
    if (/\b(first|former|1st|1)\b/.test(cleaned)) return opts[0]!.index;
    if (/\b(second|latter|2nd|2)\b/.test(cleaned)) return opts[1]?.index ?? null;
    if (/\b(both|either|all)\b/.test(cleaned)) return opts[0]!.index; // start somewhere
    return null;
  }

  /* -- answer construction ------------------------------------------- */

  /** Attach typo-correction notes so corrections are never silent. */
  private decorate(reply: LiffyReply, notes: string[]): LiffyReply {
    if (notes.length === 0 || !reply.grounded) return reply;
    return { ...reply, text: `(${notes.join(", ")}) ${reply.text}` };
  }

  private answerFrom(
    chunk: Chunk,
    index: number,
    qTerms: string[],
    hints: string[] = [],
  ): LiffyReply {
    // A pointed question carries a *facet* term: something beyond the topic's
    // own name, that isn't a generic verb ("work", "use"), and that is
    // distinctive enough to single out sentences. Otherwise it's a broad ask
    // ("tell me about X", "how does it work?") → open with the lead.
    // `hints` are curated facet terms ("who…?" → team/guided/…) that join in
    // regardless of IDF; sentences must still actually contain them to win.
    const focus = [
      ...qTerms.filter(
        (t) =>
          !chunk.nameTokens.has(t) &&
          !GENERIC.has(t) &&
          (this.idf.get(t) ?? 0) >= EXTRACT_IDF_FLOOR,
      ),
      ...hints,
    ];

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
    if (chunk.sentences.length > lead.length) {
      text += ` — say "more" for the rest.`;
      this.offeredMore = true;
    }
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
    const picked = scored.map((x) => x.i);

    // A lone, short hit often reads clipped — pull in its follow-on sentence
    // when that sentence leans on it ("It …", "That …", "The …").
    if (picked.length === 1) {
      const i = picked[0]!;
      const next = chunk.sentences[i + 1];
      if (
        next &&
        chunk.sentences[i]!.text.length + next.text.length < 380 &&
        /^(it|its|this|that|the |so |which |and )/i.test(next.text)
      ) {
        picked.push(i + 1);
      }
    }
    return picked;
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
    if (state.shown.size < chunk.sentences.length) {
      text += ` — more?`;
      this.offeredMore = true;
    }
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
  if (/^(wow+|woah|whoa|nice+|cool+|lol|lmao|haha+|hehe+|damn|based)\b/.test(t))
    return "right? ask me more.";
  if (/^(bye|cya|goodbye|see ya|see you|later|gtg|good night|gn)\b/.test(t))
    return "catch you later! (close the window whenever)";
  if (/\b(how are you|how's it going|hows it going|you good|wyd)\b/.test(t))
    return "just vibing in the terminal, waiting for questions about nafees. what do you want to know?";
  if (/(are|r) you (a )?(bot|ai|robot|real|human|person|chatgpt|claude)/.test(t))
    return "i'm a lil retrieval bot — no LLM, no keys. i only know what's in nafees's notes, and i answer straight from them.";
  if (/\byour (favorite|favourite|fav|opinion|thoughts?)\b/.test(t))
    return "i deal in facts from nafees's notes, not opinions. though between us — the cat is objectively the best part of this site.";
  if (/\b(tell|know|got|have).*(joke|something funny)\b|^joke$/.test(t))
    return "a chatbot with no LLM walks into a bar. that's it. that's me. i'm the joke. ask me about nafees instead.";
  if (/(who|what) are you|your name|are you liffy(?!\s*(review|the))/.test(t))
    return "i'm liffy, a tiny assistant that knows nafees. ask away — projects, skills, research, contact, whatever.";
  if (/^(help|what can you do|commands|options|menu|\?)$/.test(t))
    return "i answer questions about nafees from his notes. try: \"what does he build?\", \"tell me about askcal\", \"which projects use fastapi?\", or just a topic name.";
  if (/(who (made|built|created) you)/.test(t))
    return "nafees built me for this site — a grounded retriever over his own notes. ask me about him next.";
  return null;
}
