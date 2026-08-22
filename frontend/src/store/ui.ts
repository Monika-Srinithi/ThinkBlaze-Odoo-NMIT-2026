import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  notifications: any[];
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  theme: string;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  notifications: [],
  addNotification: (notification) => set((state) => ({ 
    notifications: [...state.notifications, { ...notification, id: Date.now().toString() }] 
  })),
  removeNotification: (id) => set((state) => ({ 
    notifications: state.notifications.filter(n => n.id !== id) 
  })),
  theme: 'dark'
}));
