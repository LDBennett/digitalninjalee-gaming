"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";
import { Button } from "@/src/lib/frontend/shared";

export function NavigationAuthStatus() {
  const { user, openLoginModal, openSignOutConfirm } = useAuthStore();
  const [hovered, setHovered] = useState(false);

  if (user) {
    return (
      <motion.button
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={openSignOutConfirm}
        animate={{ width: hovered ? 120 : 36 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="flex h-9 cursor-pointer items-center overflow-hidden rounded-full bg-gray-800 hover:bg-gray-700"
        aria-label="Signed in — click to sign out"
      >
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
          <img
            src="/logos/dnl-logo--green.png"
            alt=""
            className="h-6 w-8 rounded-full"
          />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full border-2 border-gray-800 bg-green-500" />
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="pr-3 text-xs whitespace-nowrap text-gray-300"
            >
              Logged In
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/40 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-gray-500" />
        <span className="text-sm text-gray-400">Guest</span>
      </div>
      <Button size="xs" variant="brand" onClick={openLoginModal}>
        Sign in
      </Button>
    </div>
  );
}
