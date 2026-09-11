import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HeroCardLatestLog } from "../HeroCard.LatestLog";
import type { GameLogEntry } from "@/src/lib/backend/backlog/domain/models";

const mockUseGameLogs = vi.fn();

vi.mock("@/src/lib/frontend/features/game-logs", () => ({
  useGameLogs: (gameId: string | null) => mockUseGameLogs(gameId),
}));

describe("HeroCardLatestLog", () => {
  it("renders latest user note when logs contain a note entry", () => {
    const noteEntry: GameLogEntry = {
      id: "log-1",
      gameId: "game-1",
      userId: "user-1",
      type: "note",
      content: "Reached the final dungeon.",
      metadata: {},
      isPrivate: false,
      createdAt: "2026-09-11T12:00:00Z",
      updatedAt: "2026-09-11T12:00:00Z",
    };

    mockUseGameLogs.mockReturnValue({
      logs: [noteEntry],
      logsLoading: false,
    });

    render(
      <HeroCardLatestLog
        gameId="game-1"
        isAuthenticated={true}
        personalNote="Legacy note"
      />
    );

    expect(screen.getByText("Latest Log")).toBeInTheDocument();
    expect(screen.getByText(/Reached the final dungeon/i)).toBeInTheDocument();
  });

  it("renders milestone event when latest log is a status_change", () => {
    const statusEntry: GameLogEntry = {
      id: "log-2",
      gameId: "game-1",
      userId: "user-1",
      type: "status_change",
      content: null,
      metadata: { old_status: "backlog", new_status: "playing" },
      isPrivate: false,
      createdAt: "2026-09-11T12:00:00Z",
      updatedAt: "2026-09-11T12:00:00Z",
    };

    mockUseGameLogs.mockReturnValue({
      logs: [statusEntry],
      logsLoading: false,
    });

    render(
      <HeroCardLatestLog
        gameId="game-1"
        isAuthenticated={true}
      />
    );

    expect(screen.getByText(/Status updated to/i)).toBeInTheDocument();
    expect(screen.getByText(/playing/i)).toBeInTheDocument();
  });

  it("falls back to personalNote when logs are empty", () => {
    mockUseGameLogs.mockReturnValue({
      logs: [],
      logsLoading: false,
    });

    render(
      <HeroCardLatestLog
        gameId="game-1"
        isAuthenticated={true}
        personalNote="Dex build in progress."
      />
    );

    expect(screen.getByText("Scratchpad Note")).toBeInTheDocument();
    expect(screen.getByText("Dex build in progress.")).toBeInTheDocument();
  });

  it("falls back to gameDescription when logs and personalNote are absent", () => {
    mockUseGameLogs.mockReturnValue({
      logs: [],
      logsLoading: false,
    });

    render(
      <HeroCardLatestLog
        gameId="game-1"
        isAuthenticated={true}
        gameDescription="An epic RPG journey through time."
      />
    );

    expect(screen.getByText("An epic RPG journey through time.")).toBeInTheDocument();
  });

  it("does not query logs or display private notes when unauthenticated", () => {
    mockUseGameLogs.mockReturnValue({
      logs: [],
      logsLoading: false,
    });

    render(
      <HeroCardLatestLog
        gameId="game-1"
        isAuthenticated={false}
        personalNote="Secret private note."
        gameDescription="Public description."
      />
    );

    expect(mockUseGameLogs).toHaveBeenCalledWith(null);
    expect(screen.queryByText("Secret private note.")).not.toBeInTheDocument();
    expect(screen.getByText("Public description.")).toBeInTheDocument();
  });
});
