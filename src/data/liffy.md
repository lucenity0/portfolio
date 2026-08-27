# Liffy's notes on Nafees

<!--
  This is Liffy's brain. Each `##` heading is a retrievable chunk; when
  someone asks a question, Liffy finds the best-matching chunk and reads
  it back (v2 engine: BM25 ranking + typo correction + compound-question
  splitting + cross-chunk aggregation + a real "did you mean A or B?"
  clarify loop + follow-up memory). Tips for editing this file:

    - Put likely question keywords in the HEADINGS (they're weighted
      heavily over body text). Separate aliases with " / ". The FIRST
      alias is the topic's "name" — keep it a tidy single word where
      possible; it becomes the chunk's label. IMPORTANT: the fallback
      "ask me about..." menu only ever lists the FIRST 8 SECTIONS IN
      FILE ORDER, regardless of what's relevant to the question — so
      keep the 8 most broadly useful sections (identity, pitch, skills,
      projects, experience, education, contact, one flagship project)
      at the very top of this file.
    - End an alias with "!" (e.g. "email!") to make this section the
      DEFAULT answer for that word when it's genuinely ambiguous across
      sections — "whats his gmail?" should mean contact info, not
      askcal's Gmail integration. The reply still points at the other
      context instead of hiding it. Use "!" sparingly, only for real
      conflicts.
    - NEVER reuse a keyword across two headings' aliases — including
      indirectly through a multi-word alias. "work history" and a bare
      "work" alias fight each other exactly as much as repeating "work"
      outright, because both reduce to the same word once stopwords
      (a/the/his/etc.) drop out. Before adding an alias, mentally strip
      stopwords and check the words left over aren't already claimed by
      another heading.
    - Body words are findable WITHOUT being aliases — the engine scans
      every chunk's body too, and answers cross-chunk questions like
      "which projects use fastapi?" by finding a term that lives in
      several bodies but isn't anyone's alias. So don't over-stuff
      headings with tech names; mentioning a stack in prose is usually
      enough — and keeping tech terms OUT of headings is exactly what
      lets that cross-chunk trick work at all. Alias a term and it drops
      out of that pool.
    - The engine splits "askcal and tiket?" into two answers, and asks
      "did you mean A or B?" on genuine ties, so don't panic about minor
      overlap between closely-related sections (e.g. "app" meaning
      either one specific project or the project list) — the clarify
      loop catches real ambiguity on its own. Save manual fixes for
      overlaps that would silently misroute somewhere unhelpful.
    - Keep sections conversational — they're spoken back verbatim, lead
      sentences first (opening ~5), the rest held behind "more".
    - Small talk, "who are you" / "who made you", and the "that's not in
      my notes" fallback line are hardcoded in retrieval.ts, NOT here —
      if those need new wording, that's a code change; this file can't
      reach them.
  Liffy only answers from this file, and never invents facts that
  aren't written down below — anything not here gets a graceful
  fallback instead.
-->

## who is nafees / who are you / about / bio / introduction / intro

I'm Nafees S, online as **lucenity0**. Third-year Computer Science & Engineering
student at B.M.S. College of Engineering (BMSCE) in Bengaluru, graduating in 2027.
I split my time between full-stack development, applied ML research, and freelance
design work under my own brand, Lucenity. Mostly I build things I actually want to
use, then spend way too long on the details. If you're sizing me up for a role,
ask me why you should hire me — I've got a real pitch, not just a bio.

## hire / hiring / why hire / hire him / why hire him / why should we hire him / why should you hire him / why should i hire him / should we hire him / should i hire him / why choose him / worth hiring / strengths / pitch / value proposition / good fit / qualifications / candidate / stand out / availability

Short version: I ship, not just study. Five finished products with real,
working stacks — Liffy, Askcal, clockit, Tiket, and Schedulr — done alongside a
full CS course load, not class assignments gathering dust in a repo. Liffy and Askcal
are both open source, deployed, and documented end to end on their own landing
pages: Liffy reviews pull requests by retrieving from a semantic index of the
whole repository, and Askcal ranks a mailbox by what ignoring it costs, on
arithmetic you can read rather than a number a model made up. On Liffy I was
project lead and top committer by a wide margin, running a layer-ownership
split with a collaborator across backend, frontend, and the LLM pipeline — so
there's ownership experience in there, not just solo hacking. Tiket's seat
booking survived a load test at 12,441 concurrent requests with zero double
bookings, which is a concurrency problem most undergrads never touch. Askcal
ships JWT auth, live Gmail and Calendar integration, refresh tokens encrypted
at rest with rotatable keys, and 282 backend tests — a real product, not a
demo. I move across the whole stack instead of
staying in one lane: mobile (SwiftUI), backend (FastAPI, PostgreSQL, Celery),
ML research (CLIP, PPO, LangChain), and design (freelance client work under my
own brand, Lucenity).

Two research threads are active alongside all that — a CLIP-based hateful-meme
detector headed for IEEE resubmission, and a PPO agent for adaptive traffic
signal control — so it's not just shipping speed, there's research depth
behind it too. I've also led logistics for BMSCE's Phase Shift tech fest and
managed the design team for Utsav, so team and event coordination aren't new
either. None of this covers a specific start date, compensation range, or
relocation preference — that's a direct conversation, so just reach out. Ask
me about any project by name for the specifics, or ask for contact details.

## skills / tech stack / technologies / languages / programming / what do you know / stack

Languages: Python, Java, C, JavaScript, TypeScript, Swift, SQL.
Frameworks & databases: FastAPI, React, Tailwind CSS, SwiftUI, PostgreSQL,
SQLAlchemy, Alembic, Redis, Celery, Vite.
AI/ML: LLMs, prompt engineering, Gemini API, reinforcement learning (PPO), deep
learning, NLP, multimodal fusion, CLIP, LangChain, ChromaDB.
Tools: Git/GitHub, Docker, AWS EC2, Xcode, Figma, Jupyter Notebook, VS Code.

## projects / work / portfolio / what has he built / what do you build / apps / what has nafees made / list

The big ones: **Liffy** (an AI code review tool — yes, same name as me),
**Askcal** (a daily scheduler that ranks your inbox by regret), **clockit** (a
macOS time tracker that can prove its own hours), **Tiket** (a ticket booking
system), and **Schedulr** (an OS concepts simulator). Liffy and
Askcal are both done, open source, and have proper landing pages of their own
now — liffy.lucenity.dev and askcal.lucenity.dev. Ask about any of them by
name and I'll go deeper — or ask why you should hire me for the highlight reel
across all five. There are also two exam-notes sites — ML Notes and BDA
Notes — built out of his own BMSCE coursework, formulas and solved papers and
all.

## experience / jobs / internships / career / roles

Graphic Designer at Clearly Blue Pvt Ltd — still affiliated with them on a
freelance basis. Beyond that, most of the hands-on experience comes from
research (the hateful-meme and traffic-signal projects), freelance design work
under Lucenity, and shipping full products end to end (Liffy, Askcal, clockit,
Tiket, Schedulr). Currently prepping for placements and research program applications.

## education / study / college / university / school / degree / cgpa / gpa / graduate / graduation

B.E. in Computer Science & Engineering at B.M.S. College of Engineering
(BMSCE), Bengaluru — CGPA 8.21, expected June 2027. Before that, Narayana PU
College, 12th, Karnataka State Board, 94.33%, May 2023.

## contact / reach / email! / gmail! / socials / github / linkedin / instagram / discord / get in touch / reach out / resume / cv

Best way in is GitHub — [github.com/lucenity0](https://github.com/lucenity0).
Email: nafees.s2005@gmail.com (secondary: 0lucenity@gmail.com).
Discord: lucenity. Instagram: @lucenity_.
LinkedIn: https://www.linkedin.com/in/nafees-s-6770712b0/
For the résumé, close me and type `resume` in the terminal — it opens right
here, with a PDF download on it.

## askcal / ask cal / pulse / scheduler / calendar app / inbox / email assistant / regret score

Askcal (renamed from Pulse) is a daily scheduler that ranks your inbox by
*regret* — what it costs you to have ignored something, not how loudly it
asked or when it arrived. It's finished and open source now, MIT, deployed and
running, with a landing page at askcal.lucenity.dev walking through the whole
thing. The clever bit: Claude reads your mail but is never asked for a score,
because ask a model for a number between 0 and 100 and you get a different
answer on Tuesday than on Monday. It extracts only what it can genuinely
judge — the stakes, the sender, whether there's a concrete task, when it's
due — and four terms of plain arithmetic turn that into the 0–100 regret
score. Every constant is printed on the page, so a score you can print is a
score you can argue with.

Scoring a message and making work out of it are two different decisions, so
four gates sit between them: a concrete task with real stakes, a confidence
floor of 0.60, a score floor of 25, and the consequence type. A digest is
reading, not work; social is never a task; money that already moved is over.
The sender is deliberately *not* a gate — an assignment from a no-reply system
is as real as a client writing by hand, and filtering automated senders out
silently dropped exactly the work that mattered. That bug shipped once and
won't again. What survives gets fitted into the actual day: Google Calendar
busy blocks are hard edges the planner may not touch, work is placed
highest-consequence-first into the earliest gap that fits it, and anything too
big for the gaps left is surfaced as unscheduled rather than quietly dropped
or double-booked. Tracks are rows you name and describe yourself — the
sentence you write is what the classifier reads, beating any assumption the
model has about what a name usually means. That replaced five categories baked
into the database, the prompt and the app, which described a guess at
somebody's life rather than anybody's actual one.

Stack: SwiftUI iOS/iPadOS app (`@Observable` state, optimistic writes that roll
back if the server refuses) talking JWT-auth'd to `askcal-api` — FastAPI,
Python 3.13, async SQLAlchemy 2.0/asyncpg, Alembic, PostgreSQL 16, deployed
with Docker Compose behind Caddy — which in turn talks to Gmail, Calendar, and
Claude (there's a Gemini path behind a setting). Auth is
Google OAuth 2.0 down to a short-lived JWT plus DB-backed refresh tokens, and
those are encrypted as a *column type* rather than at each call site, so the
one place that forgets can't write plaintext; stored values carry a version
prefix, which is what let the key rotate without taking a single mailbox
offline. 282 backend tests run in CI without needing a database at all, plus a
golden set of twelve classifier cases that each pin one rule — two of those
found errors in the fixture before they found any in the prompt. The app has
Today, Inbox, Calendar, Routine, Tracks, Review, and More views; several
mailboxes fold into one day, and each one carries the tracks its mail is
usually about as a leaning, never a rule, so a bill at a college address is
still about money. On iPad the day opens beside its own page, which takes
Apple Pencil handwriting through Scribble and converts it to searchable text.
The look is warm ruled paper with a red margin line, New York for anything
written and mono for anything counted, both themes checked past 4.5:1 contrast
rather than assumed. Honest gap: that database-free suite is exactly what makes
model-versus-schema drift invisible to it — there's a command that catches
that, and it isn't in CI yet.
No account, no signup, no tracking. Source: github.com/lucenity0/askcal.

## liffy / what is liffy / this project / this tool / code review

There are two of us, really. I'm the little notes-reading cat you're talking
to; the Liffy that matters is Nafees's self-hosted AI code review tool, and
it's finished and running, with its own landing page at liffy.lucenity.dev if
you want the full tour. The pitch: every
AI review tool sends the diff to a model, so the only question that matters is
what *else* it sends. Liffy reads your entire repository once, splits it at
function and class boundaries instead of arbitrary line counts, stores what
each piece *means*, and pulls the relevant neighbours in before it says
anything. It once flagged a bug in a Windows setup script by retrieving the
macOS script that did the same job correctly — two files sharing almost no
words, that nobody had told it were related, and the bug was already sitting
merged in main.

How a review actually runs: a pull request opens, GitHub fires a webhook,
Liffy verifies the signature, fetches the diff, splits it per file, drops the
job on a background queue so a forty-file change blocks nothing, embeds the
changed code, retrieves the nearest neighbours from the vector store, writes
the briefing, generates the review, checks it and pins each comment to a real
line, files it, and posts it back to the PR. Then you rate comments up or
down, and a weekly job scores the whole system against those ratings — a
review nobody scores can't improve. Fifteen steps end to end, and all fifteen
run today; the site says so in plain language rather than as a roadmap written
to look finished.

You bring your own model: Ollama (free, fully local, nothing leaves your
machine), Gemini's free tier, a Claude Code subscription you're probably
already paying for, or the Anthropic API metered. Embeddings run locally by
default and never need a key, whichever one you pick. Setup is `git clone`,
copy the env file, `docker compose up`. Built on FastAPI, React/TypeScript,
PostgreSQL, Redis, Celery, ChromaDB and LangChain, with GitHub OAuth for repo
access — it never sees your password and you can revoke it any time. Also
shipped: settings in the app so nobody hand-edits a `.env`, indexing for
languages beyond Python, filter/sort on the review list with a PR picker,
per-model performance analytics, five themes with a customiser, and a help
page that files its own bug reports. Not built, on purpose: teams and
organisation accounts, and reviewing anything that isn't a GitHub pull
request. Source: github.com/lucenity0/Liffy.

## clockit / clock it / time tracker / timer / billable hours / invoice / macos / desk machine

clockit is a macOS time tracker that produces invoice-grade evidence of
billable hours. It's built as a machine you keep on your desk — a pixel-art
café playing on a screen sunk into a plastic chassis, with a control deck along
the bottom carrying every number and every control. The angle is evidence
rather than counting: most trackers ask you to trust a number, and this one is
built so the number can be checked. The event log is append-only and
hash-chained — every clock-in, pause, idle decision and clock-out is appended
and never edited, and every other table is a cache that can be rebuilt by
replaying it. There's a Verify Log control that walks the chain end to end, and
an invoice built from a broken chain says so on its face.

Idle time is deducted, and the deduction is itself part of the record: step
away and it asks what to do with the time, the answer goes into the log, so an
invoice can always show what was removed and why. Hours are corroborated by
which app was frontmost — bundle id and app name only, never screenshots and
never window titles, because those leak document names, client names and URLs.
Money is integer paise end to end, never a float. Built on Electron, React,
TypeScript, SQLite through `node:sqlite`, and AppleScript for the frontmost-app
sampling and the Apple Music bridge, with 199 tests, shipping as a `.dmg`. The
whole machine is one picture drawn at a fixed 1000×848 and scaled by a single
factor, so it's exactly the same shape at every window size — no breakpoints
anywhere. Source: github.com/lucenity0/clockit-app.

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

## memes / hateful meme detection / meme paper / multimodal / cross modal attention / clip / dynamic gating / ieee paper

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

## leadership / fest / event / phase shift / utsav / coordinator / campus / extracurricular

Senior Coordinator for Phase Shift 2025 at BMSCE (2024–2025), co-leading
logistics for the college's annual technical fest. Before that, Junior
Coordinator for Utsav 2025, managing the design team and on-ground event
operations.

## freelance / design / lucenity brand / clients / lucenity.dev

Runs freelance/client design work under the Lucenity brand (lucenity.dev),
mostly using prompt engineering with AI design tools as the working method.
Brand identity itself is Cormorant Garamond wordmark, a warm ink/off-white/
starlight-gold palette, and a star-chart crosshair emblem, built to hold up
across any application background.

## how he works / workflow / build process / dev habits / approach

Prefers phased development with git checkpoints at each phase boundary,
verifying state directly before resuming a coding session rather than trusting
memory of where things were left. Likes confirmation before big architectural
changes, and tends to experiment first, then formalize understanding once
something's proven out.

## this site / website / how was this site made / terminal os / lucenityos / this portfolio

The site you're standing in is a terminal-style portfolio Nafees built from
scratch — vanilla TypeScript + Vite, no frameworks, no trackers. You type
commands, retro windows power on with a CRT flicker, and everything stays
monochrome pixels and scanlines. The windows drag, resize, minimize into a
little corner folder, and maximize; the boot sequence is honest BIOS theatre.
Even I live inside it — a retrieval bot with no LLM, reading straight from
Nafees's notes. There are also a few commands the help menu won't admit to;
the sleeping cat murmurs hints about them if you leave it alone long enough.
It's live at me.lucenity.dev.

## location / living / house / address / lives where / where does he live / visit / wherabouts / meet him / meeting

Nafees's location is private.. rather i don't know his whereabouts too. For now, he resides as me in this pixel world !

## age / how old / birthday / born / birthdate

His notes don't say — he keeps numbers like that off the record. All I can
tell you is he's a third-year CSE student graduating in 2027; you can do the
math from there if you really must.

## hobbies / interests / fun / outside of work / art / artist

Outside of code, I'm an artist — mostly digital art, with the occasional dip
into traditional media too. It's the other half of the "design-first" thing
that shows up in Lucenity's work.

## music / piano / singing / soprano / ariana grande / favorite artist / favorite singer

Music's a big one for me. I play piano, and I sing soprano. And yeah — I'm a
huge Ariana Grande fan, probably her biggest defender in any room I'm in. Her
range, the whistle notes, the way she layers harmonies on her own vocals — it's
just some of the best pop vocal work out there. Right now it's *petal* (2026)
on repeat — that's the favourite, top to bottom, though *Eternal Sunshine* and
*Positions* still get their turns. (And if you ask nicely, I might just admit
to practicing a few of her songs myself...) There's also a record player hidden
somewhere in this terminal — it ships with no music, so it spins whatever you
drop on it. Nothing you drop leaves your machine. The cat knows the word.

## games / gaming / nintendo / console / video games / fire emblem / what are you playing

Big Nintendo and console gamer. If you ask what I'm currently playing, it's
probably Fire Emblem Heroes — I'm prolly playing it right now, honestly.

## the cat

There's a cat that naps through the whole site. It is always asleep. =^..^=
It kept the seat warm during the "under construction" era and refuses to leave.
