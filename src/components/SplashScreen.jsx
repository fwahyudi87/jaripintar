import { useState } from 'react'
import { useGame } from '../context/GameContext.jsx'

export default function SplashScreen() {
  const { state, setProfile, startGame } = useGame()
  const [name, setName] = useState(state.name || '')
  const [gender, setGender] = useState(state.gender || 'boy')

  const handleStart = () => {
    if (!name.trim()) return
    setProfile(name.trim(), gender)
    startGame()
  }

  const goFullscreen = () => {
    const el = document.documentElement
    if (el.requestFullscreen) {
      el.requestFullscreen()
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen()
    }
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 28,
      padding: 24,
      background: 'linear-gradient(135deg, #f0f8ff 0%, #e8f4f8 100%)',
    }}>
      <h1 style={{
        fontSize: 'clamp(2.5rem, 8vw, 5rem)',
        fontFamily: "'Fredoka', sans-serif",
        fontWeight: 700,
        color: '#ff8c00',
        textAlign: 'center',
        textShadow: '3px 3px 0 #ffd700',
        letterSpacing: 2,
      }}>
        JariPintar
      </h1>

      <p style={{
        fontSize: 'clamp(1rem, 3vw, 1.5rem)',
        fontFamily: "'Quicksand', sans-serif",
        color: '#5a7a8a',
        textAlign: 'center',
        maxWidth: 400,
      }}>
        Ayo belajar mengetik sambil bermain!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 'clamp(200px, 60vw, 320px)' }}>
        <label style={{
          fontSize: '0.9rem',
          fontFamily: "'Quicksand', sans-serif",
          fontWeight: 600,
          color: '#5a7a8a',
        }}>
          Nama kamu:
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama..."
          maxLength={20}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          style={{
            padding: '12px 16px',
            fontSize: '1.2rem',
            fontFamily: "'Fredoka', sans-serif",
            border: '3px solid #c0d8e0',
            borderRadius: 12,
            outline: 'none',
            textAlign: 'center',
            background: '#fff',
            color: '#2c3e50',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <p style={{
          fontSize: '0.9rem',
          fontFamily: "'Quicksand', sans-serif",
          fontWeight: 600,
          color: '#5a7a8a',
        }}>
          Kamu:
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setGender('boy')}
            style={{
              padding: '12px 24px',
              fontSize: '2rem',
              background: gender === 'boy' ? '#a8d8ea' : 'rgba(255,255,255,0.5)',
              borderRadius: 16,
              border: gender === 'boy' ? '3px solid #7ab8d4' : '2px solid #c0d8e0',
              transform: gender === 'boy' ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.15s',
            }}
          >
            👦
          </button>
          <button
            onClick={() => setGender('girl')}
            style={{
              padding: '12px 24px',
              fontSize: '2rem',
              background: gender === 'girl' ? '#f9e79f' : 'rgba(255,255,255,0.5)',
              borderRadius: 16,
              border: gender === 'girl' ? '3px solid #f0d060' : '2px solid #c0d8e0',
              transform: gender === 'girl' ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.15s',
            }}
          >
            👧
          </button>
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!name.trim()}
        style={{
          padding: '20px 60px',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 600,
          color: '#fff',
          background: name.trim()
            ? 'linear-gradient(135deg, #ff8c00, #ff6b35)'
            : '#ccc',
          borderRadius: 20,
          boxShadow: name.trim()
            ? '0 6px 20px rgba(255,140,0,0.4)'
            : 'none',
          transition: 'all 0.15s',
          letterSpacing: 2,
          opacity: name.trim() ? 1 : 0.5,
        }}
      >
        MULAI MAIN!
      </button>

      <button
        onClick={goFullscreen}
        style={{
          padding: '10px 24px',
          fontSize: '0.9rem',
          fontFamily: "'Quicksand', sans-serif",
          fontWeight: 600,
          color: '#5a7a8a',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: 12,
          border: '2px solid #c0d8e0',
        }}
      >
        Layar Penuh
      </button>

      <p style={{
        fontSize: '0.75rem',
        fontFamily: "'Quicksand', sans-serif",
        color: '#b0c8d0',
        position: 'fixed',
        bottom: 8,
      }}>
        v{APP_VERSION}
      </p>
    </div>
  )
}
