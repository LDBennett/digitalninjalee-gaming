export const gameKeys = {
  all: ["games"] as const,
};

export const moodKeys = {
  all: ["moods"] as const,
};

export const gameLogKeys = {
  all: ["game-logs"] as const,
  byGame: (gameId: string) => ["game-logs", gameId] as const,
};
