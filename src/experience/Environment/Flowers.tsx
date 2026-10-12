import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, CylinderGeometry, InstancedMesh, Object3D, SphereGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { OBSTACLES, PATHS } from '../layout'

function headGeometry() {
  const petals = []
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const g = new SphereGeometry(0.05, 6, 4)
    g.scale(1, 0.35, 0.6)
    g.translate(Math.cos(a) * 0.045, 0, Math.sin(a) * 0.045)
    petals.push(g)
  }
  return mergeGeometries(petals)
}

const headGeo = headGeometry()
const centerGeo = new SphereGeometry(0.025, 6, 4)
const stemGeo = new CylinderGeometry(0.008, 0.01, 1, 4).translate(0, 0.5, 0)
const PALETTE = ['#f4c6d4', '#fbf3ea', '#ffd6a5', '#d9c3ef', '#efb8c8', '#ffe9c7']

function nearPath(x: number, z: number) {
  for (const pts of PATHS)
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i]
      const [bx, bz] = pts[i + 1]
      const dx = bx - ax
      const dz = bz - az
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)))
      if (Math.hypot(x - ax - dx * t, z - az - dz * t) < 0.6) return true
    }
  return false
}

export function Flowers({ x = 0, z = 0, radius, count, inner = 0, avoidPaths = true }: {
  x?: number; z?: number; radius: number; count: number; inner?: number; avoidPaths?: boolean
}) {
  const heads = useRef<InstancedMesh>(null!)
  const centers = useRef<InstancedMesh>(null!)
  const stems = useRef<InstancedMesh>(null!)

  const items = useMemo(() => {
    const out: { x: number; z: number; h: number; c: string }[] = []
    let guard = 0
    while (out.length < count && guard++ < count * 20) {
      // em pequenos grupos, como num jardim de verdade
      const r = inner + Math.sqrt(Math.random()) * (radius - inner - 0.4)
      const a = Math.random() * Math.PI * 2
      const px = Math.cos(a) * r
      const pz = Math.sin(a) * r
      if (avoidPaths && (nearPath(px, pz) || OBSTACLES.some(([ox, oz, or]) => Math.hypot(px - ox, pz - oz) < or + 0.3))) continue
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      const n = 2 + Math.floor(Math.random() * 4)
      for (let k = 0; k < n && out.length < count; k++)
        out.push({ x: x + px + (Math.random() - 0.5) * 0.5, z: z + pz + (Math.random() - 0.5) * 0.5, h: 0.18 + Math.random() * 0.22, c })
    }
    return out
  }, [x, z, radius, count, inner, avoidPaths])

  useLayoutEffect(() => {
    const d = new Object3D()
    const col = new Color()
    items.forEach((f, i) => {
      d.position.set(f.x, 0, f.z)
      d.rotation.set(0, 0, 0)
      d.scale.set(1, f.h, 1)
      d.updateMatrix()
      stems.current.setMatrixAt(i, d.matrix)
      d.position.y = f.h
      d.scale.setScalar(0.9 + Math.random() * 0.5)
      d.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * 6, (Math.random() - 0.5) * 0.4)
      d.updateMatrix()
      heads.current.setMatrixAt(i, d.matrix)
      d.position.y = f.h + 0.012
      d.updateMatrix()
      centers.current.setMatrixAt(i, d.matrix)
      heads.current.setColorAt(i, col.set(f.c))
    })
    for (const m of [heads.current, centers.current, stems.current]) {
      m.instanceMatrix.needsUpdate = true
      m.computeBoundingSphere()
    }
    if (heads.current.instanceColor) heads.current.instanceColor.needsUpdate = true
  }, [items])

  return (
    <>
      <instancedMesh ref={stems} args={[stemGeo, undefined, items.length]}>
        <meshStandardMaterial color="#4c7a50" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[headGeo, undefined, items.length]}>
        <meshStandardMaterial roughness={0.7} emissive="#ffb8c8" emissiveIntensity={0.08} />
      </instancedMesh>
      <instancedMesh ref={centers} args={[centerGeo, undefined, items.length]}>
        <meshStandardMaterial color="#ffcf7a" emissive="#ffb347" emissiveIntensity={0.4} />
      </instancedMesh>
    </>
  )
}
