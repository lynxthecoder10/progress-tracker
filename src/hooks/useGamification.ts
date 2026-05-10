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
    }
  }, [profile, setLocalStats]);

  // Award XP and optionally Contribution Points
  const awardPoints = async (amount: number, type: 'xp' | 'contribution' | 'both', reason: string) => {
    if (!user || !profile) return;
    
    const updates: any = {};
    if (type === 'xp' || type === 'both') {
      updates.xp = (profile.xp || 0) + amount;
    }
    if (type === 'contribution' || type === 'both') {
      updates.contribution_points = (profile.contribution_points || 0) + amount;
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

  return { awardPoints, awardXp };
}
