import { create } from "zustand";
import { authAPI } from "../services/api";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  // Load user on app start
  loadUser: async () => {
    try {
      const res = await authAPI.getMe();
      set({ user: res.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  // Login
  login: async (email, password) => {
    const res = await authAPI.login(email, password);
    set({ user: res.user });
    return res;
  },

  // Signup
  signup: async (name, email, password) => {
    const res = await authAPI.signup(name, email, password);
    set({ user: res.user });
    return res;
  },

  // Logout
  logout: async () => {
    await authAPI.logout();
    set({ user: null });
  }
}));
