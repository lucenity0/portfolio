/* ------------------------------------------------------------------ *
 * contact — socials + email window.
 * ------------------------------------------------------------------ */

import type { CommandContext } from "@/types";

export function openContact(ctx: CommandContext): void {
  const body = document.createElement("div");
  body.className = "contact";
  body.innerHTML = `
    <h2>contact</h2>
    <ul class="contact__list">
      <li class="contact__item">
        <svg class="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.04.78 2.1v3.11c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
        <span class="muted">github</span>
        <a href="https://github.com/lucenity0" target="_blank" rel="noreferrer noopener">github.com/lucenity0</a>
      </li>
      <li class="contact__item">
        <svg class="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M2.5 4.5h19a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-19A1.5 1.5 0 0 1 1 18V6a1.5 1.5 0 0 1 1.5-1.5Zm0 2v.45l9.5 6.2 9.5-6.2V6.5h-19Zm19 2.85-8.95 5.84a1 1 0 0 1-1.1 0L2.5 9.35V18h19V9.35Z" />
        </svg>
        <span class="muted">email</span>
        <span class="contact__values">
          <span class="contact__primary">
            <span class="muted">primary:</span>
            <a href="mailto:nafees.s2005@gmail.com">nafees.s2005@gmail.com</a>
          </span>
          <span class="contact__secondary">
            <span class="muted">secondary:</span>
            <a href="mailto:0lucenity@gmail.com">0lucenity@gmail.com</a>
          </span>
        </span>
      </li>
      <li class="contact__item">
        <svg class="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M19.54 5.01A16.4 16.4 0 0 0 15.6 3.8l-.48.98a14.8 14.8 0 0 0-6.24 0L8.4 3.8c-1.42.25-2.74.66-3.94 1.21C1.96 8.68 1.28 12.24 1.62 15.75a16.1 16.1 0 0 0 4.84 2.44l1.17-1.6c-.64-.23-1.25-.51-1.82-.84l.45-.35c3.5 1.62 7.3 1.62 10.76 0l.46.35c-.57.33-1.18.61-1.82.84l1.17 1.6a16.1 16.1 0 0 0 4.84-2.44c.4-4.07-.69-7.6-2.13-10.74ZM8.74 14.05c-1.05 0-1.91-.97-1.91-2.16s.84-2.17 1.91-2.17 1.93.98 1.91 2.17c0 1.19-.84 2.16-1.91 2.16Zm6.52 0c-1.05 0-1.91-.97-1.91-2.16s.84-2.17 1.91-2.17 1.93.98 1.91 2.17c0 1.19-.84 2.16-1.91 2.16Z" />
        </svg>
        <span class="muted">discord</span>
        <span>lucenity</span>
      </li>
      <li class="contact__item">
        <svg class="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
        <span class="muted">instagram</span>
        <a href="https://www.instagram.com/lucenity_/" target="_blank" rel="noreferrer noopener">@lucenity_</a>
      </li>
      <li class="contact__item">
        <svg class="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M4.5 3.5A2.5 2.5 0 1 1 4.5 8a2.5 2.5 0 0 1 0-4.5ZM2.5 9.5h4v12h-4v-12Zm6.5 0h3.83v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v6.31h-4v-5.59c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.69H9v-12Z" />
        </svg>
        <span class="muted">linkedin</span>
        <a href="https://www.linkedin.com/in/nafees-s-6770712b0/" target="_blank" rel="noreferrer noopener">nafees-s-6770712b0</a>
      </li>
    </ul>
  `;
  ctx.windows.open({
    id: "contact",
    title: "contact",
    content: body,
    width: 520,
    height: 360,
  });
  ctx.terminal.print("opened: contact", "dim");
}
