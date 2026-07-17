/* ------------------------------------------------------------------ *
 * cat-companion — the interactive cat unit: sprite + feed meter +
 * cookie plate + speech bubble, plus every reaction it knows:
 *   - typing anywhere → glides to the corner and sleeps (overlap fix)
 *   - meter fills as you type (cap 24 chars), drains with deletes
 *   - 100% → cookie plate; click → munch reaction → back to sleep
 *   - 3 clicks in 2s → shake + "quiet!" / "let me sleep!"
 *   - liffy mode: hold-to-pet (prrrr), 3s hover → one-eye stare
 *   - think(): squint frame in sync with the reply spinner
 *   - bob(): head-bob loop while the reply typewrites
 * All motion is reduced-motion gated (CSS transitions/keyframes live
 * behind the media query; JS falls back to instant state changes).
 * ------------------------------------------------------------------ */

import type { CatFrame } from "@/core/cat";
import { buildCat, setCatFrame } from "@/core/cat";
import { playOnce, prefersReducedMotion } from "@/core/fx";

const TYPE_CAP = 24; // chars to fill the feed meter
const ANGRY_CLICKS = 3;
const ANGRY_WINDOW_MS = 2000;
const ANGRY_LINES = ["quiet!", "let me sleep!"];
const PET_HOLD_MS = 1000;
const STARE_HOVER_MS = 3000;
const MUNCH_FLIPS = 5;
const MUNCH_STEP_MS = 260;

/* Occasional sleep-talk: the cat murmurs cryptic hints at the hidden
   easter eggs, so first-time visitors have a trail to follow. Rare on
   purpose — a murmur every couple of minutes, and only while idle. */
const MURMUR_FIRST_MS = 45_000; // first murmur after ~45s on the page
const MURMUR_GAP_MIN_MS = 100_000; // then every 100–160s
const MURMUR_GAP_JITTER_MS = 60_000;
const MURMUR_RETRY_MS = 15_000; // busy/typing? try again in a bit
const MURMUR_IDLE_MS = 20_000; // stay quiet within 20s of activity
const MURMUR_SHOW_MS = 4_500;

const HERO_MURMURS = [
  "zzz... sudo... nice try... zzz",
  "mrrp... a command... named after me...",
  "zzz... git clone... take one home...",
  "...ctrl+] ... windows go round... zzz",
  "zzz... liffy keeps secrets too...",
  "...feed me... 24 keys... zzz",
];
const LIFFY_MURMURS = [
  "mrrp... say meow... i dare you...",
  "zzz... cookie... just type it...",
  "...hold me... one whole second... prrr",
  "zzz... stare at me... see what happens...",
];

export type CompanionMode = "hero" | "liffy";

export interface CompanionOptions {
  /** Positioning context the companion is appended to. */
  mount: HTMLElement;
  mode: CompanionMode;
  /** Frame shown while idle in the center spot. */
  idleFrame: CatFrame;
  /** Called the first time the cat retreats to its corner. */
  onCorner?: () => void;
}

export class CatCompanion {
  readonly el: HTMLElement;
  private readonly catEl: HTMLElement;
  private readonly fillEl: HTMLElement;
  private readonly meterEl: HTMLElement;
  private readonly plateEl: HTMLButtonElement;
  private readonly bubbleEl: HTMLElement;
  private readonly opts: CompanionOptions;

  private cornered = false;
  private munching = false;
  private thinking = false;
  private bobbing = false;
  private staring = false;
  private petting = false;
  private clickTimes: number[] = [];
  private bubbleTimer: number | null = null;
  private petTimer: number | null = null;
  private hoverTimer: number | null = null;
  private readonly murmurs: string[];
  private murmurIdx = 0;
  private lastActivity = performance.now();

  constructor(opts: CompanionOptions) {
    this.opts = opts;

    this.el = document.createElement("div");
    this.el.className = `catc catc--${opts.mode}`;
    // The frame attr drives CSS (zzz visibility) — must be set from birth,
    // not first swap, or the hero cat loses its z's until interacted with.
    this.el.dataset.frame = opts.idleFrame;

    this.catEl = buildCat("cat catc__cat", opts.idleFrame);

    this.bubbleEl = document.createElement("span");
    this.bubbleEl.className = "catc__bubble";
    this.bubbleEl.setAttribute("role", "status");

    this.meterEl = document.createElement("div");
    this.meterEl.className = "catc__meter";
    this.fillEl = document.createElement("div");
    this.fillEl.className = "catc__fill";
    this.plateEl = document.createElement("button");
    this.plateEl.className = "catc__plate";
    this.plateEl.type = "button";
    this.plateEl.title = "feed the cat";
    this.plateEl.setAttribute("aria-label", "feed the cat a cookie");
    this.meterEl.append(this.fillEl, this.plateEl);

    this.el.append(this.bubbleEl, this.catEl, this.meterEl);
    opts.mount.append(this.el);

    this.wireAngryClicks();
    if (opts.mode === "liffy") {
      this.wirePetHold();
      this.wireStareHover();
    }
    this.plateEl.addEventListener("click", (e) => {
      e.stopPropagation();
      this.feed();
    });

    // Sleep-talk loop: shuffled once so every visit hints in a fresh order.
    this.murmurs = [...(opts.mode === "hero" ? HERO_MURMURS : LIFFY_MURMURS)]
      .sort(() => Math.random() - 0.5);
    this.scheduleMurmur(MURMUR_FIRST_MS);
  }

  /* ---- typing / meter ------------------------------------------------ */

  /** Live input length → meter fill; first keystroke sends cat to corner. */
  onTyping(len: number): void {
    if (len > 0) this.lastActivity = performance.now();
    if (len > 0 && !this.cornered) this.corner();
    const ratio = Math.min(len / TYPE_CAP, 1);
    this.fillEl.style.width = `${ratio * 100}%`;
    this.el.classList.toggle("catc--typing", len > 0 || this.munching);
    this.plateEl.classList.toggle("is-served", ratio >= 1);
  }

  /** Input was sent or cleared → meter resets (cat stays put). */
  onSend(): void {
    this.lastActivity = performance.now();
    this.fillEl.style.width = "0%";
    this.plateEl.classList.remove("is-served");
    if (!this.munching) this.el.classList.remove("catc--typing");
  }

  /** Cookie easter egg: instantly serve the plate. */
  fillNow(): void {
    if (!this.cornered) this.corner();
    this.fillEl.style.width = "100%";
    this.el.classList.add("catc--typing");
    this.plateEl.classList.add("is-served");
  }

  /* ---- placement ------------------------------------------------------ */

  private corner(): void {
    this.cornered = true;
    this.el.classList.add("catc--corner");
    this.setFrame("sleep");
    this.opts.onCorner?.();
  }

  /** Back to the center spot (hero: after `clear`). */
  restoreCenter(): void {
    this.cornered = false;
    this.el.classList.remove("catc--corner");
    this.onSend();
    this.setFrame(this.opts.idleFrame);
  }

  /* ---- reactions ------------------------------------------------------ */

  /** Feed the cat: brief munching, a happy word, then back to rest. */
  private feed(): void {
    if (this.munching) return;
    this.munching = true;
    this.plateEl.classList.remove("is-served");
    this.fillEl.style.width = "0%";

    if (prefersReducedMotion()) {
      this.setFrame("munch-a");
      this.say("nom.", 900);
      window.setTimeout(() => {
        this.munching = false;
        this.setFrame(this.restFrame());
        this.el.classList.remove("catc--typing");
      }, 900);
      return;
    }

    this.say("nom nom nom", MUNCH_FLIPS * MUNCH_STEP_MS + 300);
    let flips = 0;
    const timer = window.setInterval(() => {
      this.setFrame(flips % 2 === 0 ? "munch-a" : "munch-b");
      flips++;
      if (flips > MUNCH_FLIPS) {
        window.clearInterval(timer);
        this.munching = false;
        this.setFrame(this.restFrame());
        this.el.classList.remove("catc--typing");
      }
    }, MUNCH_STEP_MS);
  }

  /** Squint for the duration of liffy's thinking spinner. */
  think(on: boolean): void {
    this.thinking = on;
    if (this.munching) return;
    this.setFrame(on ? "think" : this.restFrame());
  }

  /** Head-bob while the reply typewrites. */
  bob(on: boolean): void {
    this.bobbing = on;
    if (on) {
      if (!this.munching) this.setFrame("awake");
      if (!prefersReducedMotion()) this.el.classList.add("catc--bob");
    } else {
      this.el.classList.remove("catc--bob");
      if (!this.munching && !this.thinking) this.setFrame(this.restFrame());
    }
  }

  /** A happy lil jump (meow easter egg). */
  hop(): void {
    playOnce(this.el, "catc--hop");
  }

  /** Speech bubble for `ms` milliseconds. */
  say(text: string, ms = 2000): void {
    if (this.bubbleTimer !== null) window.clearTimeout(this.bubbleTimer);
    this.bubbleEl.textContent = text;
    this.bubbleEl.classList.add("is-visible");
    this.bubbleTimer = window.setTimeout(() => {
      this.bubbleEl.classList.remove("is-visible");
      this.bubbleTimer = null;
    }, ms);
  }

  /* ---- sleep-talk hints ----------------------------------------------- */

  private scheduleMurmur(delay: number): void {
    window.setTimeout(() => this.tryMurmur(), delay);
  }

  /** Murmur one hint if the coast is clear; otherwise retry shortly. */
  private tryMurmur(): void {
    // Window closed (liffy) → the loop dies with it.
    if (!this.el.isConnected) return;
    const occupied =
      this.munching ||
      this.thinking ||
      this.bobbing ||
      this.petting ||
      this.bubbleTimer !== null ||
      document.hidden ||
      performance.now() - this.lastActivity < MURMUR_IDLE_MS;
    if (occupied) {
      this.scheduleMurmur(MURMUR_RETRY_MS);
      return;
    }
    this.say(this.murmurs[this.murmurIdx++ % this.murmurs.length]!, MURMUR_SHOW_MS);
    this.scheduleMurmur(MURMUR_GAP_MIN_MS + Math.random() * MURMUR_GAP_JITTER_MS);
  }

  /* ---- internals ------------------------------------------------------ */

  /** What the cat settles back into, wherever it currently lives. */
  private restFrame(): CatFrame {
    return this.cornered ? "sleep" : this.opts.idleFrame;
  }

  private setFrame(frame: CatFrame): void {
    setCatFrame(this.catEl, frame);
    this.el.dataset.frame = frame;
  }

  /** 3 quick clicks on the cat → shake + an annoyed line. */
  private wireAngryClicks(): void {
    this.catEl.addEventListener("click", () => {
      if (this.petting) return; // a long pet-hold isn't a poke
      const now = performance.now();
      this.clickTimes = this.clickTimes.filter(
        (t) => now - t < ANGRY_WINDOW_MS,
      );
      this.clickTimes.push(now);
      if (this.clickTimes.length >= ANGRY_CLICKS) {
        this.clickTimes = [];
        playOnce(this.el, "catc--shake");
        this.say(
          ANGRY_LINES[Math.floor(Math.random() * ANGRY_LINES.length)]!,
          2000,
        );
      }
    });
  }

  /** liffy: press-and-hold ~1s → purring lean. */
  private wirePetHold(): void {
    this.catEl.addEventListener("pointerdown", () => {
      this.petTimer = window.setTimeout(() => {
        this.petting = true;
        this.el.classList.add("catc--pet");
        this.say("prrrrr.", 60_000);
      }, PET_HOLD_MS);
    });
    const release = () => {
      if (this.petTimer !== null) window.clearTimeout(this.petTimer);
      this.petTimer = null;
      if (this.petting) {
        this.el.classList.remove("catc--pet");
        this.bubbleEl.classList.remove("is-visible");
        // let the click event that follows pointerup pass, then reset
        window.setTimeout(() => {
          this.petting = false;
        }, 0);
      }
    };
    this.catEl.addEventListener("pointerup", release);
    this.catEl.addEventListener("pointerleave", release);
  }

  /** liffy: hover 3s → the cat opens one eye and stares back. */
  private wireStareHover(): void {
    this.catEl.addEventListener("mouseenter", () => {
      this.hoverTimer = window.setTimeout(() => {
        if (!this.munching && !this.thinking && !this.bobbing) {
          this.staring = true;
          this.setFrame("peek");
        }
      }, STARE_HOVER_MS);
    });
    this.catEl.addEventListener("mouseleave", () => {
      if (this.hoverTimer !== null) window.clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
      if (this.staring) {
        this.staring = false;
        this.setFrame(this.restFrame());
      }
    });
  }
}
