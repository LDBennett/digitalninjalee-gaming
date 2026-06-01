"use client";

import { useAddGameForm } from "../hooks/useAddGameForm";

interface SelectedGamePreviewProps {
  form: ReturnType<typeof useAddGameForm>;
}

export function SelectedGamePreview({ form }: SelectedGamePreviewProps) {
  const { backgroundUrl, coverArtUrl, igdbLoading, igdbLoaded, clearCoverArt: onClear } = form;
  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-2">
      <img
        src={coverArtUrl || backgroundUrl}
        alt=""
        className="h-10 w-10 shrink-0 rounded object-cover"
      />
      <p className="flex-1 truncate text-xs text-gray-400">
        {igdbLoading ? (
          <span className="text-gray-500">Fetching IGDB data…</span>
        ) : igdbLoaded ? (
          <span className="text-green-400">
            Cover art + description from IGDB
          </span>
        ) : (
          "Cover art loaded from RAWG"
        )}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 text-xs text-gray-600 transition-colors hover:text-red-400"
      >
        Remove
      </button>
    </div>
  );
}
