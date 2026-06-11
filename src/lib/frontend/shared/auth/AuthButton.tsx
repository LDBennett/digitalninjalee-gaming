"use client";

import { useAuthStore } from "@/src/lib/frontend/shared/auth/auth.store";

export function AuthButton() {
  const { user, openLoginModal, openSignOutConfirm } = useAuthStore();

  if (user) {
    return (
      <div className="flex items-center justify-center px-2">
        <button
          onClick={openSignOutConfirm}
          className="me-2 ml-2 shrink-0 cursor-pointer text-xs text-gray-600 transition-colors hover:text-red-400"
        >
          <img
            src="/logos/dnl-logo--green.png"
            alt="DigitalNinjaLee Online Avatar - Signed In"
            className="h-6 w-8 rounded-full"
          />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-2">
      <button
        onClick={openLoginModal}
        className="me-2 ml-2 shrink-0 cursor-pointer text-xs text-gray-600 transition-colors hover:text-red-400"
      >
        <img
          src="/logos/dnl-logo--white.png"
          alt="DigitalNinjaLee Online Avatar - Signed Out"
          className="h-6 w-8 rounded-full"
        />
      </button>
    </div>
  );
}
