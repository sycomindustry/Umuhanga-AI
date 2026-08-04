# UMUHANGA AI
**Rwanda's Intelligent Learning and Discovery Platform**

Umuhanga AI is an AI-powered education ecosystem designed to help every student learn any subject, receive a personal AI tutor, and access world-class virtual scientific laboratories regardless of school resources.

## Core features
- AI Personal Teacher (text + voice) in **Kinyarwanda / English / French**
- Complete learning environment: lessons, quizzes, assignments, content library, progress tracking
- Virtual Laboratories: Chemistry, Biology, Physics (3D + interactive simulations)
- Dashboards: Student, Teacher, Parent, Admin
- Notifications, messaging, calendar, achievements, and analytics foundations

## Tech stack
- Frontend: Vite + React + TypeScript + Tailwind + shadcn/ui
- 3D/Simulations: Three.js via `@react-three/fiber` + `@react-three/drei`
- Backend: Supabase (Auth, Database, Edge Functions)
- AI: Supabase Edge Function `ai-tutor` (LLM via AI gateway)

## Run locally
1. Install dependencies
```bash
npm install
```

2. Start the dev server
```bash
npm run dev
```

Vite runs on port `8080` by default (see `vite.config.ts`).

## Supabase setup (required for auth + AI tutor)
This project expects environment variables in `.env` (already present in this repo):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Edge functions may require additional secrets in the Supabase project (for example `LOVABLE_API_KEY` for the current AI gateway integration).

## Branding
Brand constants live in `src/lib/brand.ts`. Update this file to change the product name/tagline across the UI.
