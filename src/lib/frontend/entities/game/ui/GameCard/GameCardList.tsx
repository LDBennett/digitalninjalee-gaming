"use client";

import { ReactNode } from "react";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { Pagination } from "@/src/lib/frontend/shared";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface Props {
  games: GameDto[];
  emptyState: ReactNode;
  renderCard: (game: GameDto, index: number) => ReactNode;
  spacing?: string;
  pagination?: PaginationProps;
}

export function GameCardList({
  games,
  emptyState,
  renderCard,
  spacing = "space-y-3 md:space-y-5",
  pagination,
}: Props) {
  if (games.length === 0) return <>{emptyState}</>;

  return (
    <>
      <div className={spacing}>
        {games.map((game, i) => renderCard(game, i))}
      </div>
      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
        />
      )}
    </>
  );
}
