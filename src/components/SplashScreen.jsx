import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext.jsx'
import FloatingIcons from './FloatingIcons.jsx'

const LEVELS = [
  { key: 'easy', label: 'Mudah', emoji: '🌱', color: '#4caf50' },
  { key: 'medium', label: 'Medium', emoji: '🌿', color: '#ff8c00' },
  { key: 'hard', label: 'Sulit', emoji: '🌵', color: '#e84393' },
]

export default function SplashScreen() {
  const { state, setProfile, setLevel, startGame } = useGame()
  const [name, setName] = useState(state.name || '')
  const [gender, setGender] = useState(state.gender || 'boy')
  const [level, setLocalLevel] = useState(state.level || 'medium')
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement))
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler)
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler)
    }
  }, [])

  const handleStart = () => {
    if (!name.trim()) return
    setProfile(name.trim(), gender)
    setLevel(level)
    startGame()
  }

  const toggleFullscreen = () => {
    const isFS = document.fullscreenElement || document.webkitFullscreenElement
    if (!isFS) {
      const el = document.documentElement
      if (el.requestFullscreen) el.requestFullscreen()
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    } else {
      if (document.exitFullscreen) document.exitFullscreen()
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    }
  }

  return (
    <>
      <FloatingIcons count={16} />
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: 24,
        background: 'linear-gradient(135deg, #f0f8ff 0%, #e8f4f8 100%)',
        position: 'relative',
        zIndex: 1,
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <label style={{
            fontSize: '0.85rem',
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
              padding: '10px 14px',
              fontSize: '1.3rem',
              fontFamily: "'Fredoka', sans-serif",
              border: '3px solid #c0d8e0',
              borderRadius: 14,
              outline: 'none',
              textAlign: 'center',
              background: '#fff',
              color: '#2c3e50',
              width: '100%',
              height: '52px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <span style={{
            fontSize: '0.85rem',
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 600,
            color: '#5a7a8a',
          }}>
            Kamu:
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setGender('boy')}
              style={{
                padding: '10px 16px',
                fontSize: '1.8rem',
                background: gender === 'boy' ? '#a8d8ea' : 'rgba(255,255,255,0.5)',
                borderRadius: 14,
                border: gender === 'boy' ? '3px solid #7ab8d4' : '2px solid #c0d8e0',
                transform: gender === 'boy' ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.15s',
                height: '52px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              👦
            </button>
            <button
              onClick={() => setGender('girl')}
              style={{
                padding: '10px 16px',
                fontSize: '1.8rem',
                background: gender === 'girl' ? '#f9e79f' : 'rgba(255,255,255,0.5)',
                borderRadius: 14,
                border: gender === 'girl' ? '3px solid #f0d060' : '2px solid #c0d8e0',
                transform: gender === 'girl' ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.15s',
                height: '52px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              👧
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <p style={{
          fontSize: '0.9rem',
          fontFamily: "'Quicksand', sans-serif",
          fontWeight: 600,
          color: '#5a7a8a',
        }}>
          Pilih Level Kamu:
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {LEVELS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLocalLevel(l.key)}
              style={{
                padding: '10px 16px',
                fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                fontFamily: "'Fredoka', sans-serif",
                fontWeight: 600,
                color: level === l.key ? '#fff' : '#5a7a8a',
                background: level === l.key ? l.color : 'rgba(255,255,255,0.5)',
                borderRadius: 14,
                border: level === l.key ? '3px solid transparent' : '2px solid #c0d8e0',
                transform: level === l.key ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {l.emoji} {l.label}
            </button>
          ))}
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
            ? 'linear-gradient(135deg, #4caf50, #2e7d32)'
            : '#ccc',
          borderRadius: 20,
          boxShadow: name.trim()
            ? '0 6px 20px rgba(76,175,80,0.4)'
            : 'none',
          transition: 'all 0.15s',
          letterSpacing: 2,
          opacity: name.trim() ? 1 : 0.5,
        }}
      >
        MULAI MAIN!
      </button>

      <button
        onClick={toggleFullscreen}
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
        {isFullscreen ? '⟳ Layar Normal' : '⛶ Layar Penuh'}
      </button>

      <p style={{
        fontSize: '0.75rem',
        fontFamily: "'Quicksand', sans-serif",
        color: '#b0c8d0',
        position: 'fixed',
        bottom: 8,
        zIndex: 2,
      }}>
        v{APP_VERSION}
      </p>
    </div>
    </>
  )
}
