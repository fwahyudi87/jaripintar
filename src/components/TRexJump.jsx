import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useGame } from '../context/GameContext.jsx'
import OnScreenKeyboard from './OnScreenKeyboard.jsx'
import ScoreBar from './ScoreBar.jsx'
import useGameLoop from '../hooks/useGameLoop.js'
import useLetterSound from '../hooks/useLetterSound.js'
import useSoundFeedback from '../hooks/useSoundFeedback.js'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SPAWN_INTERVAL_MAP = { easy: 3200, medium: 2600, hard: 2000 }
const OBSTACLE_SPEED_MAP = { easy: 0.25, medium: 0.4, hard: 0.6 }
const OBSTACLE_COUNT = 4
const GAME_DURATION = 45000
const TREX_X = 14

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

function generateObstacleChars(level) {
  const len = level === 'hard' ? 2 + Math.floor(Math.random() * 2) : level === 'medium' ? 1 + Math.floor(Math.random() * 2) : 1
  return Array.from({ length: len }, () => randomChar())
}

export default function TRexJump() {
  const { state, addScore, setScreen, SCREEN, completeModule6 } = useGame()
  const [obstacles, setObstacles] = useState([])
  const [pressedKey, setPressedKey] = useState(null)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameOver, setGameOver] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [trexState, setTrexState] = useState('running')
  const [obstaclesCleared, setObstaclesCleared] = useState(0)
  const playSound = useLetterSound()
  const soundFeedback = useSoundFeedback()

  const gameOverRef = useRef(false)
  gameOverRef.current = gameOver
  const obstaclesRef = useRef(obstacles)
  obstaclesRef.current = obstacles
  const trexStateRef = useRef(trexState)
  trexStateRef.current = trexState

  const obstacleSpeed = OBSTACLE_SPEED_MAP[state.level] || 0.4
  const spawnInterval = SPAWN_INTERVAL_MAP[state.level] || 2600

  const handleKey = useCallback((key) => {
    if (gameOverRef.current) return
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)
    playSound(key)

    const upper = key.toUpperCase()
    const obs = obstaclesRef.current
    let nearestIdx = -1
    for (let i = 0; i < obs.length; i++) {
      if (obs[i].typedIndex < obs[i].chars.length) {
        nearestIdx = i
        break
      }
    }
    if (nearestIdx === -1) {
      setFeedback('wrong')
      soundFeedback.wrong.play()
      setTimeout(() => setFeedback(null), 300)
      return
    }
    const target = obs[nearestIdx]
    const expected = target.chars[target.typedIndex]
    if (upper === expected) {
      const nextTyped = target.typedIndex + 1
      const cleared = nextTyped >= target.chars.length
      setObstacles((prev) => prev.map((o, i) =>
        i === nearestIdx ? { ...o, typedIndex: nextTyped } : o
      ))
      if (cleared) {
        addScore(15)
        setObstaclesCleared((c) => c + 1)
        setTrexState('jumping')
        setTimeout(() => setTrexState('running'), 400)
        setFeedback('correct')
        soundFeedback.correct.play()
        setTimeout(() => setFeedback(null), 300)
      } else {
        setTrexState('jumping')
        setTimeout(() => setTrexState('running'), 250)
        setFeedback('correct')
        soundFeedback.correct.play()
        setTimeout(() => setFeedback(null), 200)
      }
    } else {
      setFeedback('wrong')
      soundFeedback.wrong.play()
      setTrexState('stumbling')
      setTimeout(() => setTrexState('running'), 300)
      setTimeout(() => setFeedback(null), 300)
    }
  }, [addScore, playSound])

  const spawnObstacle = useCallback(() => {
    setObstacles((prev) => {
      if (prev.length >= OBSTACLE_COUNT) return prev
      const chars = generateObstacleChars(state.level)
      const id = Date.now() + Math.random()
      return [...prev, { id, chars, typedIndex: 0, x: 105 }]
    })
  }, [state.level])

  useEffect(() => {
    spawnObstacle()
    const startTime = Date.now()
    const spawnTimer = setInterval(() => {
      spawnObstacle()
    }, spawnInterval)
    const gameTimer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, GAME_DURATION - elapsed)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(spawnTimer)
        clearInterval(gameTimer)
        setGameOver(true)
        setTrexState('running')
      }
    }, 100)
    return () => {
      clearInterval(spawnTimer)
      clearInterval(gameTimer)
    }
  }, [spawnObstacle, spawnInterval, gameKey])

  useGameLoop(() => {
    setObstacles((prev) => {
      const next = prev.map((o) => ({
        ...o,
        x: o.x - obstacleSpeed,
      })).filter((o) => o.x > -15)
      return next
    })
  }, !gameOver)

  const playAgain = () => {
    setGameOver(false)
    setObstacles([])
    setTimeLeft(GAME_DURATION)
    setFeedback(null)
    setObstaclesCleared(0)
    setTrexState('running')
    setGameKey((k) => k + 1)
  }

  const handleGameOver = useCallback(() => {
    completeModule6()
  }, [completeModule6])

  const activeObstacle = useMemo(() => {
    return obstacles.find((o) => o.typedIndex < o.chars.length) || null
  }, [obstacles])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScoreBar
        name={state.name}
        gender={state.gender}
        score={state.score}
        onBack={() => setScreen(SCREEN.MENU)}
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
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #f0f8ff 0%, #e8f4f8 100%)',
      }}>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: 'linear-gradient(0deg, #d4a574 0%, #e8c9a0 60%, transparent 100%)',
        }} />

        <div style={{
          position: 'absolute',
          bottom: '26%',
          left: 0,
          right: 0,
          height: 3,
          background: '#b8956a',
          opacity: 0.5,
        }} />

        <div style={{
          position: 'absolute',
          left: `${TREX_X}%`,
          bottom: '27%',
          transform: trexState === 'jumping' ? 'translateY(-55px) rotate(-8deg)' : trexState === 'stumbling' ? 'translateY(4px) rotate(12deg)' : 'translateY(0)',
          transition: 'transform 0.15s ease-out',
          zIndex: 2,
        }}>
          <svg width="100" height="92" viewBox="0 0 100 92" fill="none" style={{ display: 'block' }}>
            <style>{`
              .leg-back { animation: runLegBack 0.3s infinite ease-in-out; transform-origin: 42px 76px; }
              .leg-front { animation: runLegFront 0.3s infinite ease-in-out; transform-origin: 58px 76px; }
              .arm { animation: armSwing 0.3s infinite ease-in-out; transform-origin: 56px 52px; }
              @keyframes runLegBack {
                0%, 100% { transform: rotate(-12deg); }
                50% { transform: rotate(12deg); }
              }
              @keyframes runLegFront {
                0%, 100% { transform: rotate(12deg); }
                50% { transform: rotate(-12deg); }
              }
              @keyframes armSwing {
                0%, 100% { transform: rotate(-5deg); }
                50% { transform: rotate(5deg); }
              }
            `}</style>
            <path d="M18 50 Q6 42 3 26 Q1 18 8 12" stroke="#4a8c5c" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7"/>
            <ellipse cx="46" cy="46" rx="22" ry="24" fill="#4a8c5c"/>
            <ellipse cx="46" cy="49" rx="13" ry="17" fill="#6bbf7a" opacity="0.3"/>
            <g className="leg-back">
              <rect x="38" y="74" width="8" height="14" rx="3" fill="#3d7048"/>
              <ellipse cx="42" cy="89" rx="7" ry="3.5" fill="#3d7048"/>
            </g>
            <g className="leg-front">
              <rect x="54" y="74" width="8" height="14" rx="3" fill="#4a8c5c"/>
              <ellipse cx="58" cy="89" rx="7" ry="3.5" fill="#4a8c5c"/>
              <circle cx="53" cy="90" r="1.5" fill="#3d7048"/>
              <circle cx="58" cy="91" r="1.5" fill="#3d7048"/>
              <circle cx="63" cy="90" r="1.5" fill="#3d7048"/>
            </g>
            <ellipse cx="74" cy="22" rx="18" ry="16" fill="#4a8c5c"/>
            <ellipse cx="72" cy="19" rx="12" ry="10" fill="#6bbf7a" opacity="0.15"/>
            <path d="M58 32 Q72 42 90 30" fill="#4a8c5c"/>
            <circle cx="78" cy="18" r="5.5" fill="#fff"/>
            <circle cx="79" cy="17" r="3" fill="#2d3436"/>
            <circle cx="80.5" cy="16" r="1.3" fill="#fff"/>
            <path d="M60 28 L88 28" stroke="#2d3436" strokeWidth="1.5" strokeLinecap="round"/>
            <polygon points="64,28 66,32 68,28" fill="#fff"/>
            <polygon points="72,28 74,32 76,28" fill="#fff"/>
            <polygon points="80,28 82,32 84,28" fill="#fff"/>
            <circle cx="89" cy="16" r="1.2" fill="#3d7048"/>
            <g className="arm">
              <path d="M56 42 Q48 38 44 43" stroke="#4a8c5c" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
            </g>
            <circle cx="32" cy="38" r="2.5" fill="#6bbf7a" opacity="0.35"/>
            <circle cx="36" cy="31" r="2" fill="#6bbf7a" opacity="0.25"/>
            <circle cx="27" cy="46" r="1.8" fill="#6bbf7a" opacity="0.3"/>
            <ellipse cx="62" cy="10" rx="3.5" ry="2" fill="#4a8c5c"/>
            <ellipse cx="70" cy="7" rx="3.5" ry="2" fill="#4a8c5c"/>
            <ellipse cx="78" cy="5" rx="3" ry="1.8" fill="#4a8c5c"/>
          </svg>
        </div>

        {obstacles.map((obs) => {
          const isActive = activeObstacle && activeObstacle.id === obs.id
          const currentChar = obs.chars[obs.typedIndex]
          return (
            <div
              key={obs.id}
              style={{
                position: 'absolute',
                left: `${obs.x}%`,
                bottom: '32%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 3,
                zIndex: 1,
              }}
            >
              {obs.chars.map((ch, ci) => {
                const isCurrent = ci === obs.typedIndex && isActive
                const isDone = ci < obs.typedIndex
                return (
                  <div
                    key={ci}
                    style={{
                      width: 34,
                      height: 34,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Comic Neue', cursive",
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: isDone ? '#fff' : isCurrent ? '#fff' : '#2c3e50',
                      background: isDone ? '#4caf50' : isCurrent ? '#ff8c00' : '#fff',
                      borderRadius: 6,
                      border: isCurrent ? '3px solid #ffd700' : '2px solid #c0d8e0',
                      boxShadow: isCurrent ? '0 0 12px rgba(255,140,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {ch}
                  </div>
                )
              })}
            </div>
          )
        })}

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
            zIndex: 10,
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
              color: '#fff',
            }}>
              Skor: {state.score}
            </p>
            <p style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
              fontFamily: "'Quicksand', sans-serif",
              color: '#ffd700',
            }}>
              Rintangan dilewati: {obstaclesCleared}
            </p>
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
              MAIN LAGI
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
              KEMBALI KE MENU
            </button>
          </div>
        )}
      </div>

      <OnScreenKeyboard onKeyPress={handleKey} pressedKey={pressedKey} showNumbers />

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  )
}
