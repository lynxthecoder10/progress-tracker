import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

interface Warning {
  id: string;
  reason: string;
  severity: string;
  created_at: string;
}

export const WarningsWidget: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWarnings();
    }
  }, [user]);

  const fetchWarnings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('warnings')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWarnings(data);
    }
    setLoading(false);
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) return null; // Don't show anything while loading

  return (
    <Card className="border-white/10 bg-black/60">
      <CardHeader>
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Trust & Standing</span>
          <span className={`font-bold ${getTrustScoreColor(profile?.trust_score || 100)}`}>
            {profile?.trust_score || 100} / 100
          </span>
        </CardTitle>
        <CardDescription>Your account standing and active warnings.</CardDescription>
      </CardHeader>
      <CardContent>
        {warnings.length === 0 ? (
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
             <span className="text-lg">✓</span>
             <p className="font-medium text-sm">Your account is in excellent standing. Keep up the great work!</p>
          </div>
        ) : (
          <div className="space-y-3">
             <p className="text-sm text-destructive font-semibold">Active Warnings:</p>
             {warnings.map(warning => (
               <div key={warning.id} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex flex-col gap-1">
                 <div className="flex justify-between items-center">
                   <span className="text-xs font-bold uppercase text-red-400">{warning.severity}</span>
                   <span className="text-xs text-muted-foreground">{new Date(warning.created_at).toLocaleDateString()}</span>
                 </div>
                 <p className="text-sm text-white/90">{warning.reason}</p>
               </div>
             ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
