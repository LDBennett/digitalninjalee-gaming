"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameQuery } from "@/src/lib/frontend/entities/game";
import { useMoods } from "@/src/lib/frontend/features/game-actions";
import { LogPlayModal } from "@/src/lib/frontend/features/recent-activity";
import { useQuickGuideStore } from "@/src/lib/frontend/shared";
import { useShakeToOpen } from "../hooks/useShakeToOpen";
import { QuickGuideHeader } from "./QuickGuide.Header";
import { QuickGuideActions } from "./QuickGuide.Actions";
import { QuickGuideRoll } from "./QuickGuide.Roll";
import { QuickGuideLive } from "./QuickGuide.Live";
import { QuickGuideFooter } from "./QuickGuide.Footer";

export function QuickGuide() {
  const { isOpen, closeGuide, toggleGuide } = useQuickGuideStore();
  const [showLogPlay, setShowLogPlay] = useState(false);
  const { games } = useGameQuery();
  const { moods } = useMoods();

  // Attach mobile shake accelerometer listener
  useShakeToOpen();

  // Global hotkeys: [G] to toggle, [Esc] to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closeGuide();
        return;
      }

      if (e.key === "g" || e.key === "G") {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            activeEl.tagName === "SELECT" ||
            (activeEl as HTMLElement).isContentEditable)
        ) {
          return;
        }

        e.preventDefault();
        toggleGuide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeGuide, toggleGuide]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
              onClick={closeGuide}
            />

            {/* Slide-over Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              aria-label="Console Quick Guide"
              className="border-brand-500/20 absolute top-0 right-0 bottom-0 flex w-[88vw] max-w-sm flex-col border-l bg-gray-900/95 shadow-2xl shadow-black/80 backdrop-blur-xl md:w-96"
            >
              <QuickGuideHeader onClose={closeGuide} />

              {/* Scrollable content */}
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                <QuickGuideActions
                  onOpenLogPlay={() => setShowLogPlay(true)}
                  onCloseGuide={closeGuide}
                />

                <QuickGuideRoll moods={moods} onCloseGuide={closeGuide} />

                <QuickGuideLive onCloseGuide={closeGuide} />
              </div>

              {/* Sticky footer */}
              <div className="px-5 pb-5">
                <QuickGuideFooter games={games} />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <LogPlayModal
        isOpen={showLogPlay}
        onClose={() => setShowLogPlay(false)}
        games={games}
      />
    </>
  );
}
