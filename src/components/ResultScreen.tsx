import type { GameResult } from '../types';
import { getAdvantageLabel, getAdvantageLevel, getAdvantageScore, getHintCandidates, TYPE_JA } from '../lib/shiritori';

interface Props {
  result: GameResult;
  onRetry: () => void;
  onTitle: () => void;
}

const LOSE_REASON_LABEL: Record<GameResult['loseReason'], string> = {
  timeout: '時間切れ',
  'no-valid-moves': '候補なし',
  'n-ending': 'ンで終わった',
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
        <div className="text-[13px] mb-1">
          {playerWon ? '★ WIN! ★' : '× LOSE ×'}
        </div>
        <div className="text-[7px]">
          {result.history.length}ターン ／ {LOSE_REASON_LABEL[result.loseReason]}で
          {result.loser === 'player' ? 'あなたが' : 'CPUが'}負け
        </div>
      </div>

      {/* Timeout: show what could have been played */}
      {result.loseReason === 'timeout' && result.loser === 'player' && result.stuckMora && (() => {
        const usedIds = new Set(result.history.map(t => t.pokemon.id));
        const hints = getHintCandidates(result.stuckMora, usedIds);
        return (
          <div className="mx-2 mt-2 p-2" style={{ background: 'var(--gb-lightest)', border: '3px solid var(--gb-darkest)' }}>
            <div className="text-[7px] mb-1" style={{ color: 'var(--gb-darkest)' }}>
              ⏰ 「{result.stuckMora}」で時間切れ ── 出せたポケモン
            </div>
            {hints.length > 0 ? (
              <div className="flex flex-col gap-1">
                {hints.map(({ pokemon: p, isFallback }) => (
                  <div key={p.id} className="flex items-center gap-2 text-[8px]" style={{ color: 'var(--gb-darkest)' }}>
                    <span>{p.nameJa}</span>
                    {p.types.length > 0 && <span className="opacity-70">({typeLabel(p.types)})</span>}
                    {isFallback && <span className="text-[6px] opacity-60">Gen{p.generation}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[7px]" style={{ color: 'var(--gb-darkest)' }}>候補なし（詰み状態でした）</div>
            )}
          </div>
        );
      })()}

      {/* Turn review */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2" style={{ minHeight: 0 }}>
        <div className="text-[8px] mb-1" style={{ color: 'var(--gb-darkest)' }}>
          ── ふりかえり ──
        </div>

        {result.history.map((turn, i) => {
          const isCpu = turn.player === 'cpu';
          const level = getAdvantageLevel(turn.advantageScore);
          const best = turn.bestAlternative;
          const isOptimal = !best; // no better alternative exists

          return (
            <div
              key={i}
              className="flex flex-col gap-1 p-2"
              style={{
                background: isCpu ? 'var(--gb-dark)' : 'var(--gb-lightest)',
                border: '3px solid var(--gb-darkest)',
              }}
            >
              {/* Turn header */}
              <div className="flex justify-between items-center">
                <span
                  className="text-[7px]"
                  style={{ color: isCpu ? 'var(--gb-lightest)' : 'var(--gb-dark)' }}
                >
                  {i + 1}. {isCpu ? 'CPU' : 'あなた'}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: isCpu ? 'var(--gb-lightest)' : 'var(--gb-darkest)' }}
                >
                  {turn.pokemon.nameJa}
                </span>
                <span
                  className={`text-[7px] px-1 ${level === 'danger' && !isCpu ? 'blink' : ''}`}
                  style={{
                    background: 'var(--gb-light)',
                    border: '2px solid var(--gb-darkest)',
                    color: 'var(--gb-darkest)',
                  }}
                >
                  {getAdvantageLabel(turn.advantageScore)}
                </span>
              </div>

              {/* Player turn: best alternative */}
              {!isCpu && (
                <div
                  className="text-[6px] p-1 mt-1"
                  style={{
                    background: isOptimal ? 'var(--gb-light)' : 'var(--gb-lightest)',
                    border: `2px solid var(--gb-darkest)`,
                    color: 'var(--gb-darkest)',
                  }}
                >
                  {isOptimal ? (
                    <span>✓ これが最善でした！</span>
                  ) : (
                    <>
                      <div className="mb-1">
                        💡 最善手: <strong>{best!.nameJa}</strong>
                        {best!.types.length > 0 && (
                          <span className="ml-1 opacity-80">({typeLabel(best!.types)})</span>
                        )}
                      </div>
                      <div>
                        語尾「{best!.lastMora}」→ {getAdvantageLabel(getAdvantageScore(best!.lastMora))}
                        <span className="ml-2 opacity-70">
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
      <div
        className="flex gap-2 p-2"
        style={{ background: 'var(--gb-dark)', borderTop: '4px solid var(--gb-darkest)' }}
      >
        <button className="gb-btn flex-1 text-center text-[9px]" onClick={onRetry}>
          もう一度
        </button>
        <button
          className="gb-btn flex-1 text-center text-[9px]"
          style={{ background: 'var(--gb-darkest)' }}
          onClick={onTitle}
        >
          タイトルへ
        </button>
      </div>
    </div>
  );
}
