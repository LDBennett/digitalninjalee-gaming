"use client";

interface Props {
  title: string;
  coverArtUrl: string | null;
  rank?: number;
}

export function GameCoverArt({ title, coverArtUrl, rank }: Props) {
  return (
    <div className="relative bg-gray-800 rounded-lg w-20 h-30 overflow-hidden shrink-0">
      {coverArtUrl ? (
        <img
          src={coverArtUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex justify-center items-center bg-linear-to-br from-brand-900 to-blue-900 w-full h-full">
          <span className="font-bold text-white/30 text-2xl">
            {title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      {rank !== undefined && (
        <div className="bottom-0 absolute inset-x-0 flex justify-center items-end bg-linear-to-t from-black/90 to-transparent pb-1.5 h-10">
          <span className="font-mono font-bold text-white text-lg leading-none">
            {rank}
          </span>
        </div>
      )}
    </div>
  );
}
