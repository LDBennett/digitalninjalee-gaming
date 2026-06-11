"use client";

import { useAuthStore } from "@/src/lib/frontend/shared/auth/auth.store";
import { signOut } from "@/src/lib/frontend/shared/auth/auth.init";
import { Button } from "@/src/lib/frontend/shared/ui/Button";

export function SignOutConfirmModal() {
  const { showSignOutConfirm, closeSignOutConfirm } = useAuthStore();

  if (!showSignOutConfirm) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={closeSignOutConfirm}
    >
      <div
        className="w-72 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-base font-semibold text-white">Sign out?</h2>
        <p className="mb-5 text-xs text-gray-500">
          You'll be switched to read-only mode.
        </p>
        <div className="flex gap-2">
          <Button
            variant="gray"
            onClick={closeSignOutConfirm}
            className="flex-1 font-medium"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              signOut();
              closeSignOutConfirm();
            }}
            className="flex-1 font-medium"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
