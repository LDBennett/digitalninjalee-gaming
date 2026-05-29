"use client";

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
        <button
          onClick={onAction}
          className="bg-brand-700 hover:bg-brand-600 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
