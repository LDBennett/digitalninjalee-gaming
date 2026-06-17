"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  Dices,
  GamepadDirectional,
  Plus,
  Play,
  X,
} from "lucide-react";
import { GameStatus } from "@/src/lib/backend/backlog/domain/models";
import { AddGameModal } from "@/src/lib/frontend/features/add-game";
import { RandomPicker } from "@/src/lib/frontend/features/roll-random";
import { useMoods } from "@/src/lib/frontend/features/game-actions";
import { useGameActions } from "@/src/lib/frontend/features/game-actions";
import { useAuthStore } from "@/src/lib/frontend/shared";

type Pool = "backlog" | "playing";

const SPRING = { type: "spring", stiffness: 400, damping: 28 } as const;
const RADIUS = 96; // px distance from center FAB to each satellite
const FAB_HALF = 28; // h-14 (56px) / 2
const SAT_HALF = 28; // h-14 (56px) / 2

export function GamepadFab() {
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPool, setPickerPool] = useState<Pool>("backlog");

  const pathname = usePathname();
  const { moods } = useMoods();
  const { user, openLoginModal } = useAuthStore();
  const queryClient = useQueryClient();

  const defaultAddStatus = useMemo((): GameStatus => {
    if (pathname === "/wishlist") return "interested";
    if (pathname === "/library") return "completed";
    if (pathname === "/playing") return "playing";
    return "backlog";
  }, [pathname]);

  const { handleAdd } = useGameActions({
    onAddSuccess: () => {
      queryClient.invalidateQueries();
      setShowAdd(false);
    },
  });

  const openPicker = (pool: Pool) => {
    setPickerPool(pool);
    setShowPicker(true);
    setOpen(false);
  };

  const handleAddClick = () => {
    if (user) {
      setShowAdd(true);
    } else {
      openLoginModal();
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(false);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleAddClick();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        openPicker("backlog");
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        openPicker("playing");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, user]);

  // N / E / S / W cardinal satellites
  const satellites = [
    {
      key: "N",
      label: "Add Game",
      icon: <Plus size={20} />,
      offset: { x: 0, y: -RADIUS },
      onClick: handleAddClick,
    },
    {
      key: "E",
      label: "Roll: Backlog",
      icon: (
        <ClipboardList size={26}>
          <Dices size={16} x={11} y={9} absoluteStrokeWidth />
        </ClipboardList>
      ),
      offset: { x: RADIUS, y: 0 },
      onClick: () => openPicker("backlog"),
    },
    {
      key: "S",
      label: "Close",
      icon: <X size={20} />,
      offset: { x: 0, y: RADIUS },
      onClick: () => setOpen(false),
    },
    {
      key: "W",
      label: "Roll: Playing",
      icon: (
        <Play size={26}>
          <Dices size={16} x={11} y={9} absoluteStrokeWidth />
        </Play>
      ),
      offset: { x: -RADIUS, y: 0 },
      onClick: () => openPicker("playing"),
    },
  ];

  return (
    <>
      {/* Resting FAB — unmounts when open; layoutId hands off to the centered FAB */}
      {!open && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <motion.button
            layoutId="fab-main"
            onClick={() => setOpen(true)}
            aria-label="Open actions"
            className="bg-brand-700 hover:bg-brand-600 pointer-events-auto absolute right-6 bottom-28 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-white shadow-xl md:right-8 md:bottom-8"
          >
            <GamepadDirectional size={26} />
          </motion.button>
        </div>
      )}

      {/* Centered radial overlay */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Cardinal satellites */}
            {satellites.map(({ key, label, icon, offset, onClick }, i) => (
              <motion.button
                key={key}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: offset.x,
                  y: offset.y,
                  transition: { ...SPRING, delay: i * 0.05 },
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 0,
                  transition: { duration: 0.12 },
                }}
                onClick={onClick}
                aria-label={label}
                title={label}
                className="hover:border-brand-700 pointer-events-auto absolute flex h-14 w-14 cursor-pointer items-center justify-center gap-1 rounded-full border border-gray-700 bg-gray-800 text-gray-300 shadow-lg hover:bg-gray-700 hover:text-white"
                style={{
                  top: "50%",
                  left: "50%",
                  marginLeft: -SAT_HALF,
                  marginTop: -SAT_HALF,
                  willChange: "transform",
                }}
              >
                {icon}
              </motion.button>
            ))}

            {/* Center FAB — layoutId receives animation from resting position */}
            <motion.button
              layoutId="fab-main"
              onClick={() => setOpen(false)}
              aria-label="Close actions"
              className="bg-brand-700 hover:bg-brand-600 pointer-events-auto absolute flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-white shadow-xl"
              style={{
                top: "50%",
                left: "50%",
                marginLeft: -FAB_HALF,
                marginTop: -FAB_HALF,
              }}
            >
              <motion.span
                key="icon-x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.2 }}
              >
                <X size={22} />
              </motion.span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <AddGameModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAdd}
        moods={moods}
        defaultStatus={defaultAddStatus}
      />

      <RandomPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        moods={moods}
        defaultPool={pickerPool}
      />
    </>
  );
}
