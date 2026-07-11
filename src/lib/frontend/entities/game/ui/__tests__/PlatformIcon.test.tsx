import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlatformIcon } from "@/src/lib/frontend/entities/game/ui/badges/PlatformIcon";
import { PLATFORMS } from "@/src/lib/backend/backlog/domain/models/game.types";

const EXPECTED_LABELS: Record<string, string> = {
  pc: "PC (Steam)",
  xbox: "Xbox",
  playstation: "PlayStation",
  switch: "Nintendo Switch",
  other: "Other",
};

describe("PlatformIcon", () => {
  it.each(PLATFORMS)(
    "renders accessible label for platform '%s'",
    (platform) => {
      render(<PlatformIcon platform={platform} />);
      expect(screen.getByText(EXPECTED_LABELS[platform])).toBeInTheDocument();
    },
  );

  it("sets the label as the tooltip title", () => {
    render(<PlatformIcon platform="switch" />);
    expect(screen.getByTitle("Nintendo Switch")).toBeInTheDocument();
  });
});
