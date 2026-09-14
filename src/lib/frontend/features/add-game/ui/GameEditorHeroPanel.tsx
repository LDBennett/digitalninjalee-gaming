"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { Input, StarRating } from "@/src/lib/frontend/shared";
import { useAddGameForm } from "../hooks/useAddGameForm";

interface GameEditorHeroPanelProps {
  form: ReturnType<typeof useAddGameForm>;
  isEditing?: boolean;
}

export function GameEditorHeroPanel({
  form,
  isEditing,
}: GameEditorHeroPanelProps) {
  const [showMediaUrls, setShowMediaUrls] = useState(false);
  const {
    title,
    setTitle,
    rating,
    setRating,
    coverArtUrl,
    setCoverArtUrl,
    backgroundUrl,
    setBackgroundUrl,
  } = form;

  const displayImage = coverArtUrl || backgroundUrl;

  return (
    <div className="flex flex-col items-center space-y-4 md:items-start">
      <div className="relative aspect-[3/4] w-36 shrink-0 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-xl sm:w-44">
        {displayImage ? (
          <img
            src={displayImage}
            alt={title || "Game cover"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-gray-600">
            <ImageIcon className="mb-2 h-10 w-10 stroke-[1.5]" />
            <span className="text-xs">No cover image</span>
          </div>
        )}
      </div>

      <div className="w-full space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Title *
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Game title..."
            required
            fullWidth
            className="font-semibold text-white placeholder-gray-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Your Rating
          </label>
          <div className="pt-0.5">
            <StarRating value={rating} onChange={setRating} />
          </div>
        </div>

        {/* Telemetry Summary Pill */}
        {(form.timeToBeat?.main || form.completionRoadmap?.difficulty) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {form.timeToBeat?.main && (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-950/40 px-2.5 py-0.5 text-[11px] font-medium text-sky-300">
                <span>⏱️ {form.timeToBeat.main}h</span>
                {form.timeToBeat.completionist && (
                  <span className="opacity-60">
                    · 100%: {form.timeToBeat.completionist}h
                  </span>
                )}
              </span>
            )}
            {form.completionRoadmap?.difficulty && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-950/40 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                <span>🏆 {form.completionRoadmap.difficulty}</span>
              </span>
            )}
          </div>
        )}

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowMediaUrls((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-gray-300"
          >
            <span>Custom Media URLs</span>
            {showMediaUrls ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>

          {showMediaUrls && (
            <div className="mt-2 space-y-2 rounded-lg border border-gray-800 bg-gray-900/60 p-2.5">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-400">
                  Cover Art URL
                </label>
                <Input
                  type="url"
                  value={coverArtUrl}
                  onChange={(e) => setCoverArtUrl(e.target.value)}
                  placeholder="https://images.igdb.com/..."
                  fullWidth
                  className="text-xs placeholder-gray-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-400">
                  Background URL
                </label>
                <Input
                  type="url"
                  value={backgroundUrl}
                  onChange={(e) => setBackgroundUrl(e.target.value)}
                  placeholder="https://..."
                  fullWidth
                  className="text-xs placeholder-gray-600"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
