import { PlayingTab } from "./usePlaying";

export const TAB_VALUES: PlayingTab[] = [
  "playing",
  "ongoing",
  "replaying",
  "recently-played",
];

export const TAB_LABELS: Record<PlayingTab, string> = {
  playing: "Playing",
  ongoing: "Ongoing",
  replaying: "Replaying",
  "recently-played": "Recently Played",
};

export const EMPTY_STATE = {
  playing: {
    heading: "Nothing in progress",
    hint: "Head to your Backlog to start a game.",
  },
  ongoing: {
    heading: "No ongoing games",
    hint: "Move a game to Ongoing from the playing page.",
  },
  replaying: {
    heading: "No games being replayed",
    hint: "Mark a completed game as 'Replaying' to see it here.",
  },
} as const;
