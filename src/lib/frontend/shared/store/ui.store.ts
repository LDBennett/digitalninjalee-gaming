import { create } from "zustand";

interface UIState {
  width: number;
  truncatedButtonText: boolean;
}

export const useUIStore = create<UIState>(() => ({
  width: typeof window !== "undefined" ? window.innerWidth : 0,
  truncatedButtonText: false,
}));

if (typeof window !== "undefined") {
  window.addEventListener("resize", () =>
    useUIStore.setState({
      width: window.innerWidth,
      truncatedButtonText: window.innerWidth < 768,
    }),
  );
}
