import { create } from "zustand";

const STORAGE_KEY = "dnl_shake_enabled";

function getInitialShake(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === "true" : true;
  } catch {
    return true;
  }
}

export interface QuickGuideState {
  isOpen: boolean;
  shakeEnabled: boolean;
  openGuide: () => void;
  closeGuide: () => void;
  toggleGuide: () => void;
  setShakeEnabled: (enabled: boolean) => void;
  toggleShake: () => void;
}

export const useQuickGuideStore = create<QuickGuideState>((set) => ({
  isOpen: false,
  shakeEnabled: getInitialShake(),
  openGuide: () => set({ isOpen: true }),
  closeGuide: () => set({ isOpen: false }),
  toggleGuide: () => set((s) => ({ isOpen: !s.isOpen })),
  setShakeEnabled: (enabled) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, String(enabled));
      } catch {}
    }
    set({ shakeEnabled: enabled });
  },
  toggleShake: () =>
    set((s) => {
      const next = !s.shakeEnabled;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch {}
      }
      return { shakeEnabled: next };
    }),
}));
