"use client";

import { useState } from "react";
import { Trophy, Link as LinkIcon, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { NumberInput } from "@/src/lib/frontend/shared";
import { useAddGameForm } from "../hooks/useAddGameForm";

interface RoadmapSectionProps {
  form: ReturnType<typeof useAddGameForm>;
}

export function GameEditorGoalsPanelRoadmapSection({ form }: RoadmapSectionProps) {
  const {
    completionRoadmap,
    setCompletionRoadmap,
    setIsManualRoadmapDirty,
    isExtractingGuide,
    extractError,
    handleExtractGuide,
  } = form;

  const [inputUrl, setInputUrl] = useState(completionRoadmap?.guide_url ?? "");

  const handleUrlChange = (val: string) => {
    setInputUrl(val);
    setIsManualRoadmapDirty(true);
    const src = /powerpyx/i.test(val) ? "PowerPyx" : /psnprofiles/i.test(val) ? "PSNProfiles" : /xboxachievements/i.test(val) ? "XboxAchievements" : "Custom";
    setCompletionRoadmap((prev) => ({
      schema_version: 1,
      difficulty: prev?.difficulty ?? null,
      time_estimate: prev?.time_estimate ?? null,
      playthroughs: prev?.playthroughs ?? null,
      missables: prev?.missables ?? 0,
      difficulty_matters: prev?.difficulty_matters,
      guide_url: val.trim(),
      source_name: src,
      updated_at: new Date().toISOString(),
    }));
  };

  const updateField = (field: "difficulty" | "time_estimate" | "missables" | "playthroughs", val: unknown) => {
    setIsManualRoadmapDirty(true);
    setCompletionRoadmap((prev) => ({
      schema_version: 1,
      difficulty: prev?.difficulty ?? null,
      time_estimate: prev?.time_estimate ?? null,
      playthroughs: prev?.playthroughs ?? null,
      missables: prev?.missables ?? 0,
      guide_url: inputUrl.trim() || prev?.guide_url || "",
      source_name: prev?.source_name ?? "Custom",
      updated_at: new Date().toISOString(),
      [field]: val,
    }));
  };

  const isPowerPyx = inputUrl.toLowerCase().includes("powerpyx.com");

  return (
    <div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5 sm:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-amber-400" />
          <span className="text-xs font-semibold text-amber-300">
            100% / Platinum Roadmap & Guide
          </span>
        </div>
        {completionRoadmap?.guide_url && (
          <a
            href={completionRoadmap.guide_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-medium text-amber-400/80 transition-colors hover:text-amber-300"
          >
            <span>{completionRoadmap.source_name || "Guide"}</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      {/* URL input and Auto-Extract */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-gray-400">
          Guide URL (PowerPyx, PSNProfiles, etc.)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon
              size={13}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
            />
            <input
              type="url"
              placeholder="https://www.powerpyx.com/..."
              value={inputUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900/90 py-1.5 pr-3 pl-8 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
          {isPowerPyx && (
            <button
              type="button"
              disabled={isExtractingGuide || !inputUrl.trim()}
              onClick={() => handleExtractGuide(inputUrl)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/25 disabled:opacity-50"
            >
              {isExtractingGuide ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              <span>{isExtractingGuide ? "Extracting..." : "Auto-Extract"}</span>
            </button>
          )}
        </div>

        {extractError && (
          <p className="text-[11px] text-red-400">{extractError}</p>
        )}
        <p className="text-[10px] text-gray-400">
          Auto-extract supports PowerPyx. For PSNProfiles or XboxAchievements, paste your link and enter the stats below.
        </p>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-[10px] font-medium tracking-wide text-gray-400">Difficulty</label>
          <input
            type="text"
            placeholder="e.g. 3/10"
            value={completionRoadmap?.difficulty ?? ""}
            onChange={(e) => updateField("difficulty", e.target.value || null)}
            className="h-8 w-full rounded-lg border border-gray-800 bg-gray-900/80 px-2.5 text-xs text-white placeholder-gray-600 transition-colors focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-medium tracking-wide text-gray-400">Time Estimate</label>
          <input
            type="text"
            placeholder="e.g. 15-20h"
            value={completionRoadmap?.time_estimate ?? ""}
            onChange={(e) => updateField("time_estimate", e.target.value || null)}
            className="h-8 w-full rounded-lg border border-gray-800 bg-gray-900/80 px-2.5 text-xs text-white placeholder-gray-600 transition-colors focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 focus:outline-none"
          />
        </div>
        <NumberInput
          label="Missables"
          min={0}
          step={1}
          placeholder="0"
          accentColor="amber"
          value={completionRoadmap?.missables ?? 0}
          onChange={(val) => updateField("missables", val ?? 0)}
        />
        <NumberInput
          label="Playthroughs"
          min={1}
          step={1}
          placeholder="1"
          accentColor="amber"
          value={completionRoadmap?.playthroughs ?? 1}
          onChange={(val) => updateField("playthroughs", val ?? 1)}
        />
      </div>
    </div>
  );
}
