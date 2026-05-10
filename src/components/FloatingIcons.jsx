import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const ICONS = ['🔤', '🎈', '🪁', '🚀', '✍️', '🦖']
const DIRECTIONS = ['tr-bl', 'bl-tr', 'tl-br', 'br-tl']

const ANIM_CSS = `
  @keyframes fi-tr-bl {
    0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { transform: translate(-130vw, 120vh) rotate(400deg); opacity: 0; }
  }
  @keyframes fi-bl-tr {
    0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { transform: translate(130vw, -120vh) rotate(-400deg); opacity: 0; }
  }
  @keyframes fi-tl-br {
    0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { transform: translate(120vw, 120vh) rotate(400deg); opacity: 0; }
  }
  @keyframes fi-br-tl {
    0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { transform: translate(-120vw, -120vh) rotate(-400deg); opacity: 0; }
  }
`

const START_POSITIONS = {
  'tr-bl': { left: '88vw', top: '-8vh' },
  'bl-tr': { left: '-8vw', top: '108vh' },
  'tl-br': { left: '-8vw', top: '-8vh' },
  'br-tl': { left: '88vw', top: '108vh' },
}

const STYLE_ID = 'jaripintar-floating-icons-style'

export default function FloatingIcons({ count = 16 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (typeof document === 'undefined') return

    let styleEl = document.getElementById(STYLE_ID)
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = STYLE_ID
      styleEl.textContent = ANIM_CSS
      document.head.appendChild(styleEl)
    }

    const container = document.createElement('div')
    container.id = 'floating-icons-root'
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:-1;'
    document.body.appendChild(container)
    containerRef.current = container

    const items = []
    for (let i = 0; i < count; i++) {
      const icon = ICONS[i % ICONS.length]
      const dir = DIRECTIONS[i % DIRECTIONS.length]
      const size = 40 + (i % 4) * 10
      const delay = -(i * 1.3)
      const opacity = 0.12 + (i % 5) * 0.03
      const duration = 24 + (i % 6) * 5
      const pos = START_POSITIONS[dir]

      const el = document.createElement('span')
      el.textContent = icon
      el.style.cssText = `
        position: absolute;
        left: ${pos.left};
        top: ${pos.top};
        font-size: ${size}px;
        opacity: ${opacity};
        animation: fi-${dir} ${duration}s linear ${delay}s infinite;
        pointer-events: none;
        user-select: none;
        will-change: transform;
      `
      container.appendChild(el)
      items.push(el)
    }

    return () => {
      container.remove()
      items.length = 0
    }
  }, [count])

  return null
}