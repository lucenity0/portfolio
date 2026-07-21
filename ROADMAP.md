# Roadmap — lucenity terminal portfolio

The portfolio is a terminal/desktop-OS experience: type a command, a retro window
opens. Built on `dev`; the public site (`main`) keeps showing the under-construction
page until launch. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it fits
together and [docs/backlog.md](docs/backlog.md) for the granular issue list.

**Gating rule:** never push portfolio code to `main`. Launch = Phase 4.

---

## Phase 0 — Foundation (done today)

- [x] `dev` branch created (main untouched)
- [x] Vite + TypeScript scaffold, split tsconfig, `@/` alias
- [x] Design tokens + base CSS ported from the under-construction page
- [x] Minimal runnable shell: boot → prompt → `help` → demo window
- [x] Data seeds (`commands.ts`, `projects.ts`) + preserved under-construction page
- [x] Docs (this file, architecture, backlog)

## Phase 1 — Terminal core

- [ ] Flesh out the command parser (quoting, unknown-command hints, `--flags`)
- [ ] Command history polish (persist to `localStorage`, de-dupe)
- [ ] Tab-completion for command names + project slugs
- [ ] Richer boot / BIOS sequence with personality
- [ ] Custom block-caret tracking the real cursor position mid-string

## Phase 2 — Window manager

- [ ] Minimize + a bottom dock for minimized windows
- [ ] Maximize / restore
- [ ] Resize handles
- [ ] Focus/blur styling polish + keyboard focus cycling (e.g. ⌘\`)
- [ ] Window open/close power-on/off animations (CRT flicker)

## Phase 3 — Apps & content

- [ ] Real `about` (bio, timeline, pixel avatar)
- [ ] `projects` grid with thumbnails + tags/filter
- [ ] `project-window`: live loading bar, error/fallback states, per-project embed config
- [ ] Real project catalogue in `data/projects.ts` (replace placeholders)
- [ ] `contact` with real handles
- [ ] Optional: `skills`, `resume`, easter eggs

## Phase 4 — Polish & launch

- [ ] Responsive / mobile terminal + windows (touch drag, on-screen keyboard)
- [ ] Accessibility pass (keyboard nav, ARIA, reduced-motion audit, focus traps)
- [ ] SEO/OG meta, favicon, social preview image
- [ ] **Launch:** point GitHub Pages at the portfolio build (Action or merge to `main`),
      keep `CNAME` + `.nojekyll`, verify `me.lucenity.dev`
