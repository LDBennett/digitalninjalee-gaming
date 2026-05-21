'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/',           label: 'Dashboard', icon: '⚡' },
  { href: '/backlog',    label: 'Backlog',   icon: '📋' },
  { href: '/playing',    label: 'Playing',   icon: '🎮' },
  { href: '/completed',  label: 'Library',   icon: '✅' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-56 min-h-screen bg-gray-950 border-r border-gray-800 flex flex-col p-4 shrink-0">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-white tracking-tight">Game Vault</h1>
        <p className="text-xs text-gray-500 mt-0.5">Backlog tracker</p>
      </div>

      <div className="space-y-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-900/50 text-purple-300 border border-purple-800/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-gray-800 pt-4 px-2">
        <p className="text-xs text-gray-600 mb-2">Platform sync</p>
        <div className="flex gap-1.5 flex-wrap">
          {['Steam', 'Xbox', 'PSN'].map((p) => (
            <span key={p} className="text-xs text-gray-700 bg-gray-900 rounded px-2 py-0.5 border border-gray-800">
              {p}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-700 mt-1.5">Coming soon</p>
      </div>
    </nav>
  );
}
