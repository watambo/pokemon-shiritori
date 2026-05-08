import type { Pokemon } from '../types';
import { normalizeKana } from './kana';
import rawData from '../data/pokemon.json';

export const TYPE_JA: Record<string, string> = {
  normal: 'ノーマル', fire: 'ほのお', water: 'みず', electric: 'でんき',
  grass: 'くさ', ice: 'こおり', fighting: 'かくとう', poison: 'どく',
  ground: 'じめん', flying: 'ひこう', psychic: 'エスパー', bug: 'むし',
  rock: 'いわ', ghost: 'ゴースト', dragon: 'ドラゴン', dark: 'あく',
  steel: 'はがね', fairy: 'フェアリー',
};

export const allPokemon: Pokemon[] = rawData as Pokemon[];
export const gen12Pokemon = allPokemon.filter(p => p.generation <= 2);

// Index: firstMora → Gen1/2 Pokémon
const gen12ByFirstMora: Record<string, Pokemon[]> = {};
for (const p of gen12Pokemon) {
  (gen12ByFirstMora[p.firstMora] ??= []).push(p);
}

// Index: nameJa → Pokemon (for fast lookup)
const pokemonByName: Record<string, Pokemon> = {};
for (const p of allPokemon) {
  pokemonByName[p.nameJa] = p;
}

// Gen3+ starters (first form of each generation's starter trio)
const STARTER_IDS = new Set([
  252, 255, 258,   // Gen3
  387, 390, 393,   // Gen4
  495, 498, 501,   // Gen5
  650, 653, 656,   // Gen6
  722, 725, 728,   // Gen7
  810, 813, 816,   // Gen8
  906, 909, 912,   // Gen9
]);

export function isMajorPokemon(p: Pokemon): boolean {
  return p.isLegendary || p.isMythical || STARTER_IDS.has(p.id);
}

export function getGen12Hints(mora: string, usedIds: Set<number>): Pokemon[] {
  return (gen12ByFirstMora[mora] ?? []).filter(p => !usedIds.has(p.id));
}

/** Returns hint candidates: Gen1/2 first, fallback to major Pokémon if none available */
export function getHintCandidates(mora: string, usedIds: Set<number>): { pokemon: Pokemon; isFallback: boolean }[] {
  const gen12 = getGen12Hints(mora, usedIds).filter(p => p.lastMora !== 'ン');
  if (gen12.length > 0) {
    return gen12.slice(0, 3).map(p => ({ pokemon: p, isFallback: false }));
  }
  // Fallback: major Pokémon (gen3+ starters, legendaries, mythicals) starting with this mora
  const major = allPokemon.filter(
    p => p.firstMora === mora && !usedIds.has(p.id) && p.generation > 2 && isMajorPokemon(p) && p.lastMora !== 'ン'
  ).slice(0, 3);
  return major.map(p => ({ pokemon: p, isFallback: true }));
}

/** How many Gen1/2 Pokémon can respond to this mora (advantage for player) */
export function getAdvantageScore(mora: string, usedIds: Set<number> = new Set()): number {
  return getGen12Hints(mora, usedIds).length;
}

export function getAdvantageLevel(score: number): 'great' | 'ok' | 'danger' {
  if (score >= 5) return 'great';
  if (score >= 2) return 'ok';
  return 'danger';
}

export function getAdvantageLabel(score: number): string {
  const level = getAdvantageLevel(score);
  if (level === 'great') return `★ ${score}しゅ`;
  if (level === 'ok')    return `△ ${score}しゅ`;
  return `✕ ${score}しゅ`;
}

export function getValidMoves(
  mora: string,
  usedIds: Set<number>,
  pool: Pokemon[] = allPokemon,
): Pokemon[] {
  return pool.filter(p => p.firstMora === mora && !usedIds.has(p.id));
}

export function findPokemon(nameJa: string): Pokemon | undefined {
  return pokemonByName[normalizeKana(nameJa)];
}

export function validatePlayerInput(
  input: string,
  currentMora: string,
  usedIds: Set<number>,
): { valid: boolean; error?: string; pokemon?: Pokemon } {
  const name = normalizeKana(input);
  if (!name) return { valid: false, error: 'なまえをにゅうりょくしてください' };

  const pokemon = findPokemon(name);
  if (!pokemon) return { valid: false, error: `「${name}」はポケモンではありません` };
  if (usedIds.has(pokemon.id)) return { valid: false, error: `「${name}」はすでにつかわれました` };
  if (pokemon.firstMora !== currentMora) {
    return { valid: false, error: `「${currentMora}」からはじめてください` };
  }
  if (pokemon.lastMora === 'ン') {
    return { valid: false, error: `「${name}」は「ン」でおわるのでまけです！` };
  }

  return { valid: true, pokemon };
}

/**
 * Best move for player from Gen1/2 only.
 * Picks the Gen1/2 Pokémon whose ending mora leaves the most Gen1/2 options for the player's NEXT turn.
 * (Ending on a well-covered mora makes it harder for CPU to trap the player.)
 */
export function getBestPlayerMove(
  mora: string,
  usedIds: Set<number>,
): Pokemon | undefined {
  // Only Gen1/2, no ン-ending
  const moves = getValidMoves(mora, usedIds, gen12Pokemon).filter(p => p.lastMora !== 'ン');
  if (!moves.length) return undefined;
  return moves.sort((a, b) => getAdvantageScore(b.lastMora, usedIds) - getAdvantageScore(a.lastMora, usedIds))[0];
}
