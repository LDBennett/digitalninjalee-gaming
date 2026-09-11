"use client";

interface GameEditorScratchpadProps {
  personalNote: string;
  onChange: (val: string) => void;
}

export function GameEditorScratchpad({
  personalNote,
  onChange,
}: GameEditorScratchpadProps) {
  return (
    <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
          Personal Scratchpad
        </label>
        <span className="text-[11px] text-gray-500">Private to you</span>
      </div>
      <p className="text-xs text-gray-500">
        Quick reference for pause points, build ideas, keybindings, or reasons
        for dropping.
      </p>
      <textarea
        value={personalNote}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Paused right before Fire Giant. Using dex/bleed build. Remember to visit Smithing Master..."
        rows={4}
        className="focus:border-brand-600 w-full resize-none rounded-lg border border-gray-700 bg-gray-800/80 p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}
