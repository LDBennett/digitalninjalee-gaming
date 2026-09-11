"use client";

import { useEffect, useRef } from "react";
import { useQuickGuideStore } from "@/src/lib/frontend/shared";

const SHAKE_THRESHOLD = 15; // m/s^2 acceleration delta threshold
const SHAKE_TIMEOUT = 800; // ms window for rapid shake gestures
const MIN_INTERVAL = 100; // ms minimum interval between samples

export function useShakeToOpen() {
  const { shakeEnabled, openGuide } = useQuickGuideStore();
  const lastShakeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastCoordsRef = useRef<{ x: number; y: number; z: number } | null>(
    null,
  );
  const shakeCountRef = useRef(0);

  useEffect(() => {
    if (
      !shakeEnabled ||
      typeof window === "undefined" ||
      !("DeviceMotionEvent" in window)
    ) {
      return;
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      // Bail if guide is already open
      if (useQuickGuideStore.getState().isOpen) return;

      // Bail if user is actively typing in a form input
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const now = Date.now();
      const timeDiff = now - lastTimeRef.current;
      if (timeDiff < MIN_INTERVAL) return;

      if (lastCoordsRef.current) {
        const deltaX = acc.x - lastCoordsRef.current.x;
        const deltaY = acc.y - lastCoordsRef.current.y;
        const deltaZ = acc.z - lastCoordsRef.current.z;
        const speed = Math.sqrt(
          deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ,
        );

        if (speed > SHAKE_THRESHOLD) {
          if (now - lastShakeRef.current > SHAKE_TIMEOUT) {
            shakeCountRef.current = 1;
          } else {
            shakeCountRef.current += 1;
          }

          lastShakeRef.current = now;

          // Deliberate double-shake detection
          if (shakeCountRef.current >= 2) {
            shakeCountRef.current = 0;
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
              try {
                navigator.vibrate([15, 30, 15]);
              } catch {}
            }
            openGuide();
          }
        }
      }

      lastCoordsRef.current = { x: acc.x, y: acc.y, z: acc.z };
      lastTimeRef.current = now;
    };

    window.addEventListener("devicemotion", handleMotion, { passive: true });
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [shakeEnabled, openGuide]);
}
