"use client";

import { getBrowserClient } from "@/src/lib/infrastructure/supabase/supabaseClient";
import { useAuthStore } from "@/src/lib/frontend/shared/auth/auth.store";
import { AuthError } from "@supabase/supabase-js";

export async function signIn(
  email: string,
  password: string,
): Promise<AuthError | null> {
  const { error } = await getBrowserClient().auth.signInWithPassword({
    email,
    password,
  });
  return error;
}

export async function signOut(): Promise<void> {
  await getBrowserClient().auth.signOut();
  return undefined;
}

export function initAuth(): void {
  if (typeof window === "undefined") return;

  const supabase = getBrowserClient();

  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.setState({
      session,
      user: session?.user ?? null,
      authLoading: false,
    });
  });

  supabase.auth.onAuthStateChange((_, session) => {
    useAuthStore.setState({ session, user: session?.user ?? null });
  });
}
