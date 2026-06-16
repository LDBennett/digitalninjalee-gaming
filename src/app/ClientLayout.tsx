"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initAuth } from "@/src/lib/frontend/shared/lib/auth.init";
import { LoginModal, SignOutConfirmModal } from "@/src/lib/frontend/features/auth";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <LoginModal />
      <SignOutConfirmModal />
    </QueryClientProvider>
  );
}
