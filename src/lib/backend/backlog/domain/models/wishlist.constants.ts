export type WishlistTab = 'interested' | 'pre-ordered' | 'keep-an-eye-on' | 'all';

export const ALL_WISHLIST_STATUSES = 'interested,pre-ordered,keep-an-eye-on';

export const WISHLIST_TAB_LABELS: Record<WishlistTab, string> = {
  all: 'All',
  interested: 'Interested',
  'pre-ordered': 'Pre-Ordered',
  'keep-an-eye-on': 'Keep an Eye On',
};
