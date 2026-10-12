import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, PointLight } from 'three'

const CANDLES = ['#f6c6d4', '#c9e3d0', '#ffe2b8', '#d7cdf2', '#f6c6d4', '#c9e3d0', '#ffe2b8']

export function Cake() {
  const flames = useRef<Group>(null!)
  const light = useRef<PointLight>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    flames.current.children.forEach((f, i) => {
      const k = 1 + Math.sin(t * 13 + i * 2.1) * 0.12 + Math.sin(t * 7.3 + i) * 0.08
      f.scale.set(1, k, 1)
    })
    light.current.intensity = 3.2 + Math.sin(t * 11) * 0.3 + Math.sin(t * 6.1) * 0.2
  })

  return (
    <group>
      {/* pedestal */}
      <mesh position-y={0.3} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.2, 0.6, 12]} />
        <meshStandardMaterial color="#d9cdc2" roughness={0.9} flatShading />
      </mesh>
      <mesh position-y={0.63}>
        <cylinderGeometry args={[0.95, 0.95, 0.05, 32]} />
        <meshStandardMaterial color="#fbf8f4" roughness={0.3} />
      </mesh>
      {/* andar de baixo */}
      <mesh position-y={0.91} castShadow>
        <cylinderGeometry args={[0.78, 0.78, 0.52, 36]} />
        <meshStandardMaterial color="#f7d9e1" roughness={0.75} />
      </mesh>
      <mesh position-y={1.16} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.76, 0.06, 10, 40]} />
        <meshStandardMaterial color="#fffaf4" roughness={0.5} />
      </mesh>
      {/* andar de cima */}
      <mesh position-y={1.37} castShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.42, 36]} />
        <meshStandardMaterial color="#fffaf4" roughness={0.6} />
      </mesh>
      <mesh position-y={1.58} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.5, 0.05, 10, 36]} />
        <meshStandardMaterial color="#f2b7c7" roughness={0.5} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.72, 1.2, Math.sin(a) * 0.72]}>
            <sphereGeometry args={[0.055, 10, 8]} />
            <meshStandardMaterial color="#d9405f" roughness={0.3} />
          </mesh>
        )
      })}
      {/* velas */}
      {CANDLES.map((c, i) => {
        const a = (i / CANDLES.length) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.3, 1.71, Math.sin(a) * 0.3]}>
            <cylinderGeometry args={[0.025, 0.025, 0.24, 8]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        )
      })}
      <group ref={flames}>
        {CANDLES.map((_, i) => {
          const a = (i / CANDLES.length) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.3, 1.88, Math.sin(a) * 0.3]} scale={[1, 1, 1]}>
              <sphereGeometry args={[0.035, 10, 8]} />
              <meshBasicMaterial color={[3, 2, 0.9]} toneMapped={false} />
            </mesh>
          )
        })}
      </group>
      <pointLight ref={light} position-y={2.2} color="#ffbe7a" intensity={3.2} distance={9} decay={1.6} />
    </group>
  )
}
