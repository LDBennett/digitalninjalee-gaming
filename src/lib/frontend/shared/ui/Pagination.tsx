"use client";

import { Button } from "./Button";

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
      <Button
        variant="gray"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="font-medium"
      >
        ← Prev
      </Button>
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
      <Button
        variant="gray"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="font-medium"
      >
        Next →
      </Button>
    </div>
  );
}
