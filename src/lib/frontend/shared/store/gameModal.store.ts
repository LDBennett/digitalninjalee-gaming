import { create } from "zustand";

export type ActiveGameModalTab = "details" | "focus" | "logs";

export interface GameModalState {
  isOpen: boolean;
  mode: "add" | "edit";
  gameId: string | null;
  defaultStatus?: string;
  activeTab: ActiveGameModalTab;
  openAdd: (defaultStatus?: string) => void;
  openEdit: (gameId: string, initialTab?: ActiveGameModalTab) => void;
  close: () => void;
  setActiveTab: (tab: ActiveGameModalTab) => void;
}

export const useGameModalStore = create<GameModalState>((set) => ({
  isOpen: false,
  mode: "add",
  gameId: null,
  defaultStatus: undefined,
  activeTab: "details",
  openAdd: (defaultStatus) =>
    set({
      isOpen: true,
      mode: "add",
      gameId: null,
      defaultStatus,
      activeTab: "details",
    }),
  openEdit: (gameId, initialTab = "details") =>
    set({
      isOpen: true,
      mode: "edit",
      gameId,
      activeTab: initialTab,
    }),
  close: () => set({ isOpen: false, gameId: null }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
