"use client";

import { useState } from "react";
import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  value: number | null;
  onChange: (rating: number | null) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value ?? 0;

  const resolveRating = (
    e: React.MouseEvent<HTMLButtonElement>,
    star: number,
  ): number => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    return isLeftHalf ? star - 0.5 : star;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, star: number) => {
    setHovered(resolveRating(e, star));
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, star: number) => {
    const newRating = resolveRating(e, star);
    onChange(newRating === value ? null : newRating);
  };

  return (
    <div className="flex items-center gap-1.5" onMouseLeave={() => setHovered(null)}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = display >= star;
          const half = !filled && display >= star - 0.5;
          return (
            <button
              key={star}
              type="button"
              onMouseMove={(e) => handleMouseMove(e, star)}
              onClick={(e) => handleClick(e, star)}
              className="text-yellow-400 transition-transform hover:scale-110"
            >
              {filled ? (
                <Star size={20} fill="currentColor" strokeWidth={1} />
              ) : half ? (
                <StarHalf size={20} fill="currentColor" strokeWidth={1} />
              ) : (
                <Star size={20} className="text-gray-600" strokeWidth={1} />
              )}
            </button>
          );
        })}
      </div>
      <span className="text-gray-400 text-xs w-6">
        {value !== null ? value : "—"}
      </span>
    </div>
  );
}
