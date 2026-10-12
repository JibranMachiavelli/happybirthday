import { useMemo } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial } from 'three'
import { reducedMotion } from '../../lib/device'

type Props = ThreeElements['group'] & {
  count: number
  scale?: number | [number, number, number]
  size?: number
  speed?: number
  color?: string
  opacity?: number
}

// Partículas aditivas animadas no vertex shader (nunca escurecem o fundo).
export function Sparkles({ count, scale = 1, size = 2, speed = 0.4, color = '#ffffff', opacity = 1, ...group }: Props) {
  const [sx, sy, sz] = typeof scale === 'number' ? [scale, scale, scale] : scale
  const geo = useMemo(() => {
    const g = new BufferGeometry()
    const p = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * sx
      p[i * 3 + 1] = (Math.random() - 0.5) * sy
      p[i * 3 + 2] = (Math.random() - 0.5) * sz
      seed[i] = Math.random() * 100
    }
    g.setAttribute('position', new BufferAttribute(p, 3))
    g.setAttribute('aSeed', new BufferAttribute(seed, 1))
    return g
  }, [count, sx, sy, sz])

  const mat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color(color) },
          uSize: { value: size },
          uOpacity: { value: opacity },
          uPx: { value: Math.min(window.devicePixelRatio, 2) },
          uAmp: { value: Math.min(sx, sy, sz) * 0.25 + 0.1 },
        },
        vertexShader: /* glsl */ `
          uniform float uTime; uniform float uSize; uniform float uPx; uniform float uAmp;
          attribute float aSeed; varying float vTw;
          void main() {
            float t = uTime + aSeed;
            vec3 p = position + vec3(sin(t * 0.7) + sin(t * 0.31) * 0.6, sin(t * 0.53) * 0.6, cos(t * 0.61) + cos(t * 0.27) * 0.6) * uAmp * 0.5;
            vTw = 0.55 + 0.45 * sin(t * 2.3);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = uSize * uPx * (14.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform float uOpacity; varying float vTw;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = pow(max(1.0 - d * 2.0, 0.0), 1.6) * vTw * uOpacity;
            gl_FragColor = vec4(uColor * a * 1.6, 1.0);
          }`,
      }),
    [color, size, opacity, sx, sy, sz],
  )

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime * speed * 2.5
  })

  return (
    <group {...group}>
      <points geometry={geo} material={mat} frustumCulled={false} />
    </group>
  )
}
