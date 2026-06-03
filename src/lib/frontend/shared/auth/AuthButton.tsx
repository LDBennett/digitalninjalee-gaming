"use client";

import { useState } from "react";
import { useAuthStore } from "@/src/lib/frontend/shared/auth/auth.store";
import { signIn, signOut } from "@/src/lib/frontend/shared/auth/auth.init";
import { Button } from "@/src/lib/frontend/shared/ui/Button";
import { Input } from "@/src/lib/frontend/shared/ui/Input";

export function AuthButton() {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
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
      setShowModal(false);
      setEmail("");
      setPassword("");
    }
  };

  if (user) {
    return (
      <div className="flex items-center justify-center px-2">
        <button
          onClick={() => setShowSignOutConfirm(true)}
          className="me-2 ml-2 shrink-0 cursor-pointer text-xs text-gray-600 transition-colors hover:text-red-400"
        >
          <img
            src="/logos/dnl-logo--green.png"
            alt="DigitalNinjaLee Online Avatar - Signed In"
            className="h-6 w-8 rounded-full"
          />
        </button>

        {showSignOutConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setShowSignOutConfirm(false)}
          >
            <div
              className="w-72 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-1 text-base font-semibold text-white">
                Sign out?
              </h2>
              <p className="mb-5 text-xs text-gray-500">
                You&apos;ll be switched to read-only mode.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="gray"
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    signOut();
                    setShowSignOutConfirm(false);
                  }}
                  className="flex-1 font-medium"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-2">
      <button
        onClick={() => setShowModal(true)}
        className="me-2 ml-2 shrink-0 cursor-pointer text-xs text-gray-600 transition-colors hover:text-red-400"
      >
        <img
          src="/logos/dnl-logo--white.png"
          alt="DigitalNinjaLee Online Avatar - Signed Out"
          className="h-6 w-8 rounded-full"
        />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowModal(false)}
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
      )}
    </div>
  );
}
