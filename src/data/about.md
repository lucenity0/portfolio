# Nafees S

`lucenity0` · developer & designer — web, iOS, and applied ML

> Building small, sharp things for the web and iOS. This whole site is one of them.

---

## Overview

Third-year B.E. Computer Science & Engineering student at B.M.S. College of Engineering
(BMSCE), Bengaluru, expected to graduate in 2027. Works across full-stack development,
applied machine learning research, and freelance/client design under the personal brand
**Lucenity**. Focus areas span backend systems (FastAPI, PostgreSQL), native iOS (SwiftUI),
and multimodal / reinforcement learning research.

## Projects

### Liffy — [liffy.lucenity.dev](https://liffy.lucenity.dev/)
Open-source, self-hosted AI code review (`lucenity0/Liffy`), led as primary owner and top
committer with one collaborator on a layer-ownership split across backend, frontend, and the
LLM pipeline. It indexes an entire repository
by meaning before it reviews anything — so a comment on a Windows setup script can be grounded
in the macOS script that does the same job correctly, two files that share almost no text.
Code is split at function and class boundaries rather than fixed line counts, embedded into a
local vector store, and retrieved per pull request; reviews fire from a GitHub webhook onto a
background queue, come back line-anchored, and get posted to the PR. Readers rate each comment
up or down, and a weekly job scores the system against those ratings. Four interchangeable
model providers — Ollama (fully local), Gemini's free tier, an existing Claude Code
subscription, or the Anthropic API — with embeddings running locally by default, so with
Ollama nothing leaves the machine. Setup is `docker compose up`. All fifteen steps from
sign-in to score run today; teams/org accounts and non-GitHub sources are deliberately not
built.

### Askcal — [askcal.lucenity.dev](https://askcal.lucenity.dev/)
Open-source (MIT) daily scheduler for student freelancers that ranks the inbox by *regret* —
what ignoring a message actually costs — instead of by urgency or arrival order. Claude reads
incoming mail with structured output but is never asked for a score; it extracts what it can
genuinely judge (stakes, sender, deadline, whether there's a concrete task) and four terms of
published arithmetic turn that into a 0–100 regret score. The structured output is validated
against the same schema the prompt is generated from, so prompt and parser cannot drift, and
classification runs in batches off the ingest path — mail lands immediately even when the
model is slow. Four gates then decide whether a
message becomes work at all, so digests and receipts stay in the inbox. What survives is fitted
into the real day: Google Calendar busy blocks are hard edges, work is placed
highest-consequence-first into the earliest gap that fits, and anything that doesn't fit is
surfaced rather than silently dropped. Tracks are rows the user names and describes, and that
description is what the classifier reads, and several connected mailboxes fold into one day.
Stack: SwiftUI iOS/iPadOS client with optimistic writes and rollback, FastAPI + PostgreSQL
backend (async SQLAlchemy, Alembic) deployed via Docker Compose behind Caddy, Google OAuth
down to short-lived JWTs with DB-backed refresh tokens encrypted at rest as a column type with
version-prefixed values, so keys rotate without downtime. 282 backend tests passing in CI on a
deliberately database-free suite, plus a golden set of 12 classifier cases. On iPad the day and
its page open side by side, and that page takes Apple Pencil handwriting through Scribble, so
a handwritten note stays searchable text. Design is warm ruled paper with a red margin line,
both themes verified past 4.5:1 contrast rather than assumed. Deployed and running; no account,
no signup, no tracking.

### clockit — [lucenity0/clockit-app](https://github.com/lucenity0/clockit-app)
Open-source (MIT) macOS time tracker (Electron, React, TypeScript, SQLite via `node:sqlite`,
AppleScript) built
as a machine you keep on your desk: a pixel-art café playing on a screen sunk into a plastic
chassis, with a control deck along the bottom carrying every number and every control. The
point is evidence rather than counting — most trackers ask you to trust a number, this one is
built so the number can be checked. The event log is append-only and hash-chained: every
clock-in, pause, idle decision and clock-out is appended and never edited, every other table is
a cache that can be rebuilt by replaying it, a Verify Log control walks the chain end to end,
and an invoice built from a broken chain says so on its face. Idle time is deducted and the
deduction is itself part of the record — step away and it asks what to do with the time, and
the answer goes into the log, so an invoice can always show what was removed and why. Hours are
corroborated by which app was frontmost, bundle id and app name only: never screenshots, never
window titles, because those leak document names, client names and URLs. Money is integer paise
end to end, never a float. The whole machine is one picture drawn at a fixed 1000×848 and
scaled by a single factor, so it is the same shape at every window size — no breakpoints
anywhere. 199 tests; ships as a `.dmg`.

### Tiket
Full-stack ticket booking system (SwiftUI, FastAPI, PostgreSQL, AWS EC2, JWT). Handles
concurrency-safe seat allocation using PostgreSQL `SELECT FOR UPDATE`, deployed on EC2 and
load tested at 12,441 concurrent requests with zero double bookings. The SwiftUI frontend
supports real-time seat selection and dynamic barcode generation.

### Schedulr
OS concepts simulator (React, TypeScript, Vite, Tailwind CSS). Implements 12+ classical OS
algorithms — CPU scheduling, page replacement, disk scheduling — as a fully type-safe,
responsive SPA with real-time Gantt chart visualization. Actively used by junior students
at BMSCE.

## Research

### [Paper title to confirm] — Cross-Modal Attention for Hateful Meme Detection
Multimodal research on hateful meme detection using CLIP ViT-L/14 with a dynamic gating
mechanism. The framework combines a CrossModalAttention module, a DynamicGatingNetwork,
and a FocalLoss objective. Currently being prepared for IEEE resubmission, addressing gaps
identified in the first round: single-dataset evaluation, missing SOTA comparisons,
overfitting, and bibliography issues. Training ran on an NVIDIA RTX A5000, running static
and dynamic model variants simultaneously.

### Interpretable PPO-Based Adaptive Traffic Signal Control
Reinforcement learning research (Python, SUMO, TraCI) on adaptive traffic signal control.
Implements a PPO agent trained with curriculum learning across increasing traffic
complexity, paired with attention-based feature attribution to address the black-box
problem common to AI-driven infrastructure systems. Includes a real-time bidirectional
SUMO–TraCI communication loop (IoT-style feedback), with constrained emergency preemption
and priority queuing.

## Leadership

- **Senior Coordinator, Phase Shift 2025** (BMSCE), 2024–2025 — co-led logistics for
  BMSCE's annual technical fest.
- **Junior Coordinator, Utsav 2025** — managed the design team and on-ground event
  operations.

## Elsewhere

- GitHub — [github.com/lucenity0](https://github.com/lucenity0)
- Type `contact` for the rest, or `liffy` to just ask me things.