/* ------------------------------------------------------------------ *
 * projects — the portfolio's project catalogue.
 *
 * Three kinds of entry:
 *   · it has a site      → `url` is that site, `thumb` is a screenshot
 *                          of it, and the window embeds it live.
 *   · it's only a repo   → `url` is the repo, no `thumb`, and the card
 *                          falls back to a GitHub mark.
 *   · it's an app        → `url` is the repo (nothing to frame), but the
 *                          card still gets a `thumb`: a shot of the app
 *                          itself, since the thing has a face even
 *                          though it has no address.
 *
 * Screenshots live in public/thumbs/. Re-take a *site* one with:
 *   chrome --headless=new --window-size=1280,800 \
 *     --virtual-time-budget=7000 --screenshot=out.png <url>
 *   sips -s format jpeg -s formatOptions 72 -Z 640 out.png \
 *     --out public/thumbs/<slug>.jpg
 *
 * An *app* shot is whatever the project publishes of itself, cropped to
 * 16:9 (the card's ratio) so `object-fit: cover` has nothing left to
 * crop — a centre-crop of a tall shot eats the part worth showing.
 * ------------------------------------------------------------------ */

import type { Project } from "@/types";

const THUMBS = `${import.meta.env.BASE_URL}thumbs/`;
const GH = "https://github.com/lucenity0";

export const PROJECTS: Project[] = [
  {
    slug: "liffy",
    name: "Liffy",
    blurb: "self-hosted AI code review that reads the whole codebase first",
    kind: "web",
    url: "https://liffy.lucenity.dev/",
    repo: `${GH}/Liffy`,
    embeddable: true,
    viewport: { width: 1280, height: 800 },
    thumb: `${THUMBS}liffy.jpg`,
    tags: ["web", "ai", "devtools", "open-source"],
  },
  {
    slug: "askcal",
    name: "Askcal",
    blurb: "a daily scheduler that ranks your inbox by regret, not urgency",
    kind: "ios",
    url: "https://askcal.lucenity.dev/",
    repo: `${GH}/askcal`,
    embeddable: true,
    viewport: { width: 1280, height: 800 },
    thumb: `${THUMBS}askcal.jpg`,
    tags: ["ios", "ai", "productivity", "open-source"],
  },
  {
    slug: "clockit",
    name: "clockit",
    blurb: "a macOS time tracker built so its hours can be checked — append-only, hash-chained",
    kind: "mac",
    url: `${GH}/clockit-app`,
    repo: `${GH}/clockit-app`,
    embeddable: false,
    thumb: `${THUMBS}clockit.jpg`,
    tags: ["mac", "productivity", "open-source"],
  },
  {
    slug: "studycafe",
    name: "study-café",
    blurb: "a study plan tracked from a pixel café — swappable tracks, no build step",
    kind: "web",
    url: "https://lucenity0.github.io/studycafe/",
    repo: `${GH}/studycafe`,
    embeddable: true,
    viewport: { width: 1280, height: 800 },
    thumb: `${THUMBS}studycafe.jpg`,
    tags: ["web", "productivity"],
  },
  {
    slug: "schedulr",
    name: "Schedulr",
    blurb: "OS concepts you can watch run — scheduling, paging, sync, disk",
    kind: "web",
    url: "https://srikrishna-ps.github.io/schedulr/",
    repo: `${GH}/schedulr`,
    embeddable: true,
    viewport: { width: 1280, height: 800 },
    thumb: `${THUMBS}schedulr.jpg`,
    tags: ["web", "education", "visualization"],
  },
  {
    slug: "tiket",
    name: "Tiket",
    blurb: "book a seat off the plan and walk in with a barcode — movies, events, sport",
    kind: "ios",
    url: `${GH}/Tiket`,
    repo: `${GH}/Tiket`,
    embeddable: false,
    tags: ["ios"],
  },
  {
    slug: "tiket-backend",
    name: "Tiket API",
    blurb: "seat booking that holds under load — 12,441 concurrent requests, zero double bookings",
    kind: "web",
    url: `${GH}/tiket-backend`,
    repo: `${GH}/tiket-backend`,
    embeddable: false,
    tags: ["backend"],
  },
  {
    slug: "hateful-memes",
    name: "Multimodal Fusion",
    blurb: "hateful-meme detection with CLIP and dynamic gating — headed for IEEE",
    kind: "web",
    url: `${GH}/A-Unified-Adaptive-Framework-for-Multimodal-Data-Fusion-with-Dynamic-Modality-Reweighting`,
    repo: `${GH}/A-Unified-Adaptive-Framework-for-Multimodal-Data-Fusion-with-Dynamic-Modality-Reweighting`,
    embeddable: false,
    tags: ["research", "ai"],
  },
  {
    slug: "traffic",
    name: "Adaptive Traffic Signals",
    blurb: "a PPO agent you can interrogate — SUMO, TraCI, attention attribution",
    kind: "web",
    url: `${GH}/Adaptive-Traffic-Signal-Controllers`,
    repo: `${GH}/Adaptive-Traffic-Signal-Controllers`,
    embeddable: false,
    tags: ["research", "ai"],
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
