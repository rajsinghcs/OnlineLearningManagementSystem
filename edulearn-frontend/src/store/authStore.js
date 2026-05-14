import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (token, userData) => {
        localStorage.setItem('jwtToken', token);
        set({
          token,
          user: userData,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      getRole: () => {
        const { token } = get();
        if (!token) return null;
        try {
          const decoded = jwtDecode(token);
          return decoded.role;
        } catch {
          return null;
        }
      },

      getUserId: () => {
        const { user } = get();
        return user?.userId;
      },

      setUser: (userData) => {
        set({ user: userData });
      },

      isStudent: () => get().getRole() === 'STUDENT',
      isInstructor: () => get().getRole() === 'INSTRUCTOR',
      isAdmin: () => get().getRole() === 'ADMIN',
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
