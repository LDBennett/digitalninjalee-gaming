export type LibraryTab = 'all' | 'completed' | 'main-complete' | 'ongoing' | 'dropped';

export const LIBRARY_TAB_STATUSES: Record<Exclude<LibraryTab, 'all'>, string> = {
  completed: 'completed',
  'main-complete': 'main-complete',
  ongoing: 'ongoing',
  dropped: 'dropped',
};

export const LIBRARY_TAB_LABELS: Record<LibraryTab, string> = {
  all: 'All',
  completed: 'Completed (100%)',
  'main-complete': 'Completed',
  ongoing: 'Ongoing',
  dropped: 'Dropped',
};
