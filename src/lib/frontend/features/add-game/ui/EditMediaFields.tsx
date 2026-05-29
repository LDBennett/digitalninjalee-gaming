"use client";

interface EditMediaFieldsProps {
  backgroundUrl: string;
  coverArtUrl: string;
  gameDescription: string;
  onBackgroundUrlChange: (v: string) => void;
  onCoverArtUrlChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
}

export function EditMediaFields({
  backgroundUrl,
  coverArtUrl,
  gameDescription,
  onBackgroundUrlChange,
  onCoverArtUrlChange,
  onDescriptionChange,
}: EditMediaFieldsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">
          Background Image URL{" "}
          <span className="ml-1 text-gray-600">— from RAWG</span>
        </label>
        <input
          type="url"
          value={backgroundUrl}
          onChange={(e) => onBackgroundUrlChange(e.target.value)}
          placeholder="https://..."
          className="focus:border-brand-600 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">
          Cover Art URL <span className="ml-1 text-gray-600">— from IGDB</span>
        </label>
        <input
          type="url"
          value={coverArtUrl}
          onChange={(e) => onCoverArtUrlChange(e.target.value)}
          placeholder="https://images.igdb.com/..."
          className="focus:border-brand-600 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none"
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
