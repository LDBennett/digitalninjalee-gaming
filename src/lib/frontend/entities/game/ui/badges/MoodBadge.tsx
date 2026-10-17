"use client";

import { Badge } from "@/src/lib/frontend/shared";
import {
  MoodName,
  MOOD_STYLES,
  getMoodLabel,
  getMoodStyle,
} from "./mood.styles";

export type { MoodName };
export { getMoodLabel, getMoodStyle };

export function MoodBadge({
  mood,
  variant = "chip",
  className,
}: {
  mood: string;
  variant?: "capsule" | "chip";
  className?: string;
}) {
  const style = MOOD_STYLES[mood as MoodName];
  if (!style) return null;
  return (
    <Badge
      bg={style.bg}
      text={style.text}
      variant={variant}
      className={className}
    >
      {style.label}
    </Badge>
  );
}
