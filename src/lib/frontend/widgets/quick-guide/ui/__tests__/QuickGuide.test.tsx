import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuickGuide } from "../QuickGuide";
import {
  useQuickGuideStore,
  useGameModalStore,
} from "@/src/lib/frontend/shared";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/backlog",
}));

// Mock hooks
vi.mock("@/src/lib/frontend/entities/game", () => ({
  useGameQuery: () => ({
    games: [
      { id: "1", title: "Game 1", status: "backlog", moods: [] },
      { id: "2", title: "Game 2", status: "playing", moods: [] },
      { id: "3", title: "Game 3", status: "completed", moods: [] },
    ],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  MoodBadge: ({ mood }: { mood: string }) => <span>{mood}</span>,
  PlatformIcon: () => <span>[Icon]</span>,
}));

vi.mock("@/src/lib/frontend/features/game-actions", () => ({
  useMoods: () => ({
    moods: [
      { id: "m1", name: "chill" },
      { id: "m2", name: "action" },
      { id: "m3", name: "rpg" },
      { id: "m4", name: "roguelike" },
      { id: "m5", name: "story" },
      { id: "m6", name: "co-op" },
      { id: "m7", name: "retro" },
      { id: "m8", name: "tactical" },
      { id: "m9", name: "strategy" },
      { id: "m10", name: "puzzle" },
    ],
  }),
}));

vi.mock("@/src/lib/frontend/features/recent-activity", () => ({
  useRecentActivity: () => ({
    recentPlays: [],
    recentLoading: false,
  }),
  LogPlayModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="mock-log-play-modal">Log Play Modal</div> : null,
}));

vi.mock("@/src/lib/frontend/features/roll-random", () => ({
  useRandomPick: () => ({
    candidates: [],
    pickedGame: null,
    noGamesMsg: "",
    pick: vi.fn(),
    reset: vi.fn(),
  }),
  GameCarousel: () => <div>Carousel</div>,
  RandomPickResult: () => <div>Pick Result</div>,
}));

describe("QuickGuide Widget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuickGuideStore.setState({ isOpen: false, shakeEnabled: true });
    useGameModalStore.setState({ isOpen: false });
  });

  it("renders nothing when closed", () => {
    render(<QuickGuide />);
    expect(screen.queryByText(/Bunker Guide/i)).not.toBeInTheDocument();
  });

  it("renders header, quick actions, roll section, and footer when open", () => {
    useQuickGuideStore.setState({ isOpen: true });
    render(<QuickGuide />);

    expect(screen.getByText(/Bunker Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
    expect(screen.getByText(/Add to Backlog/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Roll/i)).toBeInTheDocument();
    expect(screen.getByText(/Shake to Open Guide/i)).toBeInTheDocument();
  });

  it("calls closeGuide when close button is clicked", () => {
    useQuickGuideStore.setState({ isOpen: true });
    render(<QuickGuide />);

    const closeBtn = screen.getByLabelText(/Close guide/i);
    fireEvent.click(closeBtn);

    expect(useQuickGuideStore.getState().isOpen).toBe(false);
  });

  it("opens Add modal and closes guide when Add button is clicked", () => {
    useQuickGuideStore.setState({ isOpen: true });
    render(<QuickGuide />);

    const addBtn = screen.getByRole("button", { name: /Add to Backlog/i });
    fireEvent.click(addBtn);

    expect(useQuickGuideStore.getState().isOpen).toBe(false);
    expect(useGameModalStore.getState().isOpen).toBe(true);
    expect(useGameModalStore.getState().defaultStatus).toBe("backlog");
  });

  it("toggles shake detection state when switch is clicked", () => {
    useQuickGuideStore.setState({ isOpen: true, shakeEnabled: true });
    render(<QuickGuide />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "true");

    fireEvent.click(toggle);
    expect(useQuickGuideStore.getState().shakeEnabled).toBe(false);
  });

  it("closes when Escape key is pressed", () => {
    useQuickGuideStore.setState({ isOpen: true });
    render(<QuickGuide />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(useQuickGuideStore.getState().isOpen).toBe(false);
  });

  it("handles mood expansion, selection, active pinning, and clear", () => {
    useQuickGuideStore.setState({ isOpen: true });
    render(<QuickGuide />);

    // Initial collapsed state shows +2 more
    const expandBtn = screen.getByText(/\+2 more/i);
    expect(expandBtn).toBeInTheDocument();

    // Click expand to show all moods
    fireEvent.click(expandBtn);
    expect(screen.getByText(/Show less/i)).toBeInTheDocument();
    expect(screen.getByText("strategy")).toBeInTheDocument();
    expect(screen.getByText("puzzle")).toBeInTheDocument();

    // Select a mood
    const chillBtn = screen.getByText("chill");
    fireEvent.click(chillBtn);

    // Active count and clear button appear
    expect(screen.getByText(/1 active/i)).toBeInTheDocument();
    const clearBtn = screen.getByText(/Clear/i);
    expect(clearBtn).toBeInTheDocument();

    // Click clear
    fireEvent.click(clearBtn);
    expect(screen.queryByText(/1 active/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Clear/i)).not.toBeInTheDocument();
  });
});
