import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  
  // Local cache to reduce DB reads for immediate feedback
  localXp: number | null;
  localStreak: number | null;
  setLocalStats: (xp: number, streak: number) => void;
  addLocalXp: (amount: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  localXp: null,
  localStreak: null,
  setLocalStats: (xp, streak) => set({ localXp: xp, localStreak: streak }),
  addLocalXp: (amount) => set((state) => ({ 
    localXp: state.localXp !== null ? state.localXp + amount : null 
  })),
}));
