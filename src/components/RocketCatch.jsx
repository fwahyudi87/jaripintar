import { useState, useCallback, useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext.jsx'
import OnScreenKeyboard from './OnScreenKeyboard.jsx'
import ScoreBar from './ScoreBar.jsx'
import useGameLoop from '../hooks/useGameLoop.js'
import useLetterSound from '../hooks/useLetterSound.js'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const ROCKET_SPEED = 0.35
const SPAWN_INTERVAL = 2800
const ROCKET_COUNT = 4
const GAME_DURATION = 45000
const ROCKET_COLORS = ['#ff6b6b', '#ff8c00', '#4ecdc4', '#a8d8ea', '#b8a9c9', '#e84393']

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

export default function RocketCatch() {
  const { state, addScore, setScreen, SCREEN } = useGame()
  const [rockets, setRockets] = useState([])
  const [pressedKey, setPressedKey] = useState(null)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameOver, setGameOver] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const confettiRef = useRef(null)
  const playSound = useLetterSound()

  const gameOverRef = useRef(false)
  gameOverRef.current = gameOver

  const spawnRocket = useCallback(() => {
    setRockets((prev) => {
      if (prev.length >= ROCKET_COUNT) return prev
      const char = randomChar()
      const x = 10 + Math.random() * 60
      const color = ROCKET_COLORS[Math.floor(Math.random() * ROCKET_COLORS.length)]
      const id = Date.now() + Math.random()
      const drift = (Math.random() - 0.5) * 0.15
      return [...prev, { id, char, x, y: 0, color, drift }]
    })
  }, [])

  const handleKey = useCallback((key) => {
    if (gameOverRef.current) return
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)
    playSound(key)

    let hit = false
    setRockets((prev) => {
      const match = prev.find((r) => r.char === key.toUpperCase())
      if (match) {
        hit = true
        spawnConfetti(match.x, match.y)
        return prev.filter((r) => r.id !== match.id)
      }
      return prev
    })

    if (hit) {
      addScore(20)
      setFeedback('correct')
      setTimeout(() => setFeedback(null), 300)
    } else {
      setFeedback('wrong')
      setTimeout(() => setFeedback(null), 300)
    }
  }, [addScore, playSound])

  const spawnConfetti = (x, y) => {
    if (!confettiRef.current) return
    const rect = confettiRef.current.getBoundingClientRect()
    const cx = rect.left + (x / 100) * rect.width
    const cy = rect.top + (y / 100) * rect.height
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div')
      p.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        width: 6px; height: 6px;
        background: ${['#ff8c00','#ffd700','#4caf50','#ff6b6b','#a8d8ea','#f9e79f'][Math.floor(Math.random() * 6)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 999;
        transition: all 0.8s cubic-bezier(.25,.46,.45,.94);
      `
      document.body.appendChild(p)
      requestAnimationFrame(() => {
        p.style.transform = `translate(${(Math.random() - 0.5) * 250}px, ${(Math.random() - 0.5) * 250}px)`
        p.style.opacity = '0'
      })
      setTimeout(() => p.remove(), 900)
    }
  }

  useEffect(() => {
    spawnRocket()
    const startTime = Date.now()

    const spawnTimer = setInterval(() => {
      spawnRocket()
    }, SPAWN_INTERVAL)

    const gameTimer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, GAME_DURATION - elapsed)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(spawnTimer)
        clearInterval(gameTimer)
        setGameOver(true)
      }
    }, 100)

    return () => {
      clearInterval(spawnTimer)
      clearInterval(gameTimer)
    }
  }, [spawnRocket, gameKey])

  useGameLoop(() => {
    setRockets((prev) => {
      const next = prev.map((r) => ({
        ...r,
        y: r.y + ROCKET_SPEED,
        x: r.x + r.drift,
      })).filter((r) => r.y < 115)
      return next
    })
  }, !gameOver)

  const playAgain = () => {
    setGameOver(false)
    setRockets([])
    setTimeLeft(GAME_DURATION)
    setFeedback(null)
    setGameKey((k) => k + 1)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScoreBar
        name={state.name}
        gender={state.gender}
        score={state.score}
        onBack={() => setScreen(SCREEN.SPLASH)}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '4px 0',
      }}>
        <div style={{
          width: 'clamp(120px, 30vw, 200px)',
          height: 12,
          background: '#e0ecf0',
          borderRadius: 6,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(timeLeft / GAME_DURATION) * 100}%`,
            background: timeLeft < 10000 ? '#ff6b6b' : '#4caf50',
            borderRadius: 6,
            transition: 'width 0.1s linear',
          }} />
        </div>
      </div>

      <div
        ref={confettiRef}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #0b0e2a 0%, #1a1a4e 40%, #2d1b69 100%)',
        }}
      >
        {rockets.map((r) => (
          <div
            key={r.id}
            style={{
              position: 'absolute',
              left: `${r.x}%`,
              bottom: `${r.y}%`,
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <svg width="48" height="80" viewBox="0 0 48 80" fill="none">
              <polygon points="24,0 20,30 28,30" fill={r.color} />
              <rect x="18" y="30" width="12" height="28" rx="3" fill={r.color} />
              <rect x="18" y="30" width="12" height="28" rx="3" fill="url(#rocketShine)" opacity="0.3" />
              <rect x="22" y="14" width="4" height="10" rx="2" fill="#ffd700" opacity="0.8" />
              <polygon points="18,58 15,66 33,66 30,58" fill="#ff6b35" />
              <polygon points="18,66 14,72 34,72 30,66" fill="#ffd700" opacity="0.6" />
              <text x="24" y="44" textAnchor="middle" fill="#fff"
                fontFamily="'Comic Neue', cursive" fontWeight="700"
                fontSize="14" letterSpacing="1"
              >
                {r.char}
              </text>
              <rect x="21" y="30" width="6" height="26" rx="2" fill="rgba(255,255,255,0.15)" />
              <defs>
                <linearGradient id="rocketShine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        ))}

        {gameOver && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            gap: 12,
          }}>
            <p style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 700,
              color: '#ffd700',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}>
              Waktu Habis!
            </p>
            <p style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              fontFamily: "'Quicksand', sans-serif",
              color: '#4ecdc4',
            }}>
              Skor: {state.score}
            </p>
            <button
              onClick={playAgain}
              style={{
                padding: '14px 40px',
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                fontFamily: "'Fredoka', sans-serif",
                fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #ff6b6b, #e84393)',
                borderRadius: 16,
                boxShadow: '0 4px 16px rgba(255,107,107,0.4)',
              }}
            >
              Main Lagi!
            </button>
          </div>
        )}
      </div>

      <OnScreenKeyboard onKeyPress={handleKey} pressedKey={pressedKey} showNumbers />
    </div>
  )
}
