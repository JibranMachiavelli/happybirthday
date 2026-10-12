import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  ConeGeometry, CylinderGeometry, DodecahedronGeometry, InstancedMesh, MeshStandardMaterial, Object3D,
  SphereGeometry,
} from 'three'
import { LAMPS, PATHS, ROCKS, type V2 } from '../layout'

function rockyCone(radius: number, height: number, seed: number) {
  const g = new ConeGeometry(radius, height, 18, 5, true)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i)
    if (y > height / 2 - 0.01) continue
    const a = Math.atan2(p.getZ(i), p.getX(i))
    const n = Math.sin(a * 5 + seed) * 0.5 + Math.sin(a * 11 + y * 2 + seed) * 0.35
    const k = 1 + n * 0.12
    p.setX(i, p.getX(i) * k)
    p.setZ(i, p.getZ(i) * k)
  }
  g.rotateX(Math.PI)
  g.translate(0, -height / 2, 0)
  g.computeVertexNormals()
  return g
}

const rockMat = new MeshStandardMaterial({ color: '#5b4a52', roughness: 1, flatShading: true })
const soilMat = new MeshStandardMaterial({ color: '#4a3c3a', roughness: 1, flatShading: true })
const grassMat = new MeshStandardMaterial({ color: '#3f6b48', roughness: 1 })

export function Island({ x = 0, z = 0, radius }: { x?: number; z?: number; radius: number }) {
  const cone = useMemo(() => rockyCone(radius * 1.02, radius * 0.75, radius), [radius])
  const lower = useMemo(() => rockyCone(radius * 0.45, radius * 0.5, radius * 3), [radius])
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={-0.2} receiveShadow material={grassMat}>
        <cylinderGeometry args={[radius, radius * 1.01, 0.4, 64]} />
      </mesh>
      <mesh position-y={-0.4} material={soilMat}>
        <cylinderGeometry args={[radius * 1.01, radius * 1.02, 0.5, 64, 1, true]} />
      </mesh>
      <mesh position-y={-0.65} geometry={cone} material={rockMat} />
      <mesh position={[radius * 0.2, -radius * 0.7, -radius * 0.1]} geometry={lower} material={rockMat} />
    </group>
  )
}

function useInstances(ref: React.RefObject<InstancedMesh>, items: { p: [number, number, number]; s: [number, number, number]; r?: number }[]) {
  useLayoutEffect(() => {
    const d = new Object3D()
    items.forEach((it, i) => {
      d.position.set(...it.p)
      d.scale.set(...it.s)
      d.rotation.set(0, it.r ?? 0, 0)
      d.updateMatrix()
      ref.current.setMatrixAt(i, d.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [ref, items])
}

const stoneGeo = new CylinderGeometry(0.3, 0.33, 0.08, 7)
const stoneMat = new MeshStandardMaterial({ color: '#cbb8a8', roughness: 0.95, flatShading: true })

function pathStones(paths: V2[][]) {
  const out: { p: [number, number, number]; s: [number, number, number]; r: number }[] = []
  let seed = 1
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (const pts of paths) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i]
      const [bx, bz] = pts[i + 1]
      const len = Math.hypot(bx - ax, bz - az)
      const steps = Math.floor(len / 0.8)
      for (let k = 1; k < steps; k++) {
        const t = k / steps
        const nx = -(bz - az) / len
        const nz = (bx - ax) / len
        const side = (rnd() - 0.5) * 0.35
        const s = 0.8 + rnd() * 0.45
        out.push({ p: [ax + (bx - ax) * t + nx * side, 0.02, az + (bz - az) * t + nz * side], s: [s, 1, s * (0.8 + rnd() * 0.3)], r: rnd() * 3 })
      }
    }
  }
  return out
}

export function Paths() {
  const ref = useRef<InstancedMesh>(null!)
  const items = useMemo(() => pathStones(PATHS), [])
  useInstances(ref, items)
  return <instancedMesh ref={ref} args={[stoneGeo, stoneMat, items.length]} receiveShadow />
}

const rockGeo = new DodecahedronGeometry(1, 0)
const rockItems = ROCKS.map(([x, z, s], i) => ({ p: [x, s * 0.35, z] as [number, number, number], s: [s, s * 0.75, s * 0.9] as [number, number, number], r: i * 1.7 }))

export function Rocks() {
  const ref = useRef<InstancedMesh>(null!)
  useInstances(ref, rockItems)
  return (
    <instancedMesh ref={ref} args={[rockGeo, undefined, rockItems.length]} castShadow receiveShadow>
      <meshStandardMaterial color="#8a7f8c" roughness={0.9} flatShading />
    </instancedMesh>
  )
}

const postGeo = new CylinderGeometry(0.04, 0.06, 1.3, 6).translate(0, 0.65, 0)
const bulbGeo = new SphereGeometry(0.11, 12, 8)
const bulbMat = new MeshStandardMaterial({ color: '#000', emissive: '#ffc98a', emissiveIntensity: 2.6, toneMapped: false })

export function Lamps({ list = LAMPS, center = [0, 0] as V2 }: { list?: V2[]; center?: V2 }) {
  const posts = useRef<InstancedMesh>(null!)
  const bulbs = useRef<InstancedMesh>(null!)
  const postItems = useMemo(() => list.map(([x, z]) => ({ p: [x + center[0], 0, z + center[1]] as [number, number, number], s: [1, 1, 1] as [number, number, number] })), [list, center])
  const bulbItems = useMemo(() => postItems.map((it) => ({ ...it, p: [it.p[0], 1.38, it.p[2]] as [number, number, number] })), [postItems])
  useInstances(posts, postItems)
  useInstances(bulbs, bulbItems)
  useFrame(({ clock }) => {
    bulbMat.emissiveIntensity = 2.4 + Math.sin(clock.elapsedTime * 1.3) * 0.35
  })
  return (
    <>
      <instancedMesh ref={posts} args={[postGeo, undefined, postItems.length]} castShadow>
        <meshStandardMaterial color="#2d2732" roughness={0.6} metalness={0.3} />
      </instancedMesh>
      <instancedMesh ref={bulbs} args={[bulbGeo, bulbMat, bulbItems.length]} />
    </>
  )
}
