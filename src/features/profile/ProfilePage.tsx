import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { ACHIEVEMENTS, Badge, getRankTitle, getRankColor } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hammer, Zap, Brain, Flame, HandHeart, 
  TrendingUp, Crown, Star, Shield, 
  Calendar, Trophy, Lock, Mail, Code,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap: Record<string, any> = {
  Hammer, Zap, Brain, Flame, HandHeart, TrendingUp, Crown
};

export const ProfilePage: React.FC = () => {
  const { profile } = useAuthStore();
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchBadges();
    }
  }, [profile]);

  const fetchBadges = async () => {
    const { data } = await supabase
      .from('user_badges')
      .select('badge_type')
      .eq('user_id', profile?.id);
    
    if (data) {
      setBadges(data.map(b => b.badge_type));
    }
    setLoading(false);
  };

  const isUnlocked = (type: string) => badges.includes(type);

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 pb-24 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-widest">Back to Forge</span>
            </Link>
            <h1 className="text-5xl font-black tracking-tighter">Your <span className="text-amber-500">Arsenal</span></h1>
            <p className="text-gray-400 font-medium">A collection of your achievements and forged honor.</p>
          </div>

          <div className="flex items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl">
             <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/20">
                <Crown size={40} className="text-white" />
             </div>
             <div className="space-y-1">
                <p className="text-2xl font-black">{profile?.email?.split('@')[0]}</p>
                <div className="flex items-center gap-2">
                   <span className={`text-sm font-black uppercase tracking-widest ${getRankColor(profile?.xp || 0)}`}>
                      {getRankTitle(profile?.xp || 0)}
                   </span>
                </div>
             </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total XP', value: profile?.xp || 0, icon: Star, color: 'text-amber-400' },
            { label: 'Streak', value: `${profile?.streak || 0} Days`, icon: Flame, color: 'text-orange-500' },
            { label: 'Trust', value: `${profile?.trust_score || 0}/100`, icon: Shield, color: 'text-green-500' },
            { label: 'Badges', value: `${badges.length}/${ACHIEVEMENTS.length}`, icon: Trophy, color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-2">
              <stat.icon size={20} className={stat.color} />
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black tracking-tight">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = isUnlocked(achievement.type);
              const Icon = iconMap[achievement.icon] || Star;

              return (
                <motion.div
                  key={achievement.type}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`relative group ${unlocked ? '' : 'opacity-50'}`}
                >
                  <div className={`h-full bg-white/5 border border-white/10 p-8 rounded-[2.5rem] transition-all duration-500 ${unlocked ? 'hover:bg-white/10 hover:border-amber-500/30 hover:-translate-y-1' : ''}`}>
                    <div className="flex flex-col h-full justify-between gap-8">
                      <div className="space-y-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${unlocked ? achievement.color : 'from-white/10 to-transparent'} flex items-center justify-center shadow-xl`}>
                          {unlocked ? (
                            <Icon size={32} className="text-white" />
                          ) : (
                            <Lock size={24} className="text-gray-600" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-black">{achievement.name}</h3>
                          <p className="text-sm text-gray-400 font-medium leading-relaxed">{achievement.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Requirement</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">{achievement.requirement}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-8">
          <h2 className="text-2xl font-black">Identity Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Email Address</p>
                  <p className="font-bold text-lg">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl">
                  <Code size={20} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">GitHub Repository</p>
                  <p className="font-bold text-lg">{profile?.github_username || 'Not Linked'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl">
                  <Calendar size={20} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Member Since</p>
                  <p className="font-bold text-lg">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' }) : '---'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
