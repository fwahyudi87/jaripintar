import { useState, useCallback, useRef } from 'react'
import { useGame } from '../context/GameContext.jsx'
import OnScreenKeyboard from './OnScreenKeyboard.jsx'
import ScoreBar from './ScoreBar.jsx'
import useLetterSound from '../hooks/useLetterSound.js'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const ROUNDS_TO_COMPLETE = 8

function randomLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)]
}

export default function LetterHunt() {
  const { state, addScore, completeModule1, setScreen, SCREEN } = useGame()
  const [target, setTarget] = useState(() => randomLetter())
  const [pressedKey, setPressedKey] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const roundRef = useRef(0)
  const confettiRef = useRef(null)
  const playSound = useLetterSound()

  const handleKey = useCallback((key) => {
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)
    playSound(key)

    if (key === target) {
      addScore(10)
      roundRef.current += 1
      setFeedback('correct')
      spawnConfetti()

      if (roundRef.current >= ROUNDS_TO_COMPLETE) {
        completeModule1()
        setTimeout(() => setScreen(SCREEN.BALLOON_CATCH), 1200)
        return
      }

      setTimeout(() => {
        setTarget(randomLetter())
        setFeedback(null)
      }, 600)
    } else {
      setFeedback('wrong')
      setTimeout(() => setFeedback(null), 400)
    }
  }, [target, addScore, completeModule1, setScreen, SCREEN, playSound])

  const spawnConfetti = () => {
    if (!confettiRef.current) return
    const rect = confettiRef.current.getBoundingClientRect()
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div')
      p.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        width: 8px; height: 8px;
        background: ${['#ff8c00','#ffd700','#4caf50','#ff6b6b','#a8d8ea','#f9e79f'][Math.floor(Math.random() * 6)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 999;
        transform: translate(0,0);
        transition: all 0.8s cubic-bezier(.25,.46,.45,.94);
      `
      document.body.appendChild(p)
      requestAnimationFrame(() => {
        p.style.transform = `translate(${(Math.random() - 0.5) * 300}px, ${(Math.random() - 0.5) * 300}px)`
        p.style.opacity = '0'
      })
      setTimeout(() => p.remove(), 900)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScoreBar
        name={state.name}
        gender={state.gender}
        score={state.score}
        onBack={() => setScreen(SCREEN.SPLASH)}
      />

      <div
        ref={confettiRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: 16,
        }}
      >
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
          fontFamily: "'Quicksand', sans-serif",
          color: '#5a7a8a',
        }}>
          Tekan huruf di bawah ini!
        </p>

        <div
          style={{
            fontSize: 'clamp(5rem, 15vw, 10rem)',
            fontFamily: "'Comic Neue', cursive",
            fontWeight: 700,
            color: feedback === 'correct' ? '#4caf50' : feedback === 'wrong' ? '#ff6b6b' : '#ff8c00',
            animation: feedback === 'wrong' ? 'shake 0.3s' : 'none',
            transition: 'color 0.2s',
          }}
        >
          {target}
        </div>

        {state.module1Done && (
          <p style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            fontFamily: "'Fredoka', sans-serif",
            color: '#4caf50',
            fontWeight: 600,
          }}>
            ✅ Mantap! Lanjut ke Balon!
          </p>
        )}

        <p style={{
          fontSize: '0.85rem',
          fontFamily: "'Quicksand', sans-serif",
          color: '#a0b8c0',
        }}>
          {roundRef.current} / {ROUNDS_TO_COMPLETE}
        </p>
      </div>

      <OnScreenKeyboard onKeyPress={handleKey} pressedKey={pressedKey} />

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  )
}
