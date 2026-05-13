import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGamification } from '../../hooks/useGamification';

export const MonthlyReportForm: React.FC = () => {
  const { user } = useAuthStore();
  const { awardXp } = useGamification();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [summary, setSummary] = useState('');
  const [keyAchievements, setKeyAchievements] = useState('');
  const [blockers, setBlockers] = useState('');

  const calculateQualityScore = (summaryText: string, achievementsText: string) => {
    // Basic automatic quality heuristic
    let score = 0;
    if (summaryText.length > 200) score += 20;
    if (summaryText.length > 500) score += 30;
    if (achievementsText.split(',').length > 2) score += 20;
    if (blockers.length > 100) score += 30;
    return Math.min(score, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    // Get start of current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const qualityScore = calculateQualityScore(summary, keyAchievements);

    const { error } = await supabase.from('monthly_reports').insert({
      user_id: user.id,
      summary,
      key_achievements: keyAchievements.split(',').map(s => s.trim()).filter(Boolean),
      blockers,
      month_start: monthStart,
      quality_score: qualityScore
    });

    setLoading(false);

    if (!error) {
      setSuccess(true);
      // Award massive XP for monthly report
      awardXp(200, 'Monthly Report');
    } else if (error.code === '23505') { // Unique violation
      alert('You have already submitted a report for this month.');
    } else {
      alert('Failed to submit report. Please try again.');
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4"
      >
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-white">Monthly Report Submitted!</h3>
        <p className="text-emerald-100/60 max-w-sm mx-auto">
          Incredible work this month. Your report has been published to the Community Feed. +200 XP!
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-300">Monthly Summary</label>
          <p className="text-xs text-gray-500">Reflect on your overall progress and journey this past month.</p>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            rows={4}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-300">Key Achievements (comma separated)</label>
          <input
            type="text"
            value={keyAchievements}
            onChange={(e) => setKeyAchievements(e.target.value)}
            required
            placeholder="Finished Project X, Learned Next.js, Got 1000 XP"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-300">Major Blockers & How You Overcame Them</label>
          <textarea
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            required
            rows={3}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full py-4 flex items-center justify-center gap-2">
        {loading ? 'Publishing...' : 'Publish Monthly Report'} <Send size={18} />
      </Button>
    </form>
  );
};
