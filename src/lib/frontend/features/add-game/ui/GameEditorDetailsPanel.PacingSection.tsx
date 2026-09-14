"use client";

import { NumberInput } from "@/src/lib/frontend/shared";
import { useAddGameForm } from "../hooks/useAddGameForm";

interface GameEditorDetailsPanelPacingSectionProps {
  form: ReturnType<typeof useAddGameForm>;
}

export function GameEditorDetailsPanelPacingSection({
  form,
}: GameEditorDetailsPanelPacingSectionProps) {
  const { timeToBeat, setTimeToBeat, setIsManualPlaytimeDirty } = form;

  const updateMetric = (
    field: "main" | "extra" | "completionist",
    val: number | null,
  ) => {
    setIsManualPlaytimeDirty(true);
    setTimeToBeat((prev) => ({
      schema_version: 1,
      main: field === "main" ? val : (prev?.main ?? null),
      extra: field === "extra" ? val : (prev?.extra ?? null),
      completionist:
        field === "completionist" ? val : (prev?.completionist ?? null),
      source: "manual",
      url: prev?.url,
      synced_at: new Date().toISOString(),
    }));
  };

  return (
    <div className="space-y-2 rounded-xl border border-sky-500/20 bg-sky-950/20 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
          <span>⏱️ Pacing & Time to Beat</span>
        </div>
        {timeToBeat?.url && (
          <a
            href={timeToBeat.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-sky-400 transition-colors hover:text-sky-300"
          >
            HLTB ↗
          </a>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <NumberInput
          label="Main Story"
          suffix="h"
          step={0.5}
          min={0}
          placeholder="15"
          accentColor="sky"
          value={timeToBeat?.main}
          onChange={(val) => updateMetric("main", val)}
        />
        <NumberInput
          label="Main + Extra"
          suffix="h"
          step={0.5}
          min={0}
          placeholder="28"
          accentColor="sky"
          value={timeToBeat?.extra}
          onChange={(val) => updateMetric("extra", val)}
        />
        <NumberInput
          label="100% / Plat"
          suffix="h"
          step={0.5}
          min={0}
          placeholder="60"
          accentColor="sky"
          value={timeToBeat?.completionist}
          onChange={(val) => updateMetric("completionist", val)}
        />
      </div>
    </div>
  );
}
