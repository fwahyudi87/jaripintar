import { useState, useCallback, useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext.jsx'
import OnScreenKeyboard from './OnScreenKeyboard.jsx'
import ScoreBar from './ScoreBar.jsx'
import useGameLoop from '../hooks/useGameLoop.js'
import useLetterSound from '../hooks/useLetterSound.js'

const NUMBERS = ['1','2','3','4','5','6','7','8','9','0']
const KITE_SPEED = 0.25
const SPAWN_INTERVAL = 2500
const KITE_COUNT = 4
const GAME_DURATION = 45000
const KITE_COLORS = ['#ff6b6b', '#ff8c00', '#4ecdc4', '#a8d8ea', '#f9e79f', '#b8a9c9', '#e84393']

function randomNumber() {
  return NUMBERS[Math.floor(Math.random() * NUMBERS.length)]
}

export default function KiteCatch() {
  const { state, addScore, setScreen, SCREEN } = useGame()
  const [kites, setKites] = useState([])
  const [pressedKey, setPressedKey] = useState(null)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameOver, setGameOver] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const startTimeRef = useRef(Date.now())
  const confettiRef = useRef(null)
  const playSound = useLetterSound()

  const spawnKite = useCallback(() => {
    setKites((prev) => {
      if (prev.length >= KITE_COUNT) return prev
      const number = randomNumber()
      const x = 10 + Math.random() * 60
      const color = KITE_COLORS[Math.floor(Math.random() * KITE_COLORS.length)]
      const id = Date.now() + Math.random()
      const fromRight = Math.random() > 0.5
      return [...prev, { id, number, x: fromRight ? 110 : -10, y: 20 + Math.random() * 50, color, fromRight }]
    })
  }, [])

  const handleKey = useCallback((key) => {
    if (gameOver) return
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)
    playSound(key)

    let hit = false
    setKites((prev) => {
      const match = prev.find((k) => k.number === key)
      if (match) {
        hit = true
        spawnConfetti(match.x, match.y)
        return prev.filter((k) => k.id !== match.id)
      }
      return prev
    })

    if (hit) {
      addScore(15)
      setFeedback('correct')
      setTimeout(() => setFeedback(null), 300)
    } else {
      setFeedback('wrong')
      setTimeout(() => setFeedback(null), 300)
    }
  }, [gameOver, addScore, playSound])

  const spawnConfetti = (x, y) => {
    if (!confettiRef.current) return
    const rect = confettiRef.current.getBoundingClientRect()
    const cx = rect.left + (x / 100) * rect.width
    const cy = rect.top + (y / 100) * rect.height
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

  useEffect(() => {
    spawnKite()
    startTimeRef.current = Date.now()

    const spawnTimer = setInterval(() => {
      spawnKite()
    }, SPAWN_INTERVAL)

    const gameTimer = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
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
  }, [spawnKite, gameKey])

  useGameLoop(() => {
    setKites((prev) => {
      const next = prev.map((k) => ({
        ...k,
        x: k.fromRight ? k.x - KITE_SPEED : k.x + KITE_SPEED,
        y: k.y + Math.sin(Date.now() / 800 + k.id) * 0.15,
      })).filter((k) => k.x > -15 && k.x < 115)
      return next
    })
  }, !gameOver)

  const playAgain = () => {
    setGameOver(false)
    setKites([])
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
          background: 'linear-gradient(180deg, #87ceeb 0%, #f0f8ff 100%)',
        }}
      >
        {kites.map((k) => (
          <div
            key={k.id}
            style={{
              position: 'absolute',
              left: `${k.x}%`,
              top: `${k.y}%`,
              transform: 'translateX(-50%)',
              transition: 'left 0.05s linear, top 0.05s linear',
            }}
          >
            <svg width="72" height="56" viewBox="0 0 72 56" fill="none">
              <polygon points="36,4 68,28 36,52 4,28" fill={k.color} stroke="#fff" strokeWidth="2" />
              <polygon points="36,10 56,28 36,46 16,28" fill="rgba(255,255,255,0.25)" />
              <text x="36" y="32" textAnchor="middle" fill="#fff"
                fontFamily="'Comic Neue', cursive" fontWeight="700"
                fontSize="18" letterSpacing="1"
              >
                {k.number}
              </text>
              <line x1="36" y1="52" x2="36" y2="56" stroke="#888" strokeWidth="1.5" />
              <polygon points="36,56 38,54 34,54" fill="#888" />
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
            <button
              onClick={playAgain}
              style={{
                padding: '14px 40px',
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                fontFamily: "'Fredoka', sans-serif",
                fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #4ecdc4, #44b09e)',
                borderRadius: 16,
                boxShadow: '0 4px 16px rgba(78,205,196,0.4)',
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
