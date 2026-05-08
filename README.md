# Hackathon Team Progress Tracker — Product Blueprint

## Vision

A web app/PWA to track consistency, learning progress, contribution, and performance of members in a hackathon community.

> **Core philosophy:** “Consistency over talent. Execution over excuses.”

The platform is designed to:

- Track member growth
- Maintain discipline
- Encourage accountability
- Organize hackathon preparation
- Identify serious contributors
- Create a high-performance learning environment

---

## Recommended Tech Stack

### Frontend

- React + Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion

### Backend

- Supabase
  - Authentication
  - PostgreSQL database
  - Realtime
  - Storage

### PWA Support

- Vite PWA Plugin
- Offline support
- Mobile install support
- Push notifications

### Optional AI Integration

- OpenAI API
- Gemini API
- Claude API

---

## Core Features

### 1) Member Dashboard

Each member has:

- Profile
- Skills
- Current learning track
- Weekly progress
- Contribution score
- Attendance
- Task completion rate
- Hackathon participation history
- GitHub links
- Project portfolio

**Metrics tracked:**

- Daily consistency streak
- Hours learned
- Tasks completed
- Projects shipped
- Bugs solved
- APIs integrated
- GitHub commits
- Team contribution score

### 2) Weekly Check-In System

Members submit:

- What they learned
- What they built
- Problems faced
- Goals for next week

Admin controls:

- Approve reports
- Mark inactivity
- Add warnings
- Rank members

### 3) Warning & Discipline System

Automated tracking for:

- Missed reports
- Inactivity
- Low contribution
- Missed meetings

Warning flow:

1. Warning 1
2. Warning 2
3. Removal candidate

Admin actions:

- Reset warnings
- Add notes
- Temporarily mute members

### 4) Skill Matrix

Track skill levels in:

- Java
- Python
- React
- Node.js
- Firebase
- Supabase
- APIs
- AI IDE usage
- Debugging
- UI/UX
- DSA
- Deployment

Levels:

- Beginner
- Intermediate
- Advanced
- Production Ready

### 5) Leaderboard System

Ranking criteria:

- Consistency
- Contribution
- Learning progress
- Team help
- Hackathon participation
- Task completion

Leaderboard modes:

- Weekly
- Monthly
- All-time

### 6) Resource Sharing Hub

Members can upload/share:

- PDFs
- Notes
- API references
- YouTube links
- GitHub repositories
- Courses
- Prompt templates
- AI workflows

Features:

- Upvotes
- Tags
- Search
- Bookmarking

### 7) Task Management System

Admins can assign:

- Learning tasks
- Build tasks
- Team tasks
- Hackathon preparation tasks

Example tasks:

- Build authentication page
- Learn Supabase CRUD
- Create REST API
- Solve debugging challenge

### 8) Hackathon Management

Track:

- Upcoming hackathons
- Team formation
- Roles
- Ideas
- Deadlines
- Submission status

Typical roles:

- Frontend
- Backend
- AI/ML
- UI/UX
- Pitching
- Deployment

### 9) AI Evaluation System (Advanced)

AI-assisted analysis of:

- Weekly reports
- GitHub commits
- Code quality
- Productivity patterns

Generates:

- Performance summaries
- Improvement suggestions
- Ranking insights

---

## User Roles

### Founder/Admin

- Add/remove members
- Issue warnings
- Create tasks
- View analytics
- Manage hackathons

### Team Lead

- Review progress
- Assign tasks
- Manage smaller teams

### Member

- Submit reports
- Track learning
- Upload resources
- Participate in hackathons

---

## Suggested Database Schema

### `users`

- `id`
- `name`
- `email`
- `role`
- `skills`
- `warning_count`
- `streak`
- `contribution_score`

### `weekly_reports`

- `user_id`
- `learned`
- `built`
- `blockers`
- `next_goal`
- `submitted_at`

### `tasks`

- `title`
- `description`
- `assigned_to`
- `status`
- `deadline`

### `resources`

- `title`
- `category`
- `uploaded_by`
- `link`

### `hackathons`

- `title`
- `date`
- `team_members`
- `project_status`

---

## UI Pages

### Public

- Landing page
- About team
- Apply to join

### Internal

- Dashboard
- Leaderboard
- Weekly reports
- Member analytics
- Resource hub
- Task board
- Hackathon page
- Admin panel

---

## Advanced Add-ons

### Gamification

- XP points
- Levels
- Badges
- Streak rewards

### GitHub Integration

Automatically track:

- Commits
- Repositories
- Pull requests

### Discord/WhatsApp Integration

- Reminder notifications
- Weekly check-in alerts
- Meeting reminders

### AI Assistant

Members can:

- Ask coding questions
- Generate project ideas
- Debug errors
- Get roadmap suggestions

---

## MVP Plan (Phase 1)

Start with:

- Authentication
- Dashboard
- Weekly reports
- Warning system
- Leaderboard
- Resource sharing

This scope is enough for real usage and validation.

---

## Future Expansion

Potential evolution:

- Full developer community platform
- Hackathon startup incubator
- AI-powered learning ecosystem
- Recruitment and team-building platform
- College innovation network

---

## Name Ideas

- NullForge
- 0x1
- BuildFromZero
- RiseStack
- SyncForge
- HackCore
- NovaTrack
- TeamOS
- BuilderGrid
- GrowthProtocol

---

## Final Recommendation

Build this as a **PWA-first product**.

Why:

- Works on mobile and desktop
- Installable like a native app
- Lower cost than native development
- Faster iteration cycle
- Easier long-term maintenance

A React + Supabase + PWA architecture is practical, scalable, and strong for hackathon teams.

This project can become:

- A flagship portfolio project
- A hackathon-winning product
- A startup foundation
- Your team’s operating system

---

## Implementation Notes

This repository now includes the Phase 1 MVP scaffold:

- React + Vite + TypeScript app shell
- Tailwind CSS styling
- Supabase client with persistent sessions
- Demo workspace fallback
- Dashboard, weekly reports, leaderboard, resources, tasks, hackathon, and admin screens
- Supabase SQL setup with RLS and a private `member-resources` storage bucket
- Netlify static deployment config

### Local Development

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_ENABLE_DEMO_DATA=true
```

### Supabase Setup

Apply `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor or convert it into a timestamped Supabase CLI migration. Enable email/password auth in the Supabase dashboard before inviting members.

### Netlify Deploy

Netlify uses:

```toml
[build]
command = "npm run build"
publish = "dist"
```

Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_ENABLE_DEMO_DATA` in Netlify environment variables.
