import type { GameResult } from '../types';
import { getAdvantageLabel, getAdvantageLevel, getAdvantageScore, getHintCandidates, TYPE_JA } from '../lib/shiritori';

interface Props {
  result: GameResult;
  onRetry: () => void;
  onTitle: () => void;
}

const LOSE_REASON_LABEL: Record<GameResult['loseReason'], string> = {
  timeout:          'じかんぎれ',
  'no-valid-moves': 'こうほなし',
  'n-ending':       'ンでおわった',
};

function typeLabel(types: string[]): string {
  return types.map(t => TYPE_JA[t] ?? t).join('・');
}

export function ResultScreen({ result, onRetry, onTitle }: Props) {
  const playerWon = result.winner === 'player';

  return (
    <div className="gb-screen flex flex-col h-full">
      {/* Header */}
      <div
        className="px-3 py-3 text-center"
        style={{ background: playerWon ? 'var(--gb-darkest)' : 'var(--gb-dark)', color: 'var(--gb-lightest)' }}
      >
        <div className="mb-1" style={{ fontSize: '15px' }}>
          {playerWon ? '★ WIN! ★' : '× LOSE ×'}
        </div>
        <div style={{ fontSize: '9px' }}>
          {result.history.length}ターン ／ {LOSE_REASON_LABEL[result.loseReason]}で
          {result.loser === 'player' ? 'あなたが' : 'CPUが'}まけ
        </div>
      </div>

      {/* Timeout: show available moves */}
      {result.loseReason === 'timeout' && result.loser === 'player' && result.stuckMora && (() => {
        const usedIds = new Set(result.history.map(t => t.pokemon.id));
        const hints = getHintCandidates(result.stuckMora, usedIds);
        return (
          <div className="mx-2 mt-2 p-2" style={{ background: 'var(--gb-lightest)', border: '3px solid var(--gb-darkest)' }}>
            <div className="mb-1" style={{ fontSize: '9px', color: 'var(--gb-darkest)' }}>
              ⏰ 「{result.stuckMora}」でじかんぎれ ── だせたポケモン
            </div>
            {hints.length > 0 ? (
              <div className="flex flex-col gap-1">
                {hints.map(({ pokemon: p, isFallback }) => (
                  <div key={p.id} className="flex items-center gap-2" style={{ fontSize: '10px', color: 'var(--gb-darkest)' }}>
                    <span>{p.nameJa}</span>
                    {p.types.length > 0 && <span style={{ opacity: 0.7 }}>({typeLabel(p.types)})</span>}
                    {isFallback && <span style={{ fontSize: '8px', opacity: 0.6 }}>Gen{p.generation}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '9px', color: 'var(--gb-darkest)' }}>こうほなし（つみでした）</div>
            )}
          </div>
        );
      })()}

      {/* Turn review */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2" style={{ minHeight: 0 }}>
        <div className="mb-1" style={{ fontSize: '10px', color: 'var(--gb-darkest)' }}>
          ── ふりかえり ──
        </div>

        {result.history.map((turn, i) => {
          const isCpu = turn.player === 'cpu';
          const level = getAdvantageLevel(turn.advantageScore);
          const best = turn.bestAlternative;
          const isOptimal = !best;

          return (
            <div
              key={i}
              className="flex flex-col gap-1 p-2"
              style={{ background: isCpu ? 'var(--gb-dark)' : 'var(--gb-lightest)', border: '3px solid var(--gb-darkest)' }}
            >
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '9px', color: isCpu ? 'var(--gb-lightest)' : 'var(--gb-dark)' }}>
                  {i + 1}. {isCpu ? 'CPU' : 'あなた'}
                </span>
                <span style={{ fontSize: '13px', color: isCpu ? 'var(--gb-lightest)' : 'var(--gb-darkest)' }}>
                  {turn.pokemon.nameJa}
                </span>
                <span
                  className={level === 'danger' && !isCpu ? 'blink' : ''}
                  style={{ fontSize: '9px', padding: '1px 4px', background: 'var(--gb-light)', border: '2px solid var(--gb-darkest)', color: 'var(--gb-darkest)' }}
                >
                  {getAdvantageLabel(turn.advantageScore)}
                </span>
              </div>

              {/* Best alternative for player turns */}
              {!isCpu && (
                <div
                  className="p-1 mt-1"
                  style={{ background: isOptimal ? 'var(--gb-light)' : 'var(--gb-lightest)', border: '2px solid var(--gb-darkest)', color: 'var(--gb-darkest)', fontSize: '8px' }}
                >
                  {isOptimal ? (
                    <span>✓ さいぜんてでした！</span>
                  ) : (
                    <>
                      <div className="mb-1">
                        💡 さいぜんて: <strong>{best!.nameJa}</strong>
                        {best!.types.length > 0 && (
                          <span className="ml-1" style={{ opacity: 0.8 }}>({typeLabel(best!.types)})</span>
                        )}
                      </div>
                      <div>
                        ごび「{best!.lastMora}」→ {getAdvantageLabel(getAdvantageScore(best!.lastMora))}
                        <span className="ml-2" style={{ opacity: 0.7 }}>
                          （あなたの「{turn.pokemon.lastMora}」は {getAdvantageLabel(turn.advantageScore)}）
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 p-2" style={{ background: 'var(--gb-dark)', borderTop: '4px solid var(--gb-darkest)' }}>
        <button className="gb-btn flex-1 text-center" style={{ fontSize: '11px' }} onClick={onRetry}>
          もう一度
        </button>
        <button
          className="gb-btn flex-1 text-center"
          style={{ fontSize: '11px', background: 'var(--gb-darkest)' }}
          onClick={onTitle}
        >
          タイトルへ
        </button>
      </div>
    </div>
  );
}
