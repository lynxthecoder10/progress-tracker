import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

interface LeaderboardEntry {
  user_id: string;
  email: string;
  role: string;
  xp: number;
  streak: number;
  trust_score: number;
  consistency_score: number;
  ranking_score: number;
}

export const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    
    // In a real app we'd join 'users' and 'leaderboard_metrics' via a view or RPC function
    // For this prototype, we'll fetch users and order by a calculated heuristic or the raw XP/ranking_score
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, email, role, xp, streak, trust_score,
        leaderboard_metrics ( consistency_score, ranking_score )
      `)
      .order('xp', { ascending: false }) // Simplification for now, usually order by ranking_score
      .limit(20);

    if (!error && data) {
      const mapped = data.map((u: any) => ({
        user_id: u.id,
        email: u.email,
        role: u.role,
        xp: u.xp,
        streak: u.streak,
        trust_score: u.trust_score,
        consistency_score: u.leaderboard_metrics?.[0]?.consistency_score || 0,
        ranking_score: u.leaderboard_metrics?.[0]?.ranking_score || 0,
      }));
      setLeaders(mapped);
    }
    setLoading(false);
  };

  return (
    <Card className="border-white/10 bg-black/60 mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Global Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse flex flex-col space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-white/10 rounded-md"></div>)}
          </div>
        ) : (
          <div className="space-y-4">
            {leaders.map((leader, index) => (
              <div key={leader.user_id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold text-gray-500 w-6 text-center">#{index + 1}</div>
                  <div>
                    <p className="font-semibold">{leader.email.split('@')[0]}</p>
                    <p className="text-xs text-muted-foreground capitalize">{leader.role} • {leader.streak}🔥</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{leader.xp} XP</p>
                  <p className="text-xs text-green-500">Trust: {leader.trust_score}</p>
                </div>
              </div>
            ))}
            
            {leaders.length === 0 && (
              <p className="text-center text-muted-foreground py-6">No users found.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
