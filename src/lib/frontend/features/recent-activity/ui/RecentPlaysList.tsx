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
  pagination,
}: Props) {
  const { session } = useAuthStore();
  const [showLog, setShowLog] = useState(false);

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
            <RecentPlayRow key={play.id} play={play} />
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

      <span className="mt-2 flex justify-end text-xs text-gray-400 italic">
        Activity sourced from Discord and Steam
      </span>
      <LogPlayModal
        isOpen={showLog}
        onClose={() => setShowLog(false)}
        games={games}
      />
    </div>
  );
}
