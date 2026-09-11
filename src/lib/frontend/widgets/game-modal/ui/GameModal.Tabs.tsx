"use client";

import { SlidersHorizontal, Target, ScrollText } from "lucide-react";
import { ActiveGameModalTab } from "@/src/lib/frontend/shared";

interface GameModalTabsProps {
  activeTab: ActiveGameModalTab;
  onChangeTab: (tab: ActiveGameModalTab) => void;
  isAddMode?: boolean;
}

export function GameModalTabs({
  activeTab,
  onChangeTab,
  isAddMode,
}: GameModalTabsProps) {
  const tabs: { id: ActiveGameModalTab; label: string; icon: React.ReactNode }[] =
    [
      {
        id: "details",
        label: "Details",
        icon: <SlidersHorizontal size={15} />,
      },
      {
        id: "goals",
        label: "Goals & Moods",
        icon: <Target size={15} />,
      },
      {
        id: "logs",
        label: isAddMode ? "Notes" : "Notes & Logs",
        icon: <ScrollText size={15} />,
      },
    ];

  return (
    <div className="flex border-b border-gray-800 pb-1 gap-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              isActive
                ? "bg-gray-800 text-white shadow-sm ring-1 ring-gray-700"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
