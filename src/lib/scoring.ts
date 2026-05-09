import type { LeaderboardStat, UserProfile, WarningEntry } from "../types";

export type RankedMember = {
  user: UserProfile;
  stats: LeaderboardStat;
  score: number;
  rank: number;
  priority: "Highest Priority" | "High Priority" | "Medium Priority" | "Lowest Priority";
  discipline: "Clear" | "Warning 1" | "Warning 2" | "Removal candidate";
};

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function emptyStatsFor(userId: string): LeaderboardStat {
  return {
    id: `local-${userId}`,
    user_id: userId,
    xp: 0,
    level: 1,
    current_streak: 0,
    longest_streak: 0,
    consistency_score: 0,
    contribution_score: 0,
    weekly_reports_count: 0,
    tasks_completed: 0,
    resources_shared: 0,
    growth_rate: 0,
    activity_score: 0,
    badges: [],
    updated_at: new Date().toISOString()
  };
}

export function getDisciplineStatus(warnings: WarningEntry[], user: UserProfile): RankedMember["discipline"] {
  const activeMax = warnings
    .filter((warning) => warning.user_id === user.id && !warning.resolved)
    .reduce((max, warning) => Math.max(max, warning.level), user.warning_count);

  if (activeMax >= 3) return "Removal candidate";
  if (activeMax === 2) return "Warning 2";
  if (activeMax === 1) return "Warning 1";
  return "Clear";
}

export function getPriority(score: number): RankedMember["priority"] {
  if (score >= 85) return "Highest Priority";
  if (score >= 70) return "High Priority";
  if (score >= 55) return "Medium Priority";
  return "Lowest Priority";
}

export function calculateRankingScore(stats: LeaderboardStat, discipline: RankedMember["discipline"]) {
  const warningPenalty = discipline === "Removal candidate" ? 28 : discipline === "Warning 2" ? 16 : discipline === "Warning 1" ? 8 : 0;

  return clampScore(
    stats.consistency_score * 0.22 +
      stats.contribution_score * 0.2 +
      Math.min(stats.weekly_reports_count * 12, 100) * 0.16 +
      Math.min(stats.tasks_completed * 10, 100) * 0.14 +
      Math.min(stats.resources_shared * 18, 100) * 0.1 +
      stats.growth_rate * 0.1 +
      stats.activity_score * 0.08 -
      warningPenalty
  );
}

export function rankMembers(users: UserProfile[], stats: LeaderboardStat[], warnings: WarningEntry[]): RankedMember[] {
  return users
    .map((user) => {
      const memberStats = stats.find((item) => item.user_id === user.id) ?? emptyStatsFor(user.id);
      const discipline = getDisciplineStatus(warnings, user);
      const score = calculateRankingScore(memberStats, discipline);

      return {
        user,
        stats: memberStats,
        score,
        rank: 0,
        priority: getPriority(score),
        discipline
      };
    })
    .sort((a, b) => b.score - a.score || b.stats.xp - a.stats.xp)
    .map((member, index) => ({ ...member, rank: index + 1 }));
}
