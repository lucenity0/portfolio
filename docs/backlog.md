# Issue backlog

Source of truth for the GitHub issues on `lucenity0/portfolio`. Each entry maps to
one issue. Phase 0 is complete (foundation, done in the scaffold commit). Labels in
brackets. Keep this in sync when issues change.

Suggested labels to create: `phase-1`, `phase-2`, `phase-3`, `phase-4`,
`terminal`, `window-manager`, `content`, `a11y`, `deploy`, `enhancement`.

---

## Phase 1 — Terminal core

### [phase-1][terminal] Robust command parser
Extend `core/terminal.ts` line parsing: support quoted args, a helpful "did you mean"
hint for unknown commands, and simple `--flag` handling.
**Done when:** `project "sample web"` parses as one arg; unknown commands suggest the
closest match.

### [phase-1][terminal] Persistent command history
Persist history to `localStorage`, de-dupe consecutive repeats, cap length. Restore
on load so ↑ works across refreshes.
**Done when:** history survives reload and ↑/↓ walk it without dupes.

### [phase-1][terminal] Tab-completion
Tab completes command names and, for `project `, project slugs. Cycle on repeated Tab.
**Done when:** typing `proj`+Tab → `projects`; `project s`+Tab cycles slugs.

### [phase-1][terminal] Richer boot sequence
Give `core/boot.ts` more personality (varied lines, a short "logo", subtle timing).
Keep it fast and fully reduced-motion aware.
**Done when:** boot feels intentional, still completes < ~2.5s, static under reduced-motion.

### [phase-1][terminal] True block caret position
Caret currently sits at end of input. Track the real cursor position mid-string (mirror
measurement), so editing inside a line shows the block caret correctly.
**Done when:** moving the cursor with ←/→ moves the block caret.

## Phase 2 — Window manager

### [phase-2][window-manager] Minimize + dock
Add a minimize control and a bottom dock listing minimized windows; click to restore.
**Done when:** minimizing hides the window to a dock chip that restores it.

### [phase-2][window-manager] Maximize / restore
Add maximize that fills the desktop and restores to the previous rect.
**Done when:** double-click title bar (or the control) toggles maximize.

### [phase-2][window-manager] Resize handles
Edge/corner resize with min-size clamps; persist size while open.
**Done when:** windows resize from corners without dropping below min size.

### [phase-2][window-manager] Focus polish + keyboard cycling
Refine active/inactive styling; add a shortcut (e.g. ⌘\`) to cycle window focus.
**Done when:** the focused window is unambiguous and cyclable via keyboard.

### [phase-2][window-manager] Open/close CRT animation
Power-on/off transitions (scale + scanline flicker), reduced-motion aware.
**Done when:** windows animate in/out; static under reduced-motion.

## Phase 3 — Apps & content

### [phase-3][content] Real `about`
Replace placeholder bio with real content: intro, short timeline, and a small pixel
avatar drawn in the site's style.
**Done when:** `about` reflects the real story with on-brand visuals.

### [phase-3][content] Projects grid + filter
Turn the launcher into a grid with thumbnails, tags, and a simple filter.
**Done when:** `projects` shows a scannable grid filterable by tag.

### [phase-3][content] Project window: loading + fallback states
Live loading bar while the iframe loads; graceful error state; verify the
`embeddable` fallback card. Detect load failure where possible.
**Done when:** embeddable projects show a loader→content; non-embeddable show the card.

### [phase-3][content] Real project catalogue
Populate `data/projects.ts` with real projects (name, blurb, url, kind, embeddable,
thumb). Configure own web apps to allow framing from `me.lucenity.dev`.
**Done when:** placeholders are gone; every project opens correctly.

### [phase-3][content] Real `contact`
Real handles/links (GitHub, email, socials). Consider a copy-to-clipboard affordance.
**Done when:** contact links are real and working.

### [phase-3][content] Optional extras
`skills`, `resume` windows, and a couple more easter-egg commands.
**Done when:** at least `skills` or `resume` ships; eggs are hidden from `help`.

## Phase 4 — Polish & launch

### [phase-4][a11y] Responsive / mobile
Terminal + windows usable on small/touch screens: touch drag, sensible window sizing,
on-screen keyboard handling.
**Done when:** the site is usable one-handed on a phone.

### [phase-4][a11y] Accessibility pass
Keyboard navigation, ARIA roles/labels, focus management for windows, reduced-motion
audit, colour-contrast check.
**Done when:** core flows are operable by keyboard and screen-reader-sane.

### [phase-4][content] SEO / OG / favicon
Meta tags, Open Graph, a social preview image, and a favicon in the site's style.
**Done when:** shared links show a proper card; a favicon appears.

### [phase-4][deploy] Launch
Point GitHub Pages at the portfolio build — a GitHub Action that builds `dev`, or merge
the built output to `main`. Retain `CNAME` + `.nojekyll`. Verify `me.lucenity.dev`.
**Done when:** the public site serves the portfolio at the custom domain.
