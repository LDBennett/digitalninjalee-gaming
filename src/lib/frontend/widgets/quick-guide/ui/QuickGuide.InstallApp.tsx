"use client";

import { usePwaInstall } from "@/src/lib/frontend/shared";
import { Download, Monitor, Share } from "lucide-react";
import { useState } from "react";

export function QuickGuideInstallApp() {
  const { isInstalled, isInstallable, platform, promptInstall } =
    usePwaInstall();
  const [showTip, setShowTip] = useState(false);

  // If already running inside standalone app window, hide completely
  if (isInstalled) {
    return null;
  }

  // 1. One-click native install ready (Chrome/Edge/Android when prompt is primed)
  if (isInstallable) {
    return (
      <div className="flex justify-between items-center bg-gray-950/40 px-3 py-2 border border-gray-800/60 rounded-xl">
        <div className="flex items-center gap-2">
          <Download size={14} className="text-brand-400" />
          <span className="font-medium text-gray-300 text-xs">
            Install App
          </span>
        </div>
        <button
          type="button"
          onClick={() => void promptInstall()}
          className="bg-brand-500/20 hover:bg-brand-500/30 px-2.5 py-1 rounded-lg font-semibold text-[11px] text-brand-300 active:scale-95 transition-colors cursor-pointer"
        >
          Install
        </button>
      </div>
    );
  }

  // 2. iOS Safari (iPhone / iPad)
  if (platform === "ios") {
    return (
      <div className="bg-gray-950/40 px-3 py-2 border border-gray-800/60 rounded-xl text-xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Share size={14} className="text-brand-400" />
            <span className="font-medium text-gray-300">
              Add to Home Screen
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowTip((prev) => !prev)}
            className="font-medium text-[11px] text-gray-400 hover:text-gray-200 cursor-pointer"
          >
            {showTip ? "Close" : "How?"}
          </button>
        </div>
        {showTip && (
          <p className="mt-2 pt-2 border-gray-800/60 border-t text-[11px] text-gray-400 leading-relaxed">
            Tap Safari&apos;s <span className="font-medium text-white">Share</span>{" "}
            button, then scroll down and tap{" "}
            <span className="font-medium text-white">
              &quot;Add to Home Screen&quot;
            </span>
            .
          </p>
        )}
      </div>
    );
  }

  // 3. Desktop Safari (macOS Sonoma / Sequoia)
  if (platform === "mac-safari") {
    return (
      <div className="bg-gray-950/40 px-3 py-2 border border-gray-800/60 rounded-xl text-xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Monitor size={14} className="text-brand-400" />
            <span className="font-medium text-gray-300">
              Add to Mac Dock
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowTip((prev) => !prev)}
            className="font-medium text-[11px] text-gray-400 hover:text-gray-200 cursor-pointer"
          >
            {showTip ? "Close" : "How?"}
          </button>
        </div>
        {showTip && (
          <p className="mt-2 pt-2 border-gray-800/60 border-t text-[11px] text-gray-400 leading-relaxed">
            In Safari&apos;s top menu bar, click{" "}
            <span className="font-medium text-white">File</span> →{" "}
            <span className="font-medium text-white">
              &quot;Add to Dock...&quot;
            </span>
          </p>
        )}
      </div>
    );
  }

  // 4. Desktop Chrome / Edge / Brave (before prompt event fires) or general desktop
  return (
    <div className="bg-gray-950/40 px-3 py-2 border border-gray-800/60 rounded-xl text-xs">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Download size={14} className="text-brand-400" />
          <span className="font-medium text-gray-300">
            Install Desktop App
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowTip((prev) => !prev)}
          className="font-medium text-[11px] text-gray-400 hover:text-gray-200 cursor-pointer"
        >
          {showTip ? "Close" : "How?"}
        </button>
      </div>
      {showTip && (
        <p className="mt-2 pt-2 border-gray-800/60 border-t text-[11px] text-gray-400 leading-relaxed">
          Click the <span className="font-medium text-white">Install icon</span>{" "}
          in your browser address bar (top right), or click menu (⋮) →{" "}
          <span className="font-medium text-white">Install Backlog Bunker</span>.
        </p>
      )}
    </div>
  );
}
