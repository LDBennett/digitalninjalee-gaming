"use client";

import {
  Platform,
  PLATFORM_LABELS,
} from "@/src/lib/backend/backlog/domain/models";

const PLATFORM_FILTER_OPTIONS: { value: Platform; label: string }[] = [
  { value: "pc", label: PLATFORM_LABELS.pc },
  { value: "xbox", label: PLATFORM_LABELS.xbox },
  { value: "playstation", label: PLATFORM_LABELS.playstation },
  { value: "switch", label: PLATFORM_LABELS.switch },
];

interface GameFiltersPanelPlatformButtonsProps {
  platformFilter: Platform | null;
  onSelectPlatform: (platform: Platform | null) => void;
}

export function GameFiltersPanelPlatformButtons({
  platformFilter,
  onSelectPlatform,
}: GameFiltersPanelPlatformButtonsProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium tracking-wide text-gray-400 uppercase">
        Platform
      </label>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onSelectPlatform(null)}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
            platformFilter === null
              ? "bg-brand-700 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          All
        </button>
        {PLATFORM_FILTER_OPTIONS.map((p) => (
          <button
            type="button"
            key={p.value}
            onClick={() =>
              onSelectPlatform(platformFilter === p.value ? null : p.value)
            }
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              platformFilter === p.value
                ? "bg-brand-700 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
