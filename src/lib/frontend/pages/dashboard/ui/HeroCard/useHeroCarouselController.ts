"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { PanInfo } from "framer-motion";

export interface UseHeroCarouselControllerOptions {
  total: number;
  autoAdvanceIntervalMs?: number;
  cooldownMs?: number;
}

export function useHeroCarouselController({
  total,
  autoAdvanceIntervalMs = 8000,
  cooldownMs = 6000,
}: UseHeroCarouselControllerOptions) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);

  const isDraggingRef = useRef(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clamp index if total shrinks
  useEffect(() => {
    if (total > 0 && idx >= total) {
      setIdx(Math.max(0, total - 1));
    }
  }, [idx, total]);

  // Reduced motion subscription
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener?.("change", handler);
    return () => {
      mediaQuery.removeEventListener?.("change", handler);
    };
  }, []);

  const isPaused =
    total <= 1 ||
    isHovered ||
    isFocused ||
    isGestureActive ||
    isManuallyPaused ||
    prefersReducedMotion;

  const go = useCallback(
    (delta: number) => {
      if (total <= 1) return;
      setDirection(delta);
      setIdx((i) => (i + delta + total) % total);
      setProgress(0);
    },
    [total]
  );

  const goTo = useCallback(
    (target: number) => {
      if (total <= 1 || target === idx) return;
      setDirection(target > idx ? 1 : -1);
      setIdx(target);
      setProgress(0);
    },
    [idx, total]
  );

  const toggleManualPause = useCallback(() => {
    setIsManuallyPaused((prev) => !prev);
  }, []);

  // Single timer authority for autoplay interval & progress pacing
  useEffect(() => {
    if (isPaused) {
      setProgress(0);
      return;
    }

    const stepMs = 100;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (stepMs / autoAdvanceIntervalMs) * 100;
        if (next >= 100) {
          go(1);
          return 0;
        }
        return next;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPaused, autoAdvanceIntervalMs, go]);

  // Clean up cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  // Focus and hover boundary handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleFocusCapture = useCallback(() => setIsFocused(true), []);
  const handleBlurCapture = useCallback((e: React.FocusEvent) => {
    // Only unpause if focus truly leaves the carousel container
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsFocused(false);
    }
  }, []);

  // Drag & Swipe gesture handlers
  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    setIsGestureActive(true);
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }
  }, []);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const offsetX = info.offset.x;
      const velocityX = info.velocity.x;

      if (offsetX < -50 || velocityX < -300) {
        go(1);
      } else if (offsetX > 50 || velocityX > 300) {
        go(-1);
      }

      // Suppress trailing click events caused by drag
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);

      // Start cooldown before resuming autoplay
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
      cooldownTimerRef.current = setTimeout(() => {
        setIsGestureActive(false);
      }, cooldownMs);
    },
    [go, cooldownMs]
  );

  return {
    idx,
    direction,
    isPaused,
    isManuallyPaused,
    progress,
    prefersReducedMotion,
    isDraggingRef,
    go,
    goTo,
    toggleManualPause,
    containerProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocusCapture: handleFocusCapture,
      onBlurCapture: handleBlurCapture,
    },
    dragProps: {
      drag: "x" as const,
      dragConstraints: { left: 0, right: 0 },
      dragElastic: 0.2,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
  };
}
