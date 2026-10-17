import { screen, fireEvent, render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardHeroCard } from "../HeroCard";
import type { GameDto } from "@/src/lib/backend/backlog/domain/models";

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

function createMockGame(overrides: Partial<GameDto> = {}): GameDto {
  return {
    id: "game-1",
    title: "Chrono Trigger",
    platform: "snes",
    status: "playing",
    priority_score: 85,
    cover_art_url: "https://example.com/cover.jpg",
    background_url: "https://example.com/bg.jpg",
    moods: [{ id: "m1", name: "story" }],
    play_goals: ["story-completion"],
    game_description: "A timeless classic RPG.",
    personal_note: "Currently at the End of Time.",
    rating: 5,
    ...overrides,
  };
}

describe("DashboardHeroCard", () => {
  it("renders empty state launchpad when playingGames is empty", () => {
    const onEmptyRoll = vi.fn();
    renderWithQueryClient(
      <DashboardHeroCard
        playingGames={[]}
        onEmptyRoll={onEmptyRoll}
      />
    );

    expect(screen.getByText("Nothing playing right now")).toBeInTheDocument();
    const rollBtn = screen.getByRole("button", { name: "Roll Random Game" });
    fireEvent.click(rollBtn);
    expect(onEmptyRoll).toHaveBeenCalledTimes(1);
  });

  it("renders game title, live telemetry beacon, moods, and screen-reader region", () => {
    const game = createMockGame();
    renderWithQueryClient(
      <DashboardHeroCard
        playingGames={[game]}
      />
    );

    expect(screen.getByText("Currently Playing")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Chrono Trigger" })).toBeInTheDocument();
    expect(screen.getByText("Story")).toBeInTheDocument();
    expect(screen.getByText(/Showing game 1 of 1: Chrono Trigger/i)).toBeInTheDocument();
  });

  it("executes onManageGame callback when Manage Game is clicked", () => {
    const onManageGame = vi.fn();
    const game = createMockGame();
    renderWithQueryClient(
      <DashboardHeroCard
        playingGames={[game]}
        onManageGame={onManageGame}
        isAuthenticated={true}
      />
    );

    const manageBtn = screen.getByRole("button", { name: /Manage Game/i });
    fireEvent.click(manageBtn);
    expect(onManageGame).toHaveBeenCalledWith("game-1");
  });

  it("executes onViewLogs callback when Timeline & Notes is clicked", () => {
    const onViewLogs = vi.fn();
    const game = createMockGame();
    renderWithQueryClient(
      <DashboardHeroCard
        playingGames={[game]}
        onViewLogs={onViewLogs}
        isAuthenticated={true}
      />
    );

    const logsBtn = screen.getByRole("button", { name: /Timeline & Notes/i });
    fireEvent.click(logsBtn);
    expect(onViewLogs).toHaveBeenCalledWith("game-1");
  });

  it("renders personal_note snippet only when authenticated", async () => {
    const game = createMockGame();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <DashboardHeroCard
          playingGames={[game]}
          isAuthenticated={false}
        />
      </QueryClientProvider>
    );

    // Unauthenticated: private note should NOT be displayed
    expect(screen.queryByText("Currently at the End of Time.")).not.toBeInTheDocument();

    // Authenticated: private note is displayed
    rerender(
      <QueryClientProvider client={queryClient}>
        <DashboardHeroCard
          playingGames={[game]}
          isAuthenticated={true}
        />
      </QueryClientProvider>
    );
    expect(await screen.findByText("Currently at the End of Time.")).toBeInTheDocument();
  });

  it("renders navigation controls and advances slides when multiple games are present", () => {
    const games = [
      createMockGame({ id: "g1", title: "Chrono Trigger" }),
      createMockGame({ id: "g2", title: "Metroid Prime" }),
    ];

    renderWithQueryClient(
      <DashboardHeroCard
        playingGames={games}
        isAuthenticated={true}
      />
    );

    expect(screen.getByRole("heading", { name: "Chrono Trigger" })).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: "Next game" });
    fireEvent.click(nextBtn);

    expect(screen.getByRole("heading", { name: "Metroid Prime" })).toBeInTheDocument();
  });

  it("caps mood tags to 4 on mobile and renders +N indicator chip", () => {
    const gameWith7Moods = createMockGame({
      moods: [
        { id: "1", name: "action" },
        { id: "2", name: "online" },
        { id: "3", name: "multiplayer" },
        { id: "4", name: "co-op" },
        { id: "5", name: "quick-session" },
        { id: "6", name: "new-release" },
        { id: "7", name: "fighting" },
      ],
    });

    renderWithQueryClient(<DashboardHeroCard playingGames={[gameWith7Moods]} />);

    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.getByText("Multiplayer")).toBeInTheDocument();
    expect(screen.getByText("Co-op")).toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
  });
});
