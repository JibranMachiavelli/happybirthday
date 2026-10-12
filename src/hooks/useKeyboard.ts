import { useEffect } from 'react'
import { input } from '../experience/input'
import { useExperience } from '../stores/useExperience'

const MOVE = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

export function useKeyboard() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (MOVE.has(e.code)) input.keys.add(e.code)
      const s = useExperience.getState()
      if (e.code === 'KeyE' && s.phase === 'exploring' && !s.open && s.nearby) s.interact(s.nearby)
      if (e.code === 'Escape') {
        if (s.open) s.close()
        if (s.phase === 'letter') s.closeLetter()
      }
    }
    const up = (e: KeyboardEvent) => input.keys.delete(e.code)
    const clear = () => input.keys.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [])
}
