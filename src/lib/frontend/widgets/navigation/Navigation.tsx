"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthButton } from "@/src/lib/frontend/shared/auth/AuthButton";
import {
  Gift,
  Sparkles,
  SquarePlay,
  ClipboardList,
  Library,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string; Icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", Icon: Sparkles },
  { href: "/playing", label: "Playing", Icon: SquarePlay },
  { href: "/backlog", label: "Backlog", Icon: ClipboardList },
  { href: "/library", label: "Library", Icon: Library },
  { href: "/wishlist", label: "Wishlist", Icon: Gift },
];

// ── Mobile nav geometry ───────────────────────────────────────────────────────
const CR = 26; // active circle radius (52px diameter)
const NAV_H = 64; // nav bar height
const TOTAL_H = CR + NAV_H;
const NY = CR; // nav bar top Y in SVG coords — circle center sits here
const NW = 30; // notch half-width (CR + 4px gap each side)
const ND = CR; // notch depth (accommodates the lower half of the circle)
const SW = 10; // bezier shoulder for smooth curve-in
const NR = 16; // top corner radius
const NAV_BG = "#030712"; // gray-950

function buildNotchedPath(w: number, cx: number): string {
  const d = NY + ND; // notch deepest Y
  return [
    `M ${NR} ${NY}`,
    `L ${cx - NW - SW} ${NY}`,
    `C ${cx - NW} ${NY} ${cx - NW} ${d} ${cx} ${d}`,
    `C ${cx + NW} ${d} ${cx + NW} ${NY} ${cx + NW + SW} ${NY}`,
    `L ${w - NR} ${NY}`,
    `A ${NR} ${NR} 0 0 1 ${w} ${NY + NR}`,
    `L ${w} ${TOTAL_H}`,
    `L 0 ${TOTAL_H}`,
    `L 0 ${NY + NR}`,
    `A ${NR} ${NR} 0 0 1 ${NR} ${NY}`,
    `Z`,
  ].join(" ");
}

function isActivePath(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navigation() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [navWidth, setNavWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setNavWidth(el.offsetWidth));
    ro.observe(el);
    setNavWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const activeIdx = NAV_ITEMS.findIndex(({ href }) =>
    isActivePath(href, pathname),
  );
  const idx = activeIdx === -1 ? 0 : activeIdx;
  const tabW = navWidth > 0 ? navWidth / NAV_ITEMS.length : 0;
  const cx = (idx + 0.5) * tabW;
  const { href: activeHref, Icon: ActiveIcon } = NAV_ITEMS[idx];

  return (
    <>
      {/* Mobile top header */}
      <header className="fixed top-0 right-0 left-0 z-40 flex h-12 items-center justify-between border-b border-gray-800 bg-gray-950 px-4 md:hidden">
        <span className="text-base font-bold tracking-tight text-white">
          DigitalNinjaLee
        </span>
        <AuthButton />
      </header>

      {/* Desktop sidebar */}
      <nav className="sticky top-4 my-4 ml-4 hidden w-56 shrink-0 flex-col self-start overflow-y-auto rounded-2xl border border-gray-800 bg-gray-900/95 p-4 pe-6 shadow-2xl shadow-black/60 backdrop-blur-sm md:flex">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <AuthButton />
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                DigitalNinjaLee
              </span>
              <span className="flex items-center gap-1 text-center text-xs text-gray-500">
                Backlog Bunker
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = isActivePath(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
              >
                {active && (
                  <motion.div
                    layoutId="desktop-pill"
                    className="bg-brand-900/50 border-brand-800/50 absolute inset-0 rounded-lg border"
                    style={{
                      boxShadow:
                        "0 0 12px 0 rgba(var(--color-brand-800), 0.35)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <motion.span
                  animate={{ scale: active ? 1.2 : 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className={`relative z-10 transition-colors ${active ? "text-brand-300" : "text-gray-400"}`}
                >
                  <Icon size={18} />
                </motion.span>
                <span
                  className={`relative z-10 transition-colors ${active ? "text-brand-300" : "text-gray-400 group-hover:text-white"}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div
        ref={containerRef}
        className="fixed right-0 bottom-0 left-0 z-40 md:hidden"
        style={{ height: TOTAL_H }}
      >
        {/* SVG shaped background */}
        {navWidth > 0 && (
          <svg
            width={navWidth}
            height={TOTAL_H}
            viewBox={`0 0 ${navWidth} ${TOTAL_H}`}
            className="absolute inset-0 overflow-visible"
          >
            <defs>
              <filter id="mobile-nav-shadow" x="-5%" y="-40%" width="110%" height="150%">
                <feDropShadow dx="0" dy="-4" stdDeviation="8" floodColor="#000000" floodOpacity="0.55" />
              </filter>
            </defs>
            <motion.path
              fill={NAV_BG}
              filter="url(#mobile-nav-shadow)"
              initial={false}
              animate={{ d: buildNotchedPath(navWidth, cx) }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          </svg>
        )}

        {/* Active circle — center sits on nav bar top edge (y = CR in SVG) */}
        {tabW > 0 && (
          <AnimatePresence initial={false}>
            <motion.div
              key={idx}
              initial={{ y: CR + 20, scale: 0.5, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: CR + 20, scale: 0.5, opacity: 0 }}
              transition={{
                y: { type: "spring", stiffness: 700, damping: 18 },
                scale: { type: "spring", stiffness: 700, damping: 18 },
                opacity: { duration: 0.15 },
              }}
              className="absolute z-10"
              style={{ top: 0, left: cx - CR, width: CR * 2, height: CR * 2 }}
            >
              <Link
                href={activeHref}
                className="bg-brand-800 shadow-brand-900/60 flex h-full w-full items-center justify-center rounded-full text-white shadow-lg"
              >
                <ActiveIcon size={22} />
              </Link>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Nav items row — sits in the bottom NAV_H portion */}
        <div
          className="absolute right-0 bottom-0 left-0 flex"
          style={{ height: NAV_H }}
        >
          {NAV_ITEMS.map(({ href, label, Icon }, i) => {
            const isActive = i === idx;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center justify-start gap-1 text-[10px] font-medium transition-colors ${isActive ? "text-brand-400" : "text-gray-500 hover:text-gray-300"}`}
                style={{ paddingTop: isActive ? CR + 9 : 16 }}
              >
                {!isActive && <Icon size={18} />}
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
