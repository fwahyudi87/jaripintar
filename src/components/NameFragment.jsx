import { useState, useCallback, useRef, useMemo } from 'react'
import { useGame } from '../context/GameContext.jsx'
import OnScreenKeyboard from './OnScreenKeyboard.jsx'
import ScoreBar from './ScoreBar.jsx'
import useLetterSound from '../hooks/useLetterSound.js'
import useSoundFeedback from '../hooks/useSoundFeedback.js'

function generateFragments(name) {
  const upper = name.toUpperCase()
  const fragments = []
  for (let len = 2; len <= upper.length; len++) {
    for (let i = 0; i + len <= upper.length; i++) {
      fragments.push(upper.slice(i, i + len))
    }
  }
  return fragments
}

export default function NameFragment() {
  const { state, addScore, completeModule5, setScreen, SCREEN } = useGame()
  const playSound = useLetterSound()
  const soundFeedback = useSoundFeedback()

  const fragments = useMemo(() => {
    const f = generateFragments(state.name)
    return f.length > 0 ? f : [state.name.toUpperCase() || 'A']
  }, [state.name])

  const [fragIndex, setFragIndex] = useState(0)
  const [typedIndex, setTypedIndex] = useState(0)
  const [pressedKey, setPressedKey] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [completed, setCompleted] = useState(false)
  const confettiRef = useRef(null)

  const fragIndexRef = useRef(fragIndex)
  fragIndexRef.current = fragIndex
  const typedIndexRef = useRef(typedIndex)
  typedIndexRef.current = typedIndex

  const currentFragment = fragments[fragIndex] || ''

  const handleKey = useCallback((key) => {
    if (completed) return
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)
    playSound(key)

    const expected = currentFragment[typedIndexRef.current]
    if (key === expected) {
      const nextTyped = typedIndexRef.current + 1
      setTypedIndex(nextTyped)

      if (nextTyped >= currentFragment.length) {
        addScore(15)
        const nextFrag = fragIndexRef.current + 1
        if (nextFrag >= fragments.length) {
          setCompleted(true)
          setFeedback('correct')
          soundFeedback.correct.play()
          setTimeout(() => setFeedback(null), 600)
          completeModule5()
          setTimeout(() => setScreen(SCREEN.MENU), 1200)
        } else {
          setFeedback('correct')
          soundFeedback.correct.play()
          spawnConfetti()
          setTimeout(() => {
            setFragIndex(nextFrag)
            setTypedIndex(0)
            setFeedback(null)
          }, 600)
        }
      } else {
        setFeedback('correct')
        soundFeedback.correct.play()
        setTimeout(() => setFeedback(null), 300)
      }
    } else {
      setFeedback('wrong')
      soundFeedback.wrong.play()
      setTimeout(() => setFeedback(null), 400)
    }
  }, [completed, currentFragment, fragments, addScore, completeModule5, setScreen, SCREEN, playSound])

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
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
          fontFamily: "'Quicksand', sans-serif",
          color: '#5a7a8a',
        }}>
          Ketik potongan namamu!
        </p>

        <div style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {currentFragment.split('').map((ch, i) => (
            <span
              key={i}
              style={{
                fontSize: 'clamp(3rem, 10vw, 7rem)',
                fontFamily: "'Comic Neue', cursive",
                fontWeight: 700,
                color: i < typedIndex ? '#4caf50' : feedback === 'wrong' ? '#ff6b6b' : '#ff8c00',
                opacity: i < typedIndex ? 0.5 : 1,
                transition: 'all 0.2s',
                animation: i === typedIndex && feedback === 'wrong' ? 'shake 0.3s' : 'none',
              }}
            >
              {ch}
            </span>
          ))}
        </div>

        <div style={{
          width: 'min(300px, 80%)',
          height: 8,
          background: '#e0ecf0',
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(typedIndex / Math.max(currentFragment.length, 1)) * 100}%`,
            background: '#4caf50',
            borderRadius: 4,
            transition: 'width 0.2s',
          }} />
        </div>

        <p style={{
          fontSize: '0.85rem',
          fontFamily: "'Quicksand', sans-serif",
          color: '#a0b8c0',
        }}>
          Potongan {fragIndex + 1}/{fragments.length}
        </p>

        {completed && (
          <p style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            fontFamily: "'Fredoka', sans-serif",
            color: '#4caf50',
            fontWeight: 600,
          }}>
            ✅ Hebat! Semua potongan selesai!
          </p>
        )}
      </div>

      <OnScreenKeyboard onKeyPress={handleKey} pressedKey={pressedKey} />

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
