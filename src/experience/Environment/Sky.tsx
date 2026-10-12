import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { BackSide, Group, ShaderMaterial } from 'three'
import { reducedMotion } from '../../lib/device'

const skyMaterial = new ShaderMaterial({
  side: BackSide,
  depthWrite: false,
  fog: false,
  uniforms: { uTime: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec3 vDir;
    void main() {
      vDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    varying vec3 vDir;
    void main() {
      float h = vDir.y;
      float shift = sin(uTime * 0.02) * 0.5 + 0.5;
      vec3 zenith = mix(vec3(0.03, 0.04, 0.10), vec3(0.05, 0.05, 0.13), shift);
      vec3 mid = vec3(0.14, 0.12, 0.26);
      vec3 horizon = mix(vec3(0.93, 0.55, 0.47), vec3(0.85, 0.48, 0.58), shift);
      vec3 below = vec3(0.10, 0.09, 0.18);
      // brilho do pôr do sol de um lado do céu
      float sun = pow(max(dot(normalize(vec3(vDir.x, 0.0, vDir.z)), normalize(vec3(-0.7, 0.0, 0.7))), 0.0), 3.0);
      vec3 col = mix(mid, zenith, smoothstep(0.08, 0.6, h));
      col = mix(mix(horizon * 0.55, horizon, sun), col, smoothstep(-0.02, 0.28, h));
      col = mix(col, below, smoothstep(0.0, -0.35, h));
      gl_FragColor = vec4(col, 1.0);
    }
  `,
})

export function Sky() {
  const group = useRef<Group>(null!)
  useFrame(({ camera, clock }) => {
    group.current.position.copy(camera.position)
    skyMaterial.uniforms.uTime.value = clock.elapsedTime
  })
  return (
    <group ref={group}>
      <mesh material={skyMaterial} renderOrder={-1}>
        <sphereGeometry args={[180, 32, 16]} />
      </mesh>
      <Stars radius={120} depth={40} count={1400} factor={4} saturation={0} fade speed={reducedMotion ? 0 : 0.6} />
      <mesh position={[60, 70, -110]}>
        <sphereGeometry args={[4.5, 32, 16]} />
        <meshBasicMaterial color={[2.4, 2.25, 2.0]} toneMapped={false} fog={false} />
      </mesh>
    </group>
  )
}
