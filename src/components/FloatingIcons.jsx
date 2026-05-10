import { useMemo } from 'react'

const ICONS = ['🔤', '🎈', '🪁', '🚀', '✍️', '🦖']

const DIRECTIONS = ['tr-bl', 'bl-tr', 'tl-br', 'br-tl']

export default function FloatingIcons({ count = 12 }) {
  const items = useMemo(() => (
    Array.from({ length: count }, (_, i) => ({
      id: i,
      icon: ICONS[i % ICONS.length],
      direction: DIRECTIONS[i % DIRECTIONS.length],
      size: 24 + (i % 3) * 10,
      delay: -(i * 0.8),
      opacity: 0.08 + (i % 4) * 0.02,
    }))
  ), [count])

  return (
    <>
      <style>{`
        @keyframes float-tr-bl {
          0%   { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translate(-120vw, 100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes float-bl-tr {
          0%   { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translate(120vw, -100vh) rotate(-360deg); opacity: 0; }
        }
        @keyframes float-tl-br {
          0%   { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translate(100vw, 100vh) rotate(270deg); opacity: 0; }
        }
        @keyframes float-br-tl {
          0%   { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translate(-100vw, -100vh) rotate(-270deg); opacity: 0; }
        }
      `}</style>
      {items.map((item) => {
        const anim = `float-${item.direction}`
        const startX = item.direction.includes('tr') || item.direction.includes('tl')
          ? '80vw' : item.direction.includes('bl') ? '0vw' : '-10vw'
        const startY = item.direction.includes('tl') || item.direction.includes('bl')
          ? '0vh' : '-10vh'
        return (
          <span
            key={item.id}
            style={{
              position: 'fixed',
              left: startX,
              top: startY,
              fontSize: `${item.size}px`,
              opacity: item.opacity,
              animation: `${anim} ${18 + (item.id % 6) * 4}s linear ${item.delay}s infinite`,
              pointerEvents: 'none',
              zIndex: 0,
              userSelect: 'none',
            }}
          >
            {item.icon}
          </span>
        )
      })}
    </>
  )
}