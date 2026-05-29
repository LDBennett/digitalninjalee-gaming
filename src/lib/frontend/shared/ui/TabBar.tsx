"use client";

import { ReactNode, useRef } from "react";

interface TabBarProps<T extends string> {
  tabs: T[];
  value: T;
  onChange: (tab: T) => void;
  labels: Record<T, string>;
  icons?: Partial<Record<T, ReactNode>>;
  className?: string;
}

export function TabBar<T extends string>({
  tabs,
  value,
  onChange,
  labels,
  icons,
  className = "",
}: TabBarProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.active) return;
    const el = scrollRef.current;
    if (!el) return;
    const delta = e.pageX - el.offsetLeft - drag.current.startX;
    if (Math.abs(delta) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.scrollLeft - delta;
  };

  const stopDrag = () => {
    drag.current.active = false;
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        ref={scrollRef}
        style={{ touchAction: "pan-x" }}
        className="flex cursor-grab scrollbar-none overflow-x-auto border-b border-gray-800 select-none active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {tabs.map((t) => {
          const active = value === t;
          return (
            <button
              key={t}
              onClick={(e) => {
                if (drag.current.moved) {
                  e.preventDefault();
                  return;
                }
                onChange(t);
              }}
              className={`-mb-px flex shrink-0 flex-col items-center gap-1 border-b-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "border-brand-500 text-brand-400"
                  : "border-transparent text-gray-500 hover:border-gray-600 hover:text-gray-300"
              }`}
            >
              {icons?.[t] && <span>{icons[t]}</span>}
              {labels[t]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
