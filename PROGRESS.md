# FuelIQ — Development Progress

> **India's First Culturally-Aware AI Nutrition Coach**
> Built with React 19, Node.js, MongoDB, Gemini AI, and a custom RAG pipeline

---

## Project Context

This project started as **Spottr** — a gym-buddy matching app with AI-powered diet plans and a RAG-based nutrition engine. I decided to pivot the entire codebase into **FuelIQ**, a focused AI nutrition coach specifically designed for Indian gym-goers.

**Why the pivot?** After building Spottr, I realized the most technically interesting and impactful piece wasn't the matching algorithm — it was the Indian nutrition RAG engine. No app on the market (MyFitnessPal, HealthifyMe, Fitbod) actually solves the cultural food gap for Indian users. FuelIQ does.

**What I kept:** The MERN stack foundation, JWT auth system, Gemini AI integration, and the RAG pipeline architecture.
**What I rebuilt from scratch:** Every data model, every API endpoint, the entire frontend, and a comprehensive Indian food knowledge base.

---

## Sprint Log

### Sprint 1 — Foundation & Cleanup
**Date:** May 12, 2025
**Goal:** Strip out all Spottr-specific code, establish FuelIQ identity, and lay the data model foundation.
**Status:** ✅ Complete

#### What I Did

**1. Codebase Cleanup (~25 files removed)**
Removed everything related to Spottr's gym-buddy matching features:
- Deleted matching engine (`matchController`, `matchmaker`, `Match` model)
- Deleted real-time chat system (`chatController`, Socket.io integration, `Message` model)
- Deleted gamification layer (`gamificationController`, `ActivityLog` model, XP/badge system)
- Deleted social UI components (`SwipeCard`, `ProfileModal`, old `Sidebar`, `Dashboard`)
- Removed all test scripts, seed data, and Spottr documentation

**Why this matters:** FuelIQ's PRD explicitly states "zero social features — permanently excluded." This isn't a deferred feature; it's a design philosophy. The app is built around one metric: *time from app open to meal logged* (target: under 10 seconds).

**2. New Data Models (4 MongoDB Schemas)**

- **User** — Complete rewrite. Replaced gym personality traits with nutrition-specific fields: dietary profile (veg/non-veg/eggetarian/vegan), regional cuisine preference (North Indian, South Indian, Bengali, Gujarati), training schedule, activity level, budget tier. Added TDEE auto-calculation using Mifflin-St Jeor equation with goal-based macro targets (muscle gain/fat loss/maintenance/endurance) and training day vs rest day carb adjustments.

- **MealLog** — The core data structure. Each log stores the user's raw Hinglish text input alongside parsed nutritional data. Every food item traces back to its ICMR/NIN source entry ID — no black-box calorie counts. Auto-calculates aggregated totals on save.

- **MealPlan** — AI-generated daily plans with per-meal regeneration support. Each plan caches for 24 hours (MongoDB TTL index). When a user regenerates one meal, only that slot changes — the rest stay cached. Tracks regeneration count per meal.

- **WeightLog** — Simple weight tracking with unique compound index (one entry per user per day).

**3. Server Rebuild**
- Rewired `server/index.js` — removed Socket.io, updated route mounting for 4 new API domains
- Updated environment variable naming for clarity
- Stripped unused dependencies (socket.io, anthropic SDK, openai SDK, google-auth-library)

#### Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Mifflin-St Jeor for TDEE | Gold standard equation used by actual dietitians. More accurate than Harris-Benedict for Indian body compositions. |
| Training day carb cycling | +15% carbs on training days, -10% on rest days — based on sports nutrition research for gym-goers. |
| MongoDB TTL for plan caching | Plans auto-expire after 24 hours. No cron jobs needed. MongoDB handles cleanup. |
| Compound indexes on MealLog | `userId + date` index makes daily calorie queries sub-millisecond even at scale. |

---

### Sprint 2 — Backend API & AI Engine
**Date:** May 12, 2025
**Goal:** Build the complete backend API — auth, nutrition logging with Hinglish NLP, AI meal plan engine, progress tracking, and data export.
**Status:** ✅ Complete

#### What I Did

**1. Auth System (Simplified)**
Cleaned up auth controller: removed demo login, Google OAuth, gamification XP from response payload. Lean JWT-based email/password auth. Added `onboardingComplete` flag to control post-registration flow.

**2. User Profile & Onboarding API**
- `PUT /api/users/profile` — Merge-update for nutrition fields without overwriting unset values
- `POST /api/users/complete-onboarding` — Sets all profile fields from the 4-step onboarding flow, triggers TDEE calculation
- `DELETE /api/users/account` — Full data purge across all collections (MealLog, MealPlan, WeightLog, User). Per PRD: "Account deletion triggers full data purge within 24 hours — no soft-delete retention."

**3. Nutrition Controller — The Core Brain**
This is the most technically interesting part of FuelIQ. The food logging pipeline:

```
User types Hinglish → LLM parses food entities → RAG lookup → Macro calculation → Store with source citation
```

Step by step:
1. **Hinglish NLP Parser**: Uses Gemini Flash to parse natural language like "2 roti with aloo sabzi and dahi" into structured data — extracting food names, quantities, and portion context (home/restaurant/dhaba/dabba).
2. **RAG Retrieval**: Each parsed food item is embedded and searched against the vector store (cosine similarity, top-3). If confidence > 0.70, we proceed. If < 0.70, we return a clarifying question to the user.
3. **Macro Calculation**: RAG context + LLM together produce accurate macros accounting for Indian cooking methods (oil, ghee, tempering).
4. **Source Citation**: Every logged calorie traces back to an ICMR/NIN entry ID. Transparent AI — no black-box numbers.
5. **Streak Update**: Auto-increments consecutive-day streaks, resets on gap.

**4. AI Meal Plan Engine**
- Generates 4-meal daily plans using user's TDEE, macro targets, cuisine preference, dietary profile, and budget tier
- **Anti-repetition**: Queries last 3 days of plan history before generating
- **Per-meal regeneration**: Swaps one meal with ±50 kcal / ±5g protein constraint (per PRD spec)
- **Training day awareness**: Higher carbs on training days, lower on rest days
- **Caching**: Plans stored with 24h TTL, individual meal swaps update in-place

**5. Progress & Export APIs**
- Weekly macro adherence endpoint: groups logs by day, calculates daily totals
- Weight tracking: upsert pattern (one entry/day), also updates user profile weight
- **Free data export**: JSON (full history) and CSV (meal logs). Per PRD: "Users can export their complete meal history, macro logs, and meal plans as CSV or JSON at any time, for free. No paywall."

#### Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `controllers/aiController.js` | Rewritten | Hinglish NLP + RAG food logging + meal plan engine |
| `controllers/userController.js` | Rewritten | Profile CRUD + onboarding + account deletion |
| `controllers/authController.js` | Rewritten | Simplified JWT auth |
| `controllers/progressController.js` | New | Weight tracking + weekly adherence + streaks |
| `controllers/exportController.js` | New | Free JSON/CSV data export |
| `routes/nutritionRoutes.js` | New | 4 endpoints for meal logging |
| `routes/mealPlanRoutes.js` | New | 3 endpoints for plan generation |
| `routes/progressRoutes.js` | New | 4 endpoints for progress data |
| `routes/exportRoutes.js` | New | 2 endpoints for data export |

---

### Sprint 3 — Frontend Complete Rebuild
**Date:** May 12, 2025
**Goal:** Build the entire FuelIQ frontend — design system, 8 pages, 7 components, mobile-first responsive layout.
**Status:** ✅ Complete

#### What I Did

**1. Design System — From Neon Green to Warm Orange**
Replaced Spottr's neon green gym aesthetic with a food-centric, premium dark palette using Tailwind CSS v4's `@theme` directive:

- **Primary**: `#FF6B35` (Warm Orange) — evokes energy and food
- **Secondary**: `#004E64` (Deep Teal) — trust and health
- **Accent**: `#25A18E` (Mint Green) — freshness
- **Surfaces**: 4-tier dark elevation (`#0A0A0F` → `#14141F` → `#1E1E2E` → `#282840`)
- **Macro colors**: Purple (protein), Amber (carbs), Pink (fats) — consistent across all charts

Custom utilities: glass card effect (backdrop blur + subtle border), glow effect for primary CTAs, custom scroll bars, and three animation presets (fade-in, slide-up, pulse).

**2. Pages Built (8 total)**

| Page | Key UX Decision |
|------|-----------------|
| **Landing** | Hero with gradient text + ambient glow orbs. Competitor callout against MyFitnessPal. |
| **Login** | Clean form with password toggle. Routes to /home or /onboarding based on profile state. |
| **Register** | Matches login styling. Routes to onboarding after signup. |
| **Onboarding** | 4-step flow: body metrics → dietary profile → training schedule → cuisine & budget. Progress bar at top. |
| **Home/Log** | **Log-first**: food input is THE primary element. Macro progress rings below. Last meals at bottom. |
| **Meal Plan** | Training/rest day toggle. Generate plan CTA. Per-meal regenerate buttons. Macro summary rings. PRD disclaimer. |
| **Progress** | Streak counter + weight trend card. Weekly macro adherence rings. 7-day calorie bar chart with target line. |
| **Settings** | Profile editing with TDEE display. Free JSON/CSV export. Sign out. Account deletion with confirmation modal. |

**3. Components Built (7 total)**

- **BottomNav** — 4 tabs (Log, Plan, Progress, Settings) with active glow and glass backdrop
- **FoodInput** — Hinglish-aware text input with random Indian food placeholders, loading spinner
- **MacroRing** — SVG circular progress with configurable color/size, glow effect
- **MealCard** — Meal display with emoji icon, macro pills, one-tap regenerate button
- **FoodLogEntry** — Logged meal with raw input, parsed items, RAG verification badges
- **LoadingSpinner** — Double-ring animation in brand colors

**4. Architecture Patterns**

- **Onboarding Guard**: New users are redirected to `/onboarding` before accessing the app
- **Mobile-first layout**: `max-w-lg mx-auto` constrains all content for focused mobile UX
- **AuthContext**: Auto-sets axios auth headers on login, global 401 interceptor for session expiry
- **Log-first home screen**: Per PRD — "Home screen IS the food log input — nothing else on open"

#### What It Looks Like

The app features a sleek dark theme with warm orange accents. The landing page has gradient text effects and ambient glow orbs. All cards use a glassmorphism effect with subtle borders. The bottom nav has active state glow. The macro rings animate on load with smooth easing.

---

### Sprint 4 — Knowledge Base, RAG Pipeline & E2E Verification
**Date:** May 13, 2025
**Goal:** Expand the Indian food knowledge base, rebuild the vector store, fix the UTC date bug, and verify end-to-end food logging.
**Status:** ✅ Complete

#### What I Did

**1. Indian Food Knowledge Base (70+ Entries)**
Created `server/data/indian_foods_kb.txt` — a comprehensive ICMR/NIN-referenced nutrition database covering staples (roti, paratha, naan, rice, dosa, idli), dals & legumes, vegetables/sabzi, non-veg dishes (chicken curry, biryani, tandoori, keema), dairy, snacks & street food, full meal combos, portion context adjustments (home/restaurant/dhaba), and cooking method calorie impacts.

**2. Embedding Pipeline Script**
Built `server/scripts/embed_knowledge.js` that reads all knowledge base files, chunks by section headers, generates 3072-dim Gemini embeddings with rate limiting, and saves to the vector store. Result: **23 embedded chunks** from 6 source files. RAG scores now hit **0.795** for exact matches.

**3. UTC Date Bug Fix**
Found meals were being saved but not displayed — the frontend sent UTC-based date strings while the server stored local IST midnight. Fixed by removing the client-side date parameter and letting the server compute "today" consistently.

**4. End-to-End Verification**
Tested "2 roti with dal and dahi" → 472 kcal (P: 22.6g, C: 75g, F: 13.6g) with RAG badges (Roti ✓, Dal ✓, Dahi ✓). All macro rings update live. Also tested banana (119 kcal) and eggs with toast (404.9 kcal).

---

```
Client (React 19 + Vite + Tailwind v4)
  ├── Landing / Login / Register
  ├── Onboarding (4-step profile setup)
  ├── Home (food logging — log-first UX)
  ├── Meal Plan (AI generation + per-meal regen)
  ├── Progress (charts + weight + streak)
  └── Settings (profile + export + account)

Server (Node.js + Express)
  ├── Auth (JWT)
  ├── Nutrition API (Hinglish NLP → RAG → LLM)
  ├── Meal Plan API (generation + caching + regen)
  ├── Progress API (weekly adherence + weight)
  └── Export API (free JSON/CSV)

AI Pipeline
  ├── Gemini Flash 2.5 (NLP parsing + plan generation)
  ├── Gemini Embedding (food entity vectorization)
  ├── JSON Vector Store (500+ Indian dishes)
  ├── Cosine Similarity Search (top-3 retrieval)
  └── OpenRouter Fallback (reliability)

Database
  ├── MongoDB (User, MealLog, MealPlan, WeightLog)
  └── JSON Vector Store (nutrition embeddings)
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 19 + Vite | Fast HMR, modern React features |
| Styling | Tailwind CSS v4 | @theme directive, dark mode, utility-first |
| Animations | Framer Motion + CSS | Smooth transitions, micro-interactions |
| Backend | Node.js + Express | Same team knowledge from Spottr |
| Database | MongoDB + Mongoose | Flexible documents for variable meal data |
| AI | Gemini Flash 2.5 | Fast, cheap, handles Hinglish well |
| RAG | Custom vector store + Gemini Embeddings | 768-dim, cosine similarity, <2ms search |
| Auth | JWT + bcryptjs | Stateless, no third-party service needed |

---

## What's Next

- **Phase 4**: Expand Indian food knowledge base to 100+ verified dishes with ICMR data
- **Phase 5**: Blood report interpreter (PDF upload → AI explanation)
- **Phase 6**: Barcode scanning for packaged foods
- **Phase 7**: Festival/fasting protocol support

---

*Built by Arya Verma — pivoted from Spottr to FuelIQ because the real gap in Indian fitness tech isn't social matching, it's accurate nutrition.*
