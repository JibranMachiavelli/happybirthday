import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Group, LatheGeometry, MeshStandardMaterial, Vector2 } from 'three'
import { birthday } from '../../config/birthday'
import { reducedMotion } from '../../lib/device'
import { player } from '../runtime'

const C = birthday.character

function useMaterials() {
  return useMemo(() => {
    const m = (color: string, roughness = 0.75, extra = {}) => new MeshStandardMaterial({ color, roughness, ...extra })
    return {
      skin: m(C.skin, 0.65),
      blush: new MeshStandardMaterial({ color: '#f2a3a8', roughness: 0.8, transparent: true, opacity: 0.45, depthWrite: false }),
      hair: m(C.hair, 0.5, { metalness: 0.05 }),
      top: m(C.top, 0.95),
      skirt: m(C.skirt, 0.9),
      shoes: m(C.shoes, 0.6),
      white: m('#fdfcfb', 0.3),
      iris: m(C.eyes, 0.25, { emissive: C.eyes, emissiveIntensity: 0.25 }),
      pupil: m('#1d1a1f', 0.3),
      shine: new MeshStandardMaterial({ color: '#fff', emissive: '#fff', emissiveIntensity: 1.2 }),
      lash: m('#2b1d18', 0.6),
      brow: m('#4f3020', 0.7),
      lips: m('#d9837f', 0.5),
      accent: m(C.accent, 0.5, { emissive: C.accent, emissiveIntensity: 0.15 }),
    }
  }, [])
}

const skirtGeo = new LatheGeometry(
  [new Vector2(0.17, 0.4), new Vector2(0.2, 0.3), new Vector2(0.26, 0.12), new Vector2(0.31, 0), new Vector2(0.3, -0.02)].reverse(),
  24,
)

function Eye({ side, mats, blinkRef }: { side: 1 | -1; mats: ReturnType<typeof useMaterials>; blinkRef: React.RefObject<Group | null> }) {
  return (
    <group position={[0.088 * side, -0.005, 0.205]} rotation={[0, 0.32 * side, 0]}>
      <group ref={blinkRef}>
        <mesh material={mats.white} scale={[1, 1.18, 0.5]}>
          <sphereGeometry args={[0.052, 20, 14]} />
        </mesh>
        <mesh material={mats.iris} position={[0, -0.004, 0.018]} scale={[1, 1.12, 0.45]}>
          <sphereGeometry args={[0.038, 18, 12]} />
        </mesh>
        <mesh material={mats.pupil} position={[0, -0.004, 0.032]} scale={[1, 1.1, 0.4]}>
          <sphereGeometry args={[0.02, 12, 8]} />
        </mesh>
        <mesh material={mats.shine} position={[0.013, 0.014, 0.038]}>
          <sphereGeometry args={[0.009, 8, 6]} />
        </mesh>
        <mesh material={mats.shine} position={[-0.012, -0.016, 0.036]}>
          <sphereGeometry args={[0.005, 6, 4]} />
        </mesh>
      </group>
      {/* cílios */}
      <mesh material={mats.lash} position={[0, 0.006, 0.012]} rotation={[0.25, 0, 0]}>
        <torusGeometry args={[0.054, 0.007, 4, 14, Math.PI]} />
      </mesh>
      <mesh material={mats.lash} position={[0.05 * side, 0.032, 0.012]} rotation={[0, 0, -0.5 * side]} scale={[1, 0.5, 0.5]}>
        <sphereGeometry args={[0.012, 6, 4]} />
      </mesh>
      {/* sobrancelha */}
      <mesh material={mats.brow} position={[0.002 * side, 0.085, 0.01]} rotation={[0, 0, -0.12 * side]} scale={[1, 0.22, 0.3]}>
        <sphereGeometry args={[0.05, 10, 6]} />
      </mesh>
    </group>
  )
}

function Head({ mats }: { mats: ReturnType<typeof useMaterials> }) {
  const blinkR = useRef<Group>(null)
  const blinkL = useRef<Group>(null)
  const head = useRef<Group>(null!)
  const hairBack = useRef<Group>(null!)
  const blink = useRef({ next: 2.5, t: -1 })

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const b = blink.current
    if (t > b.next && b.t < 0) b.t = 0
    let s = 1
    if (b.t >= 0) {
      b.t += dt
      s = Math.max(0.08, Math.abs(1 - b.t / 0.07))
      if (b.t > 0.14) {
        b.t = -1
        b.next = t + 2 + Math.random() * 3.5
        s = 1
      }
    }
    blinkR.current!.scale.y = s
    blinkL.current!.scale.y = s
    if (!reducedMotion) {
      head.current.rotation.z = Math.sin(t * 0.7) * 0.03
      head.current.rotation.x = Math.sin(t * 0.5) * 0.025 - player.speed * 0.06
      hairBack.current.rotation.x = -player.speed * 0.15 + Math.sin(t * 9 * Math.max(player.speed, 0.15)) * 0.025 * player.speed
    }
  })

  return (
    <group ref={head} position-y={1.66}>
      {/* rosto */}
      <mesh material={mats.skin} scale={[1.03, 1.0, 0.96]} castShadow>
        <sphereGeometry args={[0.25, 32, 24]} />
      </mesh>
      <Eye side={1} mats={mats} blinkRef={blinkR} />
      <Eye side={-1} mats={mats} blinkRef={blinkL} />
      <mesh material={mats.skin} position={[0, -0.06, 0.238]} scale={[1, 0.8, 0.8]}>
        <sphereGeometry args={[0.02, 10, 8]} />
      </mesh>
      <mesh material={mats.lips} position={[0, -0.118, 0.222]} rotation={[0.35, 0, Math.PI]}>
        <torusGeometry args={[0.03, 0.008, 6, 14, Math.PI]} />
      </mesh>
      <mesh material={mats.blush} position={[0.14, -0.065, 0.192]} rotation={[0, 0.62, 0]}>
        <circleGeometry args={[0.038, 16]} />
      </mesh>
      <mesh material={mats.blush} position={[-0.14, -0.065, 0.192]} rotation={[0, -0.62, 0]}>
        <circleGeometry args={[0.038, 16]} />
      </mesh>

      {/* cabelo */}
      <mesh material={mats.hair} position={[0, 0.025, -0.012]} castShadow>
        <sphereGeometry args={[0.272, 32, 16, 0, Math.PI * 2, 0, 1.2]} />
      </mesh>
      <mesh material={mats.hair} position={[0, 0.0, -0.02]} scale={[1, 1.04, 1]}>
        <sphereGeometry args={[0.274, 32, 16, Math.PI, Math.PI]} />
      </mesh>
      <mesh material={mats.hair} position={[-0.09, 0.15, 0.17]} rotation={[0.5, 0, 0.55]} scale={[1.5, 0.55, 0.6]}>
        <sphereGeometry args={[0.1, 14, 10]} />
      </mesh>
      <mesh material={mats.hair} position={[0.06, 0.17, 0.17]} rotation={[0.45, 0, -0.35]} scale={[1.4, 0.5, 0.6]}>
        <sphereGeometry args={[0.1, 14, 10]} />
      </mesh>
      <mesh material={mats.hair} position={[0.17, 0.09, 0.13]} rotation={[0.2, 0.3, -0.9]} scale={[1.1, 0.45, 0.6]}>
        <sphereGeometry args={[0.1, 14, 10]} />
      </mesh>
      {/* mechas laterais */}
      <mesh material={mats.hair} position={[0.215, -0.13, 0.04]} rotation={[0.1, 0, 0.12]} scale={[0.36, 1.45, 0.62]} castShadow>
        <sphereGeometry args={[0.14, 14, 12]} />
      </mesh>
      <mesh material={mats.hair} position={[-0.215, -0.13, 0.04]} rotation={[0.1, 0, -0.12]} scale={[0.36, 1.45, 0.62]} castShadow>
        <sphereGeometry args={[0.14, 14, 12]} />
      </mesh>
      {/* cabelo longo nas costas */}
      <group ref={hairBack} position={[0, 0.05, -0.08]}>
        <mesh material={mats.hair} position={[0, -0.33, -0.06]} scale={[1.1, 1.75, 0.55]} castShadow>
          <sphereGeometry args={[0.22, 20, 16]} />
        </mesh>
        <mesh material={mats.hair} position={[0.13, -0.42, -0.02]} rotation={[0, 0, 0.12]} scale={[0.5, 1.4, 0.5]}>
          <sphereGeometry args={[0.2, 14, 12]} />
        </mesh>
        <mesh material={mats.hair} position={[-0.13, -0.42, -0.02]} rotation={[0, 0, -0.12]} scale={[0.5, 1.4, 0.5]}>
          <sphereGeometry args={[0.2, 14, 12]} />
        </mesh>
      </group>
      {/* presilha de flor */}
      <group position={[-0.2, 0.13, 0.08]} rotation={[0, -0.9, 0.3]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} material={mats.accent} position={[Math.cos((i / 5) * Math.PI * 2) * 0.03, Math.sin((i / 5) * Math.PI * 2) * 0.03, 0]} scale={[1, 1, 0.5]}>
            <sphereGeometry args={[0.022, 8, 6]} />
          </mesh>
        ))}
        <mesh material={mats.white} position-z={0.01}>
          <sphereGeometry args={[0.016, 8, 6]} />
        </mesh>
      </group>
    </group>
  )
}

export function CharacterProcedural() {
  const mats = useMaterials()
  const body = useRef<Group>(null!)
  const torso = useRef<Group>(null!)
  const legL = useRef<Group>(null!)
  const legR = useRef<Group>(null!)
  const armL = useRef<Group>(null!)
  const armR = useRef<Group>(null!)
  const anim = useRef({ phase: 0, s: 0 })

  useFrame(({ clock }, dt) => {
    const a = anim.current
    a.s = MathUtils.damp(a.s, player.speed, 8, dt)
    a.phase += dt * (4 + a.s * 6) * (a.s > 0.02 ? 1 : 0)
    const t = clock.elapsedTime
    const s = a.s
    const swing = Math.sin(a.phase)
    const breathe = reducedMotion ? 0 : Math.sin(t * 2.1)

    legL.current.rotation.x = swing * 0.62 * s
    legR.current.rotation.x = -swing * 0.62 * s
    armL.current.rotation.x = -swing * 0.55 * s
    armR.current.rotation.x = swing * 0.55 * s
    armL.current.rotation.z = -0.12 - breathe * 0.015 * (1 - s)
    armR.current.rotation.z = 0.12 + breathe * 0.015 * (1 - s)
    body.current.position.y = Math.abs(Math.cos(a.phase)) * 0.055 * s
    body.current.rotation.x = s * 0.08
    body.current.rotation.z = swing * 0.025 * s
    torso.current.scale.set(1 + breathe * 0.008, 1 + breathe * 0.012, 1 + breathe * 0.01)
  })

  return (
    <group ref={body}>
      {/* pernas */}
      {[legL, legR].map((ref, i) => (
        <group key={i} ref={ref} position={[i ? -0.085 : 0.085, 0.78, 0]}>
          <mesh material={mats.skin} position-y={-0.37} castShadow>
            <capsuleGeometry args={[0.06, 0.6, 6, 12]} />
          </mesh>
          <mesh material={mats.shoes} position={[0, -0.73, 0.04]} rotation-x={Math.PI / 2} scale={[1, 1, 0.65]} castShadow>
            <capsuleGeometry args={[0.07, 0.11, 6, 12]} />
          </mesh>
        </group>
      ))}
      <mesh material={mats.skirt} geometry={skirtGeo} position-y={0.6} castShadow />
      <mesh material={mats.accent} position-y={0.99} rotation-x={Math.PI / 2} scale={[1, 0.8, 1]}>
        <torusGeometry args={[0.17, 0.025, 8, 24]} />
      </mesh>
      <group ref={torso} position-y={1.0}>
        <mesh material={mats.top} position-y={0.14} scale={[1, 1, 0.78]} castShadow>
          <capsuleGeometry args={[0.165, 0.24, 8, 18]} />
        </mesh>
        <mesh material={mats.top} position-y={0.4} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.075, 0.03, 8, 18]} />
        </mesh>
      </group>
      <mesh material={mats.skin} position-y={1.44}>
        <cylinderGeometry args={[0.05, 0.055, 0.14, 12]} />
      </mesh>
      {/* braços */}
      {[armL, armR].map((ref, i) => (
        <group key={i} ref={ref} position={[i ? -0.205 : 0.205, 1.35, 0]}>
          <mesh material={mats.top} position-y={-0.22} castShadow>
            <capsuleGeometry args={[0.058, 0.34, 6, 12]} />
          </mesh>
          <mesh material={mats.skin} position-y={-0.5}>
            <sphereGeometry args={[0.055, 12, 10]} />
          </mesh>
        </group>
      ))}
      <Head mats={mats} />
    </group>
  )
}
