import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  showLoginModal: boolean;
  showSignOutConfirm: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openSignOutConfirm: () => void;
  closeSignOutConfirm: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  authLoading: true,
  showLoginModal: false,
  showSignOutConfirm: false,
  openLoginModal: () => set({ showLoginModal: true }),
  closeLoginModal: () => set({ showLoginModal: false }),
  openSignOutConfirm: () => set({ showSignOutConfirm: true }),
  closeSignOutConfirm: () => set({ showSignOutConfirm: false }),
}));
