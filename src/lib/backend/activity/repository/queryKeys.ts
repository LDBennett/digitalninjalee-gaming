export const activityKeys = {
  all: ["recent-activity"] as const,
  recent: (limit: number) => [...activityKeys.all, { limit }] as const,
};
