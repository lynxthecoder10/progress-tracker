import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, PlusSquare, MoreVertical, Hammer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If iOS, we always show the install button because we can't trigger the prompt
    if (/iphone|ipad|ipod/.test(userAgent) && !window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(true);
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  if (!showInstall) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative"
        >
          <button
            onClick={handleInstallClick}
            className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-2xl transition-all shadow-xl"
          >
            <div className="p-2 bg-amber-500 rounded-lg group-hover:scale-110 transition-transform">
               <Download size={18} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-white uppercase tracking-wider">Install App</p>
              <p className="text-[10px] text-gray-400 font-bold">Fast access on Home Screen</p>
            </div>
          </button>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-[#121214] border border-white/10 rounded-[2.5rem] p-8 relative shadow-2xl"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>

              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                  <Smartphone className="text-amber-500" size={32} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">How to Install</h3>
                  <p className="text-gray-400 text-sm font-medium">Follow these steps to add RankForge to your home screen.</p>
                </div>

                <div className="space-y-4 text-left">
                  {platform === 'ios' ? (
                    <>
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <Share size={20} className="text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-200">Tap the <span className="font-bold text-white">Share</span> button in Safari</p>
                      </div>
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <PlusSquare size={20} className="text-green-500" />
                        </div>
                        <p className="text-sm text-gray-200">Scroll down and tap <span className="font-bold text-white">"Add to Home Screen"</span></p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <MoreVertical size={20} className="text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-200">Tap the <span className="font-bold text-white">Menu</span> icon (three dots)</p>
                      </div>
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <Download size={20} className="text-green-500" />
                        </div>
                        <p className="text-sm text-gray-200">Tap <span className="font-bold text-white">"Install App"</span> or "Add to Home Screen"</p>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
