"use client";

import { useState } from "react";
import { useAuth } from "@/src/domains/shared/auth/AuthContext";

export function AuthButton() {
  const { user, signIn, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
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
        <img
          src="https://images-eds-ssl.xboxlive.com/image?url=wHwbXKif8cus8csoZ03RW_ES.ojiJijNBGRVUbTnZKsoCCCkjlsEJrrMqDkYqs3MSJhlEBWRNuWCxTi.JiW.1ZWH7Om3GGt1Uv_TzNngw8ZpADcNfCT0vVQYRHG56GKGWP1IzAm.2WGw16Y6RZVdZeZYYAI4OL6yr8yuLn5WfTA-&format=jpg&w=200&h=200"
          alt="DigitalNinjaLee Online Avatar"
          className="rounded-full w-5 h-5"
        />
        <button
          onClick={signOut}
          className="ml-2 text-gray-600 hover:text-red-400 text-xs transition-colors shrink-0"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-3 hover:bg-gray-800 px-3 py-2.5 rounded-lg w-full font-medium text-gray-400 hover:text-white text-sm transition-all"
      >
        <img
          src="https://images-eds-ssl.xboxlive.com/image?url=wHwbXKif8cus8csoZ03RW_ES.ojiJijNBGRVUbTnZKsoCCCkjlsEJrrMqDkYqs3MSJhlEBWRNuWCxTi.JiW.1ZWH7Om3GGt1Uv_TzNngw8ZpADcNfCT0vVQYRHG56GKGWP1IzAm.2WGw16Y6RZVdZeZYYAI4OL6yr8yuLn5WfTA-&format=jpg&w=200&h=200"
          alt="DigitalNinjaLee Online Avatar"
          className="rounded-full w-5 h-5"
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
                className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-purple-600 rounded-lg focus:outline-none w-full text-white text-sm placeholder-gray-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-purple-600 rounded-lg focus:outline-none w-full text-white text-sm placeholder-gray-500"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                onClick={handleSignIn}
                disabled={loading || !email || !password}
                className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 px-3 py-2 rounded-lg w-full font-semibold text-white text-sm transition-colors disabled:cursor-not-allowed"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
