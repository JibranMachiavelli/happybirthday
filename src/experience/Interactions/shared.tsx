import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, Group, MathUtils, Shape, ShaderMaterial, ExtrudeGeometry } from 'three'
import { useExperience, type Target } from '../../stores/useExperience'

export function useNear(id: Target) {
  return useExperience((s) => s.nearby === id)
}

// sobe suavemente quando a personagem chega perto
export function useHover(near: boolean) {
  const ref = useRef<Group>(null!)
  const v = useRef(0)
  useFrame((_, dt) => {
    v.current = MathUtils.damp(v.current, near ? 1 : 0, 6, dt)
    ref.current.scale.setScalar(1 + v.current * 0.12)
  })
  return { ref, hover: v }
}

export function Glow({ color = '#ffd6a5', size = 2, strength = 1, y = 0.03 }: { color?: string; size?: number; strength?: number; y?: number }) {
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uColor: { value: new Color(color) }, uStrength: { value: strength }, uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uColor; uniform float uStrength; uniform float uTime; varying vec2 vUv;
          void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(1.0 - d, 0.0), 2.2);
          a *= 0.75 + 0.25 * sin(uTime * 2.0); gl_FragColor = vec4(uColor * a * uStrength, 1.0); }`,
      }),
    [color],
  )
  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uStrength.value = MathUtils.lerp(mat.uniforms.uStrength.value, strength, 0.05)
  })
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={y} material={mat}>
      <planeGeometry args={[size, size]} />
    </mesh>
  )
}

function starShape(outer: number, inner: number) {
  const s = new Shape()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2
    if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    else s.moveTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  return s
}

export const starGeo = new ExtrudeGeometry(starShape(0.32, 0.14), {
  depth: 0.08, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3,
}).center()

function heartShape() {
  const s = new Shape()
  s.moveTo(0, -0.3)
  s.bezierCurveTo(-0.05, -0.22, -0.32, -0.08, -0.32, 0.1)
  s.bezierCurveTo(-0.32, 0.26, -0.16, 0.34, 0, 0.2)
  s.bezierCurveTo(0.16, 0.34, 0.32, 0.26, 0.32, 0.1)
  s.bezierCurveTo(0.32, -0.08, 0.05, -0.22, 0, -0.3)
  return s
}

export const heartGeo = new ExtrudeGeometry(heartShape(), {
  depth: 0.1, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4, curveSegments: 16,
}).center()
