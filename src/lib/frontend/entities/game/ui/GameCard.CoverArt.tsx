"use client";

interface Props {
  title: string;
  coverArtUrl: string | null;
  rank?: number;
}

export function GameCoverArt({ title, coverArtUrl, rank }: Props) {
  return (
    <div className="relative h-30 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-800">
      {coverArtUrl ? (
        <img
          src={coverArtUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="from-brand-900 flex h-full w-full items-center justify-center bg-linear-to-br to-blue-900">
          <span className="text-2xl font-bold text-white/30">
            {title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      {rank !== undefined && (
        <div className="absolute inset-x-0 bottom-0 flex h-10 items-end justify-center bg-linear-to-t from-black/90 to-transparent pb-1.5">
          <span className="font-mono text-lg leading-none font-bold text-white">
            {rank}
          </span>
        </div>
      )}
    </div>
  );
}
