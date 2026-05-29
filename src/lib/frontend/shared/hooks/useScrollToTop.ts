"use client";

import { useRef, useEffect } from "react";

export function useScrollToTop<T extends HTMLElement = HTMLDivElement>(
  dep: unknown,
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [dep]);
  return ref;
}
