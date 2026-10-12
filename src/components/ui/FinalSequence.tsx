import { useEffect, useState } from 'react'
import { birthday, headline } from '../../config/birthday'
import { input } from '../../experience/input'
import { fadeMusic, musicBox } from '../../lib/audio'
import { reducedMotion } from '../../lib/device'
import { useExperience } from '../../stores/useExperience'

// passo: 1-3 frases, 4 título + celebração, 5 botão da carta
const TIMELINE = [3800, 6800, 10000, 13400, 18000]

export function FinalSequence() {
  const step = useExperience((s) => s.finalStep)
  const setStep = useExperience((s) => s.setFinalStep)
  const openLetter = useExperience((s) => s.openLetter)
  const phase = useExperience((s) => s.phase)
  const [veil, setVeil] = useState(false)

  useEffect(() => {
    fadeMusic(birthday.assets.musicVolume * 0.6, 2)
    const k = reducedMotion ? 0.6 : 1
    const ids = [
      window.setTimeout(() => setVeil(true), 30),
      window.setTimeout(() => (input.teleport = true), 1100),
      window.setTimeout(() => setVeil(false), 1400),
      ...TIMELINE.map((ms, i) =>
        window.setTimeout(() => {
          setStep(i + 1)
          if (i === 3) musicBox()
        }, ms * k),
      ),
    ]
    return () => ids.forEach(clearTimeout)
  }, [setStep])

  const lines = birthday.final.lines
  return (
    <>
      <div className={`veil ${veil ? 'is-in' : ''}`} aria-hidden />
      <div className="final" aria-live="polite">
        {lines.map((l, i) => (
          <p key={i} className={`final__line ${step === i + 1 ? 'is-in' : ''} ${step > i + 1 ? 'is-out' : ''}`}>
            {l}
          </p>
        ))}
        <h1 className={`final__headline ${step >= 4 ? 'is-in' : ''}`}>{headline}</h1>
      </div>
      <div className={`final__cta ${step >= 5 && phase === 'final' ? 'is-in' : ''}`}>
        <button className="btn btn--ghost" onClick={openLetter} tabIndex={step >= 5 ? 0 : -1}>
          {birthday.final.letterButton}
        </button>
      </div>
    </>
  )
}
