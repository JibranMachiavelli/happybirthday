import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ConeGeometry, CylinderGeometry, Group, SphereGeometry } from 'three'
import { reducedMotion } from '../../lib/device'

export const balloonGeo = new SphereGeometry(0.32, 20, 14).scale(1, 1.18, 1)
const knotGeo = new ConeGeometry(0.05, 0.08, 6)
const stringGeo = new CylinderGeometry(0.004, 0.004, 1, 3).translate(0, -0.5, 0)

export function Balloon({ position, color, height = 1.8, phase = 0 }: {
  position: [number, number, number]; color: string; height?: number; phase?: number
}) {
  const head = useRef<Group>(null!)
  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime + phase
    head.current.position.y = height + Math.sin(t * 1.1) * 0.06
    head.current.rotation.z = Math.sin(t * 0.8) * 0.07
    head.current.rotation.x = Math.cos(t * 0.6) * 0.05
  })
  return (
    <group position={position}>
      <group ref={head} position-y={height}>
        <mesh geometry={balloonGeo} position-y={0.38} castShadow>
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} emissive={color} emissiveIntensity={0.12} />
        </mesh>
        <mesh geometry={knotGeo} position-y={0.0} rotation-x={Math.PI}>
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        <mesh geometry={stringGeo} scale-y={height}>
          <meshBasicMaterial color="#f3e7da" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  )
}
