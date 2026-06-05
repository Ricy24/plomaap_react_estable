import { useEffect, useRef, useCallback } from 'react'

const INACTIVITY_MS = 10 * 60 * 1000
const EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

export function useSessionTimeout(isLoggedIn, onTimeout) {
  const timerRef = useRef(null)

  const resetTimer = useCallback(() => {
    if (!isLoggedIn) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onTimeout?.()
    }, INACTIVITY_MS)
  }, [isLoggedIn, onTimeout])

  useEffect(() => {
    if (!isLoggedIn) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    resetTimer()
    EVENTS.forEach(evt => window.addEventListener(evt, resetTimer))
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      EVENTS.forEach(evt => window.removeEventListener(evt, resetTimer))
    }
  }, [isLoggedIn, resetTimer])
}
