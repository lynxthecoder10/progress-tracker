export type Role = 'admin' | 'member' | 'pending';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  xp: number;
  streak: number;
  trust_score: number;
  contribution_points: number;
  github_username: string | null;
  created_at: string;
}

export interface LeaderboardMetrics {
  user_id: string;
  consistency_score: number;
  contribution_score: number;
  ranking_score: number;
  updated_at: string;
}
