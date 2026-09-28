"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type PwaPlatform = "ios" | "mac-safari" | "chromium" | "other";

const subscribeStandalone = (callback: () => void) => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return () => { };
  }
  const mediaQuery = window.matchMedia("(display-mode: standalone)");
  mediaQuery.addEventListener("change", callback);
  return () => {
    mediaQuery.removeEventListener("change", callback);
  };
};

const getStandaloneSnapshot = (): boolean => {
  if (typeof window === "undefined") return false;
  const isStandaloneMedia =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;
  const isNavigatorStandalone =
    "standalone" in window.navigator &&
    Boolean(
      (window.navigator as unknown as { standalone?: boolean }).standalone,
    );
  return Boolean(isStandaloneMedia || isNavigatorStandalone);
};

const getPlatformSnapshot = (): PwaPlatform => {
  if (typeof window === "undefined") return "other";
  const userAgent = window.navigator.userAgent || "";
  const isStandalone = getStandaloneSnapshot();
  const isIosDevice =
    /iPad|iPhone|iPod/.test(userAgent) ||
    ("standalone" in window.navigator && !isStandalone);

  if (isIosDevice) return "ios";
  const isMac = /Macintosh|Mac OS X/.test(userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  if (isMac && isSafari) return "mac-safari";
  if (/Chrome|Chromium|Edg|Brave/.test(userAgent)) return "chromium";
  return "other";
};

const emptySubscribe = () => () => { };

export function usePwaInstall() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [manualInstalled, setManualInstalled] = useState(false);
  const promptEventRef = useRef<BeforeInstallPromptEvent | null>(null);

  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    () => false,
  );

  const platform = useSyncExternalStore(
    emptySubscribe,
    getPlatformSnapshot,
    () => "other",
  );

  const isIos = platform === "ios";
  const isInstalled = isStandalone || manualInstalled;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      promptEventRef.current = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      promptEventRef.current = null;
      setIsInstallable(false);
      setManualInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    const promptEvent = promptEventRef.current;
    if (!promptEvent) return false;

    // Synchronously consume reference to prevent double-click race condition
    promptEventRef.current = null;
    setIsInstallable(false);

    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        setManualInstalled(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isIos,
    platform,
    promptInstall,
  };
}
