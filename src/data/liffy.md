# Liffy's notes on Nafees

<!--
  This is Liffy's brain. Each `##`/`###` heading is a retrievable chunk;
  when someone asks a question, Liffy finds the best-matching section and
  reads it back. Tips:
    - Put likely question keywords in the HEADINGS (they're weighted 2x).
    - Keep sections short and conversational — they're spoken verbatim.
    - Replace every TODO with real info.
  Liffy only answers from this file; anything not here → graceful fallback.
-->

## who is nafees / who are you / about / bio / introduction / intro

I'm Nafees S, online as **lucenity0**. Third-year Computer Science & Engineering
student at B.M.S. College of Engineering (BMSCE) in Bengaluru, graduating in 2027.
I split my time between full-stack development, applied ML research, and freelance
design work under my own brand, Lucenity. Mostly I build things I actually want to
use, then spend way too long on the details.

## skills / tech stack / technologies / languages / programming / what do you know / stack

Languages: Python, Java, C, JavaScript, TypeScript, Swift, SQL.
Frameworks & databases: FastAPI, React, Tailwind CSS, SwiftUI, PostgreSQL,
SQLAlchemy, Alembic, Redis, Celery, Vite.
AI/ML: LLMs, prompt engineering, Gemini API, reinforcement learning (PPO), deep
learning, NLP, multimodal fusion, CLIP, LangChain, ChromaDB.
Tools: Git/GitHub, Docker, AWS EC2, Xcode, Figma, Jupyter Notebook, VS Code.
This portfolio site itself runs on TypeScript + Vite, no framework.

## projects / work / portfolio / what has he built / what do you build / apps / what has nafees made

The big ones: **Liffy** (this — an AI code review tool), **Askcal** (an AI daily
scheduler), **Tiket** (a ticket booking system), and **Schedulr** (an OS concepts
simulator). Ask about any of them by name and I'll go deeper.

## liffy / what is liffy / this project / this tool / code review

You're looking at it. Liffy is an open-source, self-hosted AI-powered code review
tool (`lucenity0/Liffy`). Built on FastAPI, React/TypeScript, PostgreSQL, Redis,
Celery, ChromaDB, and LangChain, with GitHub OAuth for repo access — and you bring
your own LLM API key instead of routing through a hosted service. Setup included
one-command install scripts for both macOS and Windows, and Vertex AI integration
for Claude model access with prompt caching.

## askcal / ask cal / pulse / scheduler / calendar app / inbox / email assistant / gmail / regret score

Askcal (renamed from Pulse) is a context-aware daily scheduler that ranks your
inbox by *regret*, not urgency — built for the student freelancer juggling
classes, client work, and job hunting at once. Gemini reads incoming email
with structured output, a deterministic formula turns that into a 0–100
regret score, and actionable mail (a due invoice, an OA link, a client brief)
auto-converts into a task while newsletters just stay newsletters — no manual
triage. Tasks then slot themselves around your real Google Calendar busy
blocks; pin one to an exact time and everything else routes around it. Work
lives in weighted Tracks — Uni, Career, Design, Finance, Feed — plus daily
Routines that reset at midnight and an evening Review that carries unfinished
work into tomorrow instead of guilt-tripping about it. Design is deliberately
strict off-white/black, no gradients, no mascot.

Stack: SwiftUI iOS app (monochrome, `@Observable` state) talking JWT-auth'd
to `askcal-api` — FastAPI, Python 3.13, async SQLAlchemy 2.0/asyncpg, Alembic,
PostgreSQL 16 — which in turn talks to Gmail, Calendar, and Gemini. Auth is
Google OAuth 2.0 down to a short-lived 15-minute JWT plus DB-backed opaque
refresh tokens. 79 backend tests passing, covering the regret formula,
scheduler, classifier, and auth. The iOS app has Today, Inbox, Calendar
(interactive, per-date drill-down), Routine, Tracks, Review, and More views.

Currently: auth, Gmail ingestion, classification, regret scoring, and
auto-scheduling are all live and tested. The landing page (`askcal-landing`,
Three.js + GSAP) still shows an earlier coffee-themed concept from before the
product pivoted to this monochrome look — rebuild's queued. Web dashboard and
adaptive scheduling (chronotype, weight nudging) aren't built yet on purpose.
Pre-open-source hardening — refresh-token encryption at rest, PKCE on the
OAuth flow, CI, a LICENSE — is the current blocker before it's safe to
self-host publicly.

## tiket / ticket / ticket booking / booking system / seats / concurrency

Tiket is a full-stack ticket booking system — SwiftUI, FastAPI, PostgreSQL, AWS
EC2, JWT. The interesting bit is concurrency-safe seat allocation using
PostgreSQL `SELECT FOR UPDATE`; it's been load tested at 12,441 concurrent
requests with zero double bookings. The SwiftUI frontend does real-time seat
selection and dynamic barcode generation.

## schedulr / os simulator / operating systems / scheduling algorithms / gantt chart / synchronization / page replacement / disk scheduling

Schedulr is an interactive web app for visualizing core OS concepts —
CPU scheduling, system calls, process synchronization, page replacement, and
disk scheduling — all running client-side with real-time visual feedback.
Co-developed with SriKrishna Pejathaya P S. Modules include Gantt charts and
process metrics for CPU scheduling, a system call visualizer with process
tree simulation, the classic synchronization problems (Producer-Consumer,
Readers-Writers, Dining Philosophers), page replacement algorithms (FIFO,
LRU, LFU, Optimal), and disk scheduling visualizations (FCFS, SSTF, SCAN,
C-SCAN). Minimal, modern, accessible UI, fully responsive across desktop,
tablet, and mobile. It's genuinely used by junior students at BMSCE, not just
a class demo.

Tech: React (TypeScript), Vite, Tailwind CSS, shadcn-ui. Recently added
preemptive scheduling support, a friendlier mobile view, and Skip-to-Result /
Previous-Step buttons on the page replacement and disk scheduling modules.
On the roadmap: real-time scheduling algorithms (Rate Monotonic, EDF),
multi-process scheduling, and memory allocation visualizations (First Fit,
Best Fit, Worst Fit).

## research / machine learning / ml research / papers / publications / academic work

Two research threads right now: a multimodal hateful-meme detection paper
(cross-modal attention, currently in IEEE resubmission) and a reinforcement
learning project on adaptive traffic signal control. Ask about either by name.

## hateful meme detection / multimodal / cross modal attention / clip / dynamic gating / ieee paper

Research on multimodal hateful meme detection using CLIP ViT-L/14 with a dynamic
gating mechanism. The framework combines a CrossModalAttention module, a
DynamicGatingNetwork, and a FocalLoss objective. It's being prepared for IEEE
resubmission, addressing gaps from the first round: single-dataset evaluation,
missing SOTA comparisons, overfitting, and bibliography issues. Training ran on
an NVIDIA RTX A5000, running the static and dynamic model variants side by side.
Team: S Gajalakshmi, S Nagashree, Saanvi S, Sachit P Naidu, guided by Prof.
Rekha G S.

## ppo / traffic signal / reinforcement learning / rl / sumo / traci / self driving / autonomous

Interpretable PPO-based adaptive traffic signal control — Python, SUMO, TraCI.
A PPO agent trained with curriculum learning across increasing traffic
complexity, paired with attention-based feature attribution to open up the
black-box problem in AI-driven infrastructure. Includes a real-time
bidirectional SUMO–TraCI communication loop (IoT-style feedback), with
constrained emergency preemption and priority queuing.

## education / study / college / university / school / degree / cgpa / gpa

B.E. in Computer Science & Engineering at B.M.S. College of Engineering
(BMSCE), Bengaluru — CGPA 8.21, expected June 2027. Before that, Narayana PU
College, 12th, Karnataka State Board, 94.33%, May 2023.

## experience / jobs / internships / work history / roles

Graphic Designer at Clearly Blue Pvt Ltd — still affiliated with them on a
freelance basis. Beyond that, most of the hands-on experience comes from
research (the hateful-meme and traffic-signal projects), freelance design work
under Lucenity, and shipping full products solo (Liffy, Askcal, Tiket,
Schedulr). Currently prepping for placements and research program applications.

## leadership / fest / event / phase shift / utsav / coordinator / campus

Senior Coordinator for Phase Shift 2025 at BMSCE (2024–2025), co-leading
logistics for the college's annual technical fest. Before that, Junior
Coordinator for Utsav 2025, managing the design team and on-ground event
operations.

## freelance / design work / lucenity brand / clients / lucenity.dev

Runs freelance/client design work under the Lucenity brand (lucenity.dev),
mostly using prompt engineering with AI design tools as the working method.
Brand identity itself is Cormorant Garamond wordmark, a warm ink/off-white/
starlight-gold palette, and a star-chart crosshair emblem, built to hold up
across any application background.

## how he works / workflow / build process / dev habits

Prefers phased development with git checkpoints at each phase boundary,
verifying state directly before resuming a coding session rather than trusting
memory of where things were left. Likes confirmation before big architectural
changes, and tends to experiment first, then formalize understanding once
something's proven out.

## contact / reach / email / socials / github / linkedin / hire / hiring / availability / work with him

Best way in is GitHub — [github.com/lucenity0](https://github.com/lucenity0).
TODO: add email + any other socials you want Liffy to hand out, and a line on
what kind of roles/collabs you're open to right now.

## hobbies / interests / fun / outside of work / art / artist

Outside of code, I'm an artist — mostly digital art, with the occasional dip
into traditional media too. It's the other half of the "design-first" thing
that shows up in Lucenity's work.

## music / piano / singing / soprano / ariana grande / favorite artist / favorite singer

Music's a big one for me. I play piano, and I sing soprano. And yeah — I'm a
huge Ariana Grande fan, probably her biggest defender in any room I'm in. Her
range, the whistle notes, the way she layers harmonies on her own vocals — it's
just some of the best pop vocal work out there. If you catch me humming
something between builds, there's a very good chance it's off *Eternal
Sunshine* or *Positions*. (And if you ask nicely, I might just admit to
practicing a few of her songs myself...)

## games / gaming / nintendo / console / video games / fire emblem / what are you playing

Big Nintendo and console gamer. If you ask what I'm currently playing, it's
probably Fire Emblem Heroes — I'm prolly playing it right now, honestly.

## the cat

There's a cat that naps through the whole site. It is always asleep. =^..^=
It kept the seat warm during the "under construction" era and refuses to leave.