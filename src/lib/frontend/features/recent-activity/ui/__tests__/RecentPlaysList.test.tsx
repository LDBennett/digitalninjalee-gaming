import { screen, fireEvent, render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecentPlaysList } from "../RecentPlaysList";
import type { RecentPlayDto } from "@/src/lib/backend/activity/domain/models";

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

function createMockPlay(overrides: Partial<RecentPlayDto> = {}): RecentPlayDto {
  return {
    id: "play-1",
    user_id: "user-1",
    game_name: "Metroid Prime Remastered",
    source: "manual",
    platform: "switch",
    first_seen_at: "2026-09-11T12:00:00Z",
    last_seen_at: "2026-09-11T12:30:00Z",
    created_at: "2026-09-11T12:00:00Z",
    game_id: "game-100",
    game: {
      id: "game-100",
      title: "Metroid Prime Remastered",
      cover_art_url: "https://example.com/prime.jpg",
      platform: "switch",
    },
    ...overrides,
  };
}

describe("RecentPlaysList", () => {
  it("renders empty state when plays list is empty", () => {
    renderWithQueryClient(
      <RecentPlaysList plays={[]} heading="Recently Played" games={[]} />
    );
    expect(screen.getByText("Recently Played")).toBeInTheDocument();
    expect(screen.getByText("No play activity yet")).toBeInTheDocument();
  });

  it("renders interactive row when game_id is present and invokes onSelectGame", () => {
    const onSelectGame = vi.fn();
    const play = createMockPlay();

    renderWithQueryClient(
      <RecentPlaysList
        plays={[play]}
        heading="Recently Played"
        games={[]}
        onSelectGame={onSelectGame}
      />
    );

    expect(screen.getByText("Metroid Prime Remastered")).toBeInTheDocument();
    const rowButton = screen.getByRole("button", { name: /Metroid Prime Remastered/i });
    fireEvent.click(rowButton);

    expect(onSelectGame).toHaveBeenCalledWith("game-100");
  });

  it("renders non-interactive row when game_id is absent", () => {
    const onSelectGame = vi.fn();
    const play = createMockPlay({
      game_id: null,
      game: undefined,
      game_name: "Custom Retro Game",
    });

    renderWithQueryClient(
      <RecentPlaysList
        plays={[play]}
        heading="Recently Played"
        games={[]}
        onSelectGame={onSelectGame}
      />
    );

    expect(screen.getByText("Custom Retro Game")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Custom Retro Game/i })).not.toBeInTheDocument();
  });
});
