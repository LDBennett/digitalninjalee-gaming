import { beforeEach, describe, expect, it } from "vitest";
import { useQuickGuideStore } from "../quickGuide.store";

describe("useQuickGuideStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useQuickGuideStore.setState({ isOpen: false, shakeEnabled: true });
  });

  it("initializes with isOpen false and shakeEnabled true", () => {
    const state = useQuickGuideStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.shakeEnabled).toBe(true);
  });

  it("opens, closes, and toggles guide open state", () => {
    const store = useQuickGuideStore.getState();

    store.openGuide();
    expect(useQuickGuideStore.getState().isOpen).toBe(true);

    store.closeGuide();
    expect(useQuickGuideStore.getState().isOpen).toBe(false);

    store.toggleGuide();
    expect(useQuickGuideStore.getState().isOpen).toBe(true);

    store.toggleGuide();
    expect(useQuickGuideStore.getState().isOpen).toBe(false);
  });

  it("sets and toggles shakeEnabled and updates localStorage", () => {
    const store = useQuickGuideStore.getState();

    store.setShakeEnabled(false);
    expect(useQuickGuideStore.getState().shakeEnabled).toBe(false);
    expect(localStorage.getItem("dnl_shake_enabled")).toBe("false");

    store.toggleShake();
    expect(useQuickGuideStore.getState().shakeEnabled).toBe(true);
    expect(localStorage.getItem("dnl_shake_enabled")).toBe("true");
  });
});
