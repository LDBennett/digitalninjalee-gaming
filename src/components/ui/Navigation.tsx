"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/src/domains/shared/auth/AuthButton";
import { useAuthStore } from "@/src/domains/shared/auth/auth.store";
import {
  Gift,
  Sparkles,
  SquarePlay,
  ClipboardList,
  Library,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: <Sparkles /> },
  { href: "/playing", label: "Playing", icon: <SquarePlay /> },
  { href: "/backlog", label: "Backlog", icon: <ClipboardList /> },
  { href: "/library", label: "Library", icon: <Library /> },
  { href: "/wishlist", label: "Wishlist", icon: <Gift /> },
];

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col bg-gray-950 p-4 pe-6 border-gray-800 border-r w-56 min-h-screen shrink-0">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <AuthButton />
            <span className="font-bold text-white text-lg tracking-tight">
              DigitalNinjaLee
            </span>
          </div>
          <p className="flex items-center gap-1 mt-3 text-gray-500 text-sm text-center">
            Game Backlog Bunker
          </p>
        </div>

        <div className="flex-1 space-y-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-900/50 text-brand-300 border border-brand-800/50"
                    : "text-gray-400 hover:text-white hover:bg-brand-700/50"
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
                isActive ? "text-brand-300" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <div className="flex flex-col flex-1 justify-center items-center gap-0.5 py-2 font-medium text-[10px] text-gray-500">
          <AuthButton />
          {user ? "Sign Out" : "Sign In"}
        </div>
      </nav>
    </>
  );
}
