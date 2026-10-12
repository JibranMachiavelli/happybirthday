import { useEffect, useRef, useState } from 'react'
import { birthday } from '../../config/birthday'
import { startAudio } from '../../lib/audio'
import { reducedMotion } from '../../lib/device'
import { useExperience } from '../../stores/useExperience'

function StarField() {
  const ref = useRef<HTMLCanvasElement>(null!)
  useEffect(() => {
    const c = ref.current
    const ctx = c.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio, 2)
    let w = 0
    let h = 0
    const resize = () => {
      w = c.clientWidth
      h = c.clientHeight
      c.width = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    const stars = Array.from({ length: 160 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.2, p: Math.random() * 6, s: 0.5 + Math.random() * 1.5 }))
    const dust = Array.from({ length: 28 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + 0.8, v: 0.004 + Math.random() * 0.01, p: Math.random() * 6 }))
    let raf = 0
    const draw = (ms: number) => {
      const t = ms / 1000
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        ctx.globalAlpha = 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.s + s.p))
        ctx.fillStyle = '#f8f7f4'
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      for (const d of dust) {
        const y = (((d.y - t * d.v) % 1) + 1) % 1
        ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t + d.p)
        ctx.fillStyle = '#ffd6a5'
        ctx.beginPath()
        ctx.arc((d.x + Math.sin(t * 0.3 + d.p) * 0.01) * w, y * h, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!reducedMotion) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return <canvas ref={ref} className="intro__stars" aria-hidden />
}

export function Intro() {
  const ready = useExperience((s) => s.ready)
  const enter = useExperience((s) => s.enter)
  const [step, setStep] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const times = reducedMotion ? [100, 500, 900, 1300] : [400, 1500, 2800, 4000]
    const ids = times.map((ms, i) => window.setTimeout(() => setStep(i + 1), ms))
    return () => ids.forEach(clearTimeout)
  }, [])

  const onEnter = () => {
    startAudio()
    setLeaving(true)
    enter()
    window.setTimeout(() => setGone(true), 1800)
  }

  if (gone) return null
  return (
    <div className={`intro ${leaving ? 'is-leaving' : ''}`} role="dialog" aria-label={birthday.title}>
      <div className="intro__bg" />
      <StarField />
      <div className="intro__content">
        {birthday.intro.lines.map((line, i) => (
          <p key={i} className={`intro__line ${i === 0 ? 'intro__line--big' : ''} ${step > i ? 'is-in' : ''}`}>
            {line}
          </p>
        ))}
        <button
          className={`btn btn--enter ${step > 3 ? 'is-in' : ''}`}
          onClick={onEnter}
          disabled={!ready || leaving || step < 4}
          aria-label="Entrar na experiência"
        >
          {ready ? birthday.intro.button : 'preparando…'}
        </button>
      </div>
    </div>
  )
}
