import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { ACHIEVEMENTS, getRankTitle, getRankColor } from '../../types';
import { motion } from 'framer-motion';
import {
  Hammer, Zap, Brain, Flame, TrendingUp, Crown, Star,
  Shield, Calendar, Trophy, Lock, Mail, ArrowLeft,
  Heart, GitBranch, Edit3, Check, X, ExternalLink,
  History, Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { AvatarPicker } from '../../components/profile/AvatarPicker';
import { AnimatePresence } from 'framer-motion';

const iconMap: Record<string, React.ElementType> = {
  Hammer, Zap, Brain, Flame, Heart, TrendingUp, Crown
};

const BADGE_STYLES: Record<string, { bg: string; glow: string; ring: string }> = {
  genesis:      { bg: 'from-slate-600 via-gray-500 to-slate-700',        glow: 'shadow-gray-500/30',   ring: 'ring-gray-500/40' },
  quiz_novice:  { bg: 'from-amber-500 via-yellow-400 to-orange-500',     glow: 'shadow-amber-500/40',  ring: 'ring-amber-400/50' },
  quiz_whiz:    { bg: 'from-fuchsia-600 via-purple-500 to-pink-600',     glow: 'shadow-purple-500/40', ring: 'ring-purple-500/50' },
  streak_master:{ bg: 'from-orange-600 via-red-500 to-rose-600',         glow: 'shadow-red-500/40',    ring: 'ring-red-500/50' },
  contributor:  { bg: 'from-sky-500 via-blue-500 to-indigo-600',         glow: 'shadow-blue-500/40',   ring: 'ring-blue-400/50' },
  climber:      { bg: 'from-emerald-500 via-teal-400 to-green-600',      glow: 'shadow-emerald-500/40',ring: 'ring-emerald-400/50' },
  supreme:      { bg: 'from-yellow-400 via-amber-400 to-yellow-600',     glow: 'shadow-yellow-400/50', ring: 'ring-yellow-400/60' },
};

import { ProgressTimeline } from '../progress/ProgressTimeline';
import { HelpTooltip } from '../../components/ui/HelpTooltip';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useAuthStore();
  const { addToast } = useAppStore();
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'timeline' | 'badges'>('stats');

  // GitHub edit state
  const [editingGithub, setEditingGithub] = useState(false);
  const [githubInput, setGithubInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [savingGithub, setSavingGithub] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchBadges();
      setGithubInput(profile.github_username ?? '');
      setUsernameInput(profile.username ?? '');
    }
  }, [profile]);

  const fetchBadges = async () => {
    const { data } = await supabase
      .from('user_badges')
      .select('badge_type')
      .eq('user_id', profile?.id);
    if (data) setBadges(data.map(b => b.badge_type));
    setLoading(false);
  };

  const saveGithub = async () => {
    if (!profile) return;
    setSavingGithub(true);
    const { error } = await supabase
      .from('users')
      .update({ github_username: githubInput.trim() })
      .eq('id', profile.id);

    if (!error) {
      updateProfile({ github_username: githubInput.trim() });
      addToast('GitHub linked!', 'success');
      setEditingGithub(false);
    } else {
      addToast('Failed to save. Try again.', 'error');
    }
    setSavingGithub(false);
  };

  const saveUsername = async () => {
    if (!profile) return;
    if (usernameInput.length < 3) {
      addToast('Username must be at least 3 characters', 'error');
      return;
    }
    const { error } = await supabase
      .from('users')
      .update({ username: usernameInput.trim() })
      .eq('id', profile.id);

    if (!error) {
      updateProfile({ username: usernameInput.trim() });
      addToast('Username updated!', 'success');
      setEditingUsername(false);
    } else {
      if (error.code === '23505') addToast('Username already taken', 'error');
      else addToast('Failed to save username', 'error');
    }
  };

  const isUnlocked = (type: string) => badges.includes(type);
  const unlockedCount = ACHIEVEMENTS.filter(a => isUnlocked(a.type)).length;

  return (
    <div
      className="min-h-screen bg-[#09090b] text-white pb-28"
      style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(217,119,6,0.07), transparent)' }}
    >
      <div className="max-w-5xl mx-auto px-5 pt-8 space-y-10">

        {/* ── Back ── */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Forge</span>
        </Link>

        {/* ── Hero Banner ── */}
        <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-transparent to-purple-900/20" />
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative group shrink-0">
              <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden ring-4 ring-amber-500/10">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Crown size={48} className="text-amber-500" />
                )}
              </div>
              <button 
                onClick={() => setShowAvatarPicker(true)}
                className="absolute -bottom-2 -right-2 p-2.5 bg-amber-600 rounded-2xl border-2 border-[#09090b] text-white shadow-lg hover:bg-amber-500 transition-all hover:scale-110 active:scale-95 group"
              >
                <Camera size={16} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black truncate tracking-tight flex items-center gap-2">
                  {editingUsername ? (
                    <div className="flex items-center gap-2">
                      <input 
                        value={usernameInput}
                        onChange={e => setUsernameInput(e.target.value)}
                        className="bg-white/5 border-b border-amber-500 outline-none text-2xl font-black w-48"
                        autoFocus
                      />
                      <button onClick={saveUsername} className="p-1 bg-green-500/20 text-green-400 rounded-md"><Check size={16} /></button>
                      <button onClick={() => setEditingUsername(false)} className="p-1 bg-red-500/20 text-red-400 rounded-md"><X size={16} /></button>
                    </div>
                  ) : (
                    <>
                      {profile?.username || profile?.email?.split('@')[0]}
                      <button onClick={() => setEditingUsername(true)} className="p-1 text-gray-500 hover:text-white transition-colors">
                        <Edit3 size={16} />
                      </button>
                    </>
                  )}
                </h1>
                <span className="text-[10px] font-black bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-500 uppercase tracking-widest">
                  LVL {Math.floor((profile?.xp || 0) / 100) + 1}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className={`text-sm font-black uppercase tracking-[0.2em] ${getRankColor(profile?.xp || 0)}`}>
                  {getRankTitle(profile?.xp || 0)}
                </span>
                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <p className="text-sm text-gray-500 font-bold italic">{profile?.email}</p>
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl px-8 py-5">
              <span className="text-4xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">{unlockedCount}</span>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">Artifacts Unlocked</span>
            </div>
          </div>
        </div>

        {/* Avatar Picker Modal */}
        <AnimatePresence>
          {showAvatarPicker && (
            <AvatarPicker onClose={() => setShowAvatarPicker(false)} />
          )}
        </AnimatePresence>

        {/* ── Tab Switcher ── */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 w-full overflow-hidden">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'stats' ? 'bg-amber-600 text-white' : 'text-gray-500'
            }`}
          >
            <Zap size={18} /> Identity & Stats
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'timeline' ? 'bg-amber-600 text-white' : 'text-gray-500'
            }`}
          >
            <History size={18} /> Journey Timeline
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'badges' ? 'bg-amber-600 text-white' : 'text-gray-500'
            }`}
          >
            <Trophy size={18} /> Badges
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total XP',   value: profile?.xp ?? 0,                icon: Star,    color: 'text-amber-400',  bg: 'from-amber-500/10 to-transparent' },
                  { label: 'Day Streak', value: `${profile?.streak ?? 0}d`,       icon: Flame,   color: 'text-orange-500', bg: 'from-orange-500/10 to-transparent' },
                  { label: 'Trust',      value: `${profile?.trust_score ?? 0}`,   icon: Shield,  color: 'text-emerald-400',bg: 'from-emerald-500/10 to-transparent' },
                  { label: 'Contrib.',   value: profile?.contribution_points ?? 0,icon: Trophy,  color: 'text-purple-400', bg: 'from-purple-500/10 to-transparent' },
                ].map((s, i) => (
                  <div key={i} className={`bg-gradient-to-br ${s.bg} border border-white/10 rounded-3xl p-5 space-y-2`}>
                    <s.icon size={18} className={s.color} />
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Identity / GitHub */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                <h2 className="text-xl font-black">Identity Details</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl shrink-0"><Mail size={18} className="text-gray-400" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Email</p>
                      <p className="font-bold truncate">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl shrink-0"><Calendar size={18} className="text-gray-400" /></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Member Since</p>
                      <p className="font-bold">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '---'}</p>
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="p-3 bg-white/5 rounded-2xl shrink-0"><GitBranch size={18} className="text-gray-300" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">GitHub Username</p>
                      {editingGithub ? (
                        <input
                          type="text"
                          value={githubInput}
                          onChange={e => setGithubInput(e.target.value)}
                          className="w-full bg-transparent border-b border-amber-500/50 text-white text-sm font-bold outline-none pb-0.5"
                          autoFocus
                        />
                      ) : (
                        <p className="font-bold text-amber-400">{profile?.github_username || 'Not linked'}</p>
                      )}
                    </div>
                    <button onClick={editingGithub ? saveGithub : () => setEditingGithub(true)} className="p-2 rounded-xl bg-white/5 text-gray-400">
                      {editingGithub ? <Check size={16} /> : <Edit3 size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ProgressTimeline />
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div key="badges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ACHIEVEMENTS.map((achievement, i) => {
                  const unlocked = isUnlocked(achievement.type);
                  const Icon = iconMap[achievement.icon] ?? Star;
                  const style = BADGE_STYLES[achievement.type] ?? { bg: 'from-gray-600 to-gray-800', glow: '', ring: '' };
                  return (
                    <div key={achievement.type} className={`relative rounded-3xl border p-6 flex gap-4 ${unlocked ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/[0.02] opacity-50'}`}>
                      <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${unlocked ? `bg-gradient-to-br ${style.bg}` : 'bg-white/5'}`}>
                        {unlocked ? <Icon size={26} className="text-white" /> : <Lock size={18} className="text-gray-600" />}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-base">{achievement.name}</h3>
                        <p className="text-xs text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
