import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { isTouch, reducedMotion } from '../../lib/device'
import { useExperience } from '../../stores/useExperience'
import { CAKE, POINTS, TREES } from '../layout'
import { cam, player } from '../runtime'

const PITCH_MIN = 0.12
const PITCH_MAX = 0.85

// encurta a distância se uma copa de árvore ficar entre a câmera e a personagem
function clearDistance(fx: number, fz: number, yaw: number, pitch: number, dist: number) {
  const dx = Math.sin(yaw) * Math.cos(pitch)
  const dz = Math.cos(yaw) * Math.cos(pitch)
  const dy = Math.sin(pitch)
  let best = dist
  for (const t of TREES) {
    const r = 1.25 * t.s
    const ox = t.x - fx
    const oz = t.z - fz
    const h = Math.hypot(dx, dz)
    if (h < 1e-3) continue
    // projeção no plano XZ
    const along = (ox * dx + oz * dz) / (h * h)
    if (along <= 0 || along >= best) continue
    const px = dx * along - ox
    const pz = dz * along - oz
    const y = 1.15 + dy * along
    if (px * px + pz * pz < r * r && y > 1.0 * t.s && y < 3.4 * t.s) best = Math.max(2.2, along - r * 0.6)
  }
  return best
}

export function FollowCamera() {
  const { camera, gl, size } = useThree()
  const state = useRef({
    focus: new Vector3(0, 1.2, 0),
    yaw: 0,
    pitch: 1.05,
    dist: 22,
    cine: 0,
    phase: '',
    wasOpen: false,
  })
  const tmp = useRef(new Vector3()).current
  const portrait = size.width / size.height < 0.8

  useEffect(() => {
    const c = camera as PerspectiveCamera
    c.fov = portrait ? 62 : 48
    c.updateProjectionMatrix()
  }, [camera, portrait])

  // arrastar para girar a câmera (mouse ou dedo fora do joystick)
  useEffect(() => {
    const el = gl.domElement
    let id: number | null = null
    let lx = 0
    let ly = 0
    const sens = isTouch ? 0.0065 : 0.0045
    const down = (e: PointerEvent) => {
      if (id !== null) return
      id = e.pointerId
      lx = e.clientX
      ly = e.clientY
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      cam.yaw -= (e.clientX - lx) * sens
      cam.pitch = MathUtils.clamp(cam.pitch + (e.clientY - ly) * sens * 0.6, PITCH_MIN, PITCH_MAX)
      lx = e.clientX
      ly = e.clientY
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId === id) id = null
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [gl])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const s = state.current
    const { phase, open } = useExperience.getState()

    // pequena descida cinematográfica ao entrar
    if (phase === 'exploring' && s.phase === 'intro' && reducedMotion) {
      s.dist = 6
      s.pitch = cam.pitch
    }
    s.phase = phase
    // ao fechar, mantém o ângulo atual em vez de voltar ao anterior
    if (s.wasOpen && !open) cam.yaw = s.yaw
    s.wasOpen = !!open

    let fx = player.pos.x
    let fy = 1.15
    let fz = player.pos.z
    let yaw = cam.yaw
    let pitch = cam.pitch
    let dist = portrait ? 7 : 6
    let lambda = phase === 'intro' ? 0.6 : 3.5

    if (open) {
      // por cima do ombro, olhando para o objeto
      const [px, pz] = POINTS[open]
      fx = MathUtils.lerp(fx, px, 0.7)
      fz = MathUtils.lerp(fz, pz, 0.7)
      fy = 1.1
      yaw = Math.atan2(player.pos.x - px, player.pos.z - pz) + 0.55
      dist = portrait ? 5 : 4.2
      pitch = 0.3
      lambda = 2.2
    } else if (player.inCakeArea) {
      s.cine += dt
      fx = MathUtils.lerp(CAKE.x, player.pos.x, 0.3)
      fz = MathUtils.lerp(CAKE.z, player.pos.z, 0.3)
      fy = 1.3
      yaw = 0.35 + s.cine * (reducedMotion ? 0 : 0.035)
      pitch = 0.2
      dist = portrait ? 10 : 8
      lambda = 1.2
    } else if (phase === 'intro') {
      yaw = 0.25
      pitch = 0.95
      dist = 22
    }

    if (cam.snap) {
      cam.snap = false
      s.focus.set(fx, fy, fz)
      s.yaw = yaw
      s.pitch = pitch
      s.dist = dist
    }

    let blocked = false
    if (phase === 'exploring' && !open) {
      const clear = clearDistance(fx, fz, s.yaw, s.pitch, dist)
      blocked = clear < dist && clear < s.dist
      dist = clear
    }

    const k = 1 - Math.exp(-lambda * dt)
    s.focus.lerp(tmp.set(fx, fy, fz), Math.min(1, k * 2))
    s.yaw += Math.atan2(Math.sin(yaw - s.yaw), Math.cos(yaw - s.yaw)) * k
    s.pitch += (pitch - s.pitch) * k
    s.dist += (dist - s.dist) * (phase === 'exploring' && !open ? 1 - Math.exp((blocked ? -6 : -1.1) * dt) : k)

    const cp = Math.cos(s.pitch)
    camera.position.set(
      s.focus.x + Math.sin(s.yaw) * cp * s.dist,
      s.focus.y + Math.sin(s.pitch) * s.dist,
      s.focus.z + Math.cos(s.yaw) * cp * s.dist,
    )
    camera.lookAt(s.focus)
  })

  return null
}
