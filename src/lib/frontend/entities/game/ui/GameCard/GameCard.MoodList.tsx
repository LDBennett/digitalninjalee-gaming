"use client";

import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { MoodBadge } from "../badges/MoodBadge";

interface Props {
  moods: MoodDto[];
}

export function GameCardMoodList({ moods }: Props) {
  if (moods.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 sm:hidden">
        {moods.slice(0, 2).map((mood) => (
          <MoodBadge
            key={mood.id}
            mood={mood.name}
            className="px-2 py-0.5 text-[11px]"
          />
        ))}
        {moods.length > 2 && (
          <span className="inline-flex items-center rounded-full bg-gray-800/80 px-2 py-0.5 text-[10px] font-medium text-gray-400">
            +{moods.length - 2}
          </span>
        )}
      </div>
      <div className="hidden flex-wrap items-center gap-1 sm:flex">
        {moods.slice(0, 4).map((mood) => (
          <MoodBadge
            key={mood.id}
            mood={mood.name}
            className="px-2 py-0.5 text-[11px]"
          />
        ))}
        {moods.length > 4 && (
          <span className="inline-flex items-center rounded-full bg-gray-800/80 px-2 py-0.5 text-[10px] font-medium text-gray-400">
            +{moods.length - 4}
          </span>
        )}
      </div>
    </>
  );
}
