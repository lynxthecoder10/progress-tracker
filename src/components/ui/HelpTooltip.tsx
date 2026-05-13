import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpTooltipProps {
  title: string;
  content: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block ml-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
        aria-label="Help"
      >
        <HelpCircle size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <div 
              className="fixed inset-0 z-40 md:hidden" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute z-50 right-0 mt-2 w-72 p-6 rounded-3xl bg-[#1a1a1e] border border-white/10 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-black text-white uppercase tracking-widest text-[10px]">What is this?</h4>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <h5 className="text-sm font-bold text-blue-400 mb-2">{title}</h5>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                {content}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
