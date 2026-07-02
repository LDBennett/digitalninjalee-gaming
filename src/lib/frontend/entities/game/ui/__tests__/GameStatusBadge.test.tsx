import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameStatusBadge } from "@/src/lib/frontend/entities/game/ui/badges/GameStatusBadge";
import {
  STATUS_LABELS,
  GAME_STATUSES,
} from "@/src/lib/backend/backlog/domain/models/game.types";

describe("GameStatusBadge", () => {
  it.each(GAME_STATUSES)("renders correct label for status '%s'", (status) => {
    render(<GameStatusBadge status={status} />);
    expect(screen.getByText(STATUS_LABELS[status])).toBeInTheDocument();
  });

  it("renders as a span (no onClick)", () => {
    const { container } = render(<GameStatusBadge status="playing" />);
    const el = container.querySelector("span");
    expect(el).toBeTruthy();
    expect(el?.tagName).toBe("SPAN");
  });
});
