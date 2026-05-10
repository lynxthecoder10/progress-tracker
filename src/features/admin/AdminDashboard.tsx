import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, AlertTriangle, CheckCircle, FileText, Star, Trophy, ShieldAlert, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    // Fetch users
    const { data: userData } = await supabase.from('users').select('*').order('xp', { ascending: false });
    // Fetch recent reports
    const { data: reportData } = await supabase.from('daily_reports').select('*, users(email)').order('created_at', { ascending: false }).limit(10);
    
    setUsers(userData || []);
    setReports(reportData || []);
    setLoading(false);
  };

  const handleIssueWarning = async (userId: string) => {
    const reason = prompt("Enter reason for warning:");
    if (!reason) return;

    const { error } = await supabase.from('warnings').insert({
      user_id: userId,
      issued_by: profile?.id,
      reason: reason,
      severity: 'medium'
    });

    if (!error) {
      // Reduce trust score
      const user = users.find(u => u.id === userId);
      await supabase.from('users').update({ trust_score: Math.max(0, (user.trust_score || 50) - 10) }).eq('id', userId);
      alert("Warning issued and trust score reduced!");
      fetchAdminData();
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    const { error } = await supabase.from('resources').delete().eq('id', resourceId);
    if (!error) alert("Resource deleted!");
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center p-6">
        <div className="space-y-4">
           <ShieldAlert size={64} className="mx-auto text-red-500/50" />
           <h2 className="text-2xl font-black text-white">Access Restricted</h2>
           <p className="text-gray-500 max-w-sm">This area is reserved for the Council of Admins. If you believe this is an error, contact the system administrator.</p>
           <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-10 min-h-screen">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-4">
            <Users className="text-purple-500" size={36} /> Admin Nexus
          </h1>
          <p className="text-gray-500 font-medium">Global system control and moderation.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl" onClick={fetchAdminData}>Refresh Data</Button>
        </div>
      </header>

      {/* Admin Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20">
          <h3 className="text-xs font-black uppercase tracking-widest text-purple-400">Total Users</h3>
          <p className="text-3xl font-black text-white mt-2">{users.length}</p>
        </div>
        <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-400">Active Warnings</h3>
          <p className="text-3xl font-black text-white mt-2">12</p>
        </div>
        <div className="p-6 rounded-3xl bg-green-500/10 border border-green-500/20">
          <h3 className="text-xs font-black uppercase tracking-widest text-green-400">Pending Reviews</h3>
          <p className="text-3xl font-black text-white mt-2">{reports.length}</p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* User Management */}
        <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-xl flex items-center gap-3">
              <Users size={20} className="text-blue-500" /> User Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {users.map(u => (
                <div key={u.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-gray-400">
                      {u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{u.email.split('@')[0]}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{u.role} • {u.xp} XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleIssueWarning(u.id)}
                      className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-all"
                      title="Issue Warning"
                    >
                      <AlertTriangle size={18} />
                    </button>
                    <button 
                      className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                      title="Endorse User"
                    >
                      <Star size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports Moderation */}
        <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-xl flex items-center gap-3">
              <FileText size={20} className="text-purple-500" /> Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {reports.map(r => (
                <div key={r.id} className="p-6 space-y-3 hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-300">{r.users?.email?.split('@')[0]}</p>
                    <span className="text-[10px] font-black text-gray-600">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-white font-medium line-clamp-2">{r.progress_summary}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={12} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
