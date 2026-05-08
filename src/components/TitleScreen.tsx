import { useState } from 'react';
import type { Difficulty } from '../types';

interface Props {
  onStart: (difficulty: Difficulty) => void;
}

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'easy',   label: 'よわい',  desc: 'ランダムにえらぶ' },
  { value: 'medium', label: 'ふつう',  desc: '1・2だいをねらう' },
  { value: 'hard',   label: 'つよい',  desc: 'ていこうさいしょう' },
];

export function TitleScreen({ onStart }: Props) {
  const [selected, setSelected] = useState<Difficulty>('medium');

  return (
    <div className="gb-screen flex flex-col items-center justify-between h-full p-4">
      {/* Title */}
      <div className="text-center mt-4" style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <div style={{ fontSize: '11px', lineHeight: '2', letterSpacing: '0.2em', color: 'var(--gb-dark)', marginBottom: '4px' }}>
          ★ POKEMON ★
        </div>
        <div style={{ fontSize: '18px', lineHeight: '2', color: 'var(--gb-darkest)', textShadow: '3px 3px 0 var(--gb-light)' }}>
          しりとり
        </div>
        <div style={{ fontSize: '18px', lineHeight: '2', color: 'var(--gb-darkest)', textShadow: '3px 3px 0 var(--gb-light)' }}>
          どうじょう
        </div>
      </div>

      {/* Rules summary */}
      <div className="pixel-box p-3 w-full leading-loose" style={{ background: 'var(--gb-light)', fontSize: '9px' }}>
        <div style={{ color: 'var(--gb-darkest)' }}>▸ 「ン」でおわるとまけ</div>
        <div style={{ color: 'var(--gb-darkest)' }}>▸ 1ターン60びょう</div>
        <div style={{ color: 'var(--gb-darkest)' }}>▸ 20びょうでなまえヒント</div>
        <div style={{ color: 'var(--gb-darkest)' }}>▸ 40びょうでくわしいヒント</div>
      </div>

      {/* Difficulty */}
      <div className="w-full">
        <div className="mb-3 text-center" style={{ fontSize: '10px', color: 'var(--gb-darkest)' }}>
          むずかしさ
        </div>
        <div className="flex flex-col gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d.value}
              className={`gb-btn w-full text-left flex justify-between items-center${selected === d.value ? ' selected' : ''}`}
              onClick={() => setSelected(d.value)}
            >
              <span style={{ fontSize: '11px' }}>{selected === d.value ? '▶ ' : '　'}{d.label}</span>
              <span style={{ fontSize: '8px', opacity: 0.85 }}>{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start — extra top margin for spacing */}
      <button
        className="gb-btn w-full text-center mt-4"
        style={{ background: 'var(--gb-darkest)', color: 'var(--gb-lightest)', fontSize: '13px' }}
        onClick={() => onStart(selected)}
      >
        ▶ はじめる
      </button>
    </div>
  );
}
