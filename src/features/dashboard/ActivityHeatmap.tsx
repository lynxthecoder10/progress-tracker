import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface DayData {
  date: string;
  count: number;
}

const DAYS_TO_SHOW = 91; // 13 weeks

const getIntensity = (count: number): string => {
  if (count === 0) return 'bg-white/5 border-white/5';
  if (count === 1) return 'bg-amber-900/60 border-amber-800/40';
  if (count === 2) return 'bg-amber-700/70 border-amber-600/50';
  if (count >= 3) return 'bg-amber-500 border-amber-400/60 shadow-[0_0_6px_rgba(245,158,11,0.4)]';
  return 'bg-white/5';
};

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const ActivityHeatmap: React.FC = () => {
  const { user } = useAuthStore();
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  const fetchActivity = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DAYS_TO_SHOW);
    const startDateStr = startDate.toISOString().split('T')[0];

    const [reportsRes, quizzesRes] = await Promise.all([
      supabase
        .from('daily_reports')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', startDateStr),
      supabase
        .from('quiz_attempts')
        .select('timestamp')
        .eq('user_id', user.id)
        .gte('timestamp', startDateStr)
    ]);

    // Count per date
    const counts: Record<string, number> = {};
    reportsRes.data?.forEach(r => {
      counts[r.date] = (counts[r.date] || 0) + 1;
    });
    quizzesRes.data?.forEach(q => {
      const dateStr = q.timestamp.split('T')[0];
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });

    // Build 91 day array
    const result: DayData[] = [];
    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({ date: dateStr, count: counts[dateStr] || 0 });
    }

    setDays(result);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  // Group into weeks (columns)
  const weeks: DayData[][] = [];
  const startPadding = new Date(days[0]?.date ?? new Date()).getDay(); // 0=Sun
  const paddedDays = [...Array(startPadding).fill(null), ...days];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7) as DayData[]);
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const firstReal = week.find(d => d !== null);
    if (firstReal) {
      const m = new Date(firstReal.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: MONTH_NAMES[m], col });
        lastMonth = m;
      }
    }
  });

  const totalActive = days.filter(d => d.count > 0).length;

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-amber-500" />
          <h3 className="font-black text-base">Activity Heatmap</h3>
        </div>
        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
          {totalActive} active days
        </span>
      </div>

      {loading ? (
        <div className="h-24 animate-pulse bg-white/5 rounded-2xl" />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-fit">
            {/* Month labels */}
            <div className="flex mb-1 pl-7">
              {weeks.map((_, i) => {
                const ml = monthLabels.find(m => m.col === i);
                return (
                  <div key={i} className="w-4 mr-1 text-[9px] text-gray-600 font-bold">
                    {ml?.label ?? ''}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 pr-1">
                {DAY_LABELS.map((l, i) => (
                  <div key={i} className="h-3.5 text-[9px] text-gray-600 font-bold flex items-center">
                    {l}
                  </div>
                ))}
              </div>

              {/* Grid */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day, di) => {
                    if (!day) return <div key={di} className="w-3.5 h-3.5" />;
                    return (
                      <motion.div
                        key={di}
                        whileHover={{ scale: 1.3 }}
                        className={`w-3.5 h-3.5 rounded-sm border cursor-pointer transition-all ${getIntensity(day.count)}`}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-2">
              <span className="text-[9px] text-gray-600">Less</span>
              {[0, 1, 2, 3].map(v => (
                <div key={v} className={`w-3 h-3 rounded-sm border ${getIntensity(v)}`} />
              ))}
              <span className="text-[9px] text-gray-600">More</span>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {hoveredDay && (
        <div className="text-xs text-center text-gray-400 font-bold">
          {hoveredDay.count > 0
            ? `${hoveredDay.count} report${hoveredDay.count > 1 ? 's' : ''} on ${new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            : `No activity on ${new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          }
        </div>
      )}
    </div>
  );
};
