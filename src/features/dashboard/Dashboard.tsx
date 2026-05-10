import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Leaderboard } from './Leaderboard';
import { QuizWidget } from '../quizzes/QuizWidget';
import { WarningsWidget } from './WarningsWidget';
import { motion } from 'framer-motion';
import { Zap, Flame, Shield, User, ChevronRight, Star, Heart, HandHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InstallPWA } from '../../components/InstallPWA';
import { getRankTitle, getRankColor } from '../../types';

export const Dashboard: React.FC = () => {
  const { profile } = useAuthStore();

  const stats = [
    { 
      label: 'Total XP', 
      value: profile?.xp || 0, 
      icon: Star, 
      color: 'from-blue-500 to-cyan-400',
      shadow: 'shadow-blue-500/20'
    },
    { 
      label: 'Current Streak', 
      value: `${profile?.streak || 0} Days`, 
      icon: Flame, 
      color: 'from-orange-500 to-yellow-400',
      shadow: 'shadow-orange-500/20'
    },
    { 
      label: 'Trust Score', 
      value: `${profile?.trust_score || 50}/100`, 
      icon: Shield, 
      color: 'from-green-500 to-emerald-400',
      shadow: 'shadow-green-500/20'
    },
    { 
      label: 'Contribution', 
      value: profile?.contribution_points || 0, 
      icon: Heart, 
      color: 'from-pink-500 to-rose-400',
      shadow: 'shadow-pink-500/20'
    },
  ];

  // Also import Heart from lucide-react if needed


  return (
    <div className="p-4 md:p-8 space-y-10">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-700 to-orange-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] ${getRankColor(profile?.xp || 0)}`}>
                <Hammer size={12} /> {getRankTitle(profile?.xp || 0)}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-200">RankForge</span>
              </h1>
              <p className="mt-2 text-lg text-purple-100/80 max-w-md font-medium">
                You're currently a <span className="text-white font-bold">{getRankTitle(profile?.xp || 0)}</span>. Climb to <span className="text-white font-bold">Supremacy</span>!
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center md:justify-start gap-4 pt-2"
            >
              <Link 
                to="/reports" 
                className="bg-white text-blue-700 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                Submit Report <ChevronRight size={18} />
              </Link>
              <Link 
                to="/resources" 
                className="bg-blue-500/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-500/30 transition-all"
              >
                View Resources
              </Link>
              <InstallPWA />
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative hidden lg:block"
          >
            <div className="w-48 h-48 bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 flex items-center justify-center shadow-2xl rotate-3">
              <User size={80} className="text-white/80" />
              <div className="absolute -bottom-4 -right-4 bg-yellow-400 p-4 rounded-2xl shadow-xl -rotate-6">
                <Flame size={32} className="text-orange-700" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`group p-6 rounded-[2rem] bg-gradient-to-br ${stat.color} ${stat.shadow} relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <stat.icon size={80} />
            </div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 text-white/70">
                <stat.icon size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-3xl font-black text-white">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Main Content Layout */}
      <section className="grid gap-8 lg:grid-cols-3">
        {/* Leaderboard takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Star className="text-yellow-500" /> Global Leaderboard
            </h2>
            <Link to="/" className="text-blue-500 text-sm font-bold hover:underline">View All</Link>
          </div>
          <Leaderboard />
        </div>

        {/* Widgets take 1 column */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Daily Activities</h2>
          </div>
          <div className="space-y-6">
             <QuizWidget />
             <WarningsWidget />
          </div>
        </div>
      </section>
    </div>
  );
};
