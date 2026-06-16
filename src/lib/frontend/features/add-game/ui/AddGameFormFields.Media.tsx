"use client";

import { useAddGameForm } from "../hooks/useAddGameForm";
import { Input } from "@/src/lib/frontend/shared";

interface EditMediaFieldsProps {
  form: ReturnType<typeof useAddGameForm>;
}

export function EditMediaFields({ form }: EditMediaFieldsProps) {
  const {
    backgroundUrl,
    coverArtUrl,
    gameDescription,
    setBackgroundUrl: onBackgroundUrlChange,
    setCoverArtUrl: onCoverArtUrlChange,
    setGameDescription: onDescriptionChange,
  } = form;
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">
          Background Image URL{" "}
          <span className="ml-1 text-gray-600">— from RAWG</span>
        </label>
        <Input
          type="url"
          value={backgroundUrl}
          onChange={(e) => onBackgroundUrlChange(e.target.value)}
          placeholder="https://..."
          fullWidth
          className="placeholder-gray-600"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">
          Cover Art URL <span className="ml-1 text-gray-600">— from IGDB</span>
        </label>
        <Input
          type="url"
          value={coverArtUrl}
          onChange={(e) => onCoverArtUrlChange(e.target.value)}
          placeholder="https://images.igdb.com/..."
          fullWidth
          className="placeholder-gray-600"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">
          Description{" "}
          <span className="ml-1 text-gray-600">— from IGDB / RAWG</span>
        </label>
        <textarea
          value={gameDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Game description..."
          rows={3}
          className="focus:border-brand-600 w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none"
        />
      </div>
    </div>
  );
}
