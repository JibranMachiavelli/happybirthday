import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ConeGeometry, CylinderGeometry, Group, IcosahedronGeometry, MeshStandardMaterial } from 'three'
import { reducedMotion } from '../../lib/device'
import { TREES, type TreeKind } from '../layout'

const trunkGeo = new CylinderGeometry(0.12, 0.22, 1.5, 7).translate(0, 0.75, 0)
const blobGeo = new IcosahedronGeometry(1, 1)
const coneGeo = new ConeGeometry(1, 1.4, 8)
const trunkMat = new MeshStandardMaterial({ color: '#5a4038', roughness: 1, flatShading: true })
const leaf = {
  round: [
    new MeshStandardMaterial({ color: '#4e7d55', roughness: 0.9, flatShading: true }),
    new MeshStandardMaterial({ color: '#5f9365', roughness: 0.9, flatShading: true }),
  ],
  blossom: [
    new MeshStandardMaterial({ color: '#e7a6bd', roughness: 0.85, flatShading: true }),
    new MeshStandardMaterial({ color: '#f2c3d2', roughness: 0.85, flatShading: true }),
  ],
  pine: [
    new MeshStandardMaterial({ color: '#3d6a52', roughness: 0.9, flatShading: true }),
    new MeshStandardMaterial({ color: '#4b7d60', roughness: 0.9, flatShading: true }),
  ],
}

function Foliage({ kind }: { kind: TreeKind }) {
  const [a, b] = leaf[kind]
  if (kind === 'pine') {
    return (
      <>
        <mesh geometry={coneGeo} material={a} position-y={1.6} scale={[1.1, 1, 1.1]} castShadow />
        <mesh geometry={coneGeo} material={b} position-y={2.3} scale={[0.85, 0.9, 0.85]} castShadow />
        <mesh geometry={coneGeo} material={a} position-y={2.95} scale={[0.55, 0.75, 0.55]} castShadow />
      </>
    )
  }
  return (
    <>
      <mesh geometry={blobGeo} material={a} position={[0, 2.0, 0]} scale={1.05} castShadow />
      <mesh geometry={blobGeo} material={b} position={[0.55, 1.75, 0.25]} scale={0.7} castShadow />
      <mesh geometry={blobGeo} material={b} position={[-0.5, 1.8, -0.2]} scale={0.72} castShadow />
      <mesh geometry={blobGeo} material={a} position={[0.1, 2.6, -0.1]} scale={0.6} castShadow />
    </>
  )
}

function Tree({ x, z, s, kind, i }: (typeof TREES)[number] & { i: number }) {
  const crown = useRef<Group>(null!)
  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime
    crown.current.rotation.z = Math.sin(t * 0.7 + i) * 0.018
    crown.current.rotation.x = Math.sin(t * 0.5 + i * 2) * 0.012
  })
  return (
    <group position={[x, 0, z]} scale={s} rotation-y={i * 1.3}>
      <mesh geometry={trunkGeo} material={trunkMat} castShadow />
      <group ref={crown}>
        <Foliage kind={kind} />
      </group>
    </group>
  )
}

export function Trees() {
  return (
    <>
      {TREES.map((t, i) => (
        <Tree key={i} {...t} i={i} />
      ))}
    </>
  )
}
