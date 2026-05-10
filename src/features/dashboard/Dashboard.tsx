import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Leaderboard } from './Leaderboard';
import { QuizWidget } from '../quizzes/QuizWidget';
import { WarningsWidget } from './WarningsWidget';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { profile, logout } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-6xl space-y-6"
      >
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
        </header>

        {/* Placeholder for the real dashboard elements */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-sm text-muted-foreground">Total XP</h3>
            <p className="mt-2 text-3xl font-bold">{profile?.xp || 0}</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-sm text-muted-foreground">Current Streak</h3>
            <p className="mt-2 text-3xl font-bold text-orange-500">{profile?.streak || 0} 🔥</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-sm text-muted-foreground">Trust Score</h3>
            <p className="mt-2 text-3xl font-bold text-green-500">{profile?.trust_score || 50}</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-sm text-muted-foreground">Role</h3>
            <p className="mt-2 text-3xl font-bold capitalize">{profile?.role || 'Member'}</p>
          </div>
        </div>

        {/* Gamification Components */}
        <div className="grid gap-6 md:grid-cols-2">
          <Leaderboard />
          
          <div className="space-y-6 mt-6 md:mt-0">
             <QuizWidget />
             <WarningsWidget />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
