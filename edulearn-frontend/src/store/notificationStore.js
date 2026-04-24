import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  unreadCount: 0,
  notifications: [],

  setUnreadCount: (count) => set({ unreadCount: count }),
  setNotifications: (notifications) => set({ notifications }),
  decrementUnread: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  clearUnread: () => set({ unreadCount: 0 }),
}));

export default useNotificationStore;
