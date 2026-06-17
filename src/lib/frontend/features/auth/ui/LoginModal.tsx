"use client";

import { useState } from "react";
import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";
import { signIn } from "@/src/lib/frontend/shared/lib/auth.init";
import { Button, Input, Modal } from "@/src/lib/frontend/shared";

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

  return (
    <Modal isOpen={showLoginModal} onClose={closeLoginModal} title="Sign in" maxWidth="max-w-xs">
      <div className="p-5">
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
    </Modal>
  );
}
