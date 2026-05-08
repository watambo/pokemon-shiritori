export interface Pokemon {
  id: number;
  nameJa: string;
  generation: number;
  firstMora: string;
  lastMora: string;
  types: string[];
  isLegendary: boolean;
  isMythical: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type TurnPlayer = 'player' | 'cpu';
export type GamePhase = 'title' | 'playing' | 'result';
export type LoseReason = 'n-ending' | 'timeout' | 'no-valid-moves';

export interface Turn {
  player: TurnPlayer;
  pokemon: Pokemon;
  advantageScore: number;
  bestAlternative?: Pokemon;    // best Gen1/2 alternative
  bestMoveAllGen?: Pokemon;     // best all-gen move if better than Gen1/2 best (study target)
}

export interface GameResult {
  winner: TurnPlayer;
  loser: TurnPlayer;
  loseReason: LoseReason;
  history: Turn[];
  stuckMora?: string; // mora the player was stuck on when they timed out
}
