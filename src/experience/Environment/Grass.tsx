import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, DoubleSide, InstancedMesh, MeshStandardMaterial, Object3D, PlaneGeometry } from 'three'
import { isMobile, reducedMotion } from '../../lib/device'

const H = 0.24

function bladeGeometry() {
  const g = new PlaneGeometry(0.06, H, 1, 3).translate(0, H / 2, 0)
  const p = g.attributes.position
  const n = g.attributes.normal
  for (let i = 0; i < p.count; i++) {
    const t = p.getY(i) / H
    p.setX(i, p.getX(i) * (1 - t * 0.9))
    p.setZ(i, t * t * 0.06)
    // normais para cima: a grama ilumina igual ao chão
    n.setXYZ(i, 0, 1, 0)
  }
  return g
}

const uTime = { value: 0 }
const material = new MeshStandardMaterial({ color: '#ffffff', side: DoubleSide, roughness: 1 })
material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = uTime
  shader.vertexShader = `uniform float uTime;\nvarying float vH;\n${shader.vertexShader}`.replace(
    '#include <begin_vertex>',
    `#include <begin_vertex>
    vH = position.y / ${H.toFixed(2)};
    vec4 wp = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    float w = sin(uTime * 1.4 + wp.x * 0.5 + wp.z * 0.35) * 0.6 + sin(uTime * 2.6 + wp.x * 1.7) * 0.25;
    transformed.x += w * 0.09 * vH * vH;
    transformed.z += w * 0.05 * vH * vH;`,
  )
  shader.fragmentShader = `varying float vH;\n${shader.fragmentShader}`.replace(
    '#include <color_fragment>',
    `#include <color_fragment>
    diffuseColor.rgb *= mix(0.55, 1.15, vH);`,
  ).replace(
    // mesma normal (para cima) nos dois lados da lâmina
    '#include <normal_fragment_begin>',
    'float faceDirection = gl_FrontFacing ? 1.0 : -1.0; vec3 normal = normalize(vNormal); vec3 nonPerturbedNormal = normal;',
  )
}

export function Grass({ x = 0, z = 0, radius, count }: { x?: number; z?: number; radius: number; count: number }) {
  const ref = useRef<InstancedMesh>(null!)
  const geo = useMemo(bladeGeometry, [])
  const n = isMobile ? Math.round(count * 0.5) : count

  useLayoutEffect(() => {
    const d = new Object3D()
    const c = new Color()
    for (let i = 0; i < n; i++) {
      const r = Math.sqrt(Math.random()) * (radius - 0.2)
      const a = Math.random() * Math.PI * 2
      d.position.set(x + Math.cos(a) * r, 0, z + Math.sin(a) * r)
      d.rotation.set(0, Math.random() * Math.PI, 0)
      const s = 0.7 + Math.random() * 0.6
      d.scale.set(s, s * (0.7 + Math.random() * 0.6), s)
      d.updateMatrix()
      ref.current.setMatrixAt(i, d.matrix)
      c.setHSL(0.27 + Math.random() * 0.08, 0.38 + Math.random() * 0.15, 0.36 + Math.random() * 0.12)
      ref.current.setColorAt(i, c)
    }
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [n, radius, x, z])

  useFrame(({ clock }) => {
    if (!reducedMotion) uTime.value = clock.elapsedTime
  })

  return <instancedMesh ref={ref} args={[geo, material, n]} receiveShadow frustumCulled={false} />
}
