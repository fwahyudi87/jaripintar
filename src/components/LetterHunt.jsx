import { useState, useCallback, useRef } from 'react'
import { useGame } from '../context/GameContext.jsx'
import OnScreenKeyboard from './OnScreenKeyboard.jsx'
import ScoreBar from './ScoreBar.jsx'
import useLetterSound from '../hooks/useLetterSound.js'
import useSoundFeedback from '../hooks/useSoundFeedback.js'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMBERS = ['1','2','3','4','5','6','7','8','9','0']
const LETTER_ROUNDS = 8
const NUMBER_ROUNDS = 8
const TOTAL_ROUNDS = LETTER_ROUNDS + NUMBER_ROUNDS

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function LetterHunt() {
  const { state, addScore, completeModule1, setScreen, SCREEN } = useGame()
  const [target, setTarget] = useState(() => randomItem(LETTERS))
  const [pressedKey, setPressedKey] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [isNumberPhase, setIsNumberPhase] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const roundRef = useRef(0)
  const confettiRef = useRef(null)
  const playSound = useLetterSound()
  const soundFeedback = useSoundFeedback()

  const targetRef = useRef(target)
  targetRef.current = target
  const transitioningRef = useRef(transitioning)
  transitioningRef.current = transitioning

  const handleKey = useCallback((key) => {
    if (transitioningRef.current) return
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)
    playSound(key)

    if (key === targetRef.current) {
      addScore(10)
      roundRef.current += 1
      setFeedback('correct')
      soundFeedback.correct.play()
      spawnConfetti()

      if (roundRef.current >= TOTAL_ROUNDS) {
        setCompleted(true)
        completeModule1()
        setTimeout(() => setScreen(SCREEN.MENU), 1200)
        return
      }

      if (roundRef.current === LETTER_ROUNDS) {
        setTransitioning(true)
        transitioningRef.current = true
        setTimeout(() => {
          setIsNumberPhase(true)
          setTarget(randomItem(NUMBERS))
          setTransitioning(false)
          transitioningRef.current = false
          setFeedback(null)
        }, 1000)
        return
      }

      setTimeout(() => {
        const next = roundRef.current < LETTER_ROUNDS
          ? randomItem(LETTERS)
          : randomItem(NUMBERS)
        setTarget(next)
        setFeedback(null)
      }, 600)
    } else {
      setFeedback('wrong')
      soundFeedback.wrong.play()
      setTimeout(() => setFeedback(null), 400)
    }
  }, [addScore, completeModule1, setScreen, SCREEN, playSound])

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

  const phaseProgress = isNumberPhase
    ? roundRef.current - LETTER_ROUNDS
    : roundRef.current

  const phaseTotal = isNumberPhase ? NUMBER_ROUNDS : LETTER_ROUNDS

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScoreBar
        name={state.name}
        gender={state.gender}
        score={state.score}
        onBack={() => setScreen(SCREEN.MENU)}
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
        {transitioning ? (
          <p style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontFamily: "'Fredoka', sans-serif",
            color: '#4ecdc4',
            fontWeight: 600,
            textAlign: 'center',
          }}>
            Bagus! Sekarang angka!
          </p>
        ) : (
          <>
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
              fontFamily: "'Quicksand', sans-serif",
              color: '#5a7a8a',
            }}>
              {isNumberPhase ? 'Tekan angka di bawah ini!' : 'Tekan huruf di bawah ini!'}
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

            <p style={{
              fontSize: '0.85rem',
              fontFamily: "'Quicksand', sans-serif",
              color: '#a0b8c0',
            }}>
              {isNumberPhase ? `Angka ${phaseProgress}/${phaseTotal}` : `Huruf ${phaseProgress}/${phaseTotal}`}
            </p>
          </>
        )}

        {completed && (
          <p style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            fontFamily: "'Fredoka', sans-serif",
            color: '#4caf50',
            fontWeight: 600,
          }}>
            ✅ Mantap! Kembali ke Menu...
          </p>
        )}
      </div>

      <OnScreenKeyboard onKeyPress={handleKey} pressedKey={pressedKey} showNumbers={isNumberPhase} />

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
