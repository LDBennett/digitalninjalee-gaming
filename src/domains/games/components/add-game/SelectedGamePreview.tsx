"use client";

interface SelectedGamePreviewProps {
  coverUrl: string;
  coverArtUrl: string;
  igdbLoading: boolean;
  igdbLoaded: boolean;
  onClear: () => void;
}

export function SelectedGamePreview({
  coverUrl,
  coverArtUrl,
  igdbLoading,
  igdbLoaded,
  onClear,
}: SelectedGamePreviewProps) {
  return (
    <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg">
      <img
        src={coverArtUrl || coverUrl}
        alt=""
        className="rounded w-10 h-10 object-cover shrink-0"
      />
      <p className="flex-1 text-gray-400 text-xs truncate">
        {igdbLoading ? (
          <span className="text-gray-500">Fetching IGDB data…</span>
        ) : igdbLoaded ? (
          <span className="text-green-400">Cover art + description from IGDB</span>
        ) : (
          "Cover art loaded from RAWG"
        )}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="text-gray-600 hover:text-red-400 text-xs transition-colors shrink-0"
      >
        Remove
      </button>
    </div>
  );
}
