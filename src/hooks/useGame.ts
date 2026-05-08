import { useCallback, useEffect, useRef, useState } from 'react';
import type { Difficulty, GameResult, Turn } from '../types';
import { cpuThink } from '../lib/cpu';
import {
  gen12Pokemon,
  getAdvantageScore,
  getBestPlayerMove,
  getBestMoveAllGen,
  getValidMoves,
  validatePlayerInput,
} from '../lib/shiritori';

export interface GameState {
  phase: 'title' | 'playing' | 'result';
  difficulty: Difficulty;
  history: Turn[];
  usedIds: Set<number>;
  currentMora: string;
  timeLeft: number;
  isPlayerTurn: boolean;
  inputError: string;
  result: GameResult | null;
  showHintName: boolean;   // partial name hint (20s elapsed)
  showHintType: boolean;   // type hint (40s elapsed)
}

const TURN_TIME = 60;
const HINT_NAME_AT = 40;  // timeLeft=40 → 20s elapsed → show partial names
const HINT_TYPE_AT = 20;  // timeLeft=20 → 40s elapsed → show types

const INITIAL: GameState = {
  phase: 'title',
  difficulty: 'medium',
  history: [],
  usedIds: new Set(),
  currentMora: '',
  timeLeft: TURN_TIME,
  isPlayerTurn: false,
  inputError: '',
  result: null,
  showHintName: false,
  showHintType: false,
};

export function useGame() {
  const [state, setState] = useState<GameState>(INITIAL);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref for values the timer interval needs to access without stale closure
  const timerCtxRef = useRef<{ history: Turn[]; loseAs: 'player' | 'cpu'; currentMora: string }>({
    history: [],
    loseAs: 'player',
    currentMora: '',
  });

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const endGame = useCallback(
    (winner: 'player' | 'cpu', loseReason: GameResult['loseReason'], history: Turn[], stuckMora?: string) => {
      stopTimer();
      setState(s => ({
        ...s,
        phase: 'result',
        isPlayerTurn: false,
        result: {
          winner,
          loser: winner === 'player' ? 'cpu' : 'player',
          loseReason,
          history,
          stuckMora,
        },
      }));
    },
    [stopTimer],
  );

  const startTimer = useCallback(
    (history: Turn[], currentMora: string) => {
      stopTimer();
      timerCtxRef.current = { history, loseAs: 'player', currentMora };
      let time = TURN_TIME;

      setState(s => ({ ...s, timeLeft: time, showHintName: false, showHintType: false }));

      timerRef.current = setInterval(() => {
        time -= 1;
        if (time === HINT_NAME_AT) {
          setState(s => ({ ...s, timeLeft: time, showHintName: true }));
        } else if (time === HINT_TYPE_AT) {
          setState(s => ({ ...s, timeLeft: time, showHintType: true }));
        } else if (time <= 0) {
          stopTimer();
          endGame('cpu', 'timeout', timerCtxRef.current.history, timerCtxRef.current.currentMora);
        } else {
          setState(s => ({ ...s, timeLeft: time }));
        }
      }, 1000);
    },
    [stopTimer, endGame],
  );

  // CPU think happens in a setTimeout (simulates "thinking time")
  const doCpuTurn = useCallback(
    (mora: string, usedIds: Set<number>, history: Turn[], difficulty: Difficulty) => {
      const delay = 800 + Math.random() * 800;
      setTimeout(() => {
        const picked = cpuThink(mora, usedIds, difficulty);
        if (!picked) {
          endGame('player', 'no-valid-moves', history);
          return;
        }

        const newUsed = new Set(usedIds);
        newUsed.add(picked.id);
        const advScore = getAdvantageScore(picked.lastMora, newUsed);

        // Best alternative for post-game: move that gives player the most Gen1/2 options
        const allSafe = getValidMoves(mora, usedIds).filter(p => p.lastMora !== 'ン');
        const best = allSafe.sort(
          (a, b) =>
            getAdvantageScore(b.lastMora, newUsed) - getAdvantageScore(a.lastMora, newUsed),
        )[0];

        const turn: Turn = {
          player: 'cpu',
          pokemon: picked,
          advantageScore: advScore,
          bestAlternative: best?.id !== picked.id ? best : undefined,
        };
        const newHistory = [...history, turn];

        setState(s => ({
          ...s,
          history: newHistory,
          usedIds: newUsed,
          currentMora: picked.lastMora,
          isPlayerTurn: true,
        }));

        startTimer(newHistory, picked.lastMora);
      }, delay);
    },
    [endGame, startTimer],
  );

  const startGame = useCallback(
    (difficulty: Difficulty) => {
      stopTimer();
      const starters = gen12Pokemon.filter(p => p.lastMora !== 'ン');
      const first = starters[Math.floor(Math.random() * starters.length)];
      const usedIds = new Set<number>([first.id]);
      const advScore = getAdvantageScore(first.lastMora, usedIds);

      const firstTurn: Turn = { player: 'cpu', pokemon: first, advantageScore: advScore };
      const history = [firstTurn];

      setState({
        ...INITIAL,
        phase: 'playing',
        difficulty,
        history,
        usedIds,
        currentMora: first.lastMora,
        isPlayerTurn: true,
      });

      startTimer(history, first.lastMora);
    },
    [stopTimer, startTimer],
  );

  const submitAnswer = useCallback(
    (input: string) => {
      setState(s => {
        if (!s.isPlayerTurn || s.phase !== 'playing') return s;

        const result = validatePlayerInput(input, s.currentMora, s.usedIds);
        if (!result.valid) return { ...s, inputError: result.error ?? 'エラー' };

        const pokemon = result.pokemon!;
        const newUsed = new Set(s.usedIds);
        newUsed.add(pokemon.id);
        const advScore = getAdvantageScore(pokemon.lastMora, newUsed);

        // Best Gen1/2 alternative for this player turn
        const best12 = getBestPlayerMove(s.currentMora, s.usedIds);
        const best12Score = best12 ? getAdvantageScore(best12.lastMora, newUsed) : 0;

        // Best all-gen move — only store if it's a non-Gen1/2 Pokémon that's strictly better
        const bestAll = getBestMoveAllGen(s.currentMora, s.usedIds);
        const bestAllScore = bestAll ? getAdvantageScore(bestAll.lastMora, newUsed) : 0;
        const bestMoveAllGen =
          bestAll && bestAll.generation > 2 && bestAllScore > best12Score ? bestAll : undefined;

        const turn: Turn = {
          player: 'player',
          pokemon,
          advantageScore: advScore,
          bestAlternative: best12?.id !== pokemon.id ? best12 : undefined,
          bestMoveAllGen,
        };
        const newHistory = [...s.history, turn];

        stopTimer();
        // Trigger CPU turn outside this setState (cannot call hooks here)
        // We use a flag via ref and trigger in effect
        doCpuTurn(pokemon.lastMora, newUsed, newHistory, s.difficulty);

        return {
          ...s,
          history: newHistory,
          usedIds: newUsed,
          currentMora: pokemon.lastMora,
          isPlayerTurn: false,
          inputError: '',
          showHintName: false,
          showHintType: false,
        };
      });
    },
    [stopTimer, doCpuTurn],
  );

  const goToTitle = useCallback(() => {
    stopTimer();
    setState(INITIAL);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  return { state, startGame, submitAnswer, goToTitle };
}
