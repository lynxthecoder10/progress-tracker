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
  if (xp >= 10000) return 'text-amber-400 font-black drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]';
  if (xp >= 5000) return 'text-orange-400 font-bold';
  if (xp >= 3000) return 'text-yellow-500 font-bold';
  if (xp >= 1500) return 'text-amber-600';
  if (xp >= 500) return 'text-orange-600';
  return 'text-gray-400';
};
export interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  unlocked_at: string;
}

export interface Achievement {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    type: 'genesis',
    name: 'Genesis',
    description: 'Began the journey at RankForge',
    icon: 'Hammer',
    color: 'from-gray-400 to-gray-600',
    requirement: 'Account Created'
  },
  {
    type: 'quiz_novice',
    name: 'Quiz Novice',
    description: 'Completed the first mental challenge',
    icon: 'Zap',
    color: 'from-amber-400 to-orange-500',
    requirement: '1 Quiz Passed'
  },
  {
    type: 'quiz_whiz',
    name: 'Quiz Whiz',
    description: 'A mind sharpened by knowledge',
    icon: 'Brain',
    color: 'from-purple-400 to-pink-500',
    requirement: '5 Quizzes Passed'
  },
  {
    type: 'streak_master',
    name: 'Streak Master',
    description: 'Unyielding consistency',
    icon: 'Flame',
    color: 'from-orange-500 to-red-600',
    requirement: '7 Day Streak'
  },
  {
    type: 'contributor',
    name: 'Contributor',
    description: 'Strengthening the forge for others',
    icon: 'Heart',
    color: 'from-blue-400 to-indigo-600',
    requirement: 'Shared a Resource'
  },
  {
    type: 'climber',
    name: 'Climber',
    description: 'Rising above the struggles',
    icon: 'TrendingUp',
    color: 'from-emerald-400 to-teal-600',
    requirement: 'Reached Climber Rank'
  },
  {
    type: 'supreme',
    name: 'Supremacy',
    description: 'Forged in perfection',
    icon: 'Crown',
    color: 'from-yellow-400 via-amber-500 to-yellow-600',
    requirement: 'Reached Supremacy Rank'
  }
];
