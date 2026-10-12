import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '../Environment/Sparkles'
import { Group, Vector3 } from 'three'
import { useExperience } from '../../stores/useExperience'
import { EGG } from '../layout'
import { player } from '../runtime'
import { heartGeo, starGeo } from './shared'

function Heart() {
  const ref = useRef<Group>(null!)
  const target = useRef(new Vector3()).current
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    // acompanha a personagem de pertinho, por cima do ombro
    target.set(
      player.pos.x + Math.cos(player.yaw + 2.2) * 0.75,
      2.1 + Math.sin(t * 1.8) * 0.12,
      player.pos.z + Math.sin(-player.yaw - 2.2) * 0.75,
    )
    ref.current.position.lerp(target, 1 - Math.exp(-dt * 2.5))
    ref.current.rotation.y = Math.sin(t * 1.2) * 0.6
    ref.current.scale.setScalar(0.55 + Math.sin(t * 3) * 0.04)
  })
  return (
    <group ref={ref} position={[EGG[0], 1, EGG[1]]}>
      <mesh geometry={heartGeo}>
        <meshStandardMaterial color="#000" emissive="#ff9fb8" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <Sparkles count={8} scale={0.8} size={2} speed={0.5} color="#ffd0dc" />
    </group>
  )
}

export function EasterEgg() {
  const found = useExperience((s) => s.eggFound)
  const star = useRef<Group>(null!)
  useFrame(({ clock }) => {
    if (found) return
    const t = clock.elapsedTime
    star.current.rotation.y = t * 1.5
    star.current.position.y = 0.55 + Math.sin(t * 2) * 0.06
  })
  return (
    <>
      {!found && (
        <group position={[EGG[0], 0, EGG[1]]}>
          <group ref={star} scale={0.4}>
            <mesh geometry={starGeo}>
              <meshStandardMaterial color="#000" emissive="#cfe3ff" emissiveIntensity={2.2} toneMapped={false} />
            </mesh>
          </group>
          <Sparkles count={6} scale={0.9} position-y={0.6} size={1.6} speed={0.3} color="#cfe3ff" />
        </group>
      )}
      {found && <Heart />}
    </>
  )
}
