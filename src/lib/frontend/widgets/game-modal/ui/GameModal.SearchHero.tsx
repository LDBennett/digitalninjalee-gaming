"use client";

import { Search, Sparkles, PenLine } from "lucide-react";
import {
  GameTitleSearch,
  SelectedGamePreview,
  useAddGameForm,
} from "@/src/lib/frontend/features/add-game";
import { Button } from "@/src/lib/frontend/shared";

interface GameModalSearchHeroProps {
  form: ReturnType<typeof useAddGameForm>;
  onContinueToDetails: () => void;
}

export function GameModalSearchHero({
  form,
  onContinueToDetails,
}: GameModalSearchHeroProps) {
  const hasSelectedGame = Boolean(
    form.coverArtUrl || form.backgroundUrl || form.igdbId,
  );

  return (
    <div className="flex flex-col items-center justify-center px-4 py-6 text-center">
      <div className="bg-brand-900/40 text-brand-400 ring-brand-700/50 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1">
        <Sparkles size={28} />
      </div>

      <h3 className="text-lg font-bold text-white">Find a Game</h3>
      <p className="mt-1 max-w-sm text-xs text-gray-400">
        Search the IGDB catalog to automatically import cover art, release year,
        descriptions, and genre tags.
      </p>

      <div className="mt-6 w-full max-w-md text-left">
        <GameTitleSearch form={form} isEditing={false} />

        {hasSelectedGame && (
          <div className="mt-4 space-y-3">
            <SelectedGamePreview form={form} />
            <Button
              variant="brand"
              fullWidth
              onClick={onContinueToDetails}
              className="py-2.5 font-medium"
            >
              Continue to Details & Save
            </Button>
          </div>
        )}
      </div>

      {!hasSelectedGame && (
        <div className="mt-6 w-full max-w-md border-t border-gray-800/80 pt-4">
          <button
            type="button"
            onClick={onContinueToDetails}
            className="flex w-full items-center justify-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-white"
          >
            <PenLine size={13} />
            <span>Enter game details manually</span>
          </button>
        </div>
      )}
    </div>
  );
}
