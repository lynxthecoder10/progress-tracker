import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Swords, Check, X, Trophy, Clock, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useGamification } from '../../hooks/useGamification';

interface Battle {
  id: string;
  challenger_id: string;
  opponent_id: string;
  challenger_start_xp: number;
  opponent_start_xp: number;
  status: 'pending' | 'active' | 'completed' | 'declined';
  duration_type: 'week' | 'month';
  start_date: string;
  end_date: string;
  winner_id: string | null;
  challenger: { email: string; xp: number };
  opponent: { email: string; xp: number };
}

export const BattlesPage: React.FC = () => {
  const { user, profile } = useAuthStore();
  const { awardXp } = useGamification();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [opponentEmail, setOpponentEmail] = useState('');
  const [durationType, setDurationType] = useState<'week' | 'month'>('week');
  const [isChallenging, setIsChallenging] = useState(false);

  const fetchBattles = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('battles')
      .select(`
        *,
        challenger:users!challenger_id(email, xp),
        opponent:users!opponent_id(email, xp)
      `)
      .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBattles(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBattles();
  }, [user]);

  const handleChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !opponentEmail.trim() || opponentEmail === user.email) return;

    setIsChallenging(true);
    
    // Find opponent ID by email
    const { data: opponentData } = await supabase
      .from('users')
      .select('id')
      .eq('email', opponentEmail.trim())
      .single();

    if (!opponentData) {
      alert('Opponent not found. Make sure the email is correct.');
      setIsChallenging(false);
      return;
    }

    const { error } = await supabase.from('battles').insert({
      challenger_id: user.id,
      opponent_id: opponentData.id,
      status: 'pending',
      duration_type: durationType,
      challenger_start_xp: profile.xp
    });

    if (error) {
      alert('Failed to send challenge.');
    } else {
      setOpponentEmail('');
      fetchBattles();
    }
    setIsChallenging(false);
  };

  const handleAccept = async (battle: Battle) => {
    if (!profile) return;
    const now = new Date();
    const end = new Date(now);
    if (battle.duration_type === 'week') end.setDate(end.getDate() + 7);
    else end.setMonth(end.getMonth() + 1);

    await supabase
      .from('battles')
      .update({
        status: 'active',
        start_date: now.toISOString(),
        end_date: end.toISOString(),
        opponent_start_xp: profile.xp
      })
      .eq('id', battle.id);
    
    fetchBattles();
  };

  const handleDecline = async (id: string) => {
    await supabase.from('battles').update({ status: 'declined' }).eq('id', id);
    fetchBattles();
  };

  const handleClaimXP = async (battle: Battle) => {
    if (!user) return;

    // Determine winner based on XP gained since start
    const challengerGain = battle.challenger.xp - battle.challenger_start_xp;
    const opponentGain = battle.opponent.xp - battle.opponent_start_xp;
    
    let winner_id = null;
    let challengerAward = 0;
    let opponentAward = 0;

    // Check for "Failure to Progress" (-50 XP if gain <= 0)
    if (challengerGain <= 0) challengerAward = -50;
    if (opponentGain <= 0) opponentAward = -50;

    // Determine winner/tie rewards if they didn't both fail
    if (challengerGain > opponentGain) {
      winner_id = battle.challenger_id;
      if (challengerGain > 0) challengerAward = 50;
    } else if (opponentGain > challengerGain) {
      winner_id = battle.opponent_id;
      if (opponentGain > 0) opponentAward = 50;
    } else {
      // It's a tie
      if (challengerGain > 0) challengerAward = 25;
      if (opponentGain > 0) opponentAward = 25;
    }

    const { error } = await supabase
      .from('battles')
      .update({
        status: 'completed',
        winner_id
      })
      .eq('id', battle.id);

    if (!error) {
      // Award/Deduct XP for current user
      const myAward = (user.id === battle.challenger_id) ? challengerAward : opponentAward;
      
      if (myAward !== 0) {
        awardXp(myAward, myAward > 0 ? 'Battle Reward' : 'Battle Penalty');
      }

      if (winner_id === user.id) {
        alert(`Battle completed! You won and gained ${challengerAward} XP.`);
      } else if (winner_id === null) {
        alert(`Battle tied! You gained ${myAward} XP.`);
      } else {
        alert(`Battle completed. You got ${myAward} XP.`);
      }
      fetchBattles();
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) <= new Date();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 min-h-screen">
      <header className="space-y-2 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-4">
            <Swords className="text-red-500" size={36} />
            Forge Battles
          </h1>
          <p className="text-gray-500 font-medium">Challenge your friends to see who can gain more XP.</p>
        </div>
      </header>

      {/* Challenge Form */}
      <Card className="border-red-500/20 bg-gradient-to-br from-red-500/10 to-[#121214] backdrop-blur-xl">
        <CardContent className="p-6">
          <form onSubmit={handleChallenge} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-bold text-red-200">Opponent Email</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500/50" size={18} />
                <input
                  type="email"
                  value={opponentEmail}
                  onChange={(e) => setOpponentEmail(e.target.value)}
                  placeholder="friend@example.com"
                  required
                  className="w-full bg-white/5 border border-red-500/20 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
            </div>
            <div className="space-y-2 w-full md:w-auto">
              <label className="text-sm font-bold text-red-200">Duration</label>
              <select
                value={durationType}
                onChange={(e) => setDurationType(e.target.value as 'week' | 'month')}
                className="w-full bg-white/5 border border-red-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 appearance-none"
              >
                <option value="week" className="bg-zinc-900">1 Week</option>
                <option value="month" className="bg-zinc-900">1 Month</option>
              </select>
            </div>
            <Button 
              type="submit" 
              disabled={isChallenging || !opponentEmail.trim()}
              className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-500/20"
            >
              {isChallenging ? 'Sending...' : 'Send Challenge'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Battles List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Battles</h2>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : battles.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
            <Swords className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-400">No active battles</h3>
            <p className="text-sm text-gray-500 mt-2">Send a challenge to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {battles.map((battle) => {
              const isChallenger = battle.challenger_id === user?.id;
              const opponentEmail = isChallenger ? battle.opponent.email : battle.challenger.email;
              const myGain = isChallenger 
                ? battle.challenger.xp - battle.challenger_start_xp 
                : battle.opponent.xp - battle.opponent_start_xp;
              const theirGain = isChallenger 
                ? battle.opponent.xp - battle.opponent_start_xp 
                : battle.challenger.xp - battle.challenger_start_xp;

              return (
                <motion.div 
                  key={battle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-full text-red-500 border border-red-500/20">
                      <Swords size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {isChallenger ? 'You challenged' : 'Challenged by'} <span className="text-blue-400">{opponentEmail.split('@')[0]}</span>
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <Clock size={14} /> 
                        <span className="uppercase tracking-wider text-[10px] font-bold">
                          {battle.duration_type}ly Battle
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-bold capitalize">
                          {battle.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {battle.status === 'pending' && (
                    <div className="flex gap-2 w-full md:w-auto">
                      {!isChallenger ? (
                        <>
                          <Button onClick={() => handleAccept(battle)} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700">
                            Accept
                          </Button>
                          <Button onClick={() => handleDecline(battle.id)} className="flex-1 md:flex-none bg-zinc-700 hover:bg-zinc-600">
                            Decline
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Waiting for opponent...</p>
                      )}
                    </div>
                  )}

                  {battle.status === 'active' && (
                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                      <div className="flex gap-6 w-full md:w-auto text-center">
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Your Gain</p>
                          <p className="text-xl font-black text-emerald-400">+{myGain} XP</p>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Their Gain</p>
                          <p className="text-xl font-black text-red-400">+{theirGain} XP</p>
                        </div>
                      </div>

                      {isExpired(battle.end_date) ? (
                        <Button onClick={() => handleClaimXP(battle)} className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-amber-600 font-bold shadow-lg shadow-yellow-500/20 border border-yellow-400/50 animate-pulse">
                          Claim XP
                        </Button>
                      ) : (
                        <div className="text-xs text-right text-gray-500">
                          Ends:<br/>{new Date(battle.end_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}

                  {battle.status === 'completed' && (
                    <div className="flex items-center gap-3">
                      {battle.winner_id === user?.id ? (
                        <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-500/20 font-bold">
                          <Trophy size={18} /> You Won!
                        </div>
                      ) : battle.winner_id === null ? (
                        <div className="text-gray-400 bg-white/5 px-4 py-2 rounded-xl font-bold">
                          Tie
                        </div>
                      ) : (
                        <div className="text-red-400 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 font-bold">
                          You Lost
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
