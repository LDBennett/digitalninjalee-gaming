'use client';

import { AuthProvider } from '@/src/domains/shared/auth/AuthContext';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
