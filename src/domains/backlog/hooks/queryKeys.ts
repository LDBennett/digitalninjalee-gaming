// The query keys for backlog-related queries

export const gameKeys = {
  // All games, regardless of status
  all: ["games"] as const,
  // Games by status (e.g. 'completed', 'ongoing', 'dropped')
  byStatus: (status: string) => ["games", status] as const,
};

export const moodKeys = {
  all: ["moods"] as const,
};
