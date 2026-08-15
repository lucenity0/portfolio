/* ------------------------------------------------------------------ *
 * repo-window — a project that has no site, opened in the portfolio
 * anyway.
 *
 * github.com itself cannot be framed: it serves `X-Frame-Options: deny`
 * and `frame-ancestors 'none'`, so an <iframe> gets a blank refusal.
 * What it *does* allow is cross-origin reads of the raw files
 * (raw.githubusercontent.com sends `Access-Control-Allow-Origin: *`),
 * so the README is fetched and rendered here with the same markdown
 * renderer the `about` and `resume` windows use.
 *
 * A repo with no README falls back to its top-level file listing from
 * the API — still the repo, just the other view of it. Everything is
 * best-effort: no key, no build step, and an offline visitor gets a
 * card pointing at GitHub rather than a spinner that never stops.
 * ------------------------------------------------------------------ */

import type { Project } from "@/types";
import { renderMarkdown } from "@/core/md";

/** Where the markdown might be. GitHub itself is this permissive. */
const README_NAMES = ["README.md", "readme.md", "README.markdown", "README"];

interface Repo {
  owner: string;
  name: string;
}

function parseRepo(url: string): Repo | null {
  const m = /github\.com\/([^/]+)\/([^/?#]+)/.exec(url);
  return m ? { owner: m[1]!, name: m[2]!.replace(/\.git$/, "") } : null;
}

/**
 * README links and images are written relative to the repo, so they
 * 404 against this origin. Point them back where they came from: images
 * at raw, links at the repo page.
 */
function absolutize(root: HTMLElement, repo: Repo): void {
  const raw = `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/HEAD/`;
  const blob = `https://github.com/${repo.owner}/${repo.name}/blob/HEAD/`;
  const isAbsolute = (v: string): boolean => /^(https?:|data:|#|mailto:)/i.test(v);

  for (const img of Array.from(root.querySelectorAll("img"))) {
    const src = img.getAttribute("src") ?? "";
    if (src && !isAbsolute(src)) img.setAttribute("src", raw + src.replace(/^\.?\//, ""));
    img.loading = "lazy";
  }
  for (const a of Array.from(root.querySelectorAll("a"))) {
    const href = a.getAttribute("href") ?? "";
    if (href && !isAbsolute(href)) a.setAttribute("href", blob + href.replace(/^\.?\//, ""));
    a.target = "_blank";
    a.rel = "noreferrer noopener";
  }
}

async function fetchReadme(repo: Repo): Promise<string | null> {
  for (const name of README_NAMES) {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/HEAD/${name}`,
      );
      if (res.ok) return await res.text();
    } catch {
      // Network down or blocked — try the next name, then give up.
    }
  }
  return null;
}

/** The repo's top level, for projects whose code is the documentation. */
async function fetchTree(repo: Repo): Promise<Array<{ name: string; type: string }> | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.name}/contents`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) return null; // 403 here is the unauthenticated rate limit
    const json: unknown = await res.json();
    if (!Array.isArray(json)) return null;
    return json
      .map((e) => e as { name?: unknown; type?: unknown })
      .filter((e): e is { name: string; type: string } =>
        typeof e.name === "string" && typeof e.type === "string",
      )
      .sort((a, b) =>
        a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1,
      );
  } catch {
    return null;
  }
}

export function buildRepoView(project: Project): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "repo";

  const repo = parseRepo(project.repo ?? project.url);

  // Address bar, matching the one the embedded sites get.
  const bar = document.createElement("div");
  bar.className = "project__bar";
  const dots = document.createElement("span");
  dots.className = "project__dots";
  dots.textContent = "◦ ◦ ◦";
  const addr = document.createElement("span");
  addr.className = "project__url";
  addr.textContent = repo ? `github.com/${repo.owner}/${repo.name}` : project.url;
  const open = document.createElement("a");
  open.className = "repo__open";
  open.href = project.repo ?? project.url;
  open.target = "_blank";
  open.rel = "noreferrer noopener";
  open.textContent = "open ↗";
  bar.append(dots, addr, open);

  const body = document.createElement("div");
  body.className = "repo__body docs";
  body.textContent = "fetching readme…";
  wrap.append(bar, body);

  if (!repo) {
    body.textContent = project.blurb;
    return wrap;
  }

  void (async () => {
    const md = await fetchReadme(repo);
    if (md !== null) {
      body.innerHTML = renderMarkdown(md);
      absolutize(body, repo);
      return;
    }

    const tree = await fetchTree(repo);
    if (tree && tree.length > 0) {
      body.textContent = "";
      const note = document.createElement("p");
      note.className = "muted";
      note.textContent = "no readme in this one — here's what's in it:";
      const list = document.createElement("ul");
      list.className = "repo__tree";
      for (const entry of tree) {
        const li = document.createElement("li");
        li.textContent = entry.type === "dir" ? `${entry.name}/` : entry.name;
        list.append(li);
      }
      body.append(note, list);
      return;
    }

    // Offline, rate-limited, or an empty repo: say so plainly and hand
    // over the link rather than leaving the window mid-sentence.
    body.textContent = "";
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "couldn't reach GitHub from here.";
    const blurb = document.createElement("p");
    blurb.textContent = project.blurb;
    const link = document.createElement("a");
    link.className = "project__open";
    link.href = project.repo ?? project.url;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
    link.textContent = "open on GitHub ↗";
    body.append(p, blurb, link);
  })();

  return wrap;
}
