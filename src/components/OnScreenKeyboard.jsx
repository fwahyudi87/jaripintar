import { useEffect, useRef, useCallback } from 'react'

const ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
]

const NUMBERS = ['1','2','3','4','5','6','7','8','9','0']

const LEFT_KEYS = new Set(['Q','W','E','R','T','A','S','D','F','G','Z','X','C','V','B'])
const ANCHOR_KEYS = new Set(['F','J'])

export default function OnScreenKeyboard({ onKeyPress, pressedKey, showNumbers }) {
  const debounceRef = useRef(null)

  const handleKeyDown = useCallback((e) => {
    if (e.repeat) return
    const key = e.key.toUpperCase()
    const isLetter = key.length === 1 && key >= 'A' && key <= 'Z'
    const isNumber = showNumbers && e.key.length === 1 && e.key >= '0' && e.key <= '9'
    if (!isLetter && !isNumber) return
    if (debounceRef.current) return
    debounceRef.current = setTimeout(() => { debounceRef.current = null }, 150)
    onKeyPress(e.key === ' ' ? ' ' : isNumber ? e.key : key)
  }, [onKeyPress, showNumbers])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      padding: '12px 8px',
      maxWidth: 800,
      margin: '0 auto',
      width: '100%',
    }}>
      {showNumbers && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', width: '100%' }}>
          {NUMBERS.map((n) => {
            const isPressed = pressedKey === n
            return (
              <button
                key={n}
                style={{
                  width: 'clamp(32px, 7vw, 56px)',
                  height: 'clamp(40px, 8vw, 60px)',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1.4rem)',
                  fontFamily: "'Fredoka', sans-serif",
                  fontWeight: 600,
                  color: '#2c3e50',
                  background: isPressed ? '#ffd700' : '#e8d5b7',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.08)',
                  transform: isPressed ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.08s, background 0.08s',
                  boxShadow: isPressed
                    ? '0 0 12px rgba(255,215,0,0.6)'
                    : '0 2px 4px rgba(0,0,0,0.1)',
                }}
                onPointerDown={(e) => e.preventDefault()}
              >
                {n}
              </button>
            )
          })}
        </div>
      )}
      {ROWS.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 4, justifyContent: 'center', width: '100%' }}>
          {row.map((letter) => {
            const isLeft = LEFT_KEYS.has(letter)
            const isAnchor = ANCHOR_KEYS.has(letter)
            const isPressed = pressedKey === letter
            return (
              <button
                key={letter}
                data-key={letter}
                style={{
                  width: 'clamp(32px, 7vw, 56px)',
                  height: 'clamp(40px, 8vw, 60px)',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1.4rem)',
                  fontFamily: "'Fredoka', sans-serif",
                  fontWeight: 600,
                  color: '#2c3e50',
                  background: isPressed
                    ? '#ffd700'
                    : isLeft
                      ? '#a8d8ea'
                      : '#f9e79f',
                  borderRadius: 8,
                  border: isAnchor ? '3px solid #ffd700' : '1px solid rgba(0,0,0,0.08)',
                  transform: isPressed ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.08s, background 0.08s',
                  boxShadow: isPressed
                    ? '0 0 12px rgba(255,215,0,0.6)'
                    : '0 2px 4px rgba(0,0,0,0.1)',
                }}
                onPointerDown={(e) => e.preventDefault()}
              >
                {letter}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
