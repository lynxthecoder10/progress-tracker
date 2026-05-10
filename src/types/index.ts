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

export const getRankTitle = (xp: number) => {
  if (xp >= 10000) return 'Supremacy';
  if (xp >= 5000) return 'Elite';
  if (xp >= 3000) return 'Veteran';
  if (xp >= 1500) return 'Climber';
  if (xp >= 500) return 'Grinder';
  return 'Struggler';
};

export const getRankColor = (xp: number) => {
  if (xp >= 10000) return 'text-yellow-500';
  if (xp >= 5000) return 'text-purple-500';
  if (xp >= 3000) return 'text-blue-500';
  if (xp >= 1500) return 'text-green-500';
  if (xp >= 500) return 'text-orange-500';
  return 'text-gray-500';
};
