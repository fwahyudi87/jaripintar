import { useRef, useEffect, useCallback } from 'react'

export default function useGameLoop(callback, running) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  const loop = useCallback((time) => {
    if (!loop.running) return
    cbRef.current(time)
    requestAnimationFrame(loop)
  }, [])

  useEffect(() => {
    loop.running = running
    if (running) {
      requestAnimationFrame(loop)
    }
    return () => { loop.running = false }
  }, [running, loop])
}
