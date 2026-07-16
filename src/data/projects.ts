/* ------------------------------------------------------------------ *
 * projects — the portfolio's project catalogue. Placeholder entries
 * for v1; replace with real work. `embeddable` drives whether the
 * project window shows a live iframe or a "open in new tab" card.
 * ------------------------------------------------------------------ */

import type { Project } from "@/types";

export const PROJECTS: Project[] = [
  {
    slug: "mlnotes",
    name: "ML Notes",
    blurb: "a live web thing — embeds inside its window",
    kind: "web",
    url: "https://mlnotes.lucenity.dev/",
    embeddable: true,
    tags: ["web", "placeholder"],
  },
  {
    slug:"bdanotes",
    name: "BDA Notes",
    blurb: "a live web thing — embeds inside its window",
    kind: "web",
    url: "https://bdanotes.lucenity.dev/",
    embeddable: true,
    tags: ["web", "placeholder"],
  },
  {
    slug:"schedulr",
    name: "Schedulr",
    blurb: "a scheduling app for teams and individuals",
    kind: "web",
    url: "https://srikrishna-ps.github.io/schedulr/",
    embeddable: true,
    tags: ["web", "productivity", "team"],
  },
  {
    slug: "sample-ios",
    name: "sample iOS app",
    blurb: "an app store listing — opens its landing page",
    kind: "ios",
    url: "https://www.apple.com/app-store/",
    embeddable: false,
    tags: ["ios", "placeholder"],
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
