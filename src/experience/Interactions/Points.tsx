import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '../Environment/Sparkles'
import { Group } from 'three'
import { reducedMotion } from '../../lib/device'
import { useExperience } from '../../stores/useExperience'
import { POINTS } from '../layout'
import { Glow, starGeo, useHover, useNear } from './shared'

const useFound = (id: 'flower' | 'star' | 'book') => useExperience((s) => s.found.includes(id))

export function SpecialFlower() {
  const near = useNear('flower')
  const found = useFound('flower')
  const { ref } = useHover(near)
  const head = useRef<Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!reducedMotion) {
      head.current.rotation.y = t * 0.3
      head.current.rotation.z = Math.sin(t * 0.9) * 0.08
    }
  })
  const [x, z] = POINTS.flower
  return (
    <group position={[x, 0, z]}>
      <Glow color="#efb8c8" size={2.6} strength={found ? 0.35 : near ? 1.2 : 0.8} />
      <group ref={ref}>
        <group scale={1.3}>
        <mesh position-y={0.45} castShadow>
          <cylinderGeometry args={[0.022, 0.03, 0.9, 6]} />
          <meshStandardMaterial color="#5a8f5c" />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.1 * s, 0.32, 0]} rotation={[0, 0, -0.6 * s]} scale={[1, 0.25, 0.5]}>
            <sphereGeometry args={[0.13, 10, 8]} />
            <meshStandardMaterial color="#6ea86f" />
          </mesh>
        ))}
        <group ref={head} position-y={0.95} rotation-x={0.25}>
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 0.13, 0, Math.sin(a) * 0.13]} rotation={[0, -a, 0.35]} scale={[1, 0.3, 0.6]}>
                <sphereGeometry args={[0.13, 14, 10]} />
                <meshStandardMaterial color="#f4a9bf" emissive="#e8879f" emissiveIntensity={0.25} roughness={0.5} />
              </mesh>
            )
          })}
          <mesh position-y={0.03}>
            <sphereGeometry args={[0.07, 14, 10]} />
            <meshStandardMaterial color="#000" emissive="#ffd38a" emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
        </group>
        </group>
      </group>
      <Sparkles count={found ? 6 : 16} scale={[1.4, 1.8, 1.4]} position-y={1.1} size={3} speed={0.4} color="#ffd6e2" />
    </group>
  )
}

export function FloatingStar() {
  const near = useNear('star')
  const found = useFound('star')
  const { ref } = useHover(near)
  const star = useRef<Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    star.current.rotation.y = t * 0.8
    star.current.position.y = 1.5 + (reducedMotion ? 0 : Math.sin(t * 1.4) * 0.12)
  })
  const [x, z] = POINTS.star
  return (
    <group position={[x, 0, z]}>
      <Glow color="#ffd6a5" size={2.4} strength={found ? 0.3 : near ? 1.2 : 0.8} />
      <group ref={ref}>
        <group ref={star}>
          <mesh geometry={starGeo}>
            <meshStandardMaterial color="#000" emissive="#ffd38a" emissiveIntensity={found ? 1.8 : 3.2} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <Sparkles count={found ? 6 : 18} scale={[1.6, 2.4, 1.6]} position-y={1.4} size={3} speed={0.5} color="#fff1c9" />
    </group>
  )
}

export function BookPoint() {
  const near = useNear('book')
  const found = useFound('book')
  const { ref } = useHover(near)
  const page = useRef<Group>(null!)
  useFrame(({ clock }, dt) => {
    // página folheando devagar quando a personagem chega perto
    const target = near ? 0.9 + Math.sin(clock.elapsedTime * 1.5) * 0.5 : 0.12
    page.current.rotation.z += (target - page.current.rotation.z) * (1 - Math.exp(-dt * 3))
  })
  const [x, z] = POINTS.book
  return (
    <group position={[x, 0, z]} rotation-y={0.6} scale={1.3}>
      <Glow color="#ffd6a5" size={2.6} strength={found ? 0.35 : near ? 1.2 : 0.8} />
      {/* atril */}
      <mesh position-y={0.42} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.12, 0.84, 8]} />
        <meshStandardMaterial color="#6b4f45" roughness={0.8} />
      </mesh>
      <mesh position-y={0.03} receiveShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.06, 10]} />
        <meshStandardMaterial color="#d8cabd" roughness={0.9} flatShading />
      </mesh>
      <group ref={ref} position-y={0.88} rotation-x={-0.45}>
        <mesh castShadow>
          <boxGeometry args={[0.56, 0.035, 0.4]} />
          <meshStandardMaterial color="#9a5b6b" roughness={0.6} />
        </mesh>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[0.135 * sd, 0.03, 0]} rotation-z={0.08 * sd}>
            <boxGeometry args={[0.25, 0.025, 0.37]} />
            <meshStandardMaterial color="#fbf6ec" roughness={0.9} emissive="#ffe8c8" emissiveIntensity={near ? 0.5 : 0.2} />
          </mesh>
        ))}
        <group ref={page} position={[0, 0.05, 0]}>
          <mesh position-x={0.12}>
            <boxGeometry args={[0.24, 0.006, 0.36]} />
            <meshStandardMaterial color="#fffaf2" roughness={0.9} emissive="#ffe8c8" emissiveIntensity={0.3} />
          </mesh>
        </group>
        <mesh position={[0.02, 0.02, -0.25]} rotation-x={0.2}>
          <boxGeometry args={[0.03, 0.005, 0.16]} />
          <meshStandardMaterial color="#d98aa3" />
        </mesh>
      </group>
      <Sparkles count={found ? 6 : 16} scale={[1.2, 1.8, 1.2]} position-y={1.4} size={2.5} speed={0.4} color="#fff1c9" />
    </group>
  )
}
