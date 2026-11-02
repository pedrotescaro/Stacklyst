import type { PublicQuestion } from './types';

/** A path label describes the whole segment between objectives, never a hidden tile cost. */
export function codePathInfo(question: PublicQuestion, index: number) {
  const board = question.code;
  if (!board || !board.tiles[index] || board.tiles[index].action) return null;
  const objectives = board.tiles.flatMap((tile, position) => (tile.action ? [position] : []));
  if (!objectives.length) return { kind: 'short' as const, steps: 1 };
  let steps: number;
  if (index === board.start) {
    steps = Math.min(...objectives.map((target) => Math.abs(target - index)));
  } else {
    const anchors = [...new Set([board.start, ...objectives])].sort((left, right) => left - right);
    const left = anchors.filter((anchor) => anchor < index).at(-1);
    const right = anchors.find((anchor) => anchor > index);
    steps =
      left !== undefined && right !== undefined
        ? right - left
        : Math.abs(index - (left ?? right ?? index));
  }
  steps = Math.max(1, steps);
  return { kind: steps > 1 ? ('long' as const) : ('short' as const), steps };
}
