import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  updateProfile: (updates) => set((state) => ({ 
    profile: state.profile ? { ...state.profile, ...updates } : null 
  })),
  logout: () => set({ user: null, profile: null, isLoading: false }),
}));
