import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Calendar, CheckCircle2, History, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineEvent {
  id: string;
  type: 'weekly' | 'monthly';
  date: string;
  title: string;
  summary: string;
  quality_score?: number;
}

export const ProgressTimeline: React.FC = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [user]);

  const fetchTimeline = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch Weekly Reports
    const { data: weekly } = await supabase
      .from('weekly_reports')
      .select('id, week_start, learned')
      .eq('user_id', user.id);

    // Fetch Monthly Reports
    const { data: monthly } = await supabase
      .from('monthly_reports')
      .select('id, month_start, summary, quality_score')
      .eq('user_id', user.id);

    const allEvents: TimelineEvent[] = [];

    weekly?.forEach(w => {
      allEvents.push({
        id: w.id,
        type: 'weekly',
        date: w.week_start,
        title: 'Weekly Review',
        summary: w.learned
      });
    });

    monthly?.forEach(m => {
      allEvents.push({
        id: m.id,
        type: 'monthly',
        date: m.month_start,
        title: 'Monthly Reflection',
        summary: m.summary,
        quality_score: m.quality_score
      });
    });

    // Sort by date descending
    allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setEvents(allEvents);
    setLoading(false);
  };

  if (loading) return <div className="h-48 bg-white/5 animate-pulse rounded-3xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
          <History size={20} />
        </div>
        <h3 className="text-xl font-bold text-white">Journey Timeline</h3>
      </div>

      {events.length === 0 ? (
        <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/10">
          <AlertCircle className="mx-auto text-gray-600 mb-2" size={24} />
          <p className="text-gray-500 text-sm italic">No weekly or monthly reviews found. Start reporting to build your timeline!</p>
        </div>
      ) : (
        <div className="relative pl-8 space-y-10">
          {/* Vertical Line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent opacity-20" />

          {events.map((event, index) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Dot */}
              <div className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 border-[#09090b] shadow-xl ${
                event.type === 'monthly' ? 'bg-amber-500' : 'bg-blue-500'
              }`} />

              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      event.type === 'monthly' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {event.type}
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {event.quality_score && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                      <TrendingUp size={12} /> {event.quality_score}% Quality
                    </div>
                  )}
                </div>

                <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                  {event.title}
                </h4>
                <p className="text-sm text-gray-400 line-clamp-3 italic leading-relaxed">
                  "{event.summary}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
