import { useEffect, useRef } from 'react'
import { input } from '../../experience/input'

const R = 44

export function Joystick() {
  const knob = useRef<HTMLDivElement>(null!)
  const base = useRef<HTMLDivElement>(null!)
  const id = useRef<number | null>(null)

  const reset = () => {
    id.current = null
    input.joy.x = 0
    input.joy.y = 0
    knob.current.style.transform = 'translate(-50%, -50%)'
    base.current.classList.remove('is-active')
  }

  useEffect(
    () => () => {
      input.joy.x = 0
      input.joy.y = 0
    },
    [],
  )

  const update = (e: React.PointerEvent) => {
    const r = base.current.getBoundingClientRect()
    let dx = e.clientX - (r.left + r.width / 2)
    let dy = e.clientY - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy)
    if (d > R) {
      dx = (dx / d) * R
      dy = (dy / d) * R
    }
    knob.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
    // pequena zona morta para não andar sem querer
    const m = Math.max(0, Math.min(1, (Math.hypot(dx, dy) - 6) / (R - 6)))
    const a = Math.atan2(dy, dx)
    input.joy.x = Math.cos(a) * m
    input.joy.y = -Math.sin(a) * m
  }

  return (
    <div
      className="joystick"
      role="application"
      aria-label="Controle de movimento"
      onPointerDown={(e) => {
        if (id.current !== null) return
        id.current = e.pointerId
        e.currentTarget.setPointerCapture(e.pointerId)
        base.current.classList.add('is-active')
        update(e)
      }}
      onPointerMove={(e) => e.pointerId === id.current && update(e)}
      onPointerUp={(e) => e.pointerId === id.current && reset()}
      onPointerCancel={(e) => e.pointerId === id.current && reset()}
    >
      <div ref={base} className="joystick__base">
        <div ref={knob} className="joystick__knob" />
      </div>
    </div>
  )
}
