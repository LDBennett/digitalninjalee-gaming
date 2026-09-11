"use client";

import { Button } from "@/src/lib/frontend/shared";

interface GameModalErrorProps {
  onRetry: () => void;
  onClose: () => void;
}

export function GameModalErrorState({ onRetry, onClose }: GameModalErrorProps) {
  return (
    <div className="p-6 text-center space-y-4" data-testid="game-modal-error">
      <p className="text-sm text-red-400">
        Unable to load game details from catalog.
      </p>
      <div className="flex justify-center gap-3">
        <Button variant="gray-dark" size="sm" onClick={onClose}>
          Close
        </Button>
        <Button variant="brand" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
}

interface GameModalNotFoundProps {
  onClose: () => void;
}

export function GameModalNotFoundState({ onClose }: GameModalNotFoundProps) {
  return (
    <div className="p-6 text-center space-y-4" data-testid="game-modal-not-found">
      <p className="text-sm text-gray-400">
        This game does not exist in your collection or was removed.
      </p>
      <Button variant="brand" size="sm" onClick={onClose}>
        Close
      </Button>
    </div>
  );
}
