import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '../Environment/Sparkles'
import { AdditiveBlending, DoubleSide, InstancedMesh, MathUtils, Object3D, ShaderMaterial, Shape, ShapeGeometry } from 'three'
import { POINT_IDS, useExperience } from '../../stores/useExperience'
import { POINTS } from '../layout'
import { Glow } from './shared'

const W = 1.05
const H = 1.9

function archGeometry() {
  const s = new Shape()
  s.moveTo(-W, 0)
  s.lineTo(-W, H)
  s.absarc(0, H, W, Math.PI, 0, true)
  s.lineTo(W, 0)
  s.lineTo(-W, 0)
  return new ShapeGeometry(s, 24)
}

export function Portal() {
  const unlocked = useExperience((s) => s.found.length === POINT_IDS.length)
  const flowers = useRef<InstancedMesh>(null!)
  const level = useRef(0)
  const geo = useMemo(archGeometry, [])
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uLevel: { value: 0 } },
        vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform float uTime; uniform float uLevel; varying vec2 vP;
          void main(){
            vec2 c = vP - vec2(0.0, 1.3);
            float r = length(c);
            float a = atan(c.y, c.x);
            float swirl = sin(a * 3.0 + r * 6.0 - uTime * 1.6) * 0.5 + 0.5;
            float core = smoothstep(1.8, 0.0, r);
            vec3 col = mix(vec3(1.0, 0.72, 0.78), vec3(1.0, 0.86, 0.62), swirl);
            float alpha = (0.05 + uLevel * (0.22 + swirl * 0.3)) * core;
            gl_FragColor = vec4(col * alpha * (0.8 + uLevel * 0.5), 1.0);
          }`,
      }),
    [],
  )

  useLayoutEffect(() => {
    const d = new Object3D()
    for (let i = 0; i < 22; i++) {
      const t = i / 21
      const a = Math.PI - t * Math.PI
      d.position.set(Math.cos(a) * (W + 0.18), H + Math.sin(a) * (W + 0.18), 0.12)
      if (i < 4) d.position.set(-W - 0.18, H * (0.45 + i * 0.14), 0.12)
      if (i > 17) d.position.set(W + 0.18, H * (0.45 + (21 - i) * 0.14), 0.12)
      d.scale.setScalar(0.7 + Math.random() * 0.6)
      d.updateMatrix()
      flowers.current.setMatrixAt(i, d.matrix)
    }
    flowers.current.instanceMatrix.needsUpdate = true
  }, [])

  useFrame(({ clock }, dt) => {
    level.current = MathUtils.damp(level.current, unlocked ? 1 : 0, 1.5, dt)
    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uLevel.value = level.current
  })

  const [x, z] = POINTS.portal
  return (
    <group position={[x, 0, z]}>
      <Glow color="#efb8c8" size={4} strength={unlocked ? 1.1 : 0.15} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(W + 0.18) * s, H / 2, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.2, H, 8]} />
          <meshStandardMaterial color="#d6cabf" roughness={0.9} flatShading />
        </mesh>
      ))}
      <mesh position-y={H} castShadow>
        <torusGeometry args={[W + 0.18, 0.15, 8, 28, Math.PI]} />
        <meshStandardMaterial color="#d6cabf" roughness={0.9} flatShading />
      </mesh>
      <instancedMesh ref={flowers} args={[undefined, undefined, 22]}>
        <icosahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial color="#f4bfd0" emissive="#efb8c8" emissiveIntensity={unlocked ? 0.9 : 0.1} flatShading />
      </instancedMesh>
      <mesh geometry={geo} material={mat} />
      {unlocked && <Sparkles count={30} scale={[2.4, 3.2, 1]} position-y={1.6} size={4} speed={0.6} color="#ffe2ec" />}
    </group>
  )
}
