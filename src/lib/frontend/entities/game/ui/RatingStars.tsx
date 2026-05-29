"use client";

import { Star, StarHalf } from "lucide-react";

export function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return filled ? (
          <Star
            key={star}
            size={11}
            className="text-yellow-400"
            fill="currentColor"
            strokeWidth={1}
          />
        ) : half ? (
          <StarHalf
            key={star}
            size={11}
            className="text-yellow-400"
            fill="currentColor"
            strokeWidth={1}
          />
        ) : (
          <Star
            key={star}
            size={11}
            className="text-gray-700"
            strokeWidth={1}
          />
        );
      })}
      <span className="ml-0.5 font-medium text-[10px] text-yellow-400/80">
        {rating}
      </span>
    </div>
  );
}
