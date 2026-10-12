import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '../Environment/Sparkles'
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Group, MathUtils, Points } from 'three'
import { useExperience } from '../../stores/useExperience'
import { POINTS } from '../layout'
import { Glow, useHover, useNear } from './shared'

const BOX = '#f3d9e0'
const RIBBON = '#d98aa3'
const N = 70

function dotTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new CanvasTexture(c)
}
const dot = dotTexture()

function Burst({ active }: { active: boolean }) {
  const ref = useRef<Points>(null!)
  const data = useMemo(() => {
    const seeds = Array.from({ length: N }, () => ({ a: Math.random() * Math.PI * 2, r: 0.1 + Math.random() * 0.5, v: 0.5 + Math.random(), o: Math.random() * 3 }))
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(new Float32Array(N * 3), 3))
    return { seeds, geo }
  }, [])
  const t0 = useRef<number | null>(null)

  useFrame(({ clock }) => {
    if (!active) return
    if (t0.current === null) t0.current = clock.elapsedTime
    const el = clock.elapsedTime - t0.current
    const p = data.geo.attributes.position as BufferAttribute
    data.seeds.forEach((s, i) => {
      // primeira saída em leque, depois um fluxo suave e contínuo
      const t = el < 3 ? el * s.v : ((el * s.v * 0.4 + s.o) % 3)
      const a = s.a + t * 0.8
      p.setXYZ(i, Math.cos(a) * s.r * (0.4 + t * 0.4), 0.7 + t * 0.9, Math.sin(a) * s.r * (0.4 + t * 0.4))
    })
    p.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={data.geo} visible={active} frustumCulled={false}>
      <pointsMaterial map={dot} size={0.14} color="#ffe2b8" transparent opacity={0.9} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </points>
  )
}

export function Gift() {
  const near = useNear('gift')
  const opened = useExperience((s) => s.found.includes('gift'))
  const { ref } = useHover(near && !opened)
  const lid = useRef<Group>(null!)
  const t = useRef(0)

  useFrame(({ clock }, dt) => {
    t.current = MathUtils.damp(t.current, opened ? 1 : 0, 2.2, dt)
    const k = t.current
    const wobble = !opened && near ? Math.sin(clock.elapsedTime * 10) * 0.03 : 0
    lid.current.position.set(-0.1 * k, 0.62 + k * 0.75, -0.25 * k)
    lid.current.rotation.set(-0.7 * k, 0, 0.25 * k + wobble)
  })

  const [x, z] = POINTS.gift
  return (
    <group position={[x, 0, z]} rotation-y={-0.5}>
      <Glow color="#ffd6a5" size={2.8} strength={opened ? 0.6 : near ? 1.2 : 0.8} />
      <group ref={ref}>
        <mesh position-y={0.3} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.6, 0.7]} />
          <meshStandardMaterial color={BOX} roughness={0.6} />
        </mesh>
        <mesh position-y={0.3}>
          <boxGeometry args={[0.13, 0.605, 0.705]} />
          <meshStandardMaterial color={RIBBON} roughness={0.4} />
        </mesh>
        <mesh position-y={0.3}>
          <boxGeometry args={[0.705, 0.605, 0.13]} />
          <meshStandardMaterial color={RIBBON} roughness={0.4} />
        </mesh>
        {opened && (
          <mesh position-y={0.61} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[0.62, 0.62]} />
            <meshBasicMaterial color={[2.2, 1.7, 1.2]} toneMapped={false} />
          </mesh>
        )}
        <group ref={lid} position-y={0.62}>
          <mesh position-y={0.06} castShadow>
            <boxGeometry args={[0.78, 0.13, 0.78]} />
            <meshStandardMaterial color={BOX} roughness={0.6} />
          </mesh>
          <mesh position-y={0.06}>
            <boxGeometry args={[0.13, 0.135, 0.785]} />
            <meshStandardMaterial color={RIBBON} roughness={0.4} />
          </mesh>
          <mesh position-y={0.06}>
            <boxGeometry args={[0.785, 0.135, 0.13]} />
            <meshStandardMaterial color={RIBBON} roughness={0.4} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0.11 * s, 0.2, 0]} rotation={[0, 0, 0.5 * s]} scale={[1, 1, 0.5]}>
              <torusGeometry args={[0.1, 0.035, 8, 16]} />
              <meshStandardMaterial color={RIBBON} roughness={0.4} />
            </mesh>
          ))}
        </group>
      </group>
      <Burst active={opened} />
      <Sparkles count={opened ? 24 : 14} scale={[1.4, 2.2, 1.4]} position-y={1.2} size={opened ? 4 : 2.5} speed={0.5} color="#ffe2b8" />
    </group>
  )
}
