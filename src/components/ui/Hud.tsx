import { useEffect, useState } from 'react'
import { birthday } from '../../config/birthday'
import { isTouch } from '../../lib/device'
import { POINT_IDS, useExperience } from '../../stores/useExperience'
import { Joystick } from './Joystick'

function SoundToggle() {
  const muted = useExperience((s) => s.muted)
  const toggle = useExperience((s) => s.toggleMute)
  return (
    <button className="icon-btn sound" onClick={toggle} aria-label={muted ? 'Ligar som' : 'Desligar som'} aria-pressed={!muted}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
        <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" />
        {muted ? (
          <path d="M16 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        )}
      </svg>
    </button>
  )
}

function Guide() {
  const open = useExperience((s) => s.open)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const a = window.setTimeout(() => setShow(true), 1600)
    const b = window.setTimeout(() => setShow(false), 8000)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [])
  return (
    <div className={`guide ${show && !open ? 'is-in' : ''}`} aria-live="polite">
      <p className="guide__title">{birthday.guide.title}</p>
      <p className="guide__sub">{isTouch ? birthday.guide.mobile : birthday.guide.desktop}</p>
    </div>
  )
}

function Prompt() {
  const nearby = useExperience((s) => s.nearby)
  const open = useExperience((s) => s.open)
  const unlocked = useExperience((s) => s.found.length === POINT_IDS.length)
  const interact = useExperience((s) => s.interact)
  const [last, setLast] = useState(nearby)
  if (nearby && nearby !== last) setLast(nearby)

  const visible = !!nearby && !open
  const shown = nearby ?? last
  const p = birthday.prompts
  let label = isTouch ? p.mobile : p.desktop
  let note: string | null = null
  if (shown === 'portal') {
    note = unlocked ? p.portal : p.portalLocked
    label = unlocked ? (isTouch ? p.mobile : p.desktop) : ''
  }

  return (
    <div className={`prompt ${visible ? 'is-in' : ''}`} aria-live="polite">
      {note && <p className="prompt__note">{note}</p>}
      {label && (
        <button className="btn btn--prompt" onClick={() => nearby && interact(nearby)} tabIndex={visible ? 0 : -1} aria-label={label}>
          <span>{isTouch ? label : label.replace(/\s*E$/, '')}</span>
          {!isTouch && <kbd>E</kbd>}
        </button>
      )}
    </div>
  )
}

export function Hud() {
  const phase = useExperience((s) => s.phase)
  const found = useExperience((s) => s.found.length)
  const open = useExperience((s) => s.open)
  const toast = useExperience((s) => s.toast)
  const exploring = phase === 'exploring'

  return (
    <>
      <SoundToggle />
      {exploring && (
        <>
          <div className="counter" aria-label={`${found} de ${POINT_IDS.length} descobertas`}>
            <span aria-hidden>✦</span> {found} / {POINT_IDS.length}
          </div>
          <Guide />
          <Prompt />
          {isTouch && !open && <Joystick />}
        </>
      )}
      <div className={`toast ${toast ? 'is-in' : ''}`} role="status">
        {toast}
      </div>
    </>
  )
}
