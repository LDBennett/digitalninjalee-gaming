import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useHeroCarouselController } from "../useHeroCarouselController";

describe("useHeroCarouselController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it("initializes with index 0 and active autoplay when total > 1", () => {
    const { result } = renderHook(() =>
      useHeroCarouselController({ total: 3 })
    );

    expect(result.current.idx).toBe(0);
    expect(result.current.direction).toBe(1);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isManuallyPaused).toBe(false);
  });

  it("pauses autoplay when total <= 1", () => {
    const { result } = renderHook(() =>
      useHeroCarouselController({ total: 1 })
    );

    expect(result.current.isPaused).toBe(true);
  });

  it("navigates forward and wraps around with go(1)", () => {
    const { result } = renderHook(() =>
      useHeroCarouselController({ total: 3 })
    );

    act(() => {
      result.current.go(1);
    });
    expect(result.current.idx).toBe(1);
    expect(result.current.direction).toBe(1);

    act(() => {
      result.current.go(1);
    });
    expect(result.current.idx).toBe(2);

    // Wraps back to 0
    act(() => {
      result.current.go(1);
    });
    expect(result.current.idx).toBe(0);
  });

  it("navigates backward and wraps around with go(-1)", () => {
    const { result } = renderHook(() =>
      useHeroCarouselController({ total: 3 })
    );

    act(() => {
      result.current.go(-1);
    });
    expect(result.current.idx).toBe(2);
    expect(result.current.direction).toBe(-1);
  });

  it("navigates directly with goTo(target)", () => {
    const { result } = renderHook(() =>
      useHeroCarouselController({ total: 4 })
    );

    act(() => {
      result.current.goTo(2);
    });
    expect(result.current.idx).toBe(2);
    expect(result.current.direction).toBe(1);

    act(() => {
      result.current.goTo(1);
    });
    expect(result.current.idx).toBe(1);
    expect(result.current.direction).toBe(-1);
  });

  it("toggles manual pause via toggleManualPause()", () => {
    const { result } = renderHook(() =>
      useHeroCarouselController({ total: 3 })
    );

    expect(result.current.isPaused).toBe(false);

    act(() => {
      result.current.toggleManualPause();
    });
    expect(result.current.isManuallyPaused).toBe(true);
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.toggleManualPause();
    });
    expect(result.current.isManuallyPaused).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });

  it("pauses on hover and resumes on mouse leave", () => {
    const { result } = renderHook(() =>
      useHeroCarouselController({ total: 3 })
    );

    act(() => {
      result.current.containerProps.onMouseEnter();
    });
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.containerProps.onMouseLeave();
    });
    expect(result.current.isPaused).toBe(false);
  });

  it("pauses on focus and resumes only when focus completely leaves container", () => {
    const { result } = renderHook(() =>
      useHeroCarouselController({ total: 3 })
    );

    act(() => {
      result.current.containerProps.onFocusCapture();
    });
    expect(result.current.isPaused).toBe(true);

    const container = document.createElement("div");
    const child = document.createElement("button");
    container.appendChild(child);

    // Internal tab transition (child focus): should remain paused
    act(() => {
      result.current.containerProps.onBlurCapture({
        currentTarget: container,
        relatedTarget: child,
      } as unknown as React.FocusEvent);
    });
    expect(result.current.isPaused).toBe(true);

    // Focus leaves container completely: resumes
    act(() => {
      result.current.containerProps.onBlurCapture({
        currentTarget: container,
        relatedTarget: null,
      } as unknown as React.FocusEvent);
    });
    expect(result.current.isPaused).toBe(false);
  });

  it("auto-advances slides via interval timer when active", () => {
    const { result } = renderHook(() =>
      useHeroCarouselController({ total: 3, autoAdvanceIntervalMs: 8000 })
    );

    expect(result.current.idx).toBe(0);

    act(() => {
      vi.advanceTimersByTime(8050);
    });

    expect(result.current.idx).toBe(1);

    act(() => {
      vi.advanceTimersByTime(8050);
    });

    expect(result.current.idx).toBe(2);
  });

  it("handles touch drag swipe and resumes after cooldown", () => {
    const { result } = renderHook(() =>
      useHeroCarouselController({ total: 3, cooldownMs: 3000 })
    );

    act(() => {
      result.current.dragProps.onDragStart();
    });
    expect(result.current.isPaused).toBe(true);

    // Swipe left (advance to next)
    act(() => {
      result.current.dragProps.onDragEnd(new MouseEvent("mouseup"), {
        offset: { x: -60, y: 0 },
        velocity: { x: -400, y: 0 },
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
      });
    });

    expect(result.current.idx).toBe(1);
    expect(result.current.isPaused).toBe(true);

    // Cooldown elapses: autoplay resumes
    act(() => {
      vi.advanceTimersByTime(3050);
    });
    expect(result.current.isPaused).toBe(false);
  });
});
