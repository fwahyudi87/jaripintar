import { useGame } from '../context/GameContext.jsx'
import ScoreBar from './ScoreBar.jsx'

const MODULES = [
  {
    key: 'LETTER_HUNT',
    icon: '🔤',
    title: 'Berburu\nHuruf & Angka',
    desc: 'A-Z & 0-9',
    colors: ['#ff8c00', '#ff6b35'],
    unlocked: true,
  },
  {
    key: 'BALLOON_CATCH',
    icon: '🎈',
    title: 'Tangkap\nBalon',
    desc: 'Huruf A-Z',
    colors: ['#4ecdc4', '#44b09e'],
    unlockedKey: 'module2Unlocked',
  },
  {
    key: 'KITE_CATCH',
    icon: '🪁',
    title: 'Tangkap\nLayangan',
    desc: 'Angka 0-9',
    colors: ['#ff6b6b', '#e84393'],
    unlockedKey: 'module3Unlocked',
  },
  {
    key: 'ROCKET_CATCH',
    icon: '🚀',
    title: 'Tangkap\nRoket',
    desc: 'Campuran',
    colors: ['#a29bfe', '#6c5ce7'],
    unlockedKey: 'module4Unlocked',
  },
]

export default function MenuScreen() {
  const { state, setScreen, SCREEN } = useGame()

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScoreBar
        name={state.name}
        gender={state.gender}
        score={state.score}
        onBack={() => setScreen(SCREEN.SPLASH)}
      />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 16,
        background: 'linear-gradient(135deg, #f0f8ff 0%, #e8f4f8 100%)',
      }}>
        <h2 style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
          color: '#2c3e50',
          margin: '0 0 8px 0',
        }}>
          Pilih Permainan
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          width: 'min(480px, 100%)',
        }}>
          {MODULES.map((mod) => {
            const locked = mod.unlockedKey ? !state[mod.unlockedKey] : false
            return (
              <button
                key={mod.key}
                onClick={() => {
                  if (!locked) setScreen(SCREEN[mod.key])
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '20px 12px',
                  borderRadius: 20,
                  border: 'none',
                  background: locked
                    ? '#e0e8ec'
                    : `linear-gradient(135deg, ${mod.colors[0]}, ${mod.colors[1]})`,
                  boxShadow: locked
                    ? 'none'
                    : `0 4px 16px ${mod.colors[0]}40`,
                  cursor: locked ? 'default' : 'pointer',
                  opacity: locked ? 0.5 : 1,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!locked) {
                    e.currentTarget.style.transform = 'scale(1.04)'
                    e.currentTarget.style.boxShadow = `0 6px 24px ${mod.colors[0]}60`
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = locked ? 'none' : `0 4px 16px ${mod.colors[0]}40`
                }}
              >
                {locked && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 20,
                    fontSize: '2rem',
                  }}>
                    🔒
                  </div>
                )}
                <span style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>{mod.icon}</span>
                <span style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontWeight: 600,
                  fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                  color: locked ? '#8a9aa0' : '#fff',
                  textAlign: 'center',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.2,
                }}>
                  {mod.title}
                </span>
                <span style={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 600,
                  fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                  color: locked ? '#a0b0b8' : 'rgba(255,255,255,0.85)',
                }}>
                  {mod.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
