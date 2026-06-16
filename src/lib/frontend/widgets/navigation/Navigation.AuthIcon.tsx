"use client";

import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";

export function NavigationAuthIcon() {
  const { user, openLoginModal, openSignOutConfirm } = useAuthStore();

  return (
    <button
      onClick={user ? openSignOutConfirm : openLoginModal}
      className="relative shrink-0 cursor-pointer p-1"
      aria-label={user ? "Sign out" : "Sign in"}
    >
      <img
        src={user ? "/logos/dnl-logo--green.png" : "/logos/dnl-logo--white.png"}
        alt="Auth"
        className="h-6 w-8 rounded-full"
      />
      <span
        className={`absolute right-0.5 bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-gray-950 ${user ? "bg-green-500" : "bg-gray-500"}`}
      />
    </button>
  );
}
