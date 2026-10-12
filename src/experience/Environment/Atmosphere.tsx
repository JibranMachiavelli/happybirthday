import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from './Sparkles'
import { Group, IcosahedronGeometry, InstancedMesh, MeshStandardMaterial, Object3D } from 'three'
import { isMobile, reducedMotion } from '../../lib/device'

const puffGeo = new IcosahedronGeometry(1, 1)
const cloudMat = new MeshStandardMaterial({
  color: '#c9b6d6', emissive: '#4a3a5c', emissiveIntensity: 0.4, roughness: 1, flatShading: true,
  transparent: true, opacity: 0.92,
})

// nuvens no céu e um "mar" de nuvens abaixo da ilha, tudo num único draw call
function cloudPuffs() {
  const puffs: [number, number, number, number][] = []
  const cluster = (cx: number, cy: number, cz: number, size: number) => {
    const n = 4 + Math.floor(Math.random() * 3)
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1) - 0.5
      puffs.push([cx + t * size * 2.6, cy + Math.random() * size * 0.3, cz + (Math.random() - 0.5) * size, size * (1 - Math.abs(t) * 0.9)])
    }
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + Math.random() * 0.3
    const r = 34 + Math.random() * 18
    cluster(Math.cos(a) * r, 7 + Math.random() * 12, Math.sin(a) * r, 2 + Math.random() * 1.6)
  }
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2
    const r = 14 + Math.random() * 16
    cluster(Math.cos(a) * r, -12 - Math.random() * 5, Math.sin(a) * r, 3 + Math.random() * 2)
  }
  return puffs
}

export function Clouds({ x = 0, z = 0 }: { x?: number; z?: number }) {
  const group = useRef<Group>(null!)
  const ref = useRef<InstancedMesh>(null!)
  const puffs = useRef(cloudPuffs()).current

  useLayoutEffect(() => {
    const d = new Object3D()
    puffs.forEach(([px, py, pz, s], i) => {
      d.position.set(px, py, pz)
      d.scale.set(s, s * 0.62, s * 0.8)
      d.updateMatrix()
      ref.current.setMatrixAt(i, d.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [puffs])

  useFrame((_, dt) => {
    if (!reducedMotion) group.current.rotation.y += dt * 0.006
  })

  return (
    <group ref={group} position={[x, 0, z]}>
      <instancedMesh ref={ref} args={[puffGeo, cloudMat, puffs.length]} />
    </group>
  )
}

export function Fireflies({ x = 0, z = 0, radius = 12 }: { x?: number; z?: number; radius?: number }) {
  const speed = reducedMotion ? 0 : 1
  return (
    <group position={[x, 0, z]}>
      <Sparkles count={isMobile ? 40 : 70} scale={[radius * 2, 3, radius * 2]} position-y={1.6} size={5} speed={0.35 * speed} color="#ffd98a" opacity={0.95} />
      <Sparkles count={isMobile ? 40 : 80} scale={[radius * 2.2, 6, radius * 2.2]} position-y={3} size={1.6} speed={0.6 * speed} color="#fff3e6" opacity={0.6} />
    </group>
  )
}
