import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '../Environment/Sparkles'
import { InstancedMesh, MeshStandardMaterial, Object3D, SphereGeometry } from 'three'
import { useExperience } from '../../stores/useExperience'
import { Fireflies } from '../Environment/Atmosphere'
import { Balloon } from '../Environment/Balloon'
import { Flowers } from '../Environment/Flowers'
import { Grass } from '../Environment/Grass'
import { Island, Lamps } from '../Environment/Island'
import { CAKE, CAKE_R, type V2 } from '../layout'
import { Cake } from './Cake'
import { Confetti, Fireworks, RisingBalloons } from './Effects3D'

const RING: V2[] = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2 + 0.3
  return [Math.cos(a) * 4.6, Math.sin(a) * 4.6]
})

const bulbGeo = new SphereGeometry(0.03, 8, 6)
const bulbMat = new MeshStandardMaterial({ color: '#000', emissive: '#ffd9a8', emissiveIntensity: 2, toneMapped: false })

// varal de luzinhas entre os postes
function StringLights() {
  const ref = useRef<InstancedMesh>(null!)
  const PER = 14
  const count = RING.length * PER
  useLayoutEffect(() => {
    const d = new Object3D()
    RING.forEach(([ax, az], i) => {
      const [bx, bz] = RING[(i + 1) % RING.length]
      for (let k = 0; k < PER; k++) {
        const t = (k + 0.5) / PER
        d.position.set(ax + (bx - ax) * t, 1.4 - Math.sin(t * Math.PI) * 0.45, az + (bz - az) * t)
        d.updateMatrix()
        ref.current.setMatrixAt(i * PER + k, d.matrix)
      }
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [count])
  useFrame(({ clock }) => {
    const on = useExperience.getState().finalStep >= 4
    bulbMat.emissiveIntensity = (on ? 2.4 : 1.6) + Math.sin(clock.elapsedTime * 2) * 0.4
  })
  return <instancedMesh ref={ref} args={[bulbGeo, bulbMat, count]} />
}

export function CakeArea() {
  const celebrate = useExperience((s) => s.finalStep >= 4)
  const visible = useExperience((s) => s.phase === 'final' || s.phase === 'letter')
  const center = useMemo<V2>(() => [CAKE.x, CAKE.z], [])

  // só monta depois do portal (economiza draw calls durante a exploração)
  if (!visible) return null

  return (
    <>
      <Island x={CAKE.x} z={CAKE.z} radius={CAKE_R} />
      <Grass x={CAKE.x} z={CAKE.z} radius={CAKE_R} count={1800} />
      <Flowers x={CAKE.x} z={CAKE.z} radius={CAKE_R} inner={1.7} count={220} avoidPaths={false} />
      <Lamps list={RING} center={center} />
      <Fireflies x={CAKE.x} z={CAKE.z} radius={7} />
      <group position={[CAKE.x, 0, CAKE.z]}>
        <Cake />
        <StringLights />
        <Balloon position={[-2.6, 0, -1.6]} color="#efb8c8" height={2.2} />
        <Balloon position={[-2.3, 0, -1.9]} color="#ffd6a5" height={1.8} phase={1} />
        <Balloon position={[2.8, 0, -1.2]} color="#c9d9f2" height={2.0} phase={2} />
        <Balloon position={[2.5, 0, -1.5]} color="#f8f7f4" height={2.4} phase={3} />
        <Sparkles count={40} scale={[5, 3, 5]} position-y={2} size={3} speed={0.4} color="#fff1d6" />
        {celebrate && (
          <>
            <Confetti />
            <RisingBalloons />
            <Fireworks />
            <Sparkles count={60} scale={[12, 8, 12]} position-y={4} size={4} speed={0.8} color="#ffe6f0" />
          </>
        )}
      </group>
    </>
  )
}
