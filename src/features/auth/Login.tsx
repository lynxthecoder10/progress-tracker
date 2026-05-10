import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { OfflineBanner } from '../../components/ui/OfflineBanner';
import { Zap } from 'lucide-react';

export const Login: React.FC = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess('Registration successful! Please check your email for confirmation.');
      setLoading(false);
      // Wait a bit then switch to login
      setTimeout(() => setIsRegistering(false), 3000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-white p-4 relative overflow-hidden">
      <OfflineBanner />
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
      
      <Card className="w-full max-w-md z-10 border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            Rank<span className="text-purple-500">Chaser</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isRegistering ? 'Create your team account' : 'Sign in to your team account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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
                autoComplete={isRegistering ? "new-password" : "current-password"}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            {success && <p className="text-sm text-green-500 font-medium">{success}</p>}
            
            <Button type="submit" className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? (isRegistering ? 'Registering...' : 'Signing in...') : (isRegistering ? 'Register' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccess('');
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
