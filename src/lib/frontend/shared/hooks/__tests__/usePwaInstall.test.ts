import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePwaInstall } from "../usePwaInstall";

describe("usePwaInstall", () => {
  let listeners: Record<string, EventListenerOrEventListenerObject> = {};
  let matchMediaMatches = false;

  beforeEach(() => {
    listeners = {};
    matchMediaMatches = false;

    vi.spyOn(window, "addEventListener").mockImplementation(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        listeners[type] = listener;
      },
    );

    vi.spyOn(window, "removeEventListener").mockImplementation(
      (type: string) => {
        delete listeners[type];
      },
    );

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: matchMediaMatches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with non-installable and non-installed state in standard browser", () => {
    const { result } = renderHook(() => usePwaInstall());

    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isInstallable).toBe(false);
  });

  it("detects when already running in standalone display mode", () => {
    matchMediaMatches = true;
    const { result } = renderHook(() => usePwaInstall());

    expect(result.current.isInstalled).toBe(true);
  });

  it("captures beforeinstallprompt and enables promptInstall", async () => {
    const { result } = renderHook(() => usePwaInstall());

    const mockPromptEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
    };

    act(() => {
      if (typeof listeners["beforeinstallprompt"] === "function") {
        listeners["beforeinstallprompt"](mockPromptEvent as unknown as Event);
      }
    });

    expect(result.current.isInstallable).toBe(true);
    expect(mockPromptEvent.preventDefault).toHaveBeenCalled();

    let accepted = false;
    await act(async () => {
      accepted = await result.current.promptInstall();
    });

    expect(mockPromptEvent.prompt).toHaveBeenCalled();
    expect(accepted).toBe(true);
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  it("synchronously clears prompt ref preventing duplicate prompt calls", async () => {
    const { result } = renderHook(() => usePwaInstall());

    const mockPromptEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: "dismissed", platform: "web" }),
    };

    act(() => {
      if (typeof listeners["beforeinstallprompt"] === "function") {
        listeners["beforeinstallprompt"](mockPromptEvent as unknown as Event);
      }
    });

    let firstCall = false;
    let secondCall = false;

    await act(async () => {
      firstCall = await result.current.promptInstall();
      // Rapid second call
      secondCall = await result.current.promptInstall();
    });

    expect(firstCall).toBe(false); // dismissed
    expect(secondCall).toBe(false); // immediate return due to nullified ref
    expect(mockPromptEvent.prompt).toHaveBeenCalledTimes(1);
  });

  it("unregisters event listeners on unmount", () => {
    const { unmount } = renderHook(() => usePwaInstall());

    expect(listeners["beforeinstallprompt"]).toBeDefined();
    expect(listeners["appinstalled"]).toBeDefined();

    unmount();

    expect(listeners["beforeinstallprompt"]).toBeUndefined();
    expect(listeners["appinstalled"]).toBeUndefined();
  });

  it("detects iOS platform correctly", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      configurable: true,
    });

    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.platform).toBe("ios");
    expect(result.current.isIos).toBe(true);
  });

  it("detects Mac Safari platform correctly", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      configurable: true,
    });

    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.platform).toBe("mac-safari");
  });
});
