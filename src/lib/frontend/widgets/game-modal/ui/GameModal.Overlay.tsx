"use client";

interface GameModalOverlayProps {
  coverImage?: string | null;
}

export function GameModalOverlay({ coverImage }: GameModalOverlayProps) {
  if (!coverImage) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-[400px] overflow-hidden select-none"
      style={{
        maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 35%, transparent 100%)",
      }}
    >
      <div
        className="absolute inset-0 scale-105"
        style={{
          backgroundImage: `url(${coverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          opacity: 0.65,
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-gray-950/40 to-gray-900" />
      <div className="absolute inset-0 bg-linear-to-r from-gray-950/40 via-transparent to-gray-950/40" />
    </div>
  );
}
