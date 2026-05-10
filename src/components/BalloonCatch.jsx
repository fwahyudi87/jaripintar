import { useState, useCallback, useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext.jsx'
import OnScreenKeyboard from './OnScreenKeyboard.jsx'
import ScoreBar from './ScoreBar.jsx'
import useGameLoop from '../hooks/useGameLoop.js'
import useLetterSound from '../hooks/useLetterSound.js'
import useSoundFeedback from '../hooks/useSoundFeedback.js'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const BALLOON_SPEED_MAP = { easy: 0.25, medium: 0.3, hard: 0.45 }
const SPAWN_INTERVAL = 2500
const BALLOON_COUNT = 5
const GAME_DURATION = 45000
const BALLOON_COLORS = ['#ff6b9d', '#ff8c00', '#4ecdc4', '#a8d8ea', '#f9e79f', '#ff6b6b', '#b8a9c9']

function randomLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)]
}

export default function BalloonCatch() {
  const { state, addScore, setScreen, SCREEN, unlockModule3, startModule3 } = useGame()
  const [balloons, setBalloons] = useState([])
  const [pressedKey, setPressedKey] = useState(null)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameOver, setGameOver] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [module3JustUnlocked, setModule3JustUnlocked] = useState(false)
  const confettiRef = useRef(null)
  const playSound = useLetterSound()
  const soundFeedback = useSoundFeedback()
  const balloonSpeed = BALLOON_SPEED_MAP[state.level]

  const gameOverRef = useRef(false)
  gameOverRef.current = gameOver

  const handleKey = useCallback((key) => {
    if (gameOverRef.current) return
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)
    playSound(key)

    let hit = false
    setBalloons((prev) => {
      const match = prev.find((b) => b.letter === key)
      if (match) {
        hit = true
        spawnConfetti(match.x)
        return prev.filter((b) => b.id !== match.id)
      }
      return prev
    })

    if (hit) {
      addScore(10)
      setFeedback('correct')
      soundFeedback.correct.play()
      setTimeout(() => setFeedback(null), 300)
    } else {
      setFeedback('wrong')
      soundFeedback.wrong.play()
      setTimeout(() => setFeedback(null), 300)
    }
  }, [addScore, playSound])

  const spawnConfetti = (x) => {
    if (!confettiRef.current) return
    const rect = confettiRef.current.getBoundingClientRect()
    const cx = rect.left + (x / 100) * rect.width
    const cy = rect.top + rect.height * 0.4
    for (let i = 0; i < 12; i++) {
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
        transition: all 0.6s cubic-bezier(.25,.46,.45,.94);
      `
      document.body.appendChild(p)
      requestAnimationFrame(() => {
        p.style.transform = `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px)`
        p.style.opacity = '0'
      })
      setTimeout(() => p.remove(), 700)
    }
  }

  const spawnBalloon = useCallback(() => {
    setBalloons((prev) => {
      if (prev.length >= BALLOON_COUNT) return prev
      const letter = randomLetter()
      const x = 10 + Math.random() * 60
      const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]
      const id = Date.now() + Math.random()
      return [...prev, { id, letter, x, y: 100, color }]
    })
  }, [])

  useEffect(() => {
    spawnBalloon()
    const startTime = Date.now()

    const spawnTimer = setInterval(() => {
      spawnBalloon()
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
  }, [spawnBalloon, gameKey])

  useGameLoop(() => {
    setBalloons((prev) => {
      const next = prev.map((b) => ({
        ...b,
        y: b.y - balloonSpeed,
      })).filter((b) => b.y > -10)
      return next
    })
  }, !gameOver)

  const handleGameOver = useCallback(() => {
    unlockModule3()
    setModule3JustUnlocked(true)
  }, [unlockModule3])

  const playAgain = () => {
    setGameOver(false)
    setBalloons([])
    setTimeLeft(GAME_DURATION)
    setFeedback(null)
    setModule3JustUnlocked(false)
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

      {feedback && (
        <div style={{
          padding: '8px 16px',
          margin: '0 12px 4px',
          background: feedback === 'correct' ? '#d4edda' : '#f8d7da',
          borderLeft: `4px solid ${feedback === 'correct' ? '#28a745' : '#dc3545'}`,
          borderRadius: 8,
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 600,
          fontSize: 'clamp(0.85rem, 2vw, 1rem)',
          color: feedback === 'correct' ? '#155724' : '#721c24',
          textAlign: 'center',
        }}>
          {feedback === 'correct' ? `KAMU HEBAT ${state.name}!` : `AYO ${state.name} KAMU BISA!`}
        </div>
      )}

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
          background: 'linear-gradient(180deg, #87ceeb 0%, #e0f4ff 60%, #f0f8ff 100%)',
          borderBottom: '3px solid #7ab8d4',
        }}
      >
        {balloons.map((b) => (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              bottom: `${b.y}%`,
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <svg width="64" height="80" viewBox="0 0 64 80" fill="none">
              <ellipse cx="32" cy="34" rx="30" ry="34" fill={b.color} />
              <ellipse cx="32" cy="34" rx="30" ry="34" fill="url(#shine)" opacity="0.4" />
              <polygon points="32,66 29,72 35,72" fill={b.color} />
              <line x1="32" y1="72" x2="32" y2="80" stroke="#aaa" strokeWidth="1.5" />
              <text x="32" y="40" textAnchor="middle" fill="#fff"
                fontFamily="'Comic Neue', cursive" fontWeight="700"
                fontSize="22" letterSpacing="1"
              >
                {b.letter}
              </text>
              <defs>
                <radialGradient id="shine" cx="35%" cy="30%" r="50%">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
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
            background: 'rgba(0,0,0,0.3)',
            gap: 12,
          }}>
            <p style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 700,
              color: '#fff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}>
              Waktu Habis!
            </p>
            <p style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              fontFamily: "'Quicksand', sans-serif",
              color: '#ffd700',
            }}>
              Skor: {state.score}
            </p>
            {!state.module3Unlocked && state.score >= 200 && (
              <button
                onClick={handleGameOver}
                style={{
                  padding: '12px 32px',
                  fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                  fontFamily: "'Fredoka', sans-serif",
                  fontWeight: 600,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #4ecdc4, #44b09e)',
                  borderRadius: 16,
                  boxShadow: '0 4px 16px rgba(78,205,196,0.4)',
                }}
              >
                🪁 Buka Layangan!
              </button>
            )}
            {state.module3Unlocked && (
              <button
                onClick={() => setScreen(SCREEN.KITE_CATCH)}
                style={{
                  padding: '12px 32px',
                  fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                  fontFamily: "'Fredoka', sans-serif",
                  fontWeight: 600,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #4ecdc4, #44b09e)',
                  borderRadius: 16,
                  boxShadow: '0 4px 16px rgba(78,205,196,0.4)',
                }}
              >
                🪁 Lanjut ke Layangan!
              </button>
            )}
            <button
              onClick={playAgain}
              style={{
                padding: '14px 40px',
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                fontFamily: "'Fredoka', sans-serif",
                fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #ff8c00, #ff6b35)',
                borderRadius: 16,
                boxShadow: '0 4px 16px rgba(255,140,0,0.4)',
              }}
            >
              Main Lagi!
            </button>
            <button
              onClick={() => setScreen(SCREEN.MENU)}
              style={{
                padding: '10px 24px',
                fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 600,
                color: '#5a7a8a',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 12,
                border: '2px solid #c0d8e0',
              }}
            >
              ← Kembali ke Menu
            </button>
          </div>
        )}
      </div>

      <OnScreenKeyboard onKeyPress={handleKey} pressedKey={pressedKey} />
    </div>
  )
}
