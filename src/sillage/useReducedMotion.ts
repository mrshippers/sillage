import { useEffect, useState } from 'react'

/** Honours prefers-reduced-motion. Not "disable everything": callers replace
 * movement with opacity and keep feedback, so a reduced-motion user still gets
 * told the state changed (UI/motion doctrine section 9). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}
