import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleMobileOpen: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      setCollapsed: (isCollapsed) => set({ isCollapsed }),
      toggleCollapsed: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
      setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
      toggleMobileOpen: () =>
        set((state) => ({ isMobileOpen: !state.isMobileOpen })),
    }),
    {
      name: 'rupa-sidebar',
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
      }),
    }
  )
);
