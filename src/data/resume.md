# Nafees S — résumé

`lucenity0` · web & iOS developer
nafees.s2005@gmail.com · +91-99728 47009 · [nafees-s](https://www.linkedin.com/in/nafees-s-6770712b0/) · [lucenity0](https://github.com/lucenity0)

## Education

**B.M.S. College of Engineering** — B.E. in Computer Science & Engineering
CGPA: 8.21 · Expected June 2027

**Narayana PU College** — 12th, Karnataka State Board
94.33% · May 2023

## Technical Skills

- **Languages:** Python, Java, C, JavaScript, TypeScript, Swift, SQL
- **Frameworks & Databases:** FastAPI, React, Tailwind CSS, SwiftUI, PostgreSQL, SQLAlchemy, Alembic, Redis, Celery, Vite
- **AI / ML:** LLMs, Prompt Engineering, Claude & Gemini APIs, RAG, Reinforcement Learning (PPO), Deep Learning, NLP, Multimodal Fusion (CLIP), LangChain, ChromaDB
- **Tools:** Git/GitHub, Docker, AWS EC2, GitHub OAuth/Webhooks, Xcode, Figma, Jupyter Notebook, VS Code
- **Coursework:** Machine Learning, Linear Algebra, Probability & Statistics, Data Structures & Algorithms, Advanced Data Structures

## Projects & Research

### Liffy — Open-Source AI Peer Code Review Tool *(Project Lead)*
`FastAPI, Celery, PostgreSQL, Redis, React, TypeScript, ChromaDB, LangChain` · [Source Code](https://github.com/lucenity0/Liffy) · [liffy.lucenity.dev](https://liffy.lucenity.dev/)

- Led the project as primary owner (top committer by a wide margin), defining a layer-ownership model with a collaborator across backend, frontend, and LLM-pipeline work
- Directed a self-hosted platform ingesting GitHub PR webhooks and generating line-anchored feedback via a RAG pipeline (ChromaDB + LangChain) grounded in the repo's own code, with an async Celery + Redis job layer, a provider-agnostic LLM interface (Ollama, Gemini, Anthropic, Claude Code/Codex), and one-command bootstrap scripts for macOS/Windows
- Indexing splits at function and class boundaries rather than fixed line counts, so reviews cite related files a text search would never connect — it caught a merged secret-generation bug in a Windows script by retrieving the macOS equivalent

### Askcal — AI-Powered Daily Scheduler
`FastAPI, Claude, PostgreSQL, SwiftUI, Google OAuth` · [Source Code](https://github.com/lucenity0/askcal) · [askcal.lucenity.dev](https://askcal.lucenity.dev/)

- Built a regret-ranked inbox classifier that never asks the model for a score — it extracts stakes, sender, deadline and task signals, and deterministic arithmetic ranks each mail 0–100 behind confidence and stakes floors that gate what becomes work; structured output is validated against the same schema the prompt is generated from, so prompt and parser cannot drift
- Shipped the SwiftUI iOS/iPadOS app (optimistic writes with rollback) over FastAPI/Postgres: tasks schedule around real Google Calendar busy blocks and never land in the past, several mailboxes fold into one day, and classification runs in batches off the ingest path so a slow model never costs the user an inbox
- 282 backend tests passing in CI on a deliberately database-free suite, plus a golden classifier set; refresh tokens encrypted at rest as a version-prefixed column type, rotatable with no downtime; MIT-licensed, deployed via Docker Compose behind Caddy

### Interpretable PPO-Based Adaptive Traffic Signal Control
`Python, SUMO, TraCI, RL`

- Implemented a PPO agent with curriculum learning on increasing traffic complexity; integrated attention-based feature attribution to address the black-box challenge in AI-driven infrastructure
- Engineered real-time bidirectional SUMO–TraCI communication (IoT-style feedback loop) with constrained emergency preemption and priority queuing

### Tiket — Full-Stack Ticket Booking System
`SwiftUI, FastAPI, PostgreSQL, AWS EC2, JWT` · [Source Code](https://github.com/lucenity0/tiket)

- Designed and deployed a full-stack ticket booking system with concurrency-safe seat allocation (PostgreSQL `SELECT FOR UPDATE`), JWT auth, and AWS EC2 deployment — load tested at 12,441 concurrent requests with zero double bookings
- Built production-grade iOS frontend in SwiftUI with real-time seat selection and dynamic barcode generation

### Schedulr — OS Concepts Simulator
`React, TypeScript, Vite, Tailwind CSS` · [Live](https://srikrishna-ps.github.io/schedulr/)

- Implemented 12+ classical OS algorithms (CPU scheduling, page replacement, disk scheduling) in a fully type-safe, responsive SPA with real-time Gantt chart visualization — actively used by junior students at BMSCE

## Leadership

**Senior Coordinator, Phase Shift 2025 — BMSCE** · 2024 – 2025
- Co-led logistics for BMSCE's annual technical fest; previously Junior Coordinator for Utsav 2025, managing design team and on-ground event operations

---