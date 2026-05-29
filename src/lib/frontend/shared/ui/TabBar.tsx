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
        className="flex border-b border-gray-800 overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing select-none"
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
              className={`flex flex-col items-center gap-1 px-5 py-3 -mb-px shrink-0 whitespace-nowrap text-sm font-medium border-b-2 transition-colors ${
                active
                  ? "border-brand-500 text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
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
