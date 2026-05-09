# ProgressTracker

Private gamified progress tracking for a hackathon/community team.

The MVP foundation covers authentication, member dashboard, weekly reports, ranking, leaderboard, XP/streaks, warnings, resources, skills, and task completion. It intentionally avoids broader hackathon/project-management features until the core accountability loop is stable.

## Stack

- React + Vite + TypeScript
- Tailwind CSS with shadcn-style local UI primitives
- Framer Motion
- Zustand
- Recharts
- React Hook Form + Zod
- Supabase Auth, PostgreSQL, Storage, Realtime
- vite-plugin-pwa
- Vercel

## Local Setup

```bash
npm install
npm run dev
```

Create `.env.local`:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_ENABLE_DEMO_DATA=true
```

`VITE_ENABLE_DEMO_DATA=true` enables local demo mode only during Vite development. Production expects real Supabase credentials.

## Supabase Setup

Run [supabase/migrations/001_initial_schema.sql](./supabase/migrations/001_initial_schema.sql) against the target Supabase project.

The migration creates:

- `public.users`
- `public.weekly_reports`
- `public.leaderboard_stats`
- `public.warnings`
- `public.resources`
- `public.skills`
- `public.tasks`
- private Storage bucket `resource-files`

RLS is enabled on every public table. App roles are stored in `public.users.role`, not client-editable metadata. New signups start as `member`; promote an admin directly in SQL after the first signup:

```sql
update public.users
set role = 'admin'
where email = 'admin@example.com';
```

## Architecture

```text
src/
  components/
    layout/        Shell, navigation, responsive sidebar
    ui/            Button, card, badge, field, progress primitives
  features/
    auth/          Email/password entry
    dashboard/     Member metrics, skills, tasks, chart
    leaderboard/   Priority ranking
    reports/       Weekly report form and list
    resources/     Link/file sharing
    tasks/         MVP task completion
    warnings/      Discipline ladder and admin warnings
  hooks/           Supabase auth and data orchestration
  lib/             Supabase client, scoring, validation, utilities
  store/           Zustand UI state
```

## Verification

```bash
npm run typecheck
npm run build
```

Vercel uses [vercel.json](./vercel.json) with `npm run build` and `dist` output.
