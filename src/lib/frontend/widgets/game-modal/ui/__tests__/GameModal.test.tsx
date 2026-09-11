import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameModal } from "../GameModal";
import { useGameModalStore } from "@/src/lib/frontend/shared";
import { useGameQuery } from "@/src/lib/frontend/entities/game";

// Mock hooks
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("@/src/lib/frontend/entities/game", () => ({
  useGameQuery: vi.fn(),
}));

vi.mock("@/src/lib/frontend/features/game-actions", () => ({
  useMoods: () => ({ moods: [] }),
  useGameActions: () => ({
    handleAdd: vi.fn(),
    handleEdit: vi.fn(),
    handleDelete: vi.fn(),
  }),
}));

vi.mock("@/src/lib/frontend/features/game-logs", () => ({
  GameLogTimeline: () => <div data-testid="mock-game-log-timeline">Timeline</div>,
}));

vi.mock("@/src/lib/frontend/shared/lib/useAuthFetch", () => ({
  useAuthFetch: () => ({
    authHeaders: () => ({}),
    authJsonFetch: vi.fn(),
    authDelete: vi.fn(),
  }),
}));

describe("GameModal State Machine", () => {
  const mockedUseGameQuery = vi.mocked(useGameQuery);

  beforeEach(() => {
    vi.clearAllMocks();
    useGameModalStore.setState({
      isOpen: false,
      mode: "add",
      gameId: null,
      defaultStatus: "backlog",
      activeTab: "details",
    });
  });

  it("renders null when modal is not open", () => {
    mockedUseGameQuery.mockReturnValue({
      games: [],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      gamesLoading: false,
      authLoading: false,
      invalidate: vi.fn(),
      queryKey: ["games"],
    });

    const { container } = render(<GameModal />);
    expect(container.firstChild).toBeNull();
  });

  it("renders Add Game spotlight when in add mode", () => {
    mockedUseGameQuery.mockReturnValue({
      games: [],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      gamesLoading: false,
      authLoading: false,
      invalidate: vi.fn(),
      queryKey: ["games"],
    });

    useGameModalStore.setState({
      isOpen: true,
      mode: "add",
      gameId: null,
    });

    render(<GameModal />);
    expect(screen.getByRole("heading", { name: "Add Game" })).toBeInTheDocument();
    expect(screen.getByText("Find a Game")).toBeInTheDocument();
  });

  it("renders loading skeleton in edit mode when isPending is true", () => {
    mockedUseGameQuery.mockReturnValue({
      games: [],
      isPending: true,
      isError: false,
      refetch: vi.fn(),
      gamesLoading: true,
      authLoading: false,
      invalidate: vi.fn(),
      queryKey: ["games"],
    });

    useGameModalStore.setState({
      isOpen: true,
      mode: "edit",
      gameId: "game-123",
    });

    render(<GameModal />);
    expect(screen.getByRole("heading", { name: "Loading Game..." })).toBeInTheDocument();
    expect(screen.getByTestId("game-modal-skeleton")).toBeInTheDocument();
  });

  it("renders error state in edit mode when isError is true", () => {
    mockedUseGameQuery.mockReturnValue({
      games: [],
      isPending: false,
      isError: true,
      refetch: vi.fn(),
      gamesLoading: false,
      authLoading: false,
      invalidate: vi.fn(),
      queryKey: ["games"],
    });

    useGameModalStore.setState({
      isOpen: true,
      mode: "edit",
      gameId: "game-123",
    });

    render(<GameModal />);
    expect(screen.getByRole("heading", { name: "Error Loading Game" })).toBeInTheDocument();
    expect(screen.getByTestId("game-modal-error")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("renders not found state in edit mode when game does not exist in catalog", () => {
    mockedUseGameQuery.mockReturnValue({
      games: [],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      gamesLoading: false,
      authLoading: false,
      invalidate: vi.fn(),
      queryKey: ["games"],
    });

    useGameModalStore.setState({
      isOpen: true,
      mode: "edit",
      gameId: "nonexistent-id",
    });

    render(<GameModal />);
    expect(screen.getByRole("heading", { name: "Game Not Found" })).toBeInTheDocument();
    expect(screen.getByTestId("game-modal-not-found")).toBeInTheDocument();
  });

  it("renders resolved game in edit mode", () => {
    const mockGame = {
      id: "game-123",
      title: "Chrono Trigger",
      platform: "snes" as const,
      status: "backlog" as const,
      priority_score: 85,
      background_url: null,
      cover_art_url: null,
      game_description: "Classic RPG",
      personal_note: "Play after work",
      rating: 5,
      rawg_id: null,
      igdb_id: null,
      replay_status: null,
      play_goals: [],
      moods: [],
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };

    mockedUseGameQuery.mockReturnValue({
      games: [mockGame],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      gamesLoading: false,
      authLoading: false,
      invalidate: vi.fn(),
      queryKey: ["games"],
    });

    useGameModalStore.setState({
      isOpen: true,
      mode: "edit",
      gameId: "game-123",
    });

    render(<GameModal />);
    expect(screen.getByRole("heading", { name: "Edit Chrono Trigger" })).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });
});
