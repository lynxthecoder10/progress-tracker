import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import { Trophy, Star, Crown, MessageCircle, Heart, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface MonthlyReport {
  id: string;
  user_id: string;
  month_start: string;
  summary: string;
  key_achievements: string[];
  blockers: string;
  quality_score: number;
  is_featured: boolean;
  created_at: string;
  users: { email: string; role: string; xp: number; username: string | null };
}

export const CommunityFeed: React.FC = () => {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [topperId, setTopperId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Fetch Leaderboard Topper
    const { data: topperData } = await supabase
      .from('leaderboard_metrics')
      .select('user_id')
      .order('ranking_score', { ascending: false })
      .limit(1)
      .single();
    
    if (topperData) setTopperId(topperData.user_id);

    // 2. Fetch Monthly Reports
    const { data, error } = await supabase
      .from('monthly_reports')
      .select(`
        *,
        users:users(email, role, xp, username)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReports(data as any);
    }
    setLoading(false);
  };

  const getBestReportId = () => {
    if (reports.length === 0) return null;
    return reports.reduce((prev, current) => 
      (prev.quality_score > current.quality_score) ? prev : current
    ).id;
  };

  const bestReportId = getBestReportId();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Star className="text-amber-400" /> Community Insights
          </h2>
          <p className="text-gray-500">Public monthly reflections from the forge.</p>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2].map(i => <div key={i} className="h-64 bg-white/5 rounded-[2.5rem] animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="p-20 text-center bg-white/5 rounded-[2.5rem] border border-white/10">
          <MessageCircle className="mx-auto text-gray-700 mb-4" size={48} />
          <p className="text-gray-500 font-bold">No monthly reports published yet.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {reports.map((report) => {
            const isTopper = report.user_id === topperId;
            const isBest = report.id === bestReportId;
            const isFeatured = report.is_featured;

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative group p-8 rounded-[2.5rem] border transition-all duration-500 ${
                  isBest 
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/40 shadow-2xl shadow-amber-500/10' 
                    : isTopper 
                    ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/10 border-purple-500/40' 
                    : 'bg-[#121214] border-white/5 hover:border-white/20'
                }`}
              >
                {/* Status Badges */}
                <div className="absolute -top-4 right-8 flex gap-2">
                  {isBest && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-black font-black text-[10px] uppercase tracking-tighter shadow-xl">
                      <Award size={14} /> Best of Month
                    </div>
                  )}
                  {isTopper && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 text-white font-black text-[10px] uppercase tracking-tighter shadow-xl">
                      <Crown size={14} /> Leaderboard Topper
                    </div>
                  )}
                  {isFeatured && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-tighter shadow-xl">
                      <Star size={14} /> Admin Pick
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-white group-hover:scale-110 transition-transform">
                      {report.users.email[0].toUpperCase()}
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-200">{report.users.username || report.users.email.split('@')[0]}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">{report.users.role}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white leading-tight">{new Date(report.month_start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} Review</h3>
                      <p className="text-gray-400 leading-relaxed italic">"{report.summary}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Key Achievements</p>
                        <div className="flex flex-wrap gap-2">
                          {report.key_achievements.map((ach, i) => (
                            <span key={i} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-blue-400 font-bold">
                              {ach}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Blockers Overcome</p>
                        <p className="text-xs text-gray-400 italic line-clamp-2">{report.blockers}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                          <Heart size={18} /> <span className="text-xs font-bold">Encourage</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <MessageCircle size={18} /> <span className="text-xs font-bold">Discuss</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-gray-500 text-[10px] font-black uppercase">
                        Quality Score: {report.quality_score}%
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
