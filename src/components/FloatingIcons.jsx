import { useMemo } from 'react'

const ICONS = ['🔤', '🎈', '🪁', '🚀', '✍️', '🦖']

const DIRECTIONS = ['tr-bl', 'bl-tr', 'tl-br', 'br-tl']

const ANIM_MAP = {
  'tr-bl': { x: '-120vw', y: '110vh', rot: 360 },
  'bl-tr': { x: '120vw', y: '-110vh', rot: -360 },
  'tl-br': { x: '110vw', y: '110vh', rot: 360 },
  'br-tl': { x: '-110vw', y: '-110vh', rot: -360 },
}

export default function FloatingIcons({ count = 12 }) {
  const items = useMemo(() => (
    Array.from({ length: count }, (_, i) => ({
      id: i,
      icon: ICONS[i % ICONS.length],
      dir: DIRECTIONS[i % DIRECTIONS.length],
      size: 36 + (i % 4) * 8,
      delay: -(i * 1.2),
      opacity: 0.12 + (i % 4) * 0.03,
    }))
  ), [count])

  return (
    <>
      <style>{`
        @keyframes float-tr-bl {
          0%   { transform: translate(0, 0) rotate(0deg); }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translate(-120vw, 110vh) rotate(360deg); }
        }
        @keyframes float-bl-tr {
          0%   { transform: translate(0, 0) rotate(0deg); }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translate(120vw, -110vh) rotate(-360deg); }
        }
        @keyframes float-tl-br {
          0%   { transform: translate(0, 0) rotate(0deg); }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translate(110vw, 110vh) rotate(360deg); }
        }
        @keyframes float-br-tl {
          0%   { transform: translate(0, 0) rotate(0deg); }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translate(-110vw, -110vh) rotate(-360deg); }
        }
      `}</style>
      {items.map((item) => {
        const startMap = {
          'tr-bl': { left: '85vw', top: '-5vh' },
          'bl-tr': { left: '-5vw', top: '105vh' },
          'tl-br': { left: '-5vw', top: '-5vh' },
          'br-tl': { left: '85vw', top: '105vh' },
        }
        const pos = startMap[item.dir]
        return (
          <span
            key={item.id}
            style={{
              position: 'fixed',
              left: pos.left,
              top: pos.top,
              fontSize: `${item.size}px`,
              opacity: item.opacity,
              animation: `float-${item.dir} ${22 + (item.id % 6) * 5}s linear ${item.delay}s infinite`,
              pointerEvents: 'none',
              zIndex: 0,
              userSelect: 'none',
              willChange: 'transform',
            }}
          >
            {item.icon}
          </span>
        )
      })}
    </>
  )
}