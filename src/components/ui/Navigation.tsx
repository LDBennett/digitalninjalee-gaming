"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "⚡" },
  { href: "/playing", label: "Playing", icon: "🎮" },
  { href: "/backlog", label: "Backlog", icon: "📋" },
  { href: "/library", label: "Library", icon: "✅" },
  { href: "/wishlist", label: "Wishlist", icon: "👀" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col bg-gray-950 p-4 border-gray-800 border-r w-56 min-h-screen shrink-0">
        <div className="mb-8 px-2">
          <h1 className="font-bold text-white text-xl tracking-tight">
            DigitalNinjaLee
          </h1>
          <p className="mt-0.5 text-gray-500 text-xs">Game Vault</p>
        </div>

        <div className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-purple-900/50 text-purple-300 border border-purple-800/50"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden right-0 bottom-0 left-0 z-40 fixed flex bg-gray-950 border-gray-800 border-t">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? "text-purple-300" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
