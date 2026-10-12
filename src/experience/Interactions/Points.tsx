import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { Sparkles } from '../Environment/Sparkles'
import { Group, SRGBColorSpace, Texture, TextureLoader } from 'three'
import { birthday } from '../../config/birthday'
import { reducedMotion } from '../../lib/device'
import { useExperience } from '../../stores/useExperience'
import { POINTS } from '../layout'
import { Glow, starGeo, useHover, useNear } from './shared'

const useFound = (id: 'flower' | 'star' | 'camera') => useExperience((s) => s.found.includes(id))

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

export function usePhoto() {
  const [tex, setTex] = useState<Texture | null>(null)
  useEffect(() => {
    let alive = true
    new TextureLoader().load(
      birthday.points.camera.photo,
      (t) => {
        t.colorSpace = SRGBColorSpace
        if (alive) setTex(t)
      },
      undefined,
      () => {},
    )
    return () => {
      alive = false
    }
  }, [])
  return tex
}

export function CameraMemory() {
  const near = useNear('camera')
  const found = useFound('camera')
  const { ref } = useHover(near)
  const photo = usePhoto()
  const frame = useRef<Group>(null!)
  useFrame(({ clock }) => {
    frame.current.position.y = 2.05 + (reducedMotion ? 0 : Math.sin(clock.elapsedTime * 1.2) * 0.06)
  })
  const [x, z] = POINTS.camera
  return (
    <group position={[x, 0, z]} rotation-y={0.6}>
      <Glow color="#ffd6a5" size={2.6} strength={found ? 0.35 : near ? 1.2 : 0.8} />
      <mesh position-y={0.42} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.38, 0.84, 10]} />
        <meshStandardMaterial color="#d8cabd" roughness={0.9} flatShading />
      </mesh>
      <group ref={ref} position-y={0.84}>
        <group position-y={0.13}>
          <mesh castShadow>
            <boxGeometry args={[0.38, 0.24, 0.17]} />
            <meshStandardMaterial color="#3b3540" roughness={0.5} />
          </mesh>
          <mesh scale={[1.01, 0.45, 1.02]}>
            <boxGeometry args={[0.38, 0.24, 0.17]} />
            <meshStandardMaterial color="#c9a98a" roughness={0.8} />
          </mesh>
          <mesh position-z={0.12} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.075, 0.085, 0.1, 18]} />
            <meshStandardMaterial color="#2a252d" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position-z={0.172}>
            <circleGeometry args={[0.058, 18]} />
            <meshStandardMaterial color="#1b2a44" emissive="#3b5b8f" emissiveIntensity={0.6} metalness={0.8} roughness={0.1} />
          </mesh>
          <mesh position={[0.12, 0.15, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.05, 12]} />
            <meshStandardMaterial color="#d7d2cc" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[-0.1, 0.15, 0.02]}>
            <boxGeometry args={[0.1, 0.06, 0.08]} />
            <meshStandardMaterial color="#000" emissive="#fff4e0" emissiveIntensity={near ? 2.5 : 0.6} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <group ref={frame}>
        <Billboard>
          <mesh>
            <planeGeometry args={[0.62, 0.74]} />
            <meshStandardMaterial color="#fbf7f0" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.05, 0.002]}>
            <planeGeometry args={[0.52, 0.52]} />
            {photo ? (
              <meshBasicMaterial map={photo} toneMapped={false} />
            ) : (
              <meshStandardMaterial color="#e6c5b8" emissive="#ffcfae" emissiveIntensity={0.5} />
            )}
          </mesh>
        </Billboard>
      </group>
      <Sparkles count={found ? 6 : 14} scale={[1.4, 2.6, 1.4]} position-y={1.6} size={2.5} speed={0.4} color="#fff1c9" />
    </group>
  )
}
