import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriorityPill } from "@/src/lib/frontend/entities/game/ui/PriorityPill";

describe("PriorityPill", () => {
  it.each([
    [13, "Low"],
    [38, "Medium"],
    [63, "High"],
    [88, "Critical"],
  ])("renders '%s' label for score %i", (score, label) => {
    render(<PriorityPill score={score} gameId="g1" onPriorityChange={() => {}} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("renders as a button (has onClick)", () => {
    const { container } = render(
      <PriorityPill score={50} gameId="g1" onPriorityChange={() => {}} />,
    );
    expect(container.querySelector("button")).toBeTruthy();
  });

  it("calls onPriorityChange with correct id and delta when clicked", async () => {
    const user = userEvent.setup();
    const onPriorityChange = vi.fn();
    render(
      <PriorityPill score={13} gameId="game-42" onPriorityChange={onPriorityChange} />,
    );
    // Score 13 is Low (tier 0) → clicking advances to Medium (tier 1, score 38)
    // delta = nextTierScore(13) - 13 = 38 - 13 = 25
    await user.click(screen.getByRole("button"));
    expect(onPriorityChange).toHaveBeenCalledWith("game-42", 25);
  });

  it("wraps from Critical back to Low when clicked", async () => {
    const user = userEvent.setup();
    const onPriorityChange = vi.fn();
    render(
      <PriorityPill score={88} gameId="g1" onPriorityChange={onPriorityChange} />,
    );
    // Score 88 is Critical (tier 3) → clicks wraps to Low (tier 0, score 13)
    // delta = 13 - 88 = -75
    await user.click(screen.getByRole("button"));
    expect(onPriorityChange).toHaveBeenCalledWith("g1", -75);
  });
});
