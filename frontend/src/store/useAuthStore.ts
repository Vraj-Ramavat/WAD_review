import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      if (data.token) {
        localStorage.setItem('cg_access_token', data.token);
      }

      return true;
    } catch (err: any) {
      set({ error: err.message || 'Login failed', loading: false, isAuthenticated: false });
      return false;
    }
  },

  signup: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      if (data.token) {
        localStorage.setItem('cg_access_token', data.token);
      }

      return true;
    } catch (err: any) {
      set({ error: err.message || 'Signup failed', loading: false, isAuthenticated: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('cg_access_token');
    set({ user: null, token: null, isAuthenticated: false, loading: false, error: null });
  },

  checkAuth: async () => {
    const savedToken = localStorage.getItem('cg_access_token');
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/me', {
        headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false,
        });
        if (data.token) {
          localStorage.setItem('cg_access_token', data.token);
        }
      } else {
        localStorage.removeItem('cg_access_token');
        set({ user: null, token: null, isAuthenticated: false, loading: false });
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },
}));
