# Architecture

A terminal you type into; commands open draggable retro windows. No runtime
framework — vanilla TypeScript + Vite, static build for GitHub Pages.

## Branch & deploy model

```
main   →  index.html (under construction)   ── LIVE at me.lucenity.dev
dev    →  this Vite project                  ── local `npm run dev` only
```

GitHub Pages is configured "Deploy from branch: `main` / root". Because portfolio
code never lands on `main`, the public keeps seeing the under-construction page.
A copy of that page lives at [`public/under-construction.html`](../public/under-construction.html)
for reference and aesthetic reuse. Launch (Phase 4) switches Pages to the portfolio.

Vite `base: "/"` — custom domain serves from root, so no repo-name prefix.

## Runtime flow

```
index.html
  └─ src/main.ts                         boot everything
       ├─ new DesktopWindowManager(#app)  owns open windows
       ├─ new CommandRegistry()           name → Command lookup
       │    └─ buildCommands()            data/commands.ts wires words → apps
       ├─ new Terminal(#app, …)           input surface, history, dispatch
       └─ runBootSequence(terminal)       BIOS-style intro, then hands over
```

A typed line flows: **Terminal** parses `name + args` → **CommandRegistry** finds the
`Command` → `command.run(ctx)` executes. Most commands call
`ctx.windows.open(...)` to spawn an app window. `ctx` (`CommandContext`) carries the
`terminal`, `windows` manager, `args`, and `raw` line.

## Modules (`src/`)

| Path | Responsibility |
|------|----------------|
| `main.ts` | Compose the system and boot. |
| `types.ts` | Shared contracts: `Terminal`, `WindowManager`, `Command`, `Project`, `CommandContext`. The seams between modules. |
| `core/terminal.ts` | Builds its own DOM; captures input, keeps history, renders a custom block caret (ghost layer), dispatches commands, prints scrollback. Reclaims focus when you type on the empty desktop. |
| `core/command-registry.ts` | `Map<string, Command>` with `register`/`get`/`visible`/`names`. |
| `core/window-manager.ts` | `DesktopWindowManager`: open/close/focus (z-index raise), drag-by-title-bar. Singleton windows by id. |
| `core/window.ts` | `createWindowChrome(title)` — pure DOM for the window panel (title bar, control dots, body slot). |
| `core/boot.ts` | The startup typewriter sequence. |
| `core/fx.ts` | Motion helpers (`typewriter`, `sleep`, `playOnce`) — all reduced-motion aware. |
| `apps/*.ts` | Window content: `about`, `contact`, `projects` (launcher), `project-window` (iframe embed + fallback). Each exports an `open…(ctx)` fn. |
| `data/commands.ts` | The command table; `help` closes over the list. |
| `data/projects.ts` | Project catalogue + `getProject(slug)`. |
| `styles/*.css` | `tokens` (design vars) → `base` (reset, grid, CRT, brackets) → `terminal`, `window`, `apps`. |

## Design system

Everything derives from `styles/tokens.css` (monochrome greys, mono font, spacing,
z-layers, motion timings), lifted from the under-construction page so the two feel
like one world. Reused effects: grid + vignette (`body::before`), CRT scanlines
(`body::after`), corner brackets (`.brackets`), blinking caret. **All timed motion is
gated behind `prefers-reduced-motion`.**

Z-layers: desktop `0` < terminal `10` < windows `100` (active `500`) < scanline overlay `1000`.
The terminal is the console "wallpaper"; windows float above it.

## Project embedding — the key constraint

`project-window.ts` embeds a project's live site in an `<iframe>`. Many sites block
framing (`X-Frame-Options: DENY` / CSP `frame-ancestors`), and App-Store/iOS pages
can't be embedded at all. Each `Project` carries `embeddable: boolean`:

- `true`  → live `<iframe>` inside a faux retro browser (sandboxed).
- `false` → a preview card with an "open in new tab" link.

For your own web projects, allow framing from `me.lucenity.dev` to make them embeddable.

## Conventions

- Path alias `@/…` → `src/…` (tsconfig + vite).
- Strict TypeScript (`noUncheckedIndexedAccess`, `noUnusedLocals`, …).
- `vite.config.ts` is typechecked under `tsconfig.node.json` (Node types); the app
  under `tsconfig.json` (DOM only). `npm run typecheck` runs both.
