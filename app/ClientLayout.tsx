'use client';

import { AuthProvider } from '@/src/Presentation/Web/Context/AuthContext';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
