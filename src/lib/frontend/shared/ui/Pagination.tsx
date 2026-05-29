"use client";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        ← Prev
      </button>
      <select
        value={page}
        onChange={(e) => onPageChange(Number(e.target.value))}
        className="focus:border-brand-600 rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white focus:outline-none"
      >
        {pages.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      / {totalPages}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next →
      </button>
    </div>
  );
}
