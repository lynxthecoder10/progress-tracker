import type { Hackathon, Profile, Resource, TaskItem, TrackerData, WarningEntry, WeeklyReport } from "../types";

export const demoProfiles: Profile[] = [
  {
    id: "member-1",
    name: "Tejas Naik",
    email: "tejas@example.com",
    role: "admin",
    skills: ["React", "Supabase", "Deployment", "AI IDE usage"],
    warning_count: 0,
    streak: 18,
    contribution_score: 94,
    learning_track: "Full-stack hackathon systems",
    github_url: "https://github.com/lynxthecoder10",
    portfolio_url: null,
    hours_learned: 64,
    tasks_completed: 21,
    projects_shipped: 4,
    bugs_solved: 36,
    apis_integrated: 7,
    github_commits: 148,
    attendance_rate: 96,
    team_help_score: 91
  },
  {
    id: "member-2",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    role: "lead",
    skills: ["Python", "APIs", "Debugging", "DSA"],
    warning_count: 1,
    streak: 11,
    contribution_score: 86,
    learning_track: "Backend and automation",
    github_url: "https://github.com/example",
    portfolio_url: null,
    hours_learned: 48,
    tasks_completed: 16,
    projects_shipped: 2,
    bugs_solved: 29,
    apis_integrated: 5,
    github_commits: 91,
    attendance_rate: 91,
    team_help_score: 88
  },
  {
    id: "member-3",
    name: "Maya Iyer",
    email: "maya@example.com",
    role: "member",
    skills: ["UI/UX", "React", "Pitching"],
    warning_count: 0,
    streak: 9,
    contribution_score: 81,
    learning_track: "Product design to frontend",
    github_url: null,
    portfolio_url: "https://example.com",
    hours_learned: 41,
    tasks_completed: 13,
    projects_shipped: 3,
    bugs_solved: 18,
    apis_integrated: 3,
    github_commits: 67,
    attendance_rate: 94,
    team_help_score: 83
  },
  {
    id: "member-4",
    name: "Rohan Das",
    email: "rohan@example.com",
    role: "member",
    skills: ["Java", "DSA", "Firebase"],
    warning_count: 2,
    streak: 3,
    contribution_score: 58,
    learning_track: "DSA and project shipping",
    github_url: null,
    portfolio_url: null,
    hours_learned: 24,
    tasks_completed: 7,
    projects_shipped: 1,
    bugs_solved: 9,
    apis_integrated: 1,
    github_commits: 28,
    attendance_rate: 76,
    team_help_score: 52
  }
];

export const demoReports: WeeklyReport[] = [
  {
    id: "report-1",
    user_id: "member-1",
    learned: "Supabase RLS, PWA install strategy, and Netlify deployment flow.",
    built: "Auth flow, dashboard metrics, and resource hub prototype.",
    blockers: "Need final Supabase project credentials before live integration.",
    next_goal: "Connect live database and invite first pilot members.",
    status: "approved",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: "report-2",
    user_id: "member-2",
    learned: "REST API structure and debugging network errors.",
    built: "Task API mock and leaderboard scoring formula.",
    blockers: "Needs clarity on admin review workflow.",
    next_goal: "Finish backend CRUD for task updates.",
    status: "submitted",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
  }
];

export const demoTasks: TaskItem[] = [
  {
    id: "task-1",
    title: "Submit weekly learning report",
    description: "Share learning, build output, blockers, and next-week goal before Sunday night.",
    assigned_to: "member-1",
    created_by: "member-1",
    status: "in_progress",
    task_type: "learning",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: "task-2",
    title: "Build Supabase CRUD challenge",
    description: "Create one table, add RLS, and ship a small CRUD screen with authenticated access.",
    assigned_to: "member-2",
    created_by: "member-1",
    status: "todo",
    task_type: "build",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: "task-3",
    title: "Prepare hackathon pitch script",
    description: "Write a 90-second pitch and list the top three demo moments.",
    assigned_to: "member-3",
    created_by: "member-1",
    status: "blocked",
    task_type: "hackathon",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString()
  }
];

export const demoResources: Resource[] = [
  {
    id: "resource-1",
    title: "Supabase RLS guide",
    category: "Backend",
    uploaded_by: "member-1",
    link: "https://supabase.com/docs/guides/database/postgres/row-level-security",
    tags: ["supabase", "security", "database"],
    upvotes: 14,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: "resource-2",
    title: "Hackathon demo checklist",
    category: "Ops",
    uploaded_by: "member-3",
    link: "https://example.com/demo-checklist",
    tags: ["pitch", "demo", "submission"],
    upvotes: 9,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString()
  }
];

export const demoHackathons: Hackathon[] = [
  {
    id: "hackathon-1",
    title: "Build From Zero Sprint",
    starts_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
    team_members: ["member-1", "member-2", "member-3"],
    roles_needed: ["Frontend", "Backend", "Pitching", "Deployment"],
    idea: "A community operating system for serious builders.",
    project_status: "Prototype ready, database wiring next.",
    submission_status: "building"
  }
];

export const demoWarnings: WarningEntry[] = [
  {
    id: "warning-1",
    user_id: "member-4",
    issued_by: "member-1",
    reason: "Missed two weekly check-ins without notice.",
    level: 2,
    resolved: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString()
  }
];

export const demoData: TrackerData = {
  profiles: demoProfiles,
  weeklyReports: demoReports,
  tasks: demoTasks,
  resources: demoResources,
  hackathons: demoHackathons,
  warnings: demoWarnings
};
