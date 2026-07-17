/* ------------------------------------------------------------------ *
 * hero — the post-boot centerpiece: the sleeping cat (ported from the
 * under-construction page) with floating z's and a typed-out
 * "hello, stranger!" greeting. Purely decorative: sits behind windows,
 * never intercepts clicks, and fades in respectfully.
 * ------------------------------------------------------------------ */

import { buildCat } from "@/core/cat";
import { playOnce, prefersReducedMotion, sleep, typewriter } from "@/core/fx";

export async function mountHero(root: HTMLElement): Promise<void> {
  const hero = document.createElement("div");
  hero.className = "hero";
  hero.setAttribute("aria-hidden", "true");

  const cat = buildCat("cat hero__cat");

  const title = document.createElement("div");
  title.className = "hero__title";
  const text = document.createElement("span");
  const caret = document.createElement("span");
  caret.className = "caret hero__caret";
  title.append(text, caret);

  const sub = document.createElement("div");
  sub.className = "hero__sub";
  sub.textContent = "do not wake the cat. type instead.";

  hero.append(cat, title, sub);
  root.append(hero);

  playOnce(hero, "is-arriving");
  if (!prefersReducedMotion()) await sleep(350);
  await typewriter(text, "hello, stranger!", { speed: 55 });
  if (!prefersReducedMotion()) await sleep(250);
  sub.classList.add("is-visible");
}
