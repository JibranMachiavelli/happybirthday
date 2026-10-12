import { create } from 'zustand'
import { birthday } from '../config/birthday'
import { chime, setMuted } from '../lib/audio'

export type PointId = 'flower' | 'star' | 'book' | 'gift'
export type Target = PointId | 'portal' | 'egg'
export type Phase = 'intro' | 'exploring' | 'final' | 'letter'

export const POINT_IDS: PointId[] = ['flower', 'star', 'book', 'gift']

interface ExperienceState {
  phase: Phase
  ready: boolean
  found: PointId[]
  nearby: Target | null
  open: PointId | null
  eggFound: boolean
  finalStep: number
  muted: boolean
  toast: string | null
  setReady: () => void
  enter: () => void
  setNearby: (t: Target | null) => void
  interact: (t: Target) => void
  close: () => void
  setFinalStep: (n: number) => void
  openLetter: () => void
  closeLetter: () => void
  backToWorld: () => void
  toggleMute: () => void
  showToast: (text: string) => void
}

let toastTimer: number | undefined

export const useExperience = create<ExperienceState>((set, get) => ({
  phase: 'intro',
  ready: false,
  found: [],
  nearby: null,
  open: null,
  eggFound: false,
  finalStep: 0,
  muted: false,
  toast: null,

  setReady: () => set({ ready: true }),
  enter: () => set({ phase: 'exploring' }),
  setNearby: (nearby) => get().nearby !== nearby && set({ nearby }),

  interact: (t) => {
    const s = get()
    if (s.phase !== 'exploring') return
    if (t === 'portal') {
      if (s.found.length === POINT_IDS.length) set({ phase: 'final', nearby: null, finalStep: 0 })
      return
    }
    if (t === 'egg') {
      if (!s.eggFound) chime()
      set({ eggFound: true, nearby: null })
      s.showToast(birthday.easterEgg)
      return
    }
    if (!s.found.includes(t)) chime()
    set({ open: t, found: s.found.includes(t) ? s.found : [...s.found, t] })
  },

  close: () => set({ open: null }),
  setFinalStep: (finalStep) => set({ finalStep }),
  openLetter: () => set({ phase: 'letter' }),
  closeLetter: () => set({ phase: 'final' }),
  backToWorld: () => set({ phase: 'exploring', finalStep: 0, nearby: null }),

  toggleMute: () => {
    const muted = !get().muted
    setMuted(muted)
    set({ muted })
  },

  showToast: (toast) => {
    clearTimeout(toastTimer)
    set({ toast })
    toastTimer = window.setTimeout(() => set({ toast: null }), 4200)
  },
}))
