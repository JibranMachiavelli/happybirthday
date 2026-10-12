import { useEffect, useRef, useState } from 'react'
import { birthday, letterParagraphs } from '../../config/birthday'
import { input } from '../../experience/input'
import { useExperience } from '../../stores/useExperience'

export function Letter() {
  const open = useExperience((s) => s.phase === 'letter')
  const close = useExperience((s) => s.closeLetter)
  const backToWorld = useExperience((s) => s.backToWorld)
  const [veil, setVeil] = useState(false)

  const goBack = () => {
    setVeil(true)
    window.setTimeout(() => {
      input.teleport = 'garden'
      backToWorld()
    }, 1000)
    window.setTimeout(() => setVeil(false), 1300)
  }
  const btn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) btn.current?.focus({ preventScroll: true })
  }, [open])

  return (
    <>
    <div className={`veil ${veil ? 'is-in' : ''}`} style={{ zIndex: 60 }} aria-hidden />
    <div className={`letter ${open ? 'is-in' : ''}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-label="Carta">
      <article className="letter__paper">
        <div className="letter__seal" aria-hidden>
          ✦
        </div>
        {letterParagraphs.map((p, i) => (
          <p key={i} style={{ transitionDelay: `${0.35 + i * 0.12}s` }}>
            {p}
          </p>
        ))}
        <p className="letter__sign" style={{ transitionDelay: `${0.35 + letterParagraphs.length * 0.12}s` }}>
          — {birthday.signature}
        </p>
        <div className="letter__actions">
          <button ref={btn} className="btn btn--ink" onClick={close} tabIndex={open ? 0 : -1}>
            {birthday.letter.close}
          </button>
          <button className="btn btn--ink" onClick={goBack} tabIndex={open ? 0 : -1}>
            {birthday.letter.back}
          </button>
        </div>
      </article>
    </div>
    </>
  )
}
