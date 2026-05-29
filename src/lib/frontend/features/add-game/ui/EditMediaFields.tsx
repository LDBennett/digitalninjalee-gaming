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
        <label className="block mb-1 font-medium text-gray-400 text-xs">
          Background Image URL{" "}
          <span className="ml-1 text-gray-600">— from RAWG</span>
        </label>
        <input
          type="url"
          value={backgroundUrl}
          onChange={(e) => onBackgroundUrlChange(e.target.value)}
          placeholder="https://..."
          className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm placeholder-gray-600"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium text-gray-400 text-xs">
          Cover Art URL <span className="ml-1 text-gray-600">— from IGDB</span>
        </label>
        <input
          type="url"
          value={coverArtUrl}
          onChange={(e) => onCoverArtUrlChange(e.target.value)}
          placeholder="https://images.igdb.com/..."
          className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm placeholder-gray-600"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium text-gray-400 text-xs">
          Description{" "}
          <span className="ml-1 text-gray-600">— from IGDB / RAWG</span>
        </label>
        <textarea
          value={gameDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Game description..."
          rows={3}
          className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm resize-none placeholder-gray-600"
        />
      </div>
    </div>
  );
}
