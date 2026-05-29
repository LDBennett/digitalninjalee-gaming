'use client';

import { Platform } from '@/src/lib/backend/backlog/domain/models';

const PLATFORM_STYLES: Record<Platform, { bg: string; text: string; label: string }> = {
  pc:          { bg: 'bg-gray-700',      text: 'text-gray-300',  label: 'PC' },
  xbox:        { bg: 'bg-green-900/60',  text: 'text-green-400', label: 'Xbox' },
  playstation: { bg: 'bg-blue-900/60',   text: 'text-blue-400',  label: 'PlayStation' },
  switch:      { bg: 'bg-red-900/60',    text: 'text-red-400',   label: 'Switch' },
  other:       { bg: 'bg-gray-800',      text: 'text-gray-400',  label: 'Other' },
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  const style = PLATFORM_STYLES[platform];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
