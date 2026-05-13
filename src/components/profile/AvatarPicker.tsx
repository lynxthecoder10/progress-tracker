import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { motion } from 'framer-motion';
import { Camera, X, Check, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

const AVATARS = {
  male: [
    { name: 'Warrior', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4' },
    { name: 'Knight', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster&backgroundColor=c0aede' },
    { name: 'Mage', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper&backgroundColor=ffdfbf' },
    { name: 'Rogue', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo&backgroundColor=d1d4f9' },
    { name: 'Paladin', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Finn&backgroundColor=ffd5dc' },
  ],
  female: [
    { name: 'Archer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Anya&backgroundColor=b6e3f4' },
    { name: 'Cleric', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sasha&backgroundColor=c0aede' },
    { name: 'Sorceress', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=ffdfbf' },
    { name: 'Assassin', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya&backgroundColor=d1d4f9' },
    { name: 'Valkyrie', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=ffd5dc' },
  ]
};

interface AvatarPickerProps {
  onClose: () => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ onClose }) => {
  const { user, profile, updateProfile } = useAuthStore();
  const { addToast } = useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(profile?.avatar_url || null);

  const handleSelectDefault = async (url: string) => {
    if (!user) return;
    setSelectedUrl(url);
    
    const { error } = await supabase
      .from('users')
      .update({ avatar_url: url })
      .eq('id', user.id);

    if (!error) {
      updateProfile({ avatar_url: url });
      addToast('Profile photo updated!', 'success');
      onClose();
    } else {
      addToast('Failed to update photo', 'error');
    }
  };

  const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('File too large (max 2MB)', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resource-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resource-files')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      updateProfile({ avatar_url: publicUrl });
      addToast('Custom photo uploaded!', 'success');
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-[#1a1a1c] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Camera className="text-purple-500" size={20} />
              Identity Selection
            </h2>
            <p className="text-xs text-gray-500 font-bold mt-0.5">Choose your avatar or upload a custom one.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
          {/* Custom Upload */}
          <div className="flex items-center justify-center">
            <label className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 group-hover:border-purple-500/50 transition-all">
                {isUploading ? (
                  <Loader2 className="text-purple-500 animate-spin" size={24} />
                ) : (
                  <>
                    <Camera className="text-gray-600 group-hover:text-purple-500 transition-colors" size={24} />
                    <span className="text-[10px] font-black uppercase text-gray-600 group-hover:text-purple-400">Custom</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleCustomUpload} disabled={isUploading} />
            </label>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 px-1">Vanguard (Male)</h3>
              <div className="grid grid-cols-5 gap-4">
                {AVATARS.male.map((avatar) => (
                  <button
                    key={avatar.seed}
                    onClick={() => handleSelectDefault(avatar.url)}
                    className={`relative group p-1 rounded-2xl border-2 transition-all ${
                      selectedUrl === avatar.url ? 'border-blue-500 bg-blue-500/10' : 'border-transparent hover:border-white/10'
                    }`}
                  >
                    <img src={avatar.url} alt={avatar.name} className="w-full h-full rounded-xl" />
                    {selectedUrl === avatar.url && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1 shadow-lg">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 whitespace-nowrap">
                      {avatar.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400 mb-4 px-1">Sentinel (Female)</h3>
              <div className="grid grid-cols-5 gap-4">
                {AVATARS.female.map((avatar) => (
                  <button
                    key={avatar.seed}
                    onClick={() => handleSelectDefault(avatar.url)}
                    className={`relative group p-1 rounded-2xl border-2 transition-all ${
                      selectedUrl === avatar.url ? 'border-pink-500 bg-pink-500/10' : 'border-transparent hover:border-white/10'
                    }`}
                  >
                    <img src={avatar.url} alt={avatar.name} className="w-full h-full rounded-xl" />
                    {selectedUrl === avatar.url && (
                      <div className="absolute -top-2 -right-2 bg-pink-500 rounded-full p-1 shadow-lg">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity text-pink-400 whitespace-nowrap">
                      {avatar.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-black/20 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </motion.div>
  );
};
