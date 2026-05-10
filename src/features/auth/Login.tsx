import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';

export const Login: React.FC = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in and profile is loaded
  React.useEffect(() => {
    if (user && profile) {
      navigate('/');
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // The onAuthStateChange in App.tsx will handle the state update
      // but we can trigger a manual navigation to speed things up
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-white p-4 relative overflow-hidden">
      {/* Decorative background elements for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
      
      <Card className="w-full max-w-md z-10 border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-white">ProgressTracker</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to your team account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autocomplete="email"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autocomplete="current-password"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <Button type="submit" className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
