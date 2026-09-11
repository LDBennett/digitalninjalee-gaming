"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { useQuickGuideStore } from "@/src/lib/frontend/shared";
import { NavigationAuthStatus } from "./Navigation.AuthStatus";
import { NAV_ITEMS, isActivePath } from "./Navigation.constants";

export function NavigationDesktopRail() {
  const pathname = usePathname();
  const { isOpen: isGuideOpen, toggleGuide } = useQuickGuideStore();

  return (
    <nav className="sticky top-4 z-10 mt-4 mb-4 ml-4 hidden h-[90vh] w-14 shrink-0 flex-col self-start overflow-visible rounded-2xl border border-gray-800 bg-gray-900/95 py-4 shadow-2xl shadow-black/60 backdrop-blur-sm md:flex">
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <img src="/logos/dnl-logo--white.png" alt="DNL" className="h-6 w-8" />
      </div>

      {/* Nav items */}
      <div className="flex flex-1 flex-col items-center gap-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActivePath(href, pathname);
          return (
            <div
              key={href}
              className="group relative flex w-full justify-center"
            >
              <Link
                href={href}
                className="relative flex items-center justify-center rounded-lg p-2.5"
              >
                {active && (
                  <motion.div
                    layoutId="desktop-pill"
                    className="bg-brand-900/50 border-brand-800/50 absolute inset-0 rounded-lg border"
                    style={{
                      boxShadow:
                        "0 0 12px 0 rgba(var(--color-brand-800), 0.35)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                )}
                <motion.span
                  animate={{ scale: active ? 1.2 : 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className={`relative z-10 transition-colors ${
                    active ? "text-brand-300" : "text-gray-400 group-hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                </motion.span>
              </Link>
              {/* Tooltip */}
              <span className="pointer-events-none absolute top-1/2 left-full z-999999 ml-3 -translate-y-1/2 rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                {label}
              </span>
            </div>
          );
        })}

        {/* Divider */}
        <div className="my-1.5 h-px w-6 bg-gray-800" />

        {/* Bunker Guide Trigger */}
        <div className="group relative flex w-full justify-center">
          <button
            type="button"
            onClick={toggleGuide}
            aria-label="Bunker Guide (G)"
            className={`relative flex cursor-pointer items-center justify-center rounded-lg p-2.5 transition-colors ${
              isGuideOpen
                ? "border-brand-500/40 bg-brand-950/60 text-brand-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] border"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Gamepad2 size={18} />
          </button>
          {/* Tooltip */}
          <span className="pointer-events-none absolute top-1/2 left-full z-999999 ml-3 -translate-y-1/2 rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
            Bunker Guide{" "}
            <span className="text-brand-400 font-semibold">(G)</span>
          </span>
        </div>
      </div>

      {/* Auth status at bottom */}
      <div className="mt-4 flex justify-center">
        <NavigationAuthStatus />
      </div>
    </nav>
  );
}
