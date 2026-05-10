import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, FileText, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuthStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-[#09090b]/80 backdrop-blur-md border-b border-white/10 z-50 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tighter text-white">
            Progress<span className="text-blue-500">Tracker</span>
          </Link>
          
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right mr-2 hidden lg:block">
            <p className="text-sm font-medium text-white">{profile?.email?.split('@')[0]}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#09090b]/90 backdrop-blur-lg border-t border-white/10 z-50 flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-16 transition-all ${
                active ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}`}>
                <Icon size={22} />
              </div>
              <span className="text-[10px] font-medium tracking-tight">{item.name}</span>
            </Link>
          );
        })}
        <button 
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center gap-1 w-16 text-gray-500"
        >
          <div className="p-1.5 rounded-xl">
            <LogOut size={22} />
          </div>
          <span className="text-[10px] font-medium tracking-tight">Sign Out</span>
        </button>
      </nav>
    </>
  );
};
