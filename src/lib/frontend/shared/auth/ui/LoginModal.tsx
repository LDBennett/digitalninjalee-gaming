"use client";

import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useAuthStore } from "@/src/lib/frontend/shared/auth/auth.store";
import { signIn } from "@/src/lib/frontend/shared/auth/auth.init";
import { Button } from "@/src/lib/frontend/shared/ui/Button";
import { Input } from "@/src/lib/frontend/shared/ui/Input";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function LoginModal() {
  const { showLoginModal, closeLoginModal } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const resetTurnstile = () => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  const handleClose = () => {
    resetTurnstile();
    closeLoginModal();
  };

  const handleSignIn = async () => {
    if (!turnstileToken) return;

    setLoading(true);
    setError(null);

    const verifyRes = await fetch("/api/auth/verify-turnstile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: turnstileToken }),
    });

    if (!verifyRes.ok) {
      setError("Human verification failed. Please try again.");
      setLoading(false);
      resetTurnstile();
      return;
    }

    const authErr = await signIn(email, password);
    setLoading(false);

    if (authErr) {
      setError(authErr.message);
      resetTurnstile();
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
      onClick={handleClose}
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
          {SITE_KEY && (
            <Turnstile
              ref={turnstileRef}
              siteKey={SITE_KEY}
              onSuccess={setTurnstileToken}
              onError={resetTurnstile}
              onExpire={resetTurnstile}
              options={{ theme: "dark", size: "invisible" }}
            />
          )}
          <Button
            variant="brand"
            onClick={handleSignIn}
            disabled={
              loading || !email || !password || (!!SITE_KEY && !turnstileToken)
            }
            fullWidth
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
}
