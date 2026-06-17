"use client";

import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";
import { signOut } from "@/src/lib/frontend/shared/lib/auth.init";
import { Button, Modal } from "@/src/lib/frontend/shared";

export function SignOutConfirmModal() {
  const { showSignOutConfirm, closeSignOutConfirm } = useAuthStore();

  return (
    <Modal isOpen={showSignOutConfirm} onClose={closeSignOutConfirm} title="Sign out?" maxWidth="max-w-xs">
      <div className="p-5">
        <p className="mb-5 text-xs text-gray-500">
          You'll be switched to read-only mode.
        </p>
        <div className="flex gap-2">
          <Button variant="gray" onClick={closeSignOutConfirm} className="flex-1 font-medium">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => { signOut(); closeSignOutConfirm(); }}
            className="flex-1 font-medium"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </Modal>
  );
}
