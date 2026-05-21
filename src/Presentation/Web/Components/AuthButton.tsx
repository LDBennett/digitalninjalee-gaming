'use client';

import { useState } from 'react';
import { useAuth } from '@/src/Presentation/Web/Context/AuthContext';

export function AuthButton() {
  const { user, signIn, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    const err = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setShowModal(false);
      setEmail('');
      setPassword('');
    }
  };

  if (user) {
    return (
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-gray-400 truncate min-w-0">{user.email}</p>
        <button
          onClick={signOut}
          className="text-xs text-gray-600 hover:text-red-400 transition-colors ml-2 shrink-0"
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
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
      >
        <span className="text-base">🔒</span>
        Sign in
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-80 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white font-semibold text-base mb-1">Sign in</h2>
            <p className="text-xs text-gray-500 mb-4">Game Vault is personal — sign in to make changes.</p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                onClick={handleSignIn}
                disabled={loading || !email || !password}
                className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
