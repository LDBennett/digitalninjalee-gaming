"use client";

import { Ghost, Shield } from "lucide-react";
import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";

export function NavigationAuthStatus() {
  const { user, openLoginModal, openSignOutConfirm } = useAuthStore();

  if (user) {
    return (
      <div className="group relative flex justify-center">
        <button
          onClick={openSignOutConfirm}
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-green-400 transition-colors hover:bg-gray-700 hover:text-green-300"
          title="Sign out"
          aria-label="Sign out"
        >
          <Shield size={15} />
          <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-gray-900 bg-green-500" />
        </button>

        <div className="pointer-events-none absolute top-1/2 left-full z-200 ml-3 flex -translate-y-1/2 cursor-pointer items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 whitespace-nowrap opacity-0 shadow-xl transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
          <Shield size={13} className="shrink-0 text-green-400" />
          <span className="text-xs font-medium text-gray-300">
            Signed in · <span className="cursor-pointer text-red-400" onClick={openSignOutConfirm}>Sign Out</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex justify-center">
      <button
        onClick={openLoginModal}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
        title="Sign in"
        aria-label="Sign in"
      >
        <Ghost size={15} />
      </button>

      <div
        onClick={openLoginModal}
        className="pointer-events-none absolute top-1/2 left-full z-200 ml-3 flex -translate-y-1/2 cursor-pointer items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 whitespace-nowrap opacity-0 shadow-xl transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100"
      >
        <Ghost size={13} className="shrink-0 text-gray-500" />
        <span className="text-xs font-medium text-gray-300">
          Ghost Mode · <span className="text-brand-400">Sign In</span>
        </span>
      </div>
    </div>
  );
}
