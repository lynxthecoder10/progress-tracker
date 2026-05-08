import { create } from "zustand";
import type { ViewId } from "../types";

type AppState = {
  activeView: ViewId;
  sidebarOpen: boolean;
  demoUserId: string;
  setActiveView: (view: ViewId) => void;
  setSidebarOpen: (open: boolean) => void;
  setDemoUserId: (userId: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeView: "dashboard",
  sidebarOpen: false,
  demoUserId: "demo-admin",
  setActiveView: (activeView) => set({ activeView, sidebarOpen: false }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setDemoUserId: (demoUserId) => set({ demoUserId })
}));
