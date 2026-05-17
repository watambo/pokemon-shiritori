import type { GameResult, Turn } from '../types';
import { getAdvantageLabel, getAdvantageLevel, getAdvantageScore, getValidMoves, TYPE_JA } from '../lib/shiritori';

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

interface KeyLearning {
  pokemon: ReturnType<typeof getValidMoves>[0];
  mora: string;
  score: number;
}

/** プレイヤーターンの有効手の中から、語尾 advantage score が低い順に最大 maxCount 件返す */
function findKeyLearnings(history: Turn[], maxCount = 3): KeyLearning[] {
  const seenMoras = new Set<string>();
  const results: KeyLearning[] = [];
  const usedIds = new Set<number>();

  for (let i = 0; i < history.length; i++) {
    const turn = history[i];
    if (turn.player === 'player' && i > 0) {
      const prevMora = history[i - 1].pokemon.lastMora;
      const candidates = getValidMoves(prevMora, usedIds).filter(p => p.lastMora !== 'ン');
      for (const p of candidates) {
        if (seenMoras.has(p.lastMora)) continue;
        const score = getAdvantageScore(p.lastMora, usedIds);
        results.push({ pokemon: p, mora: p.lastMora, score });
        seenMoras.add(p.lastMora);
      }
    }
    usedIds.add(turn.pokemon.id);
  }

  return results.sort((a, b) => a.score - b.score).slice(0, maxCount);
}

export function ResultScreen({ result, onRetry, onTitle }: Props) {
  const playerWon = result.winner === 'player';
  const learnings = findKeyLearnings(result.history);

  return (
    <div className="gb-screen flex flex-col h-full">
      {/* ── Header ── */}
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

      {/* ── 今回の学び ── */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2" style={{ minHeight: 0 }}>

        {/* タイムアウト補足 */}
        {result.loseReason === 'timeout' && result.loser === 'player' && result.stuckMora && (
          <div
            className="px-2 py-1"
            style={{ background: 'var(--gb-dark)', color: 'var(--gb-lightest)', fontSize: '9px' }}
          >
            ⏰ 「{result.stuckMora}」で{LOSE_REASON_LABEL.timeout}
          </div>
        )}

        {/* セクションタイトル */}
        <div style={{ fontSize: '10px', color: 'var(--gb-darkest)' }}>
          📌 このゲームでおぼえること
        </div>

        {learnings.length === 0 ? (
          <div
            className="p-2"
            style={{ background: 'var(--gb-lightest)', border: '3px solid var(--gb-darkest)', fontSize: '9px', color: 'var(--gb-darkest)' }}
          >
            ✓ このゲームに新たな学びはありませんでした
          </div>
        ) : (
          learnings.map(({ pokemon: p, mora, score }, idx) => {
            const level = getAdvantageLevel(score);
            return (
              <div
                key={idx}
                className="p-2 flex flex-col gap-1"
                style={{
                  background: 'var(--gb-lightest)',
                  border: `3px solid var(--gb-darkest)`,
                  borderLeft: `6px solid ${level === 'danger' ? 'var(--gb-darkest)' : 'var(--gb-dark)'}`,
                }}
              >
                {/* ポケモン名 + 語尾バッジ */}
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '14px', color: 'var(--gb-darkest)', fontWeight: 'bold' }}>
                    {p.nameJa}
                  </span>
                  <span
                    className={level === 'danger' ? 'blink' : ''}
                    style={{
                      fontSize: '9px', padding: '1px 5px',
                      background: level === 'danger' ? 'var(--gb-darkest)' : 'var(--gb-dark)',
                      color: 'var(--gb-lightest)',
                      border: '2px solid var(--gb-darkest)',
                    }}
                  >
                    {getAdvantageLabel(score)}
                  </span>
                </div>

                {/* 世代・タイプ */}
                <div className="flex gap-2 items-center" style={{ fontSize: '8px', color: 'var(--gb-dark)' }}>
                  {p.generation > 2 && <span>Gen{p.generation}</span>}
                  {p.types.length > 0 && <span>{typeLabel(p.types)}</span>}
                </div>

                {/* 解説 */}
                <div
                  className="mt-1 px-2 py-1"
                  style={{ background: 'var(--gb-light)', fontSize: '8px', color: 'var(--gb-darkest)', lineHeight: 1.8 }}
                >
                  ごび「{mora}」はGen1・2が{score}しゅ。
                  {score === 0
                    ? '相手に選択肢がなく、かならず詰められる。'
                    : score <= 2
                    ? '相手の選択肢が少なく、追いつめやすい語尾。'
                    : '覚えておくと有利に進められる語尾。'}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── ボタン ── */}
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
