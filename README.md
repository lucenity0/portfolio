# me.lucenity.dev — terminal portfolio

An interactive **terminal / desktop-OS** portfolio: type a command, a cute retro
window pops up. Monochrome + pixel + CRT, hand-built on vanilla TypeScript + Vite.

> **Branch note:** this (`dev`) branch is the portfolio, under construction and
> **not deployed**. The public site (`main`) still serves the pixel-art
> under-construction page. A copy lives at
> [`public/under-construction.html`](public/under-construction.html). Never push
> portfolio code to `main` until launch — see [ROADMAP.md](ROADMAP.md) Phase 4.

## Develop

```bash
npm install
npm run dev        # start the dev server (Vite picks a free port)
npm run build      # typecheck + production build → dist/
npm run typecheck  # type-check app + vite config
```

Then type `help` in the terminal.

## How it works

- **Terminal** (`src/core/terminal.ts`) captures input and dispatches commands.
- **CommandRegistry** maps words → actions (`src/data/commands.ts`).
- **Window manager** (`src/core/window-manager.ts`) spawns draggable windows.
- **Apps** (`src/apps/*`) render window content; projects embed live sites via
  `<iframe>` with an "open in new tab" fallback for sites that block framing.

Full write-up: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
Work is tracked in [ROADMAP.md](ROADMAP.md) and [docs/backlog.md](docs/backlog.md).

## Design

No frameworks, no trackers. Everything derives from `src/styles/tokens.css`
(monochrome greys, mono font, CRT/grid texture) — the same world as the
under-construction page. All motion respects `prefers-reduced-motion`.

---

<sub>© Nafees S · [@lucenity0](https://github.com/lucenity0) · monochrome + pixels</sub>
