'use client';

import { useState } from 'react';
import { GameDto } from '@/src/domains/games/models/game.types';
import { filterByMood, filterByTitle } from '@/src/domains/games/services/game.queries';

export function useGameFilters(games: GameDto[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const filtered = filterByTitle(filterByMood(games, moodFilter), searchQuery);
  return { searchQuery, setSearchQuery, moodFilter, setMoodFilter, filtered };
}
