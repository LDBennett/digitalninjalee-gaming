import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  authLoading: boolean;
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  session: null,
  authLoading: true,
}));
