export const gameKeys = {
  all: ["games"] as const,
  byStatus: (status: string) => ["games", status] as const,
};

export const moodKeys = {
  all: ["moods"] as const,
};

export const statsKeys = {
  statusCounts: ["games", "stats"] as const,
};
