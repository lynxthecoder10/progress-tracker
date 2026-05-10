import React from 'react';
import { Navbar } from './Navbar';
import { OfflineBanner } from '../ui/OfflineBanner';
import { useAuthStore } from '../../store/authStore';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#09090b]">
      <OfflineBanner />
      <Navbar />
      <main className="md:pt-16 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
