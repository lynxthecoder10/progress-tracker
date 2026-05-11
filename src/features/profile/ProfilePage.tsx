import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { ACHIEVEMENTS, getRankTitle, getRankColor } from '../../types';
import { motion } from 'framer-motion';
import {
  Hammer, Zap, Brain, Flame, TrendingUp, Crown, Star,
  Shield, Calendar, Trophy, Lock, Mail, ArrowLeft,
  Github, Edit3, Check, X, ExternalLink, HandHeart, Swords
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';

const iconMap: Record<string, React.ElementType> = {
  Hammer, Zap, Brain, Flame, HandHeart, TrendingUp, Crown, Swords
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

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useAuthStore();
  const { addToast } = useAppStore();
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // GitHub edit state
  const [editingGithub, setEditingGithub] = useState(false);
  const [githubInput, setGithubInput] = useState('');
  const [savingGithub, setSavingGithub] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchBadges();
      setGithubInput(profile.github_username ?? '');
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
        <div className="relative rounded-[2rem] overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-transparent to-purple-900/20" />
          <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30 shrink-0 ring-4 ring-amber-500/20">
              <Crown size={38} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-black truncate">{profile?.email?.split('@')[0]}</h1>
              <p className="text-sm text-gray-400 truncate">{profile?.email}</p>
              <span className={`inline-block mt-1 text-sm font-black uppercase tracking-widest ${getRankColor(profile?.xp || 0)}`}>
                {getRankTitle(profile?.xp || 0)}
              </span>
            </div>
            {/* Badges count pill */}
            <div className="shrink-0 flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
              <span className="text-3xl font-black text-amber-400">{unlockedCount}</span>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Badges</span>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
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

        {/* ── Achievements ── */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">Achievement Arsenal</h2>
            <span className="text-xs text-gray-500 font-bold">{unlockedCount} / {ACHIEVEMENTS.length} unlocked</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((achievement, i) => {
              const unlocked = isUnlocked(achievement.type);
              const Icon = iconMap[achievement.icon] ?? Star;
              const style = BADGE_STYLES[achievement.type] ?? { bg: 'from-gray-600 to-gray-800', glow: '', ring: '' };

              return (
                <motion.div
                  key={achievement.type}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative rounded-3xl border transition-all duration-300 overflow-hidden ${
                    unlocked
                      ? `border-white/10 bg-white/5 hover:-translate-y-1 hover:border-white/20 shadow-xl ${style.glow}`
                      : 'border-white/5 bg-white/[0.02] opacity-50'
                  }`}
                >
                  {/* Glow blob when unlocked */}
                  {unlocked && (
                    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${style.bg} opacity-20 blur-2xl`} />
                  )}

                  <div className="relative p-6 flex gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-lg ring-2 ${
                      unlocked
                        ? `bg-gradient-to-br ${style.bg} ${style.ring} shadow-lg`
                        : 'bg-white/5 ring-white/10'
                    }`}>
                      {unlocked
                        ? <Icon size={26} className="text-white drop-shadow" />
                        : <Lock size={18} className="text-gray-600" />
                      }
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-black text-base leading-tight">{achievement.name}</h3>
                      <p className="text-xs text-gray-400 leading-snug">{achievement.description}</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${unlocked ? 'bg-amber-500' : 'bg-gray-700'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${unlocked ? 'text-amber-400' : 'text-gray-600'}`}>
                          {achievement.requirement}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Identity / GitHub ── */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-black">Identity</h2>
          <div className="grid sm:grid-cols-2 gap-6">

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl shrink-0">
                <Mail size={18} className="text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Email</p>
                <p className="font-bold truncate">{profile?.email}</p>
              </div>
            </div>

            {/* Join date */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl shrink-0">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Member Since</p>
                <p className="font-bold">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : '---'}
                </p>
              </div>
            </div>

            {/* GitHub — full row */}
            <div className="sm:col-span-2 flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="p-3 bg-white/5 rounded-2xl shrink-0">
                <Github size={18} className="text-gray-300" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">GitHub Username</p>
                {editingGithub ? (
                  <input
                    type="text"
                    value={githubInput}
                    onChange={e => setGithubInput(e.target.value)}
                    placeholder="your-github-username"
                    className="w-full bg-transparent border-b border-amber-500/50 text-white text-sm font-bold outline-none pb-0.5 placeholder-gray-600"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') saveGithub(); if (e.key === 'Escape') setEditingGithub(false); }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    {profile?.github_username ? (
                      <a
                        href={`https://github.com/${profile.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        {profile.github_username}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-gray-600 font-bold text-sm">Not linked</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {editingGithub ? (
                  <>
                    <button
                      onClick={saveGithub}
                      disabled={savingGithub}
                      className="p-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => { setEditingGithub(false); setGithubInput(profile?.github_username ?? ''); }}
                      className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingGithub(true)}
                    className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
