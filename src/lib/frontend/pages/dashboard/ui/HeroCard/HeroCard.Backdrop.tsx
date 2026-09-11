"use client";

import { motion, AnimatePresence } from "framer-motion";

interface HeroCardBackdropProps {
  gameId: string;
  coverImage: string | null;
  prefersReducedMotion: boolean;
}

export function HeroCardBackdrop({
  gameId,
  coverImage,
  prefersReducedMotion,
}: HeroCardBackdropProps) {
  return (
    <AnimatePresence initial={false} mode="sync">
      <motion.div
        key={`bg-${gameId}`}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
      >
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-105 object-cover object-top"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(5,22,16,0.96) 0%, rgba(3,7,18,0.85) 50%, rgba(3,7,18,0.38) 100%)",
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
