"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Plus, NotebookPen } from "lucide-react";
import { GameStatus } from "@/src/lib/backend/backlog/domain/models";
import {
  Button,
  GatedElement,
  useAuthStore,
  useGameModalStore,
} from "@/src/lib/frontend/shared";

interface QuickGuideActionsProps {
  onOpenLogPlay: () => void;
  onCloseGuide: () => void;
}

export function QuickGuideActions({
  onOpenLogPlay,
  onCloseGuide,
}: QuickGuideActionsProps) {
  const pathname = usePathname();
  const { user, openLoginModal } = useAuthStore();
  const { openAdd } = useGameModalStore();

  const { defaultStatus, addLabel } = useMemo<{
    defaultStatus: GameStatus;
    addLabel: string;
  }>(() => {
    if (pathname === "/wishlist") {
      return { defaultStatus: "interested", addLabel: "Add to Wishlist" };
    }
    if (pathname === "/library") {
      return { defaultStatus: "completed", addLabel: "Add to Library" };
    }
    if (pathname === "/playing") {
      return { defaultStatus: "playing", addLabel: "Add to Playing" };
    }
    return { defaultStatus: "backlog", addLabel: "Add to Backlog" };
  }, [pathname]);

  const handleAddClick = () => {
    onCloseGuide();
    openAdd(defaultStatus);
  };

  const handleLogClick = () => {
    onCloseGuide();
    onOpenLogPlay();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
          Quick Actions
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <GatedElement
          isAuthenticated={!!user}
          onSignIn={openLoginModal}
        >
          <Button
            variant="brand-gradient"
            size="sm"
            fullWidth
            icon={<Plus size={16} />}
            onClick={handleAddClick}
            className="rounded-xl py-2.5 text-xs font-semibold shadow-md"
          >
            {addLabel}
          </Button>
        </GatedElement>

        <GatedElement
          isAuthenticated={!!user}
          onSignIn={openLoginModal}
        >
          <Button
            variant="gray-dark"
            size="sm"
            fullWidth
            icon={<NotebookPen size={15} className="text-brand-400" />}
            onClick={handleLogClick}
            className="rounded-xl py-2.5 text-xs font-semibold text-gray-200 hover:text-white"
          >
            Log Play
          </Button>
        </GatedElement>
      </div>
    </div>
  );
}
