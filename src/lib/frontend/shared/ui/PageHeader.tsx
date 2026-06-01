"use client";

import { usePathname } from "next/navigation";
import { Dices, Plus } from "lucide-react";
import { useAuthStore } from "../auth/auth.store";

type ButtonType = "random" | "add";

interface PageConfig {
  title: string;
  staticSubtitle?: string;
  buttons: ButtonType[];
  className: string;
}

const PAGE_CONFIG: Record<string, PageConfig> = {
  "/": { title: "Dashboard", buttons: ["random"], className: "mb-8" },
  "/playing": { title: "Playing", buttons: ["random"], className: "mb-6" },
  "/backlog": { title: "Backlog", buttons: ["random", "add"], className: "mb-6" },
  "/library": { title: "Library", buttons: ["add"], className: "mb-6" },
  "/wishlist": {
    title: "Wishlist",
    staticSubtitle:
      "Games I want to buy or keep an eye on. Track upcoming releases and pre-orders.",
    buttons: ["add"],
    className: "mb-6",
  },
};

interface Props {
  subtitle?: string;
  onRandom?: () => void;
  onAddGame?: () => void;
}

export function PageHeader({ subtitle, onRandom, onAddGame }: Props) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const config = PAGE_CONFIG[pathname] ?? { title: "", buttons: [], className: "mb-6" };
  const displaySubtitle = subtitle ?? config.staticSubtitle;

  return (
    <div
      className={`flex flex-col justify-between gap-4 sm:flex-row sm:items-center ${config.className}`}
    >
      <div>
        <h1 className="text-2xl font-bold text-white">{config.title}</h1>
        {displaySubtitle && (
          <p className="mt-0.5 text-sm text-gray-500">{displaySubtitle}</p>
        )}
      </div>
      {user && (
        <div className="flex gap-3">
          {config.buttons.includes("random") && onRandom && (
            <button
              onClick={onRandom}
              className="from-brand-950 hover:from-brand-800 to-brand-800 hover:to-brand-600 flex shrink-0 items-center justify-center gap-2 rounded-lg bg-linear-to-r px-4 py-2 text-center text-sm font-semibold text-white shadow-lg transition-all"
            >
              <Dices size={16} /> Random
            </button>
          )}
          {config.buttons.includes("add") && onAddGame && (
            <button
              onClick={onAddGame}
              className="from-brand-950 hover:from-brand-800 to-brand-800 hover:to-brand-600 flex shrink-0 items-center justify-center gap-2 rounded-lg bg-linear-to-r px-4 py-2 text-center text-sm font-semibold text-white shadow-lg transition-all"
            >
              <Plus size={15} /> Add Game
            </button>
          )}
        </div>
      )}
    </div>
  );
}
