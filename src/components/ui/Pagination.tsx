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
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="hover:bg-gray-800 disabled:opacity-30 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm transition-colors disabled:cursor-not-allowed"
      >
        ← Prev
      </button>
      <select
        value={page}
        onChange={(e) => onPageChange(Number(e.target.value))}
        className="bg-gray-900 px-3 py-1.5 border border-gray-700 focus:border-purple-600 rounded-lg focus:outline-none text-white text-sm"
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
        className="hover:bg-gray-800 disabled:opacity-30 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm transition-colors disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
}
