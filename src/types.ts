export type AppRole = "admin" | "member";
export type ReportStatus = "submitted" | "approved" | "needs_work";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "production_ready";
export type WarningLevel = 1 | 2 | 3;
export type ResourceCategory = "fundamentals" | "frontend" | "backend" | "database" | "design" | "hackathon" | "tooling";
export type ViewId = "dashboard" | "reports" | "leaderboard" | "warnings" | "resources" | "tasks";

export type UserProfile = {
  id: string;
  display_name: string;
  email: string;
  role: AppRole;
  learning_track: string;
  avatar_url: string | null;
  github_url: string | null;
  warning_count: number;
  responsibility_level: string;
  joined_at: string;
  updated_at: string;
};

export type WeeklyReport = {
  id: string;
  user_id: string;
  week_start: string;
  learned: string;
  shipped: string;
  blockers: string;
  next_week_goal: string;
  hours_spent: number;
  status: ReportStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type LeaderboardStat = {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  consistency_score: number;
  contribution_score: number;
  weekly_reports_count: number;
  tasks_completed: number;
  resources_shared: number;
  growth_rate: number;
  activity_score: number;
  badges: string[];
  updated_at: string;
};

export type WarningEntry = {
  id: string;
  user_id: string;
  issued_by: string | null;
  level: WarningLevel;
  reason: string;
  resolved: boolean;
  created_at: string;
  resolved_at: string | null;
};

export type Resource = {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  url: string | null;
  storage_path: string | null;
  tags: string[];
  uploaded_by: string;
  created_at: string;
};

export type Skill = {
  id: string;
  user_id: string;
  name: string;
  level: SkillLevel;
  focus_area: string;
  updated_at: string;
};

export type TaskItem = {
  id: string;
  title: string;
  description: string;
  assigned_to: string | null;
  created_by: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TrackerData = {
  users: UserProfile[];
  weeklyReports: WeeklyReport[];
  leaderboardStats: LeaderboardStat[];
  warnings: WarningEntry[];
  resources: Resource[];
  skills: Skill[];
  tasks: TaskItem[];
};
