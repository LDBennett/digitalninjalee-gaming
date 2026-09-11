"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { RecentPlayDto } from "@/src/lib/backend/activity/domain/models";
import type { GameDto } from "@/src/lib/backend/backlog/domain/models";
import {
  Button,
  EmptyState,
  Pagination,
  useAuthStore,
} from "@/src/lib/frontend/shared";
import { LogPlayModal } from "./LogPlayModal";
import { RecentPlayRow } from "./RecentPlayRow";

interface Props {
  plays: RecentPlayDto[];
  heading: string;
  games: GameDto[];
  onSelectGame?: (id: string) => void;
  variant?: "panel" | "default";
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function RecentPlaysList({
  plays,
  heading,
  games,
  onSelectGame,
  variant = "panel",
  pagination,
}: Props) {
  const { session } = useAuthStore();
  const [showLog, setShowLog] = useState(false);

  if (variant === "default") {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
              {heading}
            </h3>
          </div>
          {session && (
            <Button
              variant="ghost"
              size="xs"
              icon={<Plus size={14} />}
              onClick={() => setShowLog(true)}
            >
              Log
            </Button>
          )}
        </div>

        {plays.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900">
            <EmptyState heading="No play activity yet" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {plays.map((play) => (
              <RecentPlayRow
                key={play.id}
                play={play}
                onSelectGame={onSelectGame}
              />
            ))}
          </div>
        )}

        {pagination && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        )}

        <LogPlayModal
          isOpen={showLog}
          onClose={() => setShowLog(false)}
          games={games}
        />
      </div>
    );
  }

  return (
    <div className="flex h-[420px] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/70 shadow-2xl shadow-black/40 backdrop-blur-sm sm:h-100 sm:min-h-100 lg:h-full lg:min-h-90">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-800/80 bg-gray-900/40 px-4 py-3">
        <h3 className="text-xs font-semibold tracking-wider text-gray-200 uppercase">
          {heading}
        </h3>
        {session && (
          <Button
            variant="ghost"
            size="xs"
            icon={<Plus size={14} />}
            onClick={() => setShowLog(true)}
          >
            Log
          </Button>
        )}
      </div>

      {plays.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <EmptyState heading="No play activity yet" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
          {plays.map((play) => (
            <RecentPlayRow
              key={play.id}
              play={play}
              onSelectGame={onSelectGame}
            />
          ))}
        </div>
      )}

      {pagination && (
        <div className="border-t border-gray-800/40 p-2">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}

      <LogPlayModal
        isOpen={showLog}
        onClose={() => setShowLog(false)}
        games={games}
      />
    </div>
  );
}
