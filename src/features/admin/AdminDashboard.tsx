import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { motion } from 'framer-motion';
import {
  Users, AlertTriangle, CheckCircle, FileText, Star,
  ShieldAlert, Trash2, XCircle, Zap, ScrollText, RefreshCw,
  TrendingDown, TrendingUp, Clock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

const TAB_OPTIONS = ['Reports', 'Users', 'Audit Log'] as const;
type Tab = typeof TAB_OPTIONS[number];

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const { addToast } = useAppStore();
  const [tab, setTab] = useState<Tab>('Reports');
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [xpInputs, setXpInputs] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [userData, reportData, auditData] = await Promise.all([
      supabase.from('users').select('*').order('xp', { ascending: false }),
      supabase.from('daily_reports').select('*, users(email)').order('created_at', { ascending: false }).limit(20),
      supabase.from('audit_logs').select('*, admin:users!admin_id(email), target:users!target_user_id(email)').order('created_at', { ascending: false }).limit(50),
    ]);
    setUsers(userData.data || []);
    setReports(reportData.data || []);
    setAuditLogs(auditData.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const logAction = async (action: string, targetId: string, details: object) => {
    await supabase.from('audit_logs').insert({
      admin_id: profile?.id,
      action,
      target_user_id: targetId,
      details,
    });
  };

  const handleApproveReport = async (report: any) => {
    const { error } = await supabase
      .from('daily_reports')
      .update({ status: 'approved', reviewed_by: profile?.id })
      .eq('id', report.id);
    if (!error) {
      await logAction('approve_report', report.user_id, { report_id: report.id });
      addToast('Report approved', 'success');
      fetchData();
    }
  };

  const handleRejectReport = async (report: any) => {
    const reason = prompt('Enter rejection reason (will be visible to user):');
    if (!reason) return;
    const { error } = await supabase
      .from('daily_reports')
      .update({ status: 'rejected', flagged_reason: reason, reviewed_by: profile?.id })
      .eq('id', report.id);
    if (!error) {
      // Deduct XP penalty
      const user = users.find(u => u.id === report.user_id);
      if (user) {
        await supabase.from('users').update({ xp: Math.max(0, user.xp - 10) }).eq('id', report.user_id);
      }
      await logAction('reject_report', report.user_id, { report_id: report.id, reason, xp_deducted: 10 });
      addToast('Report rejected — 10 XP deducted', 'error');
      fetchData();
    }
  };

  const handleAdjustXp = async (userId: string, delta: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newXp = Math.max(0, user.xp + delta);
    const { error } = await supabase.from('users').update({ xp: newXp }).eq('id', userId);
    if (!error) {
      await logAction('manual_xp_adjust', userId, { delta, old_xp: user.xp, new_xp: newXp });
      addToast(`XP ${delta > 0 ? '+' : ''}${delta} applied`, 'success');
      fetchData();
    }
  };

  const handleIssueWarning = async (userId: string) => {
    const reason = prompt('Warning reason:');
    if (!reason) return;
    const user = users.find(u => u.id === userId);
    await supabase.from('warnings').insert({ user_id: userId, issued_by: profile?.id, reason, severity: 'medium' });
    await supabase.from('users').update({ trust_score: Math.max(0, (user?.trust_score || 50) - 10) }).eq('id', userId);
    await logAction('issue_warning', userId, { reason, trust_penalty: 10 });
    addToast('Warning issued — trust score -10', 'success');
    fetchData();
  };

  const handleRunDecay = async () => {
    const { error } = await supabase.rpc('apply_inactivity_decay');
    if (!error) { addToast('Inactivity decay applied', 'success'); fetchData(); }
    else addToast('Decay failed: ' + error.message, 'error');
  };

  // ── Access Gate ───────────────────────────────────────────────────────
  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center p-6">
        <div className="space-y-4">
          <ShieldAlert size={64} className="mx-auto text-red-500/50" />
          <h2 className="text-2xl font-black text-white">Access Restricted</h2>
          <p className="text-gray-500 max-w-sm">Reserved for the Council of Admins.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const pendingReports = reports.filter(r => r.status === 'pending' || !r.status);
  const approvedReports = reports.filter(r => r.status === 'approved');
  const rejectedReports = reports.filter(r => r.status === 'rejected');

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldAlert className="text-purple-500" size={30} /> Admin Nexus
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">System moderation & control</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleRunDecay} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-black uppercase tracking-widest transition-all">
            <TrendingDown size={14} /> Run Decay
          </button>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 text-xs font-black uppercase tracking-widest transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Users },
          { label: 'Pending', value: pendingReports.length, color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Clock },
          { label: 'Approved', value: approvedReports.length, color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle },
          { label: 'Rejected', value: rejectedReports.length, color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-white/10 rounded-2xl p-5`}>
            <s.icon size={16} className={s.color} />
            <p className={`text-2xl font-black mt-2 ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {TAB_OPTIONS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-t-xl transition-all ${
              tab === t
                ? 'bg-white/10 text-white border border-white/10 border-b-transparent'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <>
          {/* Reports Tab */}
          {tab === 'Reports' && (
            <div className="space-y-3">
              {reports.length === 0 && <p className="text-gray-600 text-center py-10">No reports yet</p>}
              {reports.map(r => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white/5 border rounded-2xl p-5 space-y-3 ${
                    r.status === 'approved' ? 'border-green-500/20'
                    : r.status === 'rejected' ? 'border-red-500/20'
                    : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{r.users?.email?.split('@')[0]}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          r.status === 'approved' ? 'bg-green-500/15 text-green-400'
                          : r.status === 'rejected' ? 'bg-red-500/15 text-red-400'
                          : 'bg-yellow-500/15 text-yellow-400'
                        }`}>{r.status || 'pending'}</span>
                        <span className="text-[9px] text-gray-600 font-bold">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 font-bold">{r.topic}</p>
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">{r.progress_summary}</p>
                      {r.flagged_reason && (
                        <p className="text-xs text-red-400 mt-1 font-bold">⚠ {r.flagged_reason}</p>
                      )}
                    </div>
                  </div>
                  {(!r.status || r.status === 'pending') && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveReport(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
                      >
                        <CheckCircle size={11} /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectReport(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                      >
                        <XCircle size={11} /> Reject
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Users Tab */}
          {tab === 'Users' && (
            <div className="space-y-3">
              {users.map(u => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 flex-wrap"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center font-black text-white shrink-0">
                    {u.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{u.email.split('@')[0]}</p>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{u.role} · {u.xp} XP · Trust: {u.trust_score}</p>
                  </div>
                  {/* Manual XP */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="±XP"
                      value={xpInputs[u.id] || ''}
                      onChange={e => setXpInputs(prev => ({ ...prev, [u.id]: e.target.value }))}
                      className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500/50"
                    />
                    <button
                      onClick={() => {
                        const delta = parseInt(xpInputs[u.id] || '0');
                        if (delta !== 0) { handleAdjustXp(u.id, delta); setXpInputs(prev => ({ ...prev, [u.id]: '' })); }
                      }}
                      className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
                      title="Apply XP"
                    >
                      <Zap size={14} />
                    </button>
                    <button
                      onClick={() => handleIssueWarning(u.id)}
                      className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-all"
                      title="Issue Warning"
                    >
                      <AlertTriangle size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Audit Log Tab */}
          {tab === 'Audit Log' && (
            <div className="space-y-2">
              {auditLogs.length === 0 && <p className="text-gray-600 text-center py-10">No audit logs yet</p>}
              {auditLogs.map(log => (
                <div key={log.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-start gap-3">
                  <ScrollText size={14} className="text-gray-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-amber-400 uppercase">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-gray-600">by {log.admin?.email?.split('@')[0] || 'system'}</span>
                      <span className="text-[10px] text-gray-600">→ {log.target?.email?.split('@')[0]}</span>
                    </div>
                    {log.details && <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{JSON.stringify(log.details)}</p>}
                  </div>
                  <span className="text-[9px] text-gray-700 shrink-0">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
