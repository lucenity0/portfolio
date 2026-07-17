/* ------------------------------------------------------------------ *
 * hero — the post-boot centerpiece: the sleeping cat (as an interactive
 * CatCompanion) above a typed-out greeting. The greeting rotates per
 * visit. The first keystroke anywhere sends the cat to the top-left
 * corner and fades the text away (the overlap fix); the `clear` command
 * brings everything back.
 * ------------------------------------------------------------------ */

import { CatCompanion } from "@/core/cat-companion";
import { prefersReducedMotion, playOnce, sleep, typewriter } from "@/core/fx";

const GREETINGS = [
  "hello, stranger!",
  "oh, you're back.",
  "shh. the cat sleeps.",
  "type something. anything.",
];

export interface Hero {
  companion: CatCompanion;
  /** Bring the cat and greeting back to center (used by `clear`). */
  restore(): void;
}

export function mountHero(root: HTMLElement): Hero {
  const hero = document.createElement("div");
  hero.className = "hero";
  hero.setAttribute("aria-hidden", "true");

  const title = document.createElement("div");
  title.className = "hero__title";
  const text = document.createElement("span");
  const caret = document.createElement("span");
  caret.className = "caret hero__caret";
  title.append(text, caret);

  const sub = document.createElement("div");
  sub.className = "hero__sub";
  sub.textContent = "do not wake the cat. type instead.";

  hero.append(title, sub);
  root.append(hero);

  const companion = new CatCompanion({
    mount: root,
    mode: "hero",
    idleFrame: "sleep",
    onCorner: () => hero.classList.add("hero--hidden"),
  });

  const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]!;
  void (async () => {
    playOnce(hero, "is-arriving");
    playOnce(companion.el, "is-arriving");
    if (!prefersReducedMotion()) await sleep(350);
    await typewriter(text, greeting, { speed: 55 });
    if (!prefersReducedMotion()) await sleep(250);
    sub.classList.add("is-visible");
  })();

  return {
    companion,
    restore() {
      hero.classList.remove("hero--hidden");
      companion.restoreCenter();
    },
  };
}
