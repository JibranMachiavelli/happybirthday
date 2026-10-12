import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, InstancedMesh, Object3D, PlaneGeometry,
  ShaderMaterial,
} from 'three'
import { isMobile } from '../../lib/device'
import { balloonGeo } from '../Environment/Balloon'

const dummy = new Object3D()
const CONFETTI_COLORS = ['#ffd6a5', '#efb8c8', '#98c9a3', '#f8f7f4', '#c9d9f2', '#f6a5b8']

export function Confetti({ radius = 7 }: { radius?: number }) {
  const n = isMobile ? 160 : 300
  const ref = useRef<InstancedMesh>(null!)
  const geo = useMemo(() => new PlaneGeometry(0.07, 0.13), [])
  const parts = useMemo(
    () =>
      Array.from({ length: n }, () => ({
        x: (Math.random() - 0.5) * radius * 2,
        y: 4 + Math.random() * 10,
        z: (Math.random() - 0.5) * radius * 2,
        v: 0.7 + Math.random() * 0.8,
        rx: Math.random() * 6,
        ry: Math.random() * 6,
        s: 2 + Math.random() * 4,
        p: Math.random() * 6,
      })),
    [n, radius],
  )

  useLayoutEffect(() => {
    const c = new Color()
    parts.forEach((_, i) => ref.current.setColorAt(i, c.set(CONFETTI_COLORS[i % CONFETTI_COLORS.length])))
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [parts])

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    parts.forEach((p, i) => {
      p.y -= p.v * dt
      if (p.y < 0) p.y = 9 + Math.random() * 3
      p.rx += p.s * dt
      p.ry += p.s * 0.7 * dt
      dummy.position.set(p.x + Math.sin(t * 1.3 + p.p) * 0.4, p.y, p.z + Math.cos(t + p.p) * 0.3)
      dummy.rotation.set(p.rx, p.ry, 0)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[geo, undefined, n]} frustumCulled={false}>
      <meshBasicMaterial side={DoubleSide} />
    </instancedMesh>
  )
}

const BALLOON_COLORS = ['#efb8c8', '#ffd6a5', '#c9d9f2', '#98c9a3', '#f6a5b8', '#f8f7f4']

export function RisingBalloons() {
  const n = isMobile ? 14 : 22
  const ref = useRef<InstancedMesh>(null!)
  const parts = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.4
        const r = 2.6 + Math.random() * 4.5
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, y: -Math.random() * 12, v: 0.7 + Math.random() * 0.6, p: Math.random() * 6 }
      }),
    [n],
  )

  useLayoutEffect(() => {
    const c = new Color()
    parts.forEach((_, i) => ref.current.setColorAt(i, c.set(BALLOON_COLORS[i % BALLOON_COLORS.length])))
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [parts])

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    parts.forEach((p, i) => {
      p.y += p.v * dt
      if (p.y > 24) p.y = 0
      // "inflam" ao surgir do chão
      const s = Math.max(0, Math.min(1, p.y / 1.2))
      dummy.position.set(p.x + Math.sin(t * 0.7 + p.p) * 0.3, p.y + 0.4, p.z)
      dummy.rotation.set(0, 0, Math.sin(t + p.p) * 0.12)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[balloonGeo, undefined, n]} frustumCulled={false}>
      <meshStandardMaterial roughness={0.25} emissive="#ffffff" emissiveIntensity={0.08} />
    </instancedMesh>
  )
}

const BURSTS = isMobile ? 4 : 6
const PER = isMobile ? 60 : 90
const FW_COLORS = ['#ffd6a5', '#efb8c8', '#fff3e0', '#c9e3ff', '#ffc2d4', '#d8f5c8'].map((c) => new Color(c))

export function Fireworks() {
  const { geo, mat, slots } = useMemo(() => {
    const total = BURSTS * PER
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(new Float32Array(total * 3), 3))
    geo.setAttribute('aVel', new BufferAttribute(new Float32Array(total * 3), 3))
    geo.setAttribute('aStart', new BufferAttribute(new Float32Array(total).fill(-100), 1))
    geo.setAttribute('aColor', new BufferAttribute(new Float32Array(total * 3), 3))
    const mat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPx: { value: Math.min(window.devicePixelRatio, 2) } },
      vertexShader: `
        uniform float uTime; uniform float uPx;
        attribute vec3 aVel; attribute float aStart; attribute vec3 aColor;
        varying vec3 vColor; varying float vA;
        void main(){
          float t = uTime - aStart;
          float k = 1.4;
          vec3 p = position + aVel * (1.0 - exp(-k * t)) / k + vec3(0.0, -0.45 * t * t, 0.0);
          vA = t < 0.0 ? 0.0 : clamp(1.0 - t / 2.4, 0.0, 1.0);
          vA *= 0.7 + 0.3 * sin(t * 30.0 + aStart * 10.0);
          vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = 0.18 * uPx * (420.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vA;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d) * vA;
          gl_FragColor = vec4(vColor * a * 2.2, 1.0);
        }`,
    })
    return { geo, mat, slots: Array.from({ length: BURSTS }, () => ({ next: null as number | null })) }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    mat.uniforms.uTime.value = t
    const pos = geo.attributes.position as BufferAttribute
    const vel = geo.attributes.aVel as BufferAttribute
    const start = geo.attributes.aStart as BufferAttribute
    const col = geo.attributes.aColor as BufferAttribute
    let dirty = false
    slots.forEach((s, b) => {
      s.next ??= t + b * 0.7
      if (t < s.next) return
      s.next = t + 2.4 + Math.random() * 1.6
      const a = Math.random() * Math.PI * 2
      const r = 7 + Math.random() * 6
      const ox = Math.cos(a) * r
      const oy = 8 + Math.random() * 5
      const oz = Math.sin(a) * r
      const c = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)]
      const speed = 3 + Math.random() * 2
      for (let i = b * PER; i < (b + 1) * PER; i++) {
        const u = Math.random() * 2 - 1
        const th = Math.random() * Math.PI * 2
        const q = Math.sqrt(1 - u * u)
        const m = speed * (0.85 + Math.random() * 0.15)
        pos.setXYZ(i, ox, oy, oz)
        vel.setXYZ(i, q * Math.cos(th) * m, u * m, q * Math.sin(th) * m)
        start.setX(i, t)
        col.setXYZ(i, c.r, c.g, c.b)
      }
      dirty = true
    })
    if (dirty) {
      pos.needsUpdate = true
      vel.needsUpdate = true
      start.needsUpdate = true
      col.needsUpdate = true
    }
  })

  return <points geometry={geo} material={mat} frustumCulled={false} />
}
