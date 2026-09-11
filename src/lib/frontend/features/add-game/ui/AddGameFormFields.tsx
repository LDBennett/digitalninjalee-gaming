"use client";

import { GameDto, MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { StarRating } from "@/src/lib/frontend/shared";
import { useAddGameForm } from "../hooks/useAddGameForm";
import { EditMediaFields } from "./AddGameFormFields.Media";
import { GameEditorDetailsPanel } from "./GameEditor.DetailsPanel";
import { GameEditorGoalsPanel } from "./GameEditor.GoalsPanel";

interface AddGameFormFieldsProps {
  form: ReturnType<typeof useAddGameForm>;
  editGame?: GameDto | null;
  moods: MoodDto[];
}

export function AddGameFormFields({
  form,
  editGame,
  moods,
}: AddGameFormFieldsProps) {
  const { rating, setRating, personalNote, setPersonalNote } = form;

  return (
    <div className="space-y-4">
      <GameEditorDetailsPanel form={form} editGame={editGame} />
      <GameEditorGoalsPanel form={form} moods={moods} />

      {editGame && <EditMediaFields form={form} />}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          Your Rating
        </label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">
          Personal Note
        </label>
        <textarea
          value={personalNote}
          onChange={(e) => setPersonalNote(e.target.value)}
          placeholder="Where you left off, why you dropped it..."
          rows={2}
          className="focus:border-brand-600 w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none"
        />
      </div>
    </div>
  );
}
