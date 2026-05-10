import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DailyReportForm } from './features/reports/DailyReportForm';
import { WeeklyReportForm } from './features/reports/WeeklyReportForm';
import { ResourcesPage } from './features/resources/ResourcesPage';
import { ToastContainer } from './components/ui/Toast';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const envError = !supabaseUrl || !supabaseUrl.startsWith('http');

  useEffect(() => {
    if (envError) {
      setLoading(false);
      return;
    }
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (!error && data) {
      setProfile(data as any);
    }
    setLoading(false);
  };

  if (envError) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-[#09090b] text-white p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Error</h1>
        <p className="max-w-md text-gray-400 mb-6">
          The Supabase environment variables are missing. Please add <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> to your Netlify settings and redeploy.
        </p>
        <div className="bg-white/5 p-4 rounded border border-white/10 text-left text-xs font-mono">
          URL: {import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing'}<br/>
          Key: {(import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ? 'Present (Hidden)' : 'Missing'}
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><DailyReportForm /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
