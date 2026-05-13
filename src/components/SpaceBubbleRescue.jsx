import { useState, useCallback, useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext.jsx'
import OnScreenKeyboard from './OnScreenKeyboard.jsx'
import ScoreBar from './ScoreBar.jsx'
import useGameLoop from '../hooks/useGameLoop.js'
import useSoundFeedback from '../hooks/useSoundFeedback.js'
import useLetterSound from '../hooks/useLetterSound.js'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const TOTAL_ROUNDS = 8
const BUBBLES_PER_ROUND = 4
const FLOAT_SPEED = 0.18

function randomChar(exclude = []) {
  let c
  do { c = CHARS[Math.floor(Math.random() * CHARS.length)] } while (exclude.includes(c))
  return c
}

function spawnBubbles(target) {
  const letters = [target]
  while (letters.length < BUBBLES_PER_ROUND) {
    letters.push(randomChar(letters))
  }
  const shuffled = [...letters].sort(() => Math.random() - 0.5)
  return shuffled.map((letter, i) => ({
    id: Date.now() + i + Math.random(),
    letter,
    x: 12 + (i / (BUBBLES_PER_ROUND - 1)) * 76,
    y: 88,
    removed: false,
  }))
}

const BOING_COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff']

export default function SpaceBubbleRescue() {
  const { state, addScore, setScreen, SCREEN } = useGame()
  const soundFeedback = useSoundFeedback()

  const [bubbles, setBubbles] = useState([])
  const [targetLetter, setTargetLetter] = useState(null)
  const [round, setRound] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [roundState, setRoundState] = useState('idle')
  const [confettiItems, setConfettiItems] = useState([])
  const [boingItems, setBoingItems] = useState([])
  const [parachuteX, setParachuteX] = useState(null)
  const [parachuteY, setParachuteY] = useState(null)
  const [pressedKey, setPressedKey] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const playSound = useLetterSound()

  const gameAreaRef = useRef(null)

  const roundRef = useRef(round)
  roundRef.current = round
  const targetRef = useRef(targetLetter)
  targetRef.current = targetLetter

  function speak(text) {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'id-ID'
      utter.rate = 0.78
      speechSynthesis.speak(utter)
    }
  }

  const doConfetti = useCallback((cx, cy) => {
    const pts = Array.from({ length: 24 }, () => ({
      x: cx + (Math.random() - 0.5) * 80,
      y: cy + (Math.random() - 0.5) * 80,
      r: 3 + Math.random() * 5,
      c: ['#ffd700', '#ff6b6b', '#48dbfb', '#ff9ff3', '#feca57', '#54a0ff', '#ff8c00'][Math.floor(Math.random() * 7)],
      id: Math.random(),
    }))
    setConfettiItems(pts)
    setTimeout(() => setConfettiItems([]), 800)
  }, [])

  const startRound = useCallback(() => {
    const t = randomChar()
    setTargetLetter(t)
    setBubbles(spawnBubbles(t))
    setRoundState('active')
    setParachuteX(null)
    setParachuteY(null)
    setTimeout(() => speak(`Tolong selamatkan alien di huruf ${t}`), 400)
  }, [])

  const advanceRound = useCallback(() => {
    const next = roundRef.current + 1
    if (next > TOTAL_ROUNDS) {
      addScore(50)
      setGameOver(true)
      return
    }
    setRound(next)
    startRound()
  }, [addScore, startRound])

  useEffect(() => {
    startRound()
  }, [startRound])

  useGameLoop(() => {
    if (roundState !== 'active' || gameOver) return
    setBubbles((prev) => prev.map((b) => (b.removed ? b : { ...b, y: b.y - FLOAT_SPEED })))
  }, !gameOver)

  useEffect(() => {
    if (roundState !== 'active' || !targetLetter) return
    const floated = bubbles.find(b => !b.removed && b.letter === targetLetter && b.y < -10)
    if (floated) {
      setRoundState('missed')
      soundFeedback.wrong.play()
      setTimeout(() => startRound(), 1200)
    }
  }, [bubbles, targetLetter, roundState, soundFeedback, startRound])

  useEffect(() => {
    if (parachuteY === null || gameOver) return
    if (parachuteY < 75) {
      const timer = setTimeout(() => setParachuteY(p => p + 0.7), 30)
      return () => clearTimeout(timer)
    }
  }, [parachuteY, gameOver])

  const triggerCorrect = useCallback((bubbleId) => {
    setRoundState('popped')
    setBubbles((prev) => prev.map(b => (b.id === bubbleId ? { ...b, removed: true } : b)))
    const rect = gameAreaRef.current?.getBoundingClientRect()
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
    doConfetti(cx, cy)
    soundFeedback.correct.play()
    setParachuteX(50)
    setParachuteY(0)
    setTimeout(() => {
      if (roundRef.current >= TOTAL_ROUNDS) {
        addScore(30)
        setGameOver(true)
      } else {
        setRound(r => r + 1)
        startRound()
      }
    }, 1400)
  }, [doConfetti, soundFeedback, addScore, startRound])

  const triggerWrong = useCallback((bubbleId, bx, by) => {
    soundFeedback.wrong.play()
    setBubbles((prev) => prev.map(b => (b.id === bubbleId ? { ...b, removed: true } : b)))
    const pt = {
      x: bx + (Math.random() - 0.5) * 30,
      y: by + (Math.random() - 0.5) * 30,
      c: BOING_COLORS[Math.floor(Math.random() * BOING_COLORS.length)],
      id: Math.random(),
    }
    setBoingItems(prev => [...prev, pt])
    setTimeout(() => setBoingItems(prev => prev.filter(p => p.id !== pt.id)), 600)
  }, [soundFeedback])

  const handleBubbleClick = useCallback((e, id, letter) => {
    e.stopPropagation()
    if (roundState !== 'active') return
    const rect = e.currentTarget.getBoundingClientRect()
    if (letter === targetRef.current) {
      triggerCorrect(id)
    } else {
      triggerWrong(id, rect.left, rect.top)
    }
  }, [roundState, triggerCorrect, triggerWrong])

  const handleKey = useCallback((key) => {
    if (roundState !== 'active' || gameOver) return
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)
    playSound(key)

    const upper = key.toUpperCase()
    const target = targetRef.current
    const match = bubbles.find(b => !b.removed && b.letter === upper)

    if (upper === target && match) {
      setFeedback('correct')
      triggerCorrect(match.id)
    } else if (match) {
      setFeedback('wrong')
      triggerWrong(match.id, window.innerWidth / 2, window.innerHeight / 2)
    } else {
      setFeedback('wrong')
      soundFeedback.wrong.play()
    }
    setTimeout(() => setFeedback(null), 300)
  }, [roundState, gameOver, playSound, bubbles, triggerCorrect, triggerWrong, soundFeedback])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ScoreBar name={state.name} gender={state.gender} score={state.score} onBack={() => setScreen(SCREEN.MENU)} />

      {feedback && (
        <div style={{
          padding: '8px 16px', margin: '0 12px 4px',
          background: feedback === 'correct' ? '#d4edda' : '#f8d7da',
          borderLeft: `4px solid ${feedback === 'correct' ? '#28a745' : '#dc3545'}`,
          borderRadius: 8,
          fontFamily: "'Fredoka', sans-serif", fontWeight: 600,
          fontSize: 'clamp(0.85rem, 2vw, 1rem)',
          color: feedback === 'correct' ? '#155724' : '#721c24',
          textAlign: 'center',
        }}>
          {feedback === 'correct' ? `KAMU HEBAT ${state.name}!` : `AYO ${state.name} KAMU BISA!`}
        </div>
      )}

      <div ref={gameAreaRef} style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, #0c0e3a 0%, #1b1464 35%, #2d1b69 65%, #1a0a3e 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(72,219,251,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(255,159,243,0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 17 + 7) % 100}%`,
            top: `${(i * 13 + 3) % 100}%`,
            width: 1 + (i % 3), height: 1 + (i % 3),
            borderRadius: '50%', background: '#fff',
            opacity: 0.1 + (i % 5) * 0.08,
            pointerEvents: 'none',
          }} />
        ))}

        <div style={{
          position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center', zIndex: 5,
        }}>
          <p style={{
            fontSize: 'clamp(0.95rem, 2.5vw, 1.4rem)',
            fontFamily: "'Fredoka', sans-serif",
            color: '#ffd700', margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}>
            {roundState === 'active' && `Cari huruf ${targetLetter} 👾`}
            {roundState === 'popped' && '🎉 Yeay! Selamat!'}
            {roundState === 'missed' && 'Aduh, kabur! Coba lagi!'}
          </p>
          <p style={{
            fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
            fontFamily: "'Quicksand', sans-serif",
            color: 'rgba(255,215,0,0.5)', margin: '2px 0 0',
          }}>
            Ronde {round}/{TOTAL_ROUNDS}
          </p>
        </div>

        {!gameOver && bubbles.map((b) => {
          if (b.removed) return null
          return (
            <div
              key={b.id}
              onClick={(e) => handleBubbleClick(e, b.id, b.letter)}
              style={{
                position: 'absolute', left: `${b.x}%`, top: `${b.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 82, height: 82, borderRadius: '50%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 3,
                background: b.letter === targetLetter
                  ? 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.4) 0%, rgba(162,155,254,0.3) 40%, rgba(108,92,231,0.6) 70%, rgba(72,52,212,0.8) 100%)'
                  : 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35) 0%, rgba(72,219,251,0.2) 40%, rgba(72,219,251,0.5) 70%, rgba(10,189,227,0.7) 100%)',
                boxShadow: b.letter === targetLetter
                  ? '0 0 24px rgba(162,155,254,0.4), inset 0 -4px 8px rgba(0,0,0,0.15)'
                  : '0 0 20px rgba(72,219,251,0.3), inset 0 -4px 8px rgba(0,0,0,0.1)',
                border: b.letter === targetLetter
                  ? '2px solid rgba(162,155,254,0.5)'
                  : '2px solid rgba(255,255,255,0.15)',
                animation: 'bubbleBob 2.5s ease-in-out infinite',
                transition: 'opacity 0.2s',
              }}
            >
              <span style={{ fontSize: '1.6rem', lineHeight: 1.2 }}>
                {b.letter === targetLetter ? '👾' : '👽'}
              </span>
              <span style={{
                fontSize: '1.3rem', fontFamily: "'Comic Neue', cursive",
                fontWeight: 700, color: '#fff',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              }}>
                {b.letter}
              </span>
            </div>
          )
        })}

        {confettiItems.map(p => (
          <div key={p.id} style={{
            position: 'fixed',
            left: p.x, top: p.y,
            width: p.r, height: p.r,
            borderRadius: '50%', background: p.c,
            pointerEvents: 'none', zIndex: 999,
            animation: 'confettiPop 0.7s ease-out forwards',
          }} />
        ))}

        {parachuteX !== null && parachuteY !== null && parachuteY < 75 && (
          <div style={{
            position: 'absolute',
            left: `${parachuteX}%`, top: `${parachuteY}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 6, textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>🪂</div>
            <div style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              marginTop: -8,
              animation: 'alienSwing 0.6s ease-in-out infinite alternate',
            }}>
              👾
            </div>
          </div>
        )}

        {boingItems.map(p => (
          <div key={p.id} style={{
            position: 'fixed', left: p.x, top: p.y,
            fontSize: 'clamp(1rem, 3vw, 1.4rem)',
            fontFamily: "'Fredoka', sans-serif", fontWeight: 700,
            color: p.c, pointerEvents: 'none', zIndex: 20,
            animation: 'boingFade 0.5s ease-out forwards',
          }}>
            BOING!
          </div>
        ))}

        {gameOver && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', zIndex: 20, gap: 12,
          }}>
            <div style={{ fontSize: 'clamp(3rem, 8vw, 5rem)' }}>🏆</div>
            <p style={{
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontFamily: "'Fredoka', sans-serif", fontWeight: 700,
              color: '#ffd700', textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}>
              HEBAT {state.name}!
            </p>
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
              fontFamily: "'Quicksand', sans-serif", color: '#fff',
            }}>
              Semua alien terselamatkan!
            </p>
            <button
              onClick={() => setScreen(SCREEN.MENU)}
              style={{
                marginTop: 12, padding: '14px 40px',
                fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                fontFamily: "'Fredoka', sans-serif", fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
                borderRadius: 16, border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(108,92,231,0.4)',
              }}
            >
              KEMBALI KE MENU
            </button>
          </div>
        )}
      </div>

      <OnScreenKeyboard onKeyPress={handleKey} pressedKey={pressedKey} />

      <style>{`
        @keyframes bubbleBob {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-5px); }
        }
        @keyframes confettiPop {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(0.1) rotate(720deg); opacity: 0; }
        }
        @keyframes boingFade {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(1.4) translateY(-25px); }
        }
        @keyframes alienSwing {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(5deg); }
        }
      `}</style>
    </div>
  )
}
