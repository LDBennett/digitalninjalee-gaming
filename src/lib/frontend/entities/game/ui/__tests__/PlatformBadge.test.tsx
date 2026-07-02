import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlatformBadge } from "@/src/lib/frontend/entities/game/ui/badges/PlatformBadge";
import { PLATFORMS } from "@/src/lib/backend/backlog/domain/models/game.types";

const EXPECTED_LABELS: Record<string, string> = {
  pc: "PC",
  xbox: "Xbox",
  playstation: "PlayStation",
  switch: "Switch",
  other: "Other",
};

describe("PlatformBadge", () => {
  it.each(PLATFORMS)("renders correct label for platform '%s'", (platform) => {
    render(<PlatformBadge platform={platform} />);
    expect(screen.getByText(EXPECTED_LABELS[platform])).toBeInTheDocument();
  });

  it("renders as a span (no onClick)", () => {
    const { container } = render(<PlatformBadge platform="pc" />);
    expect(container.querySelector("span")).toBeTruthy();
  });
});
