import { useEffect, useRef, useState } from 'react'
import { birthday } from '../../config/birthday'
import { useExperience, type PointId } from '../../stores/useExperience'

function GiftLines() {
  const [second, setSecond] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setSecond(true), 1600)
    return () => clearTimeout(t)
  }, [])
  const [a, b] = birthday.points.gift.lines
  return (
    <>
      <p className="message">{a}</p>
      <p className={`message message--late ${second ? 'is-in' : ''}`}>{b}</p>
    </>
  )
}

function Content({ id }: { id: PointId }) {
  const p = birthday.points
  if (id === 'gift') return <GiftLines />
  return <p className="message">{p[id].message}</p>
}

export function DiscoveryModal() {
  const open = useExperience((s) => s.open)
  const close = useExperience((s) => s.close)
  const [shown, setShown] = useState<PointId | null>(open)
  const btn = useRef<HTMLButtonElement>(null)
  if (open && open !== shown) setShown(open)

  useEffect(() => {
    if (open) btn.current?.focus({ preventScroll: true })
  }, [open])

  return (
    <div className={`modal ${open ? 'is-in' : ''}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-label="Descoberta">
      {shown && (
        <div className="modal__panel" key={shown}>
          <Content id={shown} />
          <button ref={btn} className="btn btn--ghost" onClick={close} tabIndex={open ? 0 : -1}>
            {birthday.points[shown].button}
          </button>
        </div>
      )}
    </div>
  )
}
