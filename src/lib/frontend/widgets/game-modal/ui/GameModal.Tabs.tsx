"use client";

import { SlidersHorizontal, Target, ScrollText } from "lucide-react";
import { ActiveGameModalTab } from "@/src/lib/frontend/shared";

interface GameModalTabsProps {
  activeTab: ActiveGameModalTab;
  onChangeTab: (tab: ActiveGameModalTab) => void;
}

export function GameModalTabs({ activeTab, onChangeTab }: GameModalTabsProps) {
  const tabs: {
    id: ActiveGameModalTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "details",
      label: "Details",
      icon: <SlidersHorizontal size={15} />,
    },
    {
      id: "focus",
      label: "Focus",
      icon: <Target size={15} />,
    },
    {
      id: "logs",
      label: "Logs",
      icon: <ScrollText size={15} />,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl border border-gray-800/80 bg-gray-950/80 p-1 shadow-inner sm:inline-flex">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all select-none ${
              isActive
                ? "border border-gray-700/60 bg-gray-800 text-white shadow-sm"
                : "border border-transparent text-gray-400 hover:bg-gray-900/50 hover:text-gray-200"
            }`}
          >
            <span className={isActive ? "text-white" : "text-gray-500"}>
              {tab.icon}
            </span>
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
