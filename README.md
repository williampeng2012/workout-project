# Pulsepath

Duolingo-style home fitness: short lessons on a path, habit check-ins, streaks, and XP.

## Quick start (local demo)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Start free**. Progress saves in `localStorage` until Supabase is connected.

## Stack

- Next.js (App Router) + React 19 + Tailwind 4 + TypeScript
- Supabase Auth / Postgres / RLS (optional until `.env.local` is set)
- Black & white high-contrast UI

## Supabase

1. Copy `.env.local.example` → `.env.local` and fill keys.
2. Run `npm run db:migrate` with `DATABASE_URL` set, or paste `supabase/migrations/*.sql` into the SQL editor.
3. Sign up / sign in; proxy will gate app routes when env is configured.

## App routes

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/onboarding` | Goal · days · habits |
| `/home` | Streak, XP, continue, habits |
| `/path` | Lesson path map |
| `/lesson/[id]` | Lesson player + settlement |
| `/checkin` | Habit check-ins |
| `/profile` | Level, streak rewards, reset |

## XP rules

- Lesson complete: +20 XP
- Habit check-in: +5 XP (daily cap 20)
- Streak milestones: 3 / 7 / 14 / 30 days → +15 / +40 / +80 / +200 XP
