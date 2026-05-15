# FuelIQ 🔥

![CI](https://github.com/YOUR_USERNAME/fueliq/actions/workflows/ci.yml/badge.svg)

**India's First Culturally-Aware AI Nutrition Coach**

FuelIQ gives Indian gym-goers accurate nutrition tracking for the food they actually eat — no social noise, no paywall surprises, no salmon-and-quinoa meal plans.

## The Problem

MyFitnessPal has 14 million foods, yet "aloo paratha homemade" returns 4 conflicting entries with calorie counts ranging from 150 to 400 kcal. Indian home-cooked meals are either absent or wildly inaccurate. FuelIQ fixes this with ICMR/NIN-verified data and a RAG-powered AI that actually understands Indian food.

## Features

- 🗣️ **Hinglish Food Logging** — Type "2 roti with dal and dahi" naturally
- 🧠 **Indian Nutrition RAG Engine** — 500+ verified dishes with ICMR/NIN source data
- 🍽️ **AI Meal Plan Generation** — Personalized plans based on goal, cuisine, and budget
- 🔄 **Per-Meal Regeneration** — Swap one meal with ±50 kcal / ±5g protein constraint
- 📊 **Progress Tracking** — Weekly macro adherence, weight trend, streak counter
- 📥 **Free Data Export** — JSON + CSV, no paywall, your data is yours
- 🚫 **Zero Social Features** — No leaderboards, no followers, no engagement bait

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express, MongoDB, Mongoose |
| AI/ML | Gemini Flash 2.5, Gemini Embeddings, Custom RAG Pipeline |
| Auth | JWT + bcryptjs |

## Getting Started

```bash
# Clone
git clone <repo-url>
cd fueliq

# Quick Start (Docker)
docker-compose up --build
# Then visit http://localhost

# Run Tests
cd server
npm test
```

Open `http://localhost` (or `http://localhost:3000` for local dev)

## Environment Variables

### Server (`server/.env`)
```
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_key
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # MacroRing, FoodInput, MealCard, BottomNav, etc.
│   │   ├── context/        # AuthContext
│   │   ├── layouts/        # MainLayout (mobile-first)
│   │   └── pages/          # Landing, Login, Register, Onboarding, Home, MealPlan, Progress, Settings
│   └── index.html
├── server/                 # Node.js backend
│   ├── config/             # Database connection
│   ├── controllers/        # Auth, AI, User, Progress, Export
│   ├── middleware/          # JWT auth, error handling
│   ├── models/             # User, MealLog, MealPlan, WeightLog
│   ├── routes/             # Auth, Users, Nutrition, MealPlan, Progress, Export
│   └── utils/              # Vector store, embeddings, token generation
└── PROGRESS.md             # Sprint-by-sprint development log
```

## License

Private — Not for redistribution.
