"use client";

import { useState } from "react";
import { useAuthStore } from "@/src/lib/frontend/shared/auth/auth.store";
import { signIn, signOut } from "@/src/lib/frontend/shared/auth/auth.init";

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
      <div className="flex justify-center items-center px-2">
        <button
          onClick={() => setShowSignOutConfirm(true)}
          className="me-2 ml-2 text-gray-600 hover:text-red-400 text-xs transition-colors cursor-pointer shrink-0"
        >
          <img
            src="/logos/dnl-logo--green.png"
            alt="DigitalNinjaLee Online Avatar - Signed In"
            className="rounded-full w-8 h-6"
          />
        </button>

        {showSignOutConfirm && (
          <div
            className="z-50 fixed inset-0 flex justify-center items-center bg-black/60"
            onClick={() => setShowSignOutConfirm(false)}
          >
            <div
              className="bg-gray-900 shadow-xl p-6 border border-gray-800 rounded-xl w-72"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-1 font-semibold text-white text-base">
                Sign out?
              </h2>
              <p className="mb-5 text-gray-500 text-xs">
                You&apos;ll be switched to read-only mode.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg font-medium text-gray-300 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setShowSignOutConfirm(false);
                  }}
                  className="flex-1 bg-red-900/60 hover:bg-red-800/60 px-3 py-2 rounded-lg font-medium text-red-300 text-sm transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center px-2">
      <button
        onClick={() => setShowModal(true)}
        className="me-2 ml-2 text-gray-600 hover:text-red-400 text-xs transition-colors cursor-pointer shrink-0"
      >
        <img
          src="/logos/dnl-logo--white.png"
          alt="DigitalNinjaLee Online Avatar - Signed Out"
          className="rounded-full w-8 h-6"
        />
      </button>

      {showModal && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-black/60"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gray-900 shadow-xl p-6 border border-gray-800 rounded-xl w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 font-semibold text-white text-base">Sign in</h2>
            <p className="mb-4 text-gray-500 text-xs">
              Game Vault is personal — sign in to make changes.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm placeholder-gray-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm placeholder-gray-500"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                onClick={handleSignIn}
                disabled={loading || !email || !password}
                className="bg-brand-700 hover:bg-brand-600 disabled:opacity-50 px-3 py-2 rounded-lg w-full font-semibold text-white text-sm transition-colors disabled:cursor-not-allowed"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
