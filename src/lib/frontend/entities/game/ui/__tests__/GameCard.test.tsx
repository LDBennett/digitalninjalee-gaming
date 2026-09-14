import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameCard } from "../GameCard/GameCard";
import type { GameDto } from "@/src/lib/backend/backlog/domain/models";

const baseGame: GameDto = {
  id: "test-game-1",
  title: "Test Adventure",
  platform: "pc",
  status: "playing",
  priority_score: 80,
  background_url: null,
  cover_art_url: null,
  game_description: "A great game",
  last_played_at: null,
  created_at: new Date().toISOString(),
  moods: [],
  replay_status: null,
  personal_note: null,
  rating: 4.5,
  play_goals: ["completionist"],
  time_to_beat: {
    schema_version: 1,
    main: 25.5,
    extra: 40,
    completionist: 65,
    source: "hltb",
    hltb_id: 1234,
    url: "https://howlongtobeat.com/game/1234",
    synced_at: new Date().toISOString(),
  },
  completion_roadmap: {
    schema_version: 1,
    difficulty: "4/10",
    time_estimate: "30-40 Hours",
    playthroughs: 1,
    missables: 2,
    difficulty_matters: false,
    guide_url: "https://www.powerpyx.com/test-guide/",
    source_name: "PowerPyx",
    updated_at: new Date().toISOString(),
  },
};

describe("GameCard", () => {
  it("renders game title and platform", () => {
    render(<GameCard game={baseGame} />);
    expect(screen.getByText("Test Adventure")).toBeInTheDocument();
  });

  it("renders pacing time_to_beat badge when present", () => {
    render(<GameCard game={baseGame} />);
    expect(screen.getByText("25.5h")).toBeInTheDocument();
  });

  it("renders completion_roadmap difficulty badge when present", () => {
    render(<GameCard game={baseGame} />);
    expect(screen.getByText("4/10")).toBeInTheDocument();
  });

  it("omits pacing and roadmap badges when metrics are absent", () => {
    const gameWithoutMetrics: GameDto = {
      ...baseGame,
      id: "test-game-2",
      time_to_beat: null,
      completion_roadmap: null,
    };
    render(<GameCard game={gameWithoutMetrics} />);
    expect(screen.queryByText("25.5h")).not.toBeInTheDocument();
    expect(screen.queryByText("4/10")).not.toBeInTheDocument();
  });
});
