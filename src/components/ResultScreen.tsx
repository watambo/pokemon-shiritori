import type { GameResult, Turn } from '../types';
import { allPokemon, getValidMoves, TYPE_JA } from '../lib/shiritori';

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

/**
 * プレイヤーターンの有効手の中から、語尾を「全ポケモンで返せる数」が少ない順に最大 maxCount 件返す。
 * 相手が1000種類知っていても詰まりやすい語尾 = 覚えると実戦で最も役立つポケモン。
 */
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
        // 全ポケモンで語尾から返せる数（ン終わり除外）= 相手が詰まりやすさの指標
        const score = getValidMoves(p.lastMora, usedIds, allPokemon)
          .filter(q => q.lastMora !== 'ン').length;
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

        {/* セクションタイトル + 共通説明 */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--gb-darkest)' }}>
            📌 このゲームでおぼえること
          </div>
          <div className="mt-1" style={{ fontSize: '8px', color: 'var(--gb-dark)' }}>
            語尾から返せる全ポケモンが少ないほど相手を追いつめやすい。
          </div>
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
            // 全ポケモン基準のレア度（スコアが低いほどレア）
            const isVeryRare = score <= 3;
            return (
              <div
                key={idx}
                className="p-2 flex flex-col gap-1"
                style={{
                  background: 'var(--gb-lightest)',
                  border: '3px solid var(--gb-darkest)',
                  borderLeft: `6px solid ${isVeryRare ? 'var(--gb-darkest)' : 'var(--gb-dark)'}`,
                }}
              >
                {/* ポケモン名 + 語尾カウント */}
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '14px', color: 'var(--gb-darkest)', fontWeight: 'bold' }}>
                    {p.nameJa}
                  </span>
                  <span
                    style={{
                      fontSize: '9px', padding: '1px 5px',
                      background: isVeryRare ? 'var(--gb-darkest)' : 'var(--gb-dark)',
                      color: 'var(--gb-lightest)',
                      border: '2px solid var(--gb-darkest)',
                    }}
                  >
                    ごび「{mora}」{score}しゅ
                  </span>
                </div>

                {/* 世代・タイプ */}
                <div className="flex gap-2 items-center" style={{ fontSize: '8px', color: 'var(--gb-dark)' }}>
                  {p.generation > 2 && <span>Gen{p.generation}</span>}
                  {p.types.length > 0 && <span>{typeLabel(p.types)}</span>}
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
