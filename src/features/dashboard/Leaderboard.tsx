import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import { Trophy, Medal, Flame, Shield, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  user_id: string;
  email: string;
  role: string;
  xp: number;
  streak: number;
  trust_score: number;
  ranking_score: number;
  consistency_score: number;
  avatar_url: string | null;
  last_rank: number | null;
  current_rank: number | null;
  username: string | null;
}

export const Leaderboard: React.FC = () => {
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
        last_rank,
        current_rank,
        users!inner(email, role, xp, streak, trust_score, avatar_url, username)
      `)
      .order('ranking_score', { ascending: false })
      .limit(10);

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
        avatar_url: row.users.avatar_url,
        last_rank: row.last_rank,
        current_rank: row.current_rank,
        username: row.users.username,
      })));
    }
    setLoading(false);
  };

  const getRankStyles = (index: number) => {
    switch (index) {
      case 0: return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', icon: 'text-yellow-500', medal: <Trophy size={20} className="text-yellow-500" /> };
      case 1: return { bg: 'bg-slate-300/10', border: 'border-slate-300/50', icon: 'text-slate-300', medal: <Medal size={20} className="text-slate-300" /> };
      case 2: return { bg: 'bg-amber-600/10', border: 'border-amber-600/50', icon: 'text-amber-600', medal: <Medal size={20} className="text-amber-600" /> };
      default: return { bg: 'bg-white/2', border: 'border-white/5', icon: 'text-gray-500', medal: null };
    }
  };

  return (
    <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl overflow-hidden">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {leaders.map((leader, index) => {
              const styles = getRankStyles(index);
              return (
                <motion.div 
                  key={leader.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-6 transition-all hover:bg-white/[0.03] group`}
                >
                  <div className="flex items-center gap-6">
                    <div className="relative flex items-center justify-center w-10">
                      {styles.medal ? (
                        <div className="animate-bounce-subtle">{styles.medal}</div>
                      ) : (
                        <span className="text-lg font-black text-gray-600">#{index + 1}</span>
                      )}
                    </div>

                    {/* Rank Movement */}
                    <div className="flex flex-col items-center -ml-4 mr-2">
                      {leader.last_rank && leader.current_rank && (
                        <>
                          {leader.last_rank > leader.current_rank && (
                            <span className="text-green-500 text-[10px] font-bold">↑</span>
                          )}
                          {leader.last_rank < leader.current_rank && (
                            <span className="text-red-500 text-[10px] font-bold">↓</span>
                          )}
                          {leader.last_rank === leader.current_rank && (
                            <span className="text-gray-600 text-[10px]">•</span>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-inner overflow-hidden">
                        {leader.avatar_url ? (
                          <img src={leader.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          leader.email[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-200 group-hover:text-white transition-colors">
                            {leader.username || leader.email.split('@')[0]}
                          </p>
                          {leader.streak > 5 && <Flame size={14} className="text-orange-500" />}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{leader.role}</span>
                          <span className="flex items-center gap-1 text-[10px] font-medium text-orange-400">
                            <Flame size={10} /> {leader.streak} Day Streak
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-amber-400 font-black text-xl">
                      <TrendingUp size={14} className="text-amber-500/60" />
                      {leader.ranking_score}<span className="text-[10px] font-bold ml-1 opacity-50">pts</span>
                    </div>
                    <div className="text-[10px] text-gray-600 font-bold mt-0.5">
                      {leader.xp.toLocaleString()} XP · 🔥{leader.streak}d
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
  );
};
