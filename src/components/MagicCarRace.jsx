import { useState, useRef, useMemo, useCallback } from 'react'
import { useGame } from '../context/GameContext.jsx'
import ScoreBar from './ScoreBar.jsx'
import useSoundFeedback from '../hooks/useSoundFeedback.js'

const LETTER_TRACKS = {
  A: [{x:20,y:180},{x:100,y:20},{x:180,y:180},{x:55,y:130},{x:145,y:130}],
  B: [{x:40,y:180},{x:40,y:20},{x:130,y:20},{x:130,y:85},{x:40,y:85},{x:130,y:85},{x:130,y:180},{x:40,y:180}],
  C: [{x:170,y:30},{x:100,y:15},{x:30,y:50},{x:30,y:150},{x:100,y:185},{x:170,y:170}],
  D: [{x:40,y:20},{x:40,y:180},{x:120,y:180},{x:175,y:100},{x:120,y:20},{x:40,y:20}],
  E: [{x:170,y:20},{x:40,y:20},{x:40,y:100},{x:150,y:100},{x:40,y:100},{x:40,y:180},{x:170,y:180}],
  F: [{x:170,y:20},{x:40,y:20},{x:40,y:100},{x:150,y:100},{x:40,y:100},{x:40,y:180}],
  G: [{x:170,y:30},{x:100,y:15},{x:30,y:50},{x:30,y:150},{x:100,y:185},{x:170,y:170},{x:170,y:100},{x:110,y:100}],
  H: [{x:40,y:20},{x:40,y:180},{x:40,y:100},{x:160,y:100},{x:160,y:20},{x:160,y:180}],
  I: [{x:30,y:20},{x:170,y:20},{x:100,y:20},{x:100,y:180},{x:30,y:180},{x:170,y:180}],
  J: [{x:80,y:20},{x:80,y:150},{x:120,y:180},{x:170,y:150},{x:170,y:20}],
  K: [{x:40,y:20},{x:40,y:180},{x:40,y:100},{x:160,y:30},{x:40,y:100},{x:160,y:170}],
  L: [{x:40,y:20},{x:40,y:180},{x:170,y:180}],
  M: [{x:20,y:180},{x:20,y:20},{x:100,y:120},{x:180,y:20},{x:180,y:180}],
  N: [{x:30,y:180},{x:30,y:20},{x:170,y:180},{x:170,y:20}],
  O: [{x:100,y:15},{x:20,y:60},{x:20,y:140},{x:100,y:185},{x:180,y:140},{x:180,y:60},{x:100,y:15}],
  P: [{x:40,y:180},{x:40,y:20},{x:140,y:20},{x:175,y:65},{x:140,y:110},{x:40,y:110}],
  Q: [{x:100,y:185},{x:20,y:140},{x:20,y:60},{x:100,y:15},{x:180,y:60},{x:180,y:140},{x:100,y:185},{x:120,y:150},{x:170,y:190}],
  R: [{x:40,y:180},{x:40,y:20},{x:140,y:20},{x:175,y:65},{x:140,y:110},{x:40,y:110},{x:175,y:180}],
  S: [{x:170,y:25},{x:50,y:25},{x:35,y:90},{x:165,y:100},{x:175,y:165},{x:55,y:175}],
  T: [{x:25,y:20},{x:175,y:20},{x:100,y:20},{x:100,y:180}],
  U: [{x:25,y:20},{x:25,y:130},{x:100,y:180},{x:175,y:130},{x:175,y:20}],
  V: [{x:20,y:20},{x:100,y:180},{x:180,y:20}],
  W: [{x:20,y:20},{x:50,y:170},{x:100,y:60},{x:150,y:170},{x:180,y:20}],
  X: [{x:20,y:20},{x:180,y:180},{x:100,y:100},{x:20,y:180},{x:180,y:20}],
  Y: [{x:20,y:20},{x:100,y:100},{x:180,y:20},{x:100,y:100},{x:100,y:180}],
  Z: [{x:20,y:20},{x:180,y:20},{x:20,y:180},{x:180,y:180}],
}

const SAMPLE_COUNT = 120
const PROXIMITY = 22
const LETTERS_PER_SESSION = 5

function sampleTrack(waypoints, count) {
  const segs = []
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x
    const dy = waypoints[i].y - waypoints[i - 1].y
    segs.push({ len: Math.sqrt(dx * dx + dy * dy), dx, dy, x0: waypoints[i - 1].x, y0: waypoints[i - 1].y })
  }
  const totalLen = segs.reduce((s, seg) => s + seg.len, 0)
  if (totalLen === 0) return [{ x: 100, y: 100 }]

  const pts = []
  for (let i = 0; i < count; i++) {
    const t = (i / (count - 1)) * totalLen
    let acc = 0
    for (const seg of segs) {
      if (acc + seg.len >= t || seg === segs[segs.length - 1]) {
        const st = seg.len > 0 ? (t - acc) / seg.len : 0
        pts.push({ x: seg.x0 + seg.dx * st, y: seg.y0 + seg.dy * st })
        break
      }
      acc += seg.len
    }
  }
  return pts
}

function playHonk() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(350, ctx.currentTime)
    osc.frequency.setValueAtTime(550, ctx.currentTime + 0.06)
    osc.frequency.setValueAtTime(450, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
  } catch {}
}

const MUD_COLORS = ['#8B4513', '#A0522D', '#6B3410', '#CD853F']

export default function MagicCarRace() {
  const { state, addScore, setScreen, SCREEN } = useGame()
  const soundFeedback = useSoundFeedback()

  const [sessionLetters] = useState(() => {
    const keys = Object.keys(LETTER_TRACKS)
    const shuffled = [...keys].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, LETTERS_PER_SESSION)
  })

  const [letterIdx, setLetterIdx] = useState(0)
  const [carIdx, setCarIdx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [inMud, setInMud] = useState(false)
  const [mudPts, setMudPts] = useState([])
  const [showDone, setShowDone] = useState(false)
  const [loopAnim, setLoopAnim] = useState(false)
  const [allDone, setAllDone] = useState(false)

  const svgRef = useRef(null)
  const carIdxRef = useRef(0)
  carIdxRef.current = carIdx
  const letterIdxRef = useRef(0)
  letterIdxRef.current = letterIdx
  const draggingRef = useRef(false)
  draggingRef.current = dragging

  const currentKey = sessionLetters[letterIdx] || 'A'
  const waypoints = LETTER_TRACKS[currentKey] || LETTER_TRACKS.A
  const trackPoints = useMemo(() => sampleTrack(waypoints, SAMPLE_COUNT), [waypoints])

  const carPos = trackPoints[Math.min(carIdx, trackPoints.length - 1)] || { x: 100, y: 100 }
  const carAngle = useMemo(() => {
    const next = Math.min(carIdx + 2, trackPoints.length - 1)
    const p = trackPoints[next] || carPos
    return Math.atan2(p.y - carPos.y, p.x - carPos.x) * (180 / Math.PI)
  }, [carIdx, trackPoints, carPos])

  const pathD = waypoints.map((wp, i) => (i === 0 ? 'M' : 'L') + wp.x + ' ' + wp.y).join(' ')

  const advanceTo = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(idx, trackPoints.length - 1))
    setCarIdx(clamped)
    if (clamped >= trackPoints.length - 1) {
      setShowDone(true)
    }
  }, [trackPoints])

  const nextLetter = useCallback(() => {
    const next = letterIdxRef.current + 1
    if (next >= sessionLetters.length) {
      addScore(50)
      setAllDone(true)
      return
    }
    addScore(20)
    setLetterIdx(next)
    setCarIdx(0)
    setShowDone(false)
    setMudPts([])
  }, [sessionLetters, addScore])

  const handlePointer = useCallback((e) => {
    if (!svgRef.current || showDone || allDone) return
    if (e.type === 'pointerdown') {
      setDragging(true)
      draggingRef.current = true
    }
    if (e.type === 'pointerup' || e.type === 'pointerleave') {
      setDragging(false)
      draggingRef.current = false
      return
    }
    if (!draggingRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 200
    const y = ((e.clientY - rect.top) / rect.height) * 200

    let best = { idx: -1, dist: Infinity }
    for (let i = 0; i < trackPoints.length; i++) {
      const dx = x - trackPoints[i].x
      const dy = y - trackPoints[i].y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < best.dist) { best = { idx: i, dist: d } }
    }

    if (best.dist <= PROXIMITY) {
      setInMud(false)
      advanceTo(best.idx)
    } else if (!inMud) {
      setInMud(true)
      playHonk()
      soundFeedback.wrong.play()
      const pts = Array.from({ length: 5 }, () => ({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 24,
        r: 4 + Math.random() * 8,
        c: MUD_COLORS[Math.floor(Math.random() * MUD_COLORS.length)],
        id: Math.random(),
      }))
      setMudPts(pts)
      setTimeout(() => { setInMud(false); setMudPts([]) }, 500)
    }
  }, [trackPoints, inMud, showDone, allDone, advanceTo, soundFeedback])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
      <ScoreBar
        name={state.name}
        gender={state.gender}
        score={state.score}
        onBack={() => setScreen(SCREEN.MENU)}
      />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg, #e8f8e0 0%, #d4edc9 100%)', position: 'relative', overflow: 'hidden',
      }}>
        {allDone ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: 8 }}>🏆</div>
            <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: '#ff8c00' }}>
              HEBAT {state.name}!
            </p>
            <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', fontFamily: "'Quicksand', sans-serif", color: '#5a7a8a' }}>
              Semua huruf berhasil dilalui!
            </p>
            <button
              onClick={() => setScreen(SCREEN.MENU)}
              style={{
                marginTop: 20, padding: '14px 40px', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                fontFamily: "'Fredoka', sans-serif", fontWeight: 600, color: '#fff',
                background: 'linear-gradient(135deg, #ff8c00, #ff6b35)', borderRadius: 16,
                boxShadow: '0 4px 16px rgba(255,140,0,0.4)', border: 'none', cursor: 'pointer',
              }}
            >
              KEMBALI KE MENU
            </button>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox="0 0 200 200"
            style={{ width: 'min(85vmin, 500px)', height: 'min(85vmin, 500px)', cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
            onPointerDown={handlePointer}
            onPointerMove={handlePointer}
            onPointerUp={handlePointer}
            onPointerLeave={handlePointer}
          >
            <defs>
              <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a8e6a2" />
                <stop offset="100%" stopColor="#7bc474" />
              </linearGradient>
              <filter id="shadow1">
                <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.2" />
              </filter>
            </defs>

            <rect x="0" y="0" width="200" height="200" rx="12" fill="url(#grassGrad)" />

            <path d={pathD} fill="none" stroke="#c8e6c9" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            <path d={pathD} fill="none" stroke="#ff8c00" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />

            {trackPoints.filter((_, i) => i % 8 === 0).map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="1.2" fill="#ffd700" opacity="0.5" />
            ))}

            {carIdx > 0 && (
              <path
                d={trackPoints.slice(0, Math.min(carIdx + 1, trackPoints.length)).map((p, i) =>
                  (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y
                ).join(' ')}
                fill="none" stroke="#4caf50" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
              />
            )}

            <g transform={`translate(${trackPoints[0].x},${trackPoints[0].y})`}>
              <rect x="-6" y="-10" width="12" height="20" rx="2" fill="#fff" stroke="#333" strokeWidth="0.8" />
              <rect x="-2" y="-14" width="4" height="6" fill="#e74c3c" rx="1" />
            </g>

            <g transform={`translate(${trackPoints[trackPoints.length - 1].x},${trackPoints[trackPoints.length - 1].y})`}>
              <rect x="-6" y="-10" width="12" height="20" rx="2" fill="#333" stroke="#222" strokeWidth="0.8" />
              <rect x="-2" y="-14" width="4" height="6" fill="#fff" rx="1" />
            </g>

            {mudPts.map(p => (
              <circle key={p.id} cx={p.x} cy={p.y} r={p.r} fill={p.c} opacity="0.7">
                <animate attributeName="r" from={p.r} to="0" dur="0.5s" />
                <animate attributeName="opacity" from="0.7" to="0" dur="0.5s" />
              </circle>
            ))}

            <g
              transform={`translate(${carPos.x},${carPos.y}) rotate(${carAngle})`}
              filter="url(#shadow1)"
              style={{ transition: 'transform 0.08s linear' }}
            >
              {loopAnim ? (
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.6s" repeatCount="2" additive="sum" />
                  <animateTransform attributeName="transform" type="translate" values="0,0; 0,-30; 0,0; 0,-30; 0,0" dur="0.6s" repeatCount="2" additive="sum" />
                  <rect x="-8" y="-5" width="16" height="10" rx="4" fill="#e74c3c" />
                  <rect x="-10" y="-4" width="2" height="8" rx="1" fill="#c0392b" />
                  <rect x="6" y="-4" width="2" height="8" rx="1" fill="#c0392b" />
                  <circle cx="-5" cy="6" r="2.5" fill="#333" />
                  <circle cx="5" cy="6" r="2.5" fill="#333" />
                </g>
              ) : (
                <g>
                  <rect x="-8" y="-5" width="16" height="10" rx="3" fill={inMud ? '#8B4513' : '#e74c3c'} />
                  <rect x="-10" y="-4" width="2" height="8" rx="1" fill="#c0392b" />
                  <rect x="6" y="-4" width="2" height="8" rx="1" fill="#c0392b" />
                  <circle cx="-5" cy="6" r="2.5" fill="#333" />
                  <circle cx="5" cy="6" r="2.5" fill="#333" />
                  <rect x="-3" y="-7" width="6" height="3" rx="1" fill="#fff" opacity="0.8" />
                </g>
              )}
            </g>

            {inMud && (
              <text x="100" y="18" textAnchor="middle" fontSize="7" fontFamily="'Fredoka', sans-serif" fontWeight="700" fill="#8B4513">
                BEEP BEEP! 🚗💨
              </text>
            )}
          </svg>
        )}

        {!allDone && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <p style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', fontFamily: "'Quicksand', sans-serif", color: '#5a7a8a' }}>
              Huruf {letterIdx + 1}/{sessionLetters.length}
            </p>
            <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: '#2c3e50', letterSpacing: 4 }}>
              {currentKey}
            </p>
          </div>
        )}
      </div>

      {showDone && !allDone && (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.3)', zIndex: 20, gap: 16,
        }}>
          <div style={{ fontSize: 'clamp(3rem, 10vw, 5rem)' }}>🎉</div>
          <p style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: '#ffd700', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            HURUF {currentKey}!
          </p>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', fontFamily: "'Quicksand', sans-serif", color: '#fff' }}>
            Mantap {state.name}!
          </p>
          <button
            onClick={() => {
              setLoopAnim(true)
              setTimeout(() => {
                setLoopAnim(false)
                nextLetter()
              }, 1200)
            }}
            style={{
              padding: '14px 40px', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              fontFamily: "'Fredoka', sans-serif", fontWeight: 600, color: '#fff',
              background: 'linear-gradient(135deg, #4caf50, #2e7d32)', borderRadius: 16,
              boxShadow: '0 4px 16px rgba(76,175,80,0.4)', border: 'none', cursor: 'pointer',
            }}
          >
            HURUF SELANJUTNYA
          </button>
        </div>
      )}

      <style>{`
        svg { -webkit-user-select: none; user-select: none; }
        svg * { -webkit-user-select: none; user-select: none; }
      `}</style>
    </div>
  )
}
