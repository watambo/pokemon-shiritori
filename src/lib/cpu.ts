import type { Difficulty, Pokemon } from '../types';
import { getValidMoves, getAdvantageScore } from './shiritori';

function pickRandom<T>(arr: T[]): T | undefined {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}

/** CPU picks the move that minimizes Gen1/2 options for the player */
function pickMinAdvantage(moves: Pokemon[], usedIds: Set<number>): Pokemon | undefined {
  if (!moves.length) return undefined;
  return [...moves].sort(
    (a, b) => getAdvantageScore(a.lastMora, usedIds) - getAdvantageScore(b.lastMora, usedIds)
  )[0];
}

export function cpuThink(
  currentMora: string,
  usedIds: Set<number>,
  difficulty: Difficulty,
): Pokemon | undefined {
  const all = getValidMoves(currentMora, usedIds);
  const safe = all.filter(p => p.lastMora !== 'ン');
  const pool = safe.length ? safe : all; // fallback: use ン-ending if no choice

  switch (difficulty) {
    case 'easy':
      return pickRandom(pool);
    case 'medium':
      return Math.random() < 0.6 ? pickMinAdvantage(pool, usedIds) : pickRandom(pool);
    case 'hard':
      return pickMinAdvantage(pool, usedIds);
  }
}
