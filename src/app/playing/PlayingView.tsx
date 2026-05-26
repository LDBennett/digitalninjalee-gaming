"use client";

import { useScrollToTop } from "@/src/domains/shared/hooks/useScrollToTop";
import { usePlaying, PlayingTab } from "./usePlaying";
import { GameCard } from "@/src/domains/games/components/GameCard";
import { GameCardList } from "@/src/domains/games/components/GameCardList";
import { AddGameModal } from "@/src/domains/games/components/AddGameModal";
import { MoodFilter } from "@/src/domains/games/components/MoodFilter";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { TabBar } from "@/src/components/ui/TabBar";

const TAB_VALUES: PlayingTab[] = ["playing", "ongoing"];
const TAB_LABELS: Record<PlayingTab, string> = {
  playing: "Playing",
  ongoing: "Ongoing",
};

const EMPTY_STATE = {
  playing: {
    heading: "Nothing in progress",
    hint: "Head to your Backlog to start a game.",
  },
  ongoing: {
    heading: "No ongoing games",
    hint: "Move a game to Ongoing from the playing page.",
  },
} as const;

export function PlayingView() {
  const {
    activeTab,
    setActiveTab,
    filtered,
    paginated,
    page,
    setPage,
    totalPages,
    moods,
    moodFilter,
    setMoodFilter,
    searchQuery,
    setSearchQuery,
    editGame,
    setEditGame,
    loading,
    isAuthenticated,
    handleStatusChange,
    handleEdit,
    handleDelete,
  } = usePlaying();

  const topRef = useScrollToTop(page);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-sm">Loading…</div>
      </div>
    );

  const emptyState = EMPTY_STATE[activeTab];
  const countLabel = activeTab === "playing" ? "active game" : "ongoing game";

  return (
    <div ref={topRef} className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-bold text-white text-2xl">Currently Playing</h1>
        <p className="mt-0.5 text-gray-500 text-sm">
          {filtered.length} {countLabel}
          {filtered.length !== 1 ? "s" : ""}
          {moodFilter ? ` · ${moodFilter}` : ""}
        </p>
      </div>

      <TabBar
        tabs={TAB_VALUES}
        value={activeTab}
        onChange={setActiveTab}
        labels={TAB_LABELS}
        className="mb-6"
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        className="mb-5"
      />

      <MoodFilter
        moods={moods}
        value={moodFilter}
        onChange={setMoodFilter}
        className="mb-5"
      />

      <GameCardList
        games={paginated}
        emptyState={
          <EmptyState
            heading={emptyState.heading}
            hint={moodFilter ? "Try another filter." : emptyState.hint}
          />
        }
        renderCard={(game) => (
          <GameCard
            key={game.id}
            game={game}
            onEdit={isAuthenticated ? setEditGame : undefined}
            onStatusChange={isAuthenticated ? handleStatusChange : undefined}
          />
        )}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {editGame && (
        <AddGameModal
          isOpen
          onClose={() => setEditGame(null)}
          onSave={handleEdit}
          onDelete={isAuthenticated ? handleDelete : undefined}
          editGame={editGame}
          moods={moods}
        />
      )}
    </div>
  );
}
