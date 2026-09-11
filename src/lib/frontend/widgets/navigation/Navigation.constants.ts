import type { LucideIcon } from "lucide-react";
import {
  Gift,
  Sparkles,
  SquarePlay,
  ClipboardList,
  Library,
} from "lucide-react";

export type NavItem = { href: string; label: string; Icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", Icon: Sparkles },
  { href: "/playing", label: "Playing", Icon: SquarePlay },
  { href: "/backlog", label: "Backlog", Icon: ClipboardList },
  { href: "/library", label: "Library", Icon: Library },
  { href: "/wishlist", label: "Wishlist", Icon: Gift },
];

export function isActivePath(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
