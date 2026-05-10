import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, LogOut, User, Bell, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (logoClicks === 3) {
      if (profile?.role === 'admin') {
        navigate('/admin');
      }
      setLogoClicks(0);
    }
    const timer = setTimeout(() => setLogoClicks(0), 2000);
    return () => clearTimeout(timer);
  }, [logoClicks, profile, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: ShieldCheck });
  }

  const isActive = (path: string) => location.pathname === path;

  const mockNotifications = [
    { id: 1, title: 'XP Awarded!', text: 'You earned +50 XP for Daily Report', type: 'success', time: '2m ago' },
    { id: 2, title: 'New Skill Badge', text: 'Unlocked React Apprentice', type: 'info', time: '1h ago' },
    { id: 3, title: 'System Warning', text: 'Resource shared was flagged', type: 'warning', time: '1d ago' },
  ];

  return (
    <>
      <nav 
        className={`hidden md:flex fixed top-0 left-0 right-0 h-20 z-50 transition-all duration-500 items-center justify-between px-8 ${
          isScrolled 
            ? 'bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 py-4' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="flex items-center gap-12">
          <div 
            onClick={() => {
              setLogoClicks(prev => prev + 1);
              if (location.pathname !== '/') navigate('/');
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
              <LayoutDashboard size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              Progress<span className="text-blue-500">Tracker</span>
            </span>
          </div>
          
          <div className="flex items-center p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isActive(item.path)
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {isActive(item.path) && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <item.icon size={16} className="relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Notification Button */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl border transition-all group ${
                showNotifications ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
               <Bell size={20} />
               {!showNotifications && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#09090b]" />}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bg-[#121214] border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl"
                >
                  <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-black text-white uppercase tracking-widest text-xs">Notifications</h3>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">3 New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.map(n => (
                      <div key={n.id} className="p-4 flex gap-4 hover:bg-white/[0.03] transition-colors border-b border-white/5 cursor-pointer group">
                        <div className={`p-2 rounded-xl h-fit ${
                          n.type === 'success' ? 'bg-green-500/10 text-green-500' : 
                          n.type === 'warning' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {n.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{n.title}</p>
                          <p className="text-[10px] text-gray-500 leading-relaxed">{n.text}</p>
                          <p className="text-[10px] text-gray-700 font-black uppercase tracking-tighter pt-1">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 text-center">
                    <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Mark all as read</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="text-right">
              <p className="text-sm font-black text-white">{profile?.email?.split('@')[0]}</p>
              <div className="flex items-center justify-end gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{profile?.role}</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-inner group cursor-pointer hover:border-blue-500/50 transition-all">
               <User size={24} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
            </div>
            <button 
              onClick={handleSignOut}
              className="p-3 rounded-2xl bg-red-500/10 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar remains same but with Admin added to navItems dynamically */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] z-50 flex items-center justify-around px-4 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1.5 w-16 transition-all ${
                active ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-all relative ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 -translate-y-2' : 'hover:bg-white/5'}`}>
                <Icon size={24} />
              </div>
              {!active && <span className="text-[10px] font-black uppercase tracking-tighter">{item.name}</span>}
            </Link>
          );
        })}
        <button 
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center gap-1.5 w-16 text-gray-500"
        >
          <div className="p-3 rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter">Exit</span>
        </button>
      </nav>

      {/* Mobile Header (Brand Only) */}
      <div className="md:hidden flex items-center justify-between p-6 bg-transparent">
        <div 
          onClick={() => {
            setLogoClicks(prev => prev + 1);
            if (location.pathname !== '/') navigate('/');
          }}
          className="cursor-pointer"
        >
          <span className="text-xl font-black tracking-tighter text-white">
            Progress<span className="text-blue-500">Tracker</span>
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <User size={20} className="text-gray-400" />
        </div>
      </div>
    </>
  );
};
