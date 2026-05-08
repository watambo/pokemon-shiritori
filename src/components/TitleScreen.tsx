import { useState } from 'react';
import type { Difficulty } from '../types';

interface Props {
  onStart: (difficulty: Difficulty) => void;
}

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'easy',   label: 'よわい',   desc: 'ランダムに選ぶ' },
  { value: 'medium', label: 'ふつう',   desc: '初代を狙って来る' },
  { value: 'hard',   label: 'つよい',   desc: '徹底的に追い詰める' },
];

export function TitleScreen({ onStart }: Props) {
  const [selected, setSelected] = useState<Difficulty>('medium');

  return (
    <div className="gb-screen flex flex-col items-center justify-between h-full p-4">
      {/* Title */}
      <div className="text-center mt-4" style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <div style={{ fontSize: '10px', lineHeight: '2', letterSpacing: '0.2em', color: 'var(--gb-dark)', marginBottom: '4px' }}>
          ★ POKEMON ★
        </div>
        <div style={{ fontSize: '16px', lineHeight: '2', color: 'var(--gb-darkest)', textShadow: '3px 3px 0 var(--gb-light)' }}>
          しりとり
        </div>
        <div style={{ fontSize: '16px', lineHeight: '2', color: 'var(--gb-darkest)', textShadow: '3px 3px 0 var(--gb-light)' }}>
          道場
        </div>
      </div>

      {/* Rules summary */}
      <div className="pixel-box p-3 w-full text-[7px] leading-loose" style={{ background: 'var(--gb-light)' }}>
        <div style={{ color: 'var(--gb-darkest)' }}>▸ 「ン」で終わると負け</div>
        <div style={{ color: 'var(--gb-darkest)' }}>▸ 1ターン60秒</div>
        <div style={{ color: 'var(--gb-darkest)' }}>▸ 20秒で名前ヒント</div>
        <div style={{ color: 'var(--gb-darkest)' }}>▸ 40秒でタイプヒント</div>
      </div>

      {/* Difficulty */}
      <div className="w-full">
        <div className="text-[8px] mb-3 text-center" style={{ color: 'var(--gb-darkest)' }}>
          むずかしさ
        </div>
        <div className="flex flex-col gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d.value}
              className={`gb-btn w-full text-left flex justify-between items-center${selected === d.value ? ' selected' : ''}`}
              onClick={() => setSelected(d.value)}
            >
              <span>{selected === d.value ? '▶ ' : '　'}{d.label}</span>
              <span className="text-[7px] opacity-80">{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start */}
      <button
        className="gb-btn w-full text-center text-[11px]"
        style={{ background: 'var(--gb-darkest)', color: 'var(--gb-lightest)' }}
        onClick={() => onStart(selected)}
      >
        ▶ はじめる
      </button>
    </div>
  );
}
