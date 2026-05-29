"use client";

interface Props {
  heading: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ heading, hint, actionLabel, onAction }: Props) {
  return (
    <div className="bg-gray-900 p-12 border border-gray-800 rounded-xl text-center">
      <p className="mb-2 text-gray-500 text-lg">{heading}</p>
      {hint && <p className="mb-4 text-gray-600 text-sm">{hint}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-brand-700 hover:bg-brand-600 px-4 py-2 rounded-lg font-semibold text-white text-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
