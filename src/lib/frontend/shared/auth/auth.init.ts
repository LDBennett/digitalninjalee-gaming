'use client';

import { getBrowserClient } from '@/src/lib/infrastructure/supabase/supabaseClient';
import { useAuthStore } from '@/src/lib/frontend/shared/auth/auth.store';
import { AuthError } from '@supabase/supabase-js';

export function signIn(email: string, password: string): Promise<AuthError | null> {
  return getBrowserClient().auth.signInWithPassword({ email, password }).then(({ error }) => error);
}

export function signOut(): Promise<void> {
  return getBrowserClient().auth.signOut().then(() => undefined);
}

export function initAuth(): void {
  if (typeof window === 'undefined') return;

  const supabase = getBrowserClient();

  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.setState({ session, user: session?.user ?? null, authLoading: false });
  });

  supabase.auth.onAuthStateChange((_, session) => {
    useAuthStore.setState({ session, user: session?.user ?? null });
  });
}
