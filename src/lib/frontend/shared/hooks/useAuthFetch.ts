"use client";

import { useAuthStore } from "@/src/lib/frontend/shared/auth/auth.store";

export function useAuthFetch() {
  const { session } = useAuthStore();

  const authHeaders = (): Record<string, string> =>
    session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {};

  const authJsonFetch = (url: string, method: string, body: object) =>
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    });

  const authDelete = (url: string) =>
    fetch(url, { method: "DELETE", headers: authHeaders() });

  return { authHeaders, authJsonFetch, authDelete };
}
