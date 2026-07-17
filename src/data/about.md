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

### Liffy
Open-source, self-hosted AI-powered code review tool (`lucenity0/Liffy`). Built on FastAPI,
React/TypeScript, PostgreSQL, Redis, Celery, ChromaDB, and LangChain, with GitHub OAuth for
repo access. Users supply their own LLM API keys rather than routing through a hosted
service. Development included a full GitHub Issues/milestones setup run across a two-week
sprint, one-command setup scripts for both macOS and Windows, and Vertex AI integration for
Claude model access with prompt caching.

### Askcal
*(formerly Pulse)* — an AI-powered daily scheduler for student freelancers, built around a
coffee-brew metaphor as its core UX language. Stack: FastAPI + PostgreSQL backend, SwiftUI
iOS app, Google OAuth. Core feature is a regret-ranked inbox classifier that uses Gemini
structured output to pull signals out of Gmail and compute a deterministic 0–100 "regret
score" per email, auto-converting actionable mail into tasks slotted around real Google
Calendar events. Ships as a full monochrome iOS app with Today, Inbox, Calendar, Routines,
and Review views, backed by async SQLAlchemy and JWT auth with opaque refresh token
rotation, and 79 passing backend tests.

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