import React, { useState } from 'react';
import { DailyReportForm } from './DailyReportForm';
import { WeeklyReportForm } from './WeeklyReportForm';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, Info, Clock, AlertCircle } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 min-h-screen">
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-4">
          <FileText className="text-blue-500" size={36} />
          Progress Reporting
        </h1>
        <p className="text-gray-500 font-medium">Document your journey and maintain your streak.</p>
      </header>

      {/* Stats/Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-4">
          <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
            <Info size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-400">Daily Goal</h4>
            <p className="text-xs text-blue-100/60 leading-relaxed">Submit your daily activity to maintain your streak. Required by 11:59 PM local time.</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-4">
          <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-purple-400">Weekly Review</h4>
            <p className="text-xs text-purple-100/60 leading-relaxed">Summarize your week every Sunday. This significantly boosts your Trust Score.</p>
          </div>
        </div>
      </div>

      {/* Custom Tab Switcher */}
      <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 w-full max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'daily' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Clock size={18} /> Daily
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'weekly' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Calendar size={18} /> Weekly
        </button>
      </div>

      {/* Form Section with Transitions */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'daily' ? (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DailyReportForm />
            </motion.div>
          ) : (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WeeklyReportForm />
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
