"use client";

import { Ghost, LogIn } from "lucide-react";
import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";

export function NavigationAuthStatus() {
  const { user, openLoginModal, openSignOutConfirm } = useAuthStore();

  if (user) {
    return (
      <button
        onClick={openSignOutConfirm}
        className="mx-auto block cursor-pointer"
        title="Sign out"
        aria-label="Sign out"
      >
        <span className="block h-2 w-2 rounded-full bg-green-500" />
      </button>
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
