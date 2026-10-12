import { useEffect, useRef } from 'react'
import { birthday } from '../../config/birthday'
import { useExperience } from '../../stores/useExperience'

export function Letter() {
  const open = useExperience((s) => s.phase === 'letter')
  const close = useExperience((s) => s.closeLetter)
  const btn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) btn.current?.focus({ preventScroll: true })
  }, [open])

  return (
    <div className={`letter ${open ? 'is-in' : ''}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-label="Carta">
      <article className="letter__paper">
        <div className="letter__seal" aria-hidden>
          ❤
        </div>
        {birthday.letter.paragraphs.map((p, i) => (
          <p key={i} style={{ transitionDelay: `${0.35 + i * 0.12}s` }}>
            {p}
          </p>
        ))}
        <p className="letter__sign" style={{ transitionDelay: `${0.35 + birthday.letter.paragraphs.length * 0.12}s` }}>
          — {birthday.signature}
        </p>
        <button ref={btn} className="btn btn--ink" onClick={close} tabIndex={open ? 0 : -1}>
          {birthday.letter.close}
        </button>
      </article>
    </div>
  )
}
