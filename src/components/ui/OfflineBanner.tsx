import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-red-500 text-white py-2 px-4 flex items-center justify-center gap-3 shadow-lg"
        >
          <WifiOff size={18} className="animate-pulse" />
          <p className="text-sm font-black uppercase tracking-widest">
            Network Disconnected. <span className="font-medium opacity-80">Check your connection.</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
