"use client";

import { type DurationFilter } from "@/src/lib/backend/backlog/domain/services";
import { Select } from "@/src/lib/frontend/shared";

const DURATION_FILTER_OPTIONS: { value: DurationFilter; label: string }[] = [
  { value: "short", label: "Short (< 10h)" },
  { value: "medium", label: "Medium (10–25h)" },
  { value: "long", label: "Long (25–50h)" },
  { value: "epic", label: "Epic (50h+)" },
];

interface GameFiltersPanelDurationSelectProps {
  value: DurationFilter | null;
  onChange: (val: DurationFilter | null) => void;
}

export function GameFiltersPanelDurationSelect({
  value,
  onChange,
}: GameFiltersPanelDurationSelectProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium tracking-wide text-gray-400 uppercase">
        Length
      </label>
      <Select
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value as DurationFilter) || null)}
        fullWidth
      >
        <option value="">All Lengths</option>
        {DURATION_FILTER_OPTIONS.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
