"use client";

import { usePathname } from "next/navigation";
import { Dices, Plus } from "lucide-react";
import { useAuthStore } from "../auth/auth.store";
import { Button } from "./Button";

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
      <div className="flex gap-3">
        {config.buttons.includes("random") && onRandom && (
          <Button
            variant="brand-gradient"
            onClick={onRandom}
            icon={<Dices size={16} />}
            className="shrink-0"
          >
            Random
          </Button>
        )}
        {user && config.buttons.includes("add") && onAddGame && (
          <Button
            variant="brand-gradient"
            onClick={onAddGame}
            icon={<Plus size={15} />}
            className="shrink-0"
          >
            Add Game
          </Button>
        )}
      </div>
    </div>
  );
}
