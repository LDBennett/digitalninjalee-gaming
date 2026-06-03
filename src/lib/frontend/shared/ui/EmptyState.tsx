"use client";

import { Button } from "./Button";

interface Props {
  heading: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ heading, hint, actionLabel, onAction }: Props) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
      <p className="mb-2 text-lg text-gray-500">{heading}</p>
      {hint && <p className="mb-4 text-sm text-gray-600">{hint}</p>}
      {actionLabel && onAction && (
        <Button variant="brand" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
