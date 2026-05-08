import { useEffect, useRef, useState } from 'react';
import type { GameState } from '../hooks/useGame';
import { getAdvantageLabel, getAdvantageLevel, getHintCandidates, TYPE_JA } from '../lib/shiritori';

interface Props {
  state: GameState;
  onSubmit: (input: string) => void;
  onGiveUp: () => void;
}

const ADV_COLOR = {
  great: 'var(--gb-darkest)',
  ok: 'var(--gb-dark)',
  danger: 'var(--gb-darkest)',
};

function AdvBadge({ score }: { score: number }) {
  const level = getAdvantageLevel(score);
  const label = getAdvantageLabel(score);
  return (
    <span
      className={`text-[6px] px-1 ${level === 'danger' ? 'blink' : ''}`}
      style={{ color: ADV_COLOR[level], background: 'var(--gb-light)', border: '2px solid var(--gb-darkest)' }}
    >
      {label}
    </span>
  );
}

export function GameScreen({ state, onSubmit, onGiveUp }: Props) {
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.history]);

  // Focus input when it becomes player's turn
  useEffect(() => {
    if (state.isPlayerTurn) inputRef.current?.focus();
  }, [state.isPlayerTurn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input);
    setInput('');
  };

  const timerPct = (state.timeLeft / 60) * 100;
  const timerWarn = state.timeLeft <= 15;

  // Hints: Gen1/2 first, fallback to major Pokémon
  const hintCandidates = getHintCandidates(state.currentMora, state.usedIds);

  return (
    <div className="gb-screen flex flex-col h-full">
      {/* Timer bar */}
      <div style={{ background: 'var(--gb-light)', height: '12px', position: 'relative' }}>
        <div
          className={`timer-bar${timerWarn ? ' warn' : ''}`}
          style={{ width: `${timerPct}%` }}
        />
        <span
          className="absolute right-1 top-0 text-[7px] leading-[12px]"
          style={{ color: 'var(--gb-lightest)' }}
        >
          {state.timeLeft}s
        </span>
      </div>

      {/* Status bar */}
      <div
        className="flex justify-between items-center px-2 py-1 text-[7px]"
        style={{ background: 'var(--gb-dark)', color: 'var(--gb-lightest)' }}
      >
        <span>ターン {state.history.length}</span>
        <span>
          {state.isPlayerTurn ? '▶ あなたのばん' : '… CPUがかんがえ中'}
        </span>
        <span style={{ color: 'var(--gb-lightest)' }}>
          次: 「{state.currentMora}」
        </span>
      </div>

      {/* Chat area */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-2 flex flex-col gap-2"
        style={{ minHeight: 0 }}
      >
        {state.history.map((turn, i) => {
          const isCpu = turn.player === 'cpu';
          const level = getAdvantageLevel(turn.advantageScore);
          return (
            <div key={i} className={`flex flex-col ${isCpu ? 'items-start' : 'items-end'}`}>
              <div className={`text-[6px] mb-1 px-1`} style={{ color: 'var(--gb-dark)' }}>
                {isCpu ? 'CPU' : 'あなた'}
              </div>
              <div className={`bubble-${isCpu ? 'cpu' : 'player'} px-3 py-2 text-[11px] max-w-[80%]`}>
                {turn.pokemon.nameJa}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[6px]" style={{ color: 'var(--gb-dark)' }}>
                  語尾「{turn.pokemon.lastMora}」
                </span>
                <AdvBadge score={turn.advantageScore} />
                {level === 'danger' && (
                  <span className="text-[6px] blink" style={{ color: 'var(--gb-darkest)' }}>⚠</span>
                )}
              </div>
            </div>
          );
        })}

        {/* CPU thinking indicator */}
        {!state.isPlayerTurn && state.phase === 'playing' && (
          <div className="flex items-start">
            <div className="bubble-cpu px-3 py-2 text-[11px]">
              <span className="blink">▮▮▮</span>
            </div>
          </div>
        )}
      </div>

      {/* Hint card: shows progressively */}
      {(state.showHintName || state.showHintType) && state.isPlayerTurn && (
        <div className="hint-card mx-2 mb-1 p-2">
          <div className="text-[7px] mb-1" style={{ color: 'var(--gb-darkest)' }}>
            {hintCandidates.length > 0 && hintCandidates[0].isFallback
              ? '💡 ヒント（有名ポケモン）'
              : '💡 ヒント（初代・2代）'}
          </div>
          {hintCandidates.length > 0 ? (
            <div className="flex flex-col gap-1">
              {hintCandidates.map(({ pokemon: p, isFallback }) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span
                    className="text-[9px] px-2 py-0.5"
                    style={{ background: 'var(--gb-lightest)', border: '2px solid var(--gb-darkest)', color: 'var(--gb-darkest)', minWidth: '48px' }}
                  >
                    {[...p.nameJa].slice(0, 2).join('')}…
                  </span>
                  {isFallback && (
                    <span className="text-[6px]" style={{ color: 'var(--gb-dark)' }}>Gen{p.generation}</span>
                  )}
                  {state.showHintType && p.types.length > 0 && (
                    <span className="text-[7px]" style={{ color: 'var(--gb-darkest)' }}>
                      {p.types.map(t => TYPE_JA[t] ?? t).join('・')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[7px]" style={{ color: 'var(--gb-darkest)' }}>
              候補がありません
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="p-2" style={{ background: 'var(--gb-light)', borderTop: '4px solid var(--gb-darkest)' }}>
        {state.inputError && (
          <div
            className="text-[7px] mb-1 blink"
            style={{ color: 'var(--gb-darkest)' }}
          >
            ✕ {state.inputError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            className="gb-input flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={state.isPlayerTurn ? `「${state.currentMora}」から…` : ''}
            disabled={!state.isPlayerTurn}
            autoComplete="off"
          />
          <button
            type="submit"
            className="gb-btn"
            disabled={!state.isPlayerTurn || !input.trim()}
          >
            ▶
          </button>
        </form>
        <button
          className="text-[6px] mt-1 underline"
          style={{ color: 'var(--gb-darkest)', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={onGiveUp}
        >
          あきらめる
        </button>
      </div>
    </div>
  );
}
