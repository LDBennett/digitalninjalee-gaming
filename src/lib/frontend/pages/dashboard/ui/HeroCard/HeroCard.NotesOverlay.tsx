"use client";

import { motion, AnimatePresence } from "framer-motion";
import { NotebookText, X } from "lucide-react";

interface HeroCardNotesOverlayProps {
  open: boolean;
  note: string | null | undefined;
  onClose: () => void;
}

export function HeroCardNotesOverlay({
  open,
  note,
  onClose,
}: HeroCardNotesOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="notes"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 z-10 flex flex-col bg-gray-950/92 p-6 backdrop-blur-sm md:p-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <NotebookText size={15} className="text-gray-400" />
              Notes
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
              aria-label="Close notes"
            >
              <X size={14} />
            </button>
          </div>

          {note ? (
            <p className="text-sm leading-relaxed text-gray-300">{note}</p>
          ) : (
            <p className="text-sm italic text-gray-500">
              No notes for this game.
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
