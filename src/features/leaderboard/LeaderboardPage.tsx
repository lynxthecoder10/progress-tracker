import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import { Trophy, Medal, Flame, TrendingUp, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface LeaderboardEntry {
  user_id: string;
  email: string;
  role: string;
  xp: number;
  streak: number;
  trust_score: number;
  ranking_score: number;
  consistency_score: number;
}

export const LeaderboardPage: React.FC = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leaderboard_metrics')
      .select(`
        user_id,
        ranking_score,
        consistency_score,
        users!inner(email, role, xp, streak, trust_score)
      `)
      .order('ranking_score', { ascending: false });

    if (!error && data) {
      setLeaders(data.map((row: any) => ({
        user_id: row.user_id,
        email: row.users.email,
        role: row.users.role,
        xp: row.users.xp,
        streak: row.users.streak,
        trust_score: row.users.trust_score,
        ranking_score: row.ranking_score,
        consistency_score: row.consistency_score,
      })));
    }
    setLoading(false);
  };

  const getRankStyles = (index: number) => {
    switch (index) {
      case 0: return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-500', medal: <Trophy size={28} className="text-yellow-500" /> };
      case 1: return { bg: 'bg-slate-300/10', border: 'border-slate-300/50', text: 'text-slate-300', medal: <Medal size={28} className="text-slate-300" /> };
      case 2: return { bg: 'bg-amber-600/10', border: 'border-amber-600/50', text: 'text-amber-600', medal: <Medal size={28} className="text-amber-600" /> };
      default: return { bg: 'bg-white/2', border: 'border-white/5', text: 'text-gray-500', medal: null };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Back to Forge</span>
      </Link>

      <div className="flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
          <Trophy className="text-yellow-500" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Global Leaderboard</h1>
          <p className="text-gray-400">The most consistent and active members of the forge.</p>
        </div>
      </div>

      <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaders.map((leader, index) => {
                const styles = getRankStyles(index);
                return (
                  <motion.div 
                    key={leader.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex flex-col md:flex-row md:items-center justify-between p-6 transition-all hover:bg-white/[0.03] group gap-4 ${index < 3 ? styles.bg : ''}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative flex items-center justify-center w-12 shrink-0">
                        {styles.medal ? (
                          <div className="animate-bounce-subtle">{styles.medal}</div>
                        ) : (
                          <span className="text-2xl font-black text-gray-600">#{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border ${index < 3 ? styles.border : 'border-white/10'} flex items-center justify-center text-2xl font-bold text-white shadow-inner`}>
                          {leader.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-bold text-lg group-hover:text-white transition-colors ${index < 3 ? 'text-white' : 'text-gray-200'}`}>
                              {leader.email.split('@')[0]}
                            </p>
                            {leader.streak > 5 && <Flame size={16} className="text-orange-500" />}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">{leader.role}</span>
                            <span className="flex items-center gap-1 text-xs font-medium text-orange-400">
                              <Flame size={12} /> {leader.streak} Day Streak
                            </span>
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                              <Shield size={12} /> {leader.trust_score} Trust
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-left md:text-right pl-24 md:pl-0">
                      <div className="flex items-center md:justify-end gap-1.5 text-amber-400 font-black text-2xl">
                        <TrendingUp size={18} className="text-amber-500/60" />
                        {leader.ranking_score}<span className="text-xs font-bold ml-1 opacity-50">pts</span>
                      </div>
                      <div className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">
                        {leader.xp.toLocaleString()} Raw XP
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {leaders.length === 0 && (
                <div className="p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="text-gray-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300">No competitors yet</h3>
                  <p className="text-gray-500 text-sm">Be the first to climb the leaderboard!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
