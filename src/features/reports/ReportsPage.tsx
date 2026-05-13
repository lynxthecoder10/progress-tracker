import React, { useState } from 'react';
import { DailyReportForm } from './DailyReportForm';
import { WeeklyReportForm } from './WeeklyReportForm';
import { MonthlyReportForm } from './MonthlyReportForm';
import { CommunityFeed } from './CommunityFeed';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, Info, Clock, AlertCircle, Users, Globe } from 'lucide-react';
import { HelpTooltip } from '../../components/ui/HelpTooltip';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'community'>('daily');

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 min-h-screen">
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-4">
          <FileText className="text-blue-500" size={36} />
          Progress Reporting
          <HelpTooltip 
            title="Why Report?" 
            content="Documentation is the forge of consistency. Reporting your progress daily, weekly, and monthly builds your Trust Score and earns you XP." 
          />
        </h1>
        <p className="text-gray-500 font-medium">Document your journey and maintain your streak.</p>
      </header>

      {/* Custom Tab Switcher */}
      <div className="flex flex-wrap p-1 bg-white/5 rounded-2xl border border-white/10 w-full overflow-hidden">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
            activeTab === 'daily' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Clock size={18} /> Daily
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
            activeTab === 'weekly' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Calendar size={18} /> Weekly
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
            activeTab === 'monthly' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Users size={18} /> Monthly
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
            activeTab === 'community' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Globe size={18} /> Community
        </button>
      </div>

      {/* Form Section with Transitions */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'daily' && (
            <motion.div key="daily" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <DailyReportForm />
            </motion.div>
          )}
          {activeTab === 'weekly' && (
            <motion.div key="weekly" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <WeeklyReportForm />
            </motion.div>
          )}
          {activeTab === 'monthly' && (
            <motion.div key="monthly" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <MonthlyReportForm />
            </motion.div>
          )}
          {activeTab === 'community' && (
            <motion.div key="community" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <CommunityFeed />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Anti-Abuse Warning */}
      <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 flex items-center gap-4">
        <AlertCircle className="text-red-500/50" />
        <p className="text-[10px] uppercase tracking-widest font-black text-red-500/40">
          Anti-Abuse System Active: Duplicate or low-quality reports will result in Trust Score reduction.
        </p>
      </div>
    </div>
  );
};
