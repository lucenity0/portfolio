/* ------------------------------------------------------------------ *
 * Liffy engine contract. The UI (apps/liffy.ts) depends only on this
 * interface, so the answer source is swappable:
 *   - v1: RetrievalEngine  — client-side, grounded in liffy.md, no keys.
 *   - later: a ClaudeBackendEngine that calls a serverless Worker can
 *     implement the same `ask()` and drop in with zero UI changes.
 * ------------------------------------------------------------------ */

export interface ChatTurn {
  role: "user" | "liffy";
  text: string;
}

export interface LiffyReply {
  /** The answer text (plain, terminal-friendly). */
  text: string;
  /** True when answered from the knowledge base; false for the fallback. */
  grounded: boolean;
  /** Titles of the knowledge chunks used, if any. */
  sources?: string[];
}

export interface LiffyEngine {
  /**
   * Answer `question` given prior `history`. Returns a full reply; the UI
   * handles presentation (typewriter). A future streaming engine can add
   * an `askStream()` without breaking this contract.
   */
  ask(question: string, history: ChatTurn[]): Promise<LiffyReply>;
}
