"use client";

import { ReactNode } from "react";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { Pagination } from "@/src/lib/frontend/shared/ui/Pagination";

interface Props {
  games: GameDto[];
  emptyState: ReactNode;
  renderCard: (game: GameDto, index: number) => ReactNode;
  spacing?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function GameCardList({
  games,
  emptyState,
  renderCard,
  spacing = "space-y-3 md:space-y-5",
  page,
  totalPages,
  onPageChange,
}: Props) {
  if (games.length === 0) return <>{emptyState}</>;

  return (
    <>
      <div className={spacing}>
        {games.map((game, i) => renderCard(game, i))}
      </div>
      {page !== undefined && totalPages !== undefined && onPageChange && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
