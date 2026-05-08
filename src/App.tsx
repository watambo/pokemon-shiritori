import { useGame } from './hooks/useGame';
import { TitleScreen } from './components/TitleScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import type { Difficulty } from './types';

export default function App() {
  const { state, startGame, submitAnswer, goToTitle } = useGame();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gb-bg)',
        padding: '16px',
      }}
    >
      {/* GB device shell */}
      <div
        style={{
          width: '380px',
          background: '#b0a0c8',
          borderRadius: '12px 12px 40px 40px',
          padding: '16px 16px 32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Screen bezel */}
        <div
          style={{
            background: '#3a3050',
            borderRadius: '8px 8px 16px 16px',
            padding: '12px',
            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.5)',
          }}
        >
          {/* Power LED */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
            <div
              style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 4px #00ff88',
              }}
            />
          </div>
          {/* Screen */}
          <div style={{ height: '440px', borderRadius: '4px', overflow: 'hidden' }}>
            {state.phase === 'title' && (
              <TitleScreen onStart={(d: Difficulty) => startGame(d)} />
            )}
            {state.phase === 'playing' && (
              <GameScreen
                state={state}
                onSubmit={submitAnswer}
                onGiveUp={goToTitle}
              />
            )}
            {state.phase === 'result' && state.result && (
              <ResultScreen
                result={state.result}
                onRetry={() => startGame(state.difficulty)}
                onTitle={goToTitle}
              />
            )}
          </div>
        </div>

        {/* Nintendo-style label */}
        <div style={{ textAlign: 'center' }}>
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#3a3050',
              letterSpacing: '0.2em',
            }}
          >
            POKEMON SHIRITORI
          </span>
        </div>

        {/* D-pad / buttons area (decorative) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 8px',
          }}
        >
          {/* D-pad */}
          <div style={{ position: 'relative', width: '56px', height: '56px' }}>
            {[
              { top: '0', left: '50%', transform: 'translateX(-50%)', h: '18px', w: '18px' },
              { bottom: '0', left: '50%', transform: 'translateX(-50%)', h: '18px', w: '18px' },
              { left: '0', top: '50%', transform: 'translateY(-50%)', h: '18px', w: '18px' },
              { right: '0', top: '50%', transform: 'translateY(-50%)', h: '18px', w: '18px' },
              { top: '50%', left: '50%', transform: 'translate(-50%,-50%)', h: '18px', w: '18px' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute', background: '#3a3050',
                  borderRadius: '2px', ...s,
                }}
              />
            ))}
          </div>

          {/* A/B buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#7040a0', boxShadow: '0 3px 0 #4a2080' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#904040', boxShadow: '0 3px 0 #602020' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
