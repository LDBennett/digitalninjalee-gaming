import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DashboardListQueue } from "../Dashboard.ListQueue";
import type { GameDto } from "@/src/lib/backend/backlog/domain/models";

function createMockGame(overrides: Partial<GameDto> = {}): GameDto {
  return {
    id: "game-1",
    title: "Final Fantasy VII Rebirth",
    platform: "playstation",
    status: "backlog",
    priority_score: 95,
    ...overrides,
  };
}

describe("DashboardListQueue", () => {
  it("renders empty state when games list is empty", () => {
    render(<DashboardListQueue games={[]} heading="Top Priority" />);

    expect(screen.getByText("Top Priority")).toBeInTheDocument();
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("renders list of games with priority badge and handles onSelectGame click", () => {
    const onSelectGame = vi.fn();
    const games = [
      createMockGame({ id: "g1", title: "Final Fantasy VII Rebirth", priority_score: 95 }),
      createMockGame({ id: "g2", title: "Elden Ring", priority_score: 80 }),
    ];

    render(
      <DashboardListQueue
        games={games}
        heading="Backlog: Top Priority"
        onSelectGame={onSelectGame}
      />
    );

    expect(screen.getByText("Backlog: Top Priority")).toBeInTheDocument();
    expect(screen.getByText("Final Fantasy VII Rebirth")).toBeInTheDocument();
    expect(screen.getByText("Elden Ring")).toBeInTheDocument();

    const ffRow = screen.getByRole("button", { name: /Final Fantasy VII Rebirth/i });
    fireEvent.click(ffRow);

    expect(onSelectGame).toHaveBeenCalledTimes(1);
    expect(onSelectGame).toHaveBeenCalledWith("g1");
  });

  it("renders custom queue items and header action button", () => {
    const handleItemClick = vi.fn();
    const handleActionClick = vi.fn();

    const items = [
      {
        id: "play-1",
        title: "Metroid Prime",
        platform: "switch",
        coverUrl: "https://example.com/cover.jpg",
        trailing: <span data-testid="trailing-time">5m ago</span>,
        onClick: handleItemClick,
      },
    ];

    render(
      <DashboardListQueue
        heading="Recently Played"
        items={items}
        action={<button onClick={handleActionClick}>Log Activity</button>}
      />
    );

    expect(screen.getByText("Recently Played")).toBeInTheDocument();
    expect(screen.getByText("Metroid Prime")).toBeInTheDocument();
    expect(screen.getByTestId("trailing-time")).toHaveTextContent("5m ago");

    const actionButton = screen.getByRole("button", { name: "Log Activity" });
    fireEvent.click(actionButton);
    expect(handleActionClick).toHaveBeenCalledTimes(1);

    const rowButton = screen.getByRole("button", { name: /Metroid Prime/i });
    fireEvent.click(rowButton);
    expect(handleItemClick).toHaveBeenCalledTimes(1);
  });
});
