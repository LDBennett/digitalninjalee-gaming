import { create } from 'zustand';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { getBrowserClient } from '@/src/infrastructure/database/supabase.client';

interface AuthState {
  user: User | null;
  session: Session | null;
  authLoading: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>(() => ({
  user: null,
  session: null,
  authLoading: true,
  signIn: async (email, password) => {
    const { error } = await getBrowserClient().auth.signInWithPassword({ email, password });
    return error;
  },
  signOut: async () => {
    await getBrowserClient().auth.signOut();
  },
}));

if (typeof window !== 'undefined') {
  const supabase = getBrowserClient();

  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.setState({ session, user: session?.user ?? null, authLoading: false });
  });

  supabase.auth.onAuthStateChange((_, session) => {
    useAuthStore.setState({ session, user: session?.user ?? null });
  });
}
