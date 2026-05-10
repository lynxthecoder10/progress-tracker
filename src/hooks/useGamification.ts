import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

// Gamification constants
export const XP_VALUES = {
  DAILY_REPORT: 50,
  WEEKLY_REPORT: 200,
  TASK_COMPLETED: 10,
  RESOURCE_SHARED: 15,
  QUIZ_PERFECT: 100,
  QUIZ_PASS: 50,
};

export function useGamification() {
  const { user, profile, updateProfile } = useAuthStore();
  const { setLocalStats } = useAppStore();

  useEffect(() => {
    if (profile) {
      setLocalStats(profile.xp, profile.streak);
    }
  }, [profile, setLocalStats]);

  // Award XP for an action
  const awardXp = async (amount: number, reason: string) => {
    if (!user || !profile) return;
    
    const newXp = profile.xp + amount;
    
    // Update local state first for instant feedback
    updateProfile({ xp: newXp });
    
    // Update DB
    const { error } = await supabase
      .from('users')
      .update({ xp: newXp })
      .eq('id', user.id);
      
    if (error) {
      console.error('Failed to award XP:', error);
      // Rollback on error
      updateProfile({ xp: profile.xp });
    }
  };

  return { awardXp };
}
