import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

// Gamification constants
export const XP_VALUES = {
  DAILY_REPORT: 50,
  WEEKLY_REPORT: 200,
  TASK_COMPLETED: 10,
  RESOURCE_SHARED: 15, // Also adds to contribution
  QUIZ_PERFECT: 100,
  QUIZ_PASS: 50,
  ENDORSEMENT: 25, // Pure contribution
};

export function useGamification() {
  const { user, profile, updateProfile } = useAuthStore();
  const { setLocalStats } = useAppStore();

  useEffect(() => {
    if (profile) {
      setLocalStats(profile.xp, profile.streak);
      // Auto-unlock Genesis badge if not already done
      unlockBadge('genesis');
      // Check for streak mastery
      if (profile.streak >= 7) unlockBadge('streak_master');
    }
  }, [profile, setLocalStats]);

  const unlockBadge = async (type: string) => {
    if (!user) return;
    
    // Check if already has it (ignore error if already exists due to UNIQUE constraint)
    const { error } = await supabase
      .from('user_badges')
      .insert({ user_id: user.id, badge_type: type });
      
    if (!error) {
      // Potentially show a toast or notification
      console.log(`Unlocked badge: ${type}`);
    }
  };

  // Award XP and optionally Contribution Points
  const awardPoints = async (amount: number, type: 'xp' | 'contribution' | 'both', reason: string) => {
    if (!user || !profile) return;
    
    const updates: any = {};
    if (type === 'xp' || type === 'both') {
      updates.xp = (profile.xp || 0) + amount;
      
      // Check for rank-based badges
      const newXp = updates.xp;
      if (newXp >= 1500) unlockBadge('climber');
      if (newXp >= 10000) unlockBadge('supreme');
    }
    if (type === 'contribution' || type === 'both') {
      updates.contribution_points = (profile.contribution_points || 0) + amount;
      if (updates.contribution_points >= 1) unlockBadge('contributor');
    }
    
    // Update local state first
    updateProfile(updates);
    
    // Update DB
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);
      
    if (error) {
      console.error('Failed to award points:', error);
      // Rollback
      const rollback: any = {};
      if (updates.xp) rollback.xp = profile.xp;
      if (updates.contribution_points) rollback.contribution_points = profile.contribution_points;
      updateProfile(rollback);
    }
  };

  // Legacy awardXp wrapper
  const awardXp = (amount: number, reason: string) => awardPoints(amount, 'xp', reason);

  return { awardPoints, awardXp, unlockBadge };
}
