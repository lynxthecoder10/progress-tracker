export type Role = "admin" | "lead" | "member";
export type ReportStatus = "submitted" | "approved" | "needs_work";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskType = "learning" | "build" | "team" | "hackathon";
export type SubmissionStatus = "idea" | "building" | "submitted" | "shipped";

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  skills: string[];
  warning_count: number;
  streak: number;
  contribution_score: number;
  learning_track: string;
  github_url: string | null;
  portfolio_url: string | null;
  hours_learned: number;
  tasks_completed: number;
  projects_shipped: number;
  bugs_solved: number;
  apis_integrated: number;
  github_commits: number;
  attendance_rate: number;
  team_help_score: number;
  created_at?: string;
  updated_at?: string;
};

export type WeeklyReport = {
  id: string;
  user_id: string;
  learned: string;
  built: string;
  blockers: string;
  next_goal: string;
  status: ReportStatus;
  submitted_at: string;
};

export type TaskItem = {
  id: string;
  title: string;
  description: string;
  assigned_to: string | null;
  created_by: string | null;
  status: TaskStatus;
  task_type: TaskType;
  deadline: string;
  created_at?: string;
};

export type Resource = {
  id: string;
  title: string;
  category: string;
  uploaded_by: string;
  link: string;
  tags: string[];
  upvotes: number;
  created_at: string;
};

export type Hackathon = {
  id: string;
  title: string;
  starts_at: string;
  deadline: string;
  team_members: string[];
  roles_needed: string[];
  idea: string;
  project_status: string;
  submission_status: SubmissionStatus;
  created_at?: string;
};

export type WarningEntry = {
  id: string;
  user_id: string;
  issued_by: string | null;
  reason: string;
  level: 1 | 2 | 3;
  resolved: boolean;
  created_at: string;
};

export type TrackerData = {
  profiles: Profile[];
  weeklyReports: WeeklyReport[];
  tasks: TaskItem[];
  resources: Resource[];
  hackathons: Hackathon[];
  warnings: WarningEntry[];
};
