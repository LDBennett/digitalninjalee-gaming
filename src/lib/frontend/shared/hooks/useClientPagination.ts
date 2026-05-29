'use client';

import { useState } from 'react';

export function useClientPagination<T>(items: T[], pageSize = 20) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paginated = items.slice((page - 1) * pageSize, page * pageSize);
  return { page, setPage, totalPages, paginated };
}
