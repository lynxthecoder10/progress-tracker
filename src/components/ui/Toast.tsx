import React, { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: { id: string; message: string; type: 'success' | 'error' }; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(onRemove, 3000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md min-w-[250px] ${
        toast.type === 'success' 
          ? 'bg-green-500/20 border-green-500/50 text-green-400' 
          : 'bg-red-500/20 border-red-500/50 text-red-400'
      }`}
    >
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">{toast.message}</p>
        <button onClick={onRemove} className="ml-4 opacity-50 hover:opacity-100">✕</button>
      </div>
    </motion.div>
  );
};
