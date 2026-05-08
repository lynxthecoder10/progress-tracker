import type { LeaderboardStat, Resource, Skill, TaskItem, TrackerData, UserProfile, WarningEntry, WeeklyReport } from "../types";
import { getWeekStart } from "./utils";

const now = Date.now();
const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (days: number) => new Date(now + days * 24 * 60 * 60 * 1000).toISOString();

export const demoUsers: UserProfile[] = [
  {
    id: "demo-admin",
    display_name: "Tejas Naik",
    email: "tejas@example.com",
    role: "admin",
    learning_track: "Full-stack hackathon systems",
    avatar_url: null,
    github_url: "https://github.com/lynxthecoder10",
    warning_count: 0,
    responsibility_level: "Core organizer",
    joined_at: daysAgo(62),
    updated_at: daysAgo(1)
  },
  {
    id: "demo-member-1",
    display_name: "Aarav Sharma",
    email: "aarav@example.com",
    role: "member",
    learning_track: "Backend fundamentals",
    avatar_url: null,
    github_url: null,
    warning_count: 1,
    responsibility_level: "Feature contributor",
    joined_at: daysAgo(44),
    updated_at: daysAgo(2)
  },
  {
    id: "demo-member-2",
    display_name: "Maya Iyer",
    email: "maya@example.com",
    role: "member",
    learning_track: "Frontend and UI systems",
    avatar_url: null,
    github_url: null,
    warning_count: 0,
    responsibility_level: "Project contributor",
    joined_at: daysAgo(38),
    updated_at: daysAgo(1)
  },
  {
    id: "demo-member-3",
    display_name: "Rohan Das",
    email: "rohan@example.com",
    role: "member",
    learning_track: "DSA and debugging",
    avatar_url: null,
    github_url: null,
    warning_count: 2,
    responsibility_level: "Needs consistency",
    joined_at: daysAgo(27),
    updated_at: daysAgo(6)
  }
];

export const demoLeaderboardStats: LeaderboardStat[] = [
  {
    id: "stat-admin",
    user_id: "demo-admin",
    xp: 4280,
    level: 9,
    current_streak: 19,
    longest_streak: 24,
    consistency_score: 96,
    contribution_score: 92,
    weekly_reports_count: 8,
    tasks_completed: 23,
    resources_shared: 9,
    growth_rate: 88,
    activity_score: 94,
    badges: ["Streak Builder", "Resource Mentor", "Sprint Lead"],
    updated_at: daysAgo(1)
  },
  {
    id: "stat-member-1",
    user_id: "demo-member-1",
    xp: 2710,
    level: 6,
    current_streak: 10,
    longest_streak: 12,
    consistency_score: 78,
    contribution_score: 83,
    weekly_reports_count: 6,
    tasks_completed: 15,
    resources_shared: 3,
    growth_rate: 82,
    activity_score: 79,
    badges: ["API Finisher", "Helper"],
    updated_at: daysAgo(2)
  },
  {
    id: "stat-member-2",
    user_id: "demo-member-2",
    xp: 3180,
    level: 7,
    current_streak: 14,
    longest_streak: 14,
    consistency_score: 90,
    contribution_score: 78,
    weekly_reports_count: 7,
    tasks_completed: 17,
    resources_shared: 4,
    growth_rate: 86,
    activity_score: 84,
    badges: ["UI Shipper", "Report Streak"],
    updated_at: daysAgo(1)
  },
  {
    id: "stat-member-3",
    user_id: "demo-member-3",
    xp: 1160,
    level: 3,
    current_streak: 2,
    longest_streak: 5,
    consistency_score: 42,
    contribution_score: 55,
    weekly_reports_count: 3,
    tasks_completed: 7,
    resources_shared: 1,
    growth_rate: 54,
    activity_score: 46,
    badges: ["Comeback Week"],
    updated_at: daysAgo(6)
  }
];

export const demoReports: WeeklyReport[] = [
  {
    id: "report-1",
    user_id: "demo-admin",
    week_start: getWeekStart(daysAgo(3) ? new Date(daysAgo(3)) : undefined),
    learned: "Tightened Supabase RLS patterns and PWA install behavior.",
    shipped: "Initial dashboard, scoring model, and resource hub architecture.",
    blockers: "Waiting on live Supabase credentials.",
    next_week_goal: "Invite pilot members and test real weekly report submissions.",
    hours_spent: 14,
    status: "approved",
    submitted_at: daysAgo(2),
    reviewed_at: daysAgo(1),
    reviewed_by: "demo-admin"
  },
  {
    id: "report-2",
    user_id: "demo-member-2",
    week_start: getWeekStart(new Date(daysAgo(4))),
    learned: "Reusable React components and dark dashboard spacing.",
    shipped: "Mobile member-card concept and task checklist.",
    blockers: "Needs review on form validation patterns.",
    next_week_goal: "Finish authenticated resource upload flow.",
    hours_spent: 9,
    status: "submitted",
    submitted_at: daysAgo(1),
    reviewed_at: null,
    reviewed_by: null
  }
];

export const demoWarnings: WarningEntry[] = [
  {
    id: "warning-1",
    user_id: "demo-member-1",
    issued_by: "demo-admin",
    level: 1,
    reason: "Missed a weekly report and did not notify the team.",
    resolved: false,
    created_at: daysAgo(8),
    resolved_at: null
  },
  {
    id: "warning-2",
    user_id: "demo-member-3",
    issued_by: "demo-admin",
    level: 2,
    reason: "Repeated inactivity across tasks and check-ins.",
    resolved: false,
    created_at: daysAgo(4),
    resolved_at: null
  }
];

export const demoResources: Resource[] = [
  {
    id: "resource-1",
    title: "Supabase RLS mental model",
    description: "Short guide for writing authenticated policies without trusting client state.",
    category: "database",
    url: "https://supabase.com/docs/guides/database/postgres/row-level-security",
    storage_path: null,
    tags: ["supabase", "rls", "security"],
    uploaded_by: "demo-admin",
    created_at: daysAgo(5)
  },
  {
    id: "resource-2",
    title: "Hackathon demo checklist",
    description: "A practical checklist for the final 24 hours before a submission.",
    category: "hackathon",
    url: "https://example.com/hackathon-demo-checklist",
    storage_path: null,
    tags: ["demo", "pitch", "submission"],
    uploaded_by: "demo-member-2",
    created_at: daysAgo(3)
  }
];

export const demoSkills: Skill[] = [
  { id: "skill-1", user_id: "demo-admin", name: "Supabase", level: "advanced", focus_area: "RLS and auth", updated_at: daysAgo(1) },
  { id: "skill-2", user_id: "demo-admin", name: "React", level: "production_ready", focus_area: "PWA architecture", updated_at: daysAgo(1) },
  { id: "skill-3", user_id: "demo-member-2", name: "UI/UX", level: "advanced", focus_area: "Dashboards", updated_at: daysAgo(2) },
  { id: "skill-4", user_id: "demo-member-1", name: "APIs", level: "intermediate", focus_area: "CRUD flows", updated_at: daysAgo(3) }
];

export const demoTasks: TaskItem[] = [
  {
    id: "task-1",
    title: "Submit this week's progress report",
    description: "Summarize learning, shipped output, blockers, and next goal.",
    assigned_to: "demo-admin",
    created_by: "demo-admin",
    status: "in_progress",
    priority: "high",
    due_at: daysFromNow(2),
    completed_at: null,
    created_at: daysAgo(3),
    updated_at: daysAgo(1)
  },
  {
    id: "task-2",
    title: "Finish Supabase CRUD drill",
    description: "Build one authenticated CRUD flow with RLS-backed access.",
    assigned_to: "demo-member-1",
    created_by: "demo-admin",
    status: "todo",
    priority: "medium",
    due_at: daysFromNow(5),
    completed_at: null,
    created_at: daysAgo(2),
    updated_at: daysAgo(2)
  },
  {
    id: "task-3",
    title: "Polish mobile report form",
    description: "Make the form comfortable on small screens and validate field errors.",
    assigned_to: "demo-member-2",
    created_by: "demo-admin",
    status: "done",
    priority: "medium",
    due_at: daysAgo(1),
    completed_at: daysAgo(1),
    created_at: daysAgo(6),
    updated_at: daysAgo(1)
  }
];

export const demoData: TrackerData = {
  users: demoUsers,
  weeklyReports: demoReports,
  leaderboardStats: demoLeaderboardStats,
  warnings: demoWarnings,
  resources: demoResources,
  skills: demoSkills,
  tasks: demoTasks
};
