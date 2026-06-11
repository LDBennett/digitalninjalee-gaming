"use client";

import { useState } from "react";
import { useAuthStore } from "@/src/lib/frontend/shared/auth/auth.store";
import { signIn } from "@/src/lib/frontend/shared/auth/auth.init";
import { Button } from "@/src/lib/frontend/shared/ui/Button";
import { Input } from "@/src/lib/frontend/shared/ui/Input";

export function LoginModal() {
  const { showLoginModal, closeLoginModal } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    const authErr = await signIn(email, password);
    setLoading(false);
    if (authErr) {
      setError(authErr.message);
    } else {
      closeLoginModal();
      setEmail("");
      setPassword("");
    }
  };

  if (!showLoginModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={closeLoginModal}
    >
      <div
        className="w-80 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-base font-semibold text-white">Sign in</h2>
        <p className="mb-4 text-xs text-gray-500">
          Game Vault is personal — sign in to make changes.
        </p>
        <div className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            error={error ?? undefined}
            fullWidth
          />
          <Button
            variant="brand"
            onClick={handleSignIn}
            disabled={loading || !email || !password}
            fullWidth
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
}
