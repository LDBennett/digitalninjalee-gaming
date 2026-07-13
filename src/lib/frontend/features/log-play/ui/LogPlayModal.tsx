"use client";

import { useState } from "react";
import type { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { Modal, SearchInput } from "@/src/lib/frontend/shared";
import { useLogPlay } from "../hooks/useLogPlay";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  games: GameDto[];
}

const MAX_RESULTS = 8;

export function LogPlayModal({ isOpen, onClose, games }: Props) {
  const [query, setQuery] = useState("");
  const { logPlay, logging } = useLogPlay({
    onSuccess: () => {
      setQuery("");
      onClose();
    },
  });

  const trimmed = query.trim();
  const matches = trimmed
    ? games
        .filter((g) => g.title.toLowerCase().includes(trimmed.toLowerCase()))
        .slice(0, MAX_RESULTS)
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log play" maxWidth="max-w-md">
      <div className="p-5">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="What are you playing?"
        />

        <div className="mt-3 flex flex-col gap-1">
          {matches.map((game) => (
            <button
              key={game.id}
              type="button"
              disabled={logging}
              onClick={() => logPlay({ gameId: game.id, gameName: game.title })}
              className="flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {game.cover_art_url ? (
                <img
                  src={game.cover_art_url}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-800 text-xs font-bold text-white/30">
                  {game.title.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate text-sm text-white">{game.title}</span>
            </button>
          ))}

          {trimmed && (
            <button
              type="button"
              disabled={logging}
              onClick={() => logPlay({ gameName: trimmed })}
              className="rounded-lg px-2 py-2 text-left text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
            >
              Log &ldquo;{trimmed}&rdquo;{matches.length > 0 && " as typed"}
            </button>
          )}

          {!trimmed && (
            <p className="px-2 py-4 text-center text-xs text-gray-500">
              Search your library, or type any game name to log it.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
