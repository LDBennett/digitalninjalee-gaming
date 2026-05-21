export interface MoodState {
  readonly id: string;
  readonly name: string;
}

export function moodsEqual(a: MoodState, b: MoodState): boolean {
  return a.id === b.id;
}
