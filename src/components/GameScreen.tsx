import { useEffect, useRef, useState } from 'react';
import type { GameState } from '../hooks/useGame';
import { getHintCandidates, TYPE_JA } from '../lib/shiritori';

interface Props {
  state: GameState;
  onSubmit: (input: string) => void;
  onGiveUp: () => void;
}


export function GameScreen({ state, onSubmit, onGiveUp }: Props) {
  const [input, setInput] = useState('');
  const [showUsedList, setShowUsedList] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input);
    setInput('');
  };

  const timerPct = (state.timeLeft / 60) * 100;
  const timerWarn = state.timeLeft <= 15;
  const hintCandidates = getHintCandidates(state.currentMora, state.usedIds);

  return (
    <div className="gb-screen flex flex-col h-full">
      {/* Timer bar */}
      <div ref={topRef} style={{ background: 'var(--gb-light)', height: '14px', position: 'relative' }}>
        <div className={`timer-bar${timerWarn ? ' warn' : ''}`} style={{ width: `${timerPct}%` }} />
        <span className="absolute right-1 top-0 leading-[14px]" style={{ fontSize: '8px', color: 'var(--gb-lightest)' }}>
          {state.timeLeft}s
        </span>
      </div>

      {/* Status bar */}
      <div
        className="flex justify-between items-center px-2 py-1"
        style={{ background: 'var(--gb-dark)', color: 'var(--gb-lightest)', fontSize: '9px' }}
      >
        <span>ターン {state.history.length}</span>
        <span>{state.isPlayerTurn ? '▶ あなたのばん' : '… かんがえちゅう'}</span>
        <span>つぎ:「{state.currentMora}」</span>
      </div>

      {/* Used Pokémon toggle */}
      <button
        type="button"
        onClick={() => setShowUsedList(s => !s)}
        className="w-full flex justify-between items-center px-2 py-0.5"
        style={{ background: 'var(--gb-light)', borderBottom: '2px solid var(--gb-dark)', fontSize: '8px', color: 'var(--gb-darkest)', cursor: 'pointer' }}
      >
        <span>つかったポケモン ({state.history.length}こ)</span>
        <span>{showUsedList ? '▲ とじる' : '▼ みる'}</span>
      </button>
      {showUsedList && (
        <div
          className="px-2 py-1 flex flex-wrap gap-1 overflow-y-auto"
          style={{ maxHeight: '64px', background: 'var(--gb-lightest)', borderBottom: '2px solid var(--gb-dark)' }}
        >
          {state.history.map((turn, i) => (
            <span
              key={i}
              style={{
                fontSize: '8px',
                padding: '1px 4px',
                background: turn.player === 'cpu' ? 'var(--gb-dark)' : 'var(--gb-light)',
                color: turn.player === 'cpu' ? 'var(--gb-lightest)' : 'var(--gb-darkest)',
                border: '1px solid var(--gb-darkest)',
              }}
            >
              {turn.pokemon.nameJa}
            </span>
          ))}
        </div>
      )}

      {/* Chat area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-2 flex flex-col gap-2" style={{ minHeight: 0 }}>
        {state.history.map((turn, i) => {
          const isCpu = turn.player === 'cpu';
          return (
            <div key={i} className={`flex flex-col ${isCpu ? 'items-start' : 'items-end'}`}>
              <div className="mb-1 px-1" style={{ fontSize: '8px', color: 'var(--gb-dark)' }}>
                {isCpu ? 'CPU' : 'あなた'}
              </div>
              <div className={`bubble-${isCpu ? 'cpu' : 'player'} px-3 py-2 max-w-[80%]`} style={{ fontSize: '13px' }}>
                {turn.pokemon.nameJa}
              </div>
            </div>
          );
        })}

        {!state.isPlayerTurn && state.phase === 'playing' && (
          <div className="flex items-start">
            <div className="bubble-cpu px-3 py-2" style={{ fontSize: '13px' }}>
              <span className="blink">▮▮▮</span>
            </div>
          </div>
        )}
      </div>

      {/* Hint card */}
      {(state.showHintName || state.showHintType) && state.isPlayerTurn && (
        <div className="hint-card mx-2 mb-1 p-2">
          <div className="mb-1" style={{ fontSize: '9px', color: 'var(--gb-darkest)' }}>
            {hintCandidates.length > 0 && hintCandidates[0].isFallback
              ? '💡 ヒント（ゆうめいポケモン）'
              : '💡 ヒント（1・2だい）'}
          </div>
          {hintCandidates.length > 0 ? (
            <div className="flex flex-col gap-1">
              {hintCandidates.map(({ pokemon: p, isFallback }) => {
                const nameChars = [...p.nameJa];
                // at 40s elapsed: show 3 chars for long names, type for short (≤3 chars)
                const showExtra = state.showHintType;
                const isShortName = nameChars.length <= 3;
                const hintChars = showExtra && !isShortName ? 3 : 2;
                return (
                  <div key={p.id} className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5"
                      style={{ fontSize: '11px', background: 'var(--gb-lightest)', border: '2px solid var(--gb-darkest)', color: 'var(--gb-darkest)', minWidth: '56px' }}
                    >
                      {nameChars.slice(0, hintChars).join('')}…
                    </span>
                    {isFallback && (
                      <span style={{ fontSize: '8px', color: 'var(--gb-dark)' }}>Gen{p.generation}</span>
                    )}
                    {showExtra && isShortName && p.types.length > 0 && (
                      <span style={{ fontSize: '9px', color: 'var(--gb-darkest)' }}>
                        {p.types.map(t => TYPE_JA[t] ?? t).join('・')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '9px', color: 'var(--gb-darkest)' }}>こうほがありません</div>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="p-2" style={{ background: 'var(--gb-light)', borderTop: '4px solid var(--gb-darkest)' }}>
        {state.inputError && (
          <div className="mb-1 blink" style={{ fontSize: '9px', color: 'var(--gb-darkest)' }}>
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
            onBlur={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })}
          />
          <button type="submit" className="gb-btn" disabled={!state.isPlayerTurn || !input.trim()}>
            ▶
          </button>
        </form>
        <button
          className="mt-1 underline"
          style={{ fontSize: '8px', color: 'var(--gb-darkest)', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={onGiveUp}
        >
          あきらめる
        </button>
      </div>
    </div>
  );
}
