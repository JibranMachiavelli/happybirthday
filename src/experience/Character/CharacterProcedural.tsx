import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, LatheGeometry, MathUtils, MeshPhysicalMaterial, MeshStandardMaterial, Vector2 } from 'three'
import { birthday } from '../../config/birthday'
import { reducedMotion } from '../../lib/device'
import { player } from '../runtime'

const C = birthday.character

function useMaterials() {
  return useMemo(() => {
    const m = (color: string, roughness = 0.75, extra = {}) => new MeshStandardMaterial({ color, roughness, ...extra })
    return {
      // leve emissivo simula subsurface e evita rosto escuro na contraluz
      skin: m(C.skin, 0.6, { emissive: C.skin, emissiveIntensity: 0.16 }),
      blush: new MeshStandardMaterial({ color: '#f29ea6', roughness: 0.8, transparent: true, opacity: 0.25, depthWrite: false }),
      hair: new MeshPhysicalMaterial({ color: C.hair, emissive: C.hair, emissiveIntensity: 0.08, roughness: 0.45, clearcoat: 0.35, clearcoatRoughness: 0.5, sheen: 0.6, sheenColor: '#b07a55' }),
      top: m(C.top, 0.95),
      cuff: m('#e6dccb', 0.95),
      skirt: m(C.skirt, 0.85),
      shoes: m(C.shoes, 0.5),
      sole: m('#d9d3cc', 0.7),
      white: m('#fdfcfb', 0.25),
      iris: m(C.eyes, 0.2, { emissive: C.eyes, emissiveIntensity: 0.2 }),
      irisLight: m('#8fd3a8', 0.2, { emissive: '#8fd3a8', emissiveIntensity: 0.25 }),
      pupil: m('#1d1a1f', 0.25),
      shine: new MeshStandardMaterial({ color: '#fff', emissive: '#fff', emissiveIntensity: 1.2 }),
      lash: m('#2b1d18', 0.6),
      brow: m('#5a3726', 0.7),
      lips: m('#d8807d', 0.45),
      accent: m(C.accent, 0.5, { emissive: C.accent, emissiveIntensity: 0.15 }),
    }
  }, [])
}

type Mats = ReturnType<typeof useMaterials>

const torsoGeo = new LatheGeometry(
  [[0.0, 0.0], [0.15, 0.0], [0.155, 0.08], [0.165, 0.2], [0.18, 0.32], [0.185, 0.38], [0.165, 0.44], [0.12, 0.49], [0.06, 0.52], [0.0, 0.53]].map(
    ([r, y]) => new Vector2(r, y),
  ),
  28,
).scale(1, 1, 0.78)

// saia evasê com pregas suaves
const skirtGeo = (() => {
  const g = new LatheGeometry(
    [[0.155, 0.4], [0.17, 0.32], [0.22, 0.18], [0.29, 0.04], [0.31, 0.0], [0.295, -0.015]].map(([r, y]) => new Vector2(r, y)).reverse(),
    48,
  )
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const z = p.getZ(i)
    const t = MathUtils.clamp((0.4 - p.getY(i)) / 0.4, 0, 1)
    const k = 1 + Math.sin(Math.atan2(z, x) * 14) * 0.045 * t
    p.setX(i, x * k)
    p.setZ(i, z * k * 0.9)
  }
  g.computeVertexNormals()
  return g
})()

function Eye({ side, mats, blinkRef }: { side: 1 | -1; mats: Mats; blinkRef: React.RefObject<Group | null> }) {
  return (
    <group position={[0.086 * side, -0.02, 0.208]} rotation={[0, 0.32 * side, 0]} scale={0.9}>
      <group ref={blinkRef}>
        <mesh material={mats.white} scale={[1, 1.15, 0.5]}>
          <sphereGeometry args={[0.054, 20, 14]} />
        </mesh>
        <mesh material={mats.iris} position={[0, -0.003, 0.019]} scale={[1, 1.12, 0.45]}>
          <sphereGeometry args={[0.04, 20, 14]} />
        </mesh>
        <mesh material={mats.irisLight} position={[0, -0.014, 0.028]} scale={[1, 0.7, 0.35]}>
          <sphereGeometry args={[0.028, 16, 10]} />
        </mesh>
        <mesh material={mats.pupil} position={[0, -0.002, 0.034]} scale={[1, 1.1, 0.4]}>
          <sphereGeometry args={[0.019, 12, 8]} />
        </mesh>
        <mesh material={mats.shine} position={[0.014, 0.016, 0.04]}>
          <sphereGeometry args={[0.009, 8, 6]} />
        </mesh>
        <mesh material={mats.shine} position={[-0.012, -0.017, 0.037]}>
          <sphereGeometry args={[0.005, 6, 4]} />
        </mesh>
      </group>
      {/* cílios superiores e um pequeno "rabo" de delineado */}
      <mesh material={mats.lash} position={[0, 0.006, 0.012]} rotation={[0.25, 0, 0]} scale={[1, 1.05, 1]}>
        <torusGeometry args={[0.056, 0.0075, 5, 16, Math.PI]} />
      </mesh>
      <mesh material={mats.lash} position={[0.055 * side, 0.03, 0.01]} rotation={[0, 0, -0.6 * side]} scale={[1.4, 0.45, 0.5]}>
        <sphereGeometry args={[0.012, 6, 4]} />
      </mesh>
      {/* sobrancelha fina em arco */}
      <mesh material={mats.brow} position={[0.004 * side, 0.068, 0.006]} rotation={[0.2, 0, 0.12 * side]}>
        <torusGeometry args={[0.05, 0.0065, 4, 12, 1.5]} />
      </mesh>
    </group>
  )
}

function Hair({ mats, backRef }: { mats: Mats; backRef: React.RefObject<Group | null> }) {
  const H = mats.hair
  return (
    <>
      <mesh material={H} position={[0, 0.03, -0.012]} scale={[1.02, 1, 1]} castShadow>
        <sphereGeometry args={[0.272, 40, 20, 0, Math.PI * 2, 0, 1.38]} />
      </mesh>
      <mesh material={H} position={[0, 0.0, -0.02]} scale={[1, 1.05, 1.02]}>
        <sphereGeometry args={[0.276, 36, 18, Math.PI, Math.PI]} />
      </mesh>
      {/* volume suave no topo */}
      <mesh material={H} position={[0.02, 0.2, 0.0]} rotation={[0.1, 0, -0.12]} scale={[1.9, 0.55, 1.7]}>
        <sphereGeometry args={[0.12, 20, 12]} />
      </mesh>
      {/* franja lateral varrida, em uma peça só */}
      <mesh material={H} position={[-0.05, 0.12, 0.2]} rotation={[0.45, 0, 0.32]} scale={[1.9, 0.45, 0.7]}>
        <sphereGeometry args={[0.1, 24, 14]} />
      </mesh>
      {/* laterais: cobrem orelhas e têmporas */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} material={H} position={[0.175 * sd, -0.01, -0.03]} rotation={[0, 0.35 * sd, 0]} scale={[0.55, 1.25, 0.95]}>
          <sphereGeometry args={[0.2, 20, 16]} />
        </mesh>
      ))}
      {/* mechas que emolduram o rosto, com pontas viradas */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[0.215 * sd, -0.13, 0.04]} rotation={[0.08, 0, 0.08 * sd]}>
          <mesh material={H} scale={[0.34, 1.6, 0.6]} castShadow>
            <sphereGeometry args={[0.14, 16, 14]} />
          </mesh>
        </group>
      ))}
      {/* cabelo longo nas costas, com pontas onduladas */}
      <group ref={backRef} position={[0, 0.05, -0.08]}>
        <mesh material={H} position={[0, -0.32, -0.06]} scale={[1.12, 1.7, 0.55]} castShadow>
          <sphereGeometry args={[0.22, 22, 18]} />
        </mesh>
        {[-1, 1].map((sd) => (
          <mesh key={sd} material={H} position={[0.14 * sd, -0.42, -0.02]} rotation-z={0.12 * sd} scale={[0.5, 1.4, 0.5]}>
            <sphereGeometry args={[0.2, 16, 14]} />
          </mesh>
        ))}
        {[-0.15, -0.05, 0.05, 0.15].map((x, i) => (
          <mesh key={x} material={H} position={[x, -0.68 + (i % 2) * 0.03, -0.05]} scale={[0.9, 1.1, 0.75]}>
            <sphereGeometry args={[0.075, 12, 10]} />
          </mesh>
        ))}
      </group>
      {/* presilha de flor */}
      <group position={[-0.205, 0.14, 0.085]} rotation={[0, -0.9, 0.3]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} material={mats.accent} position={[Math.cos((i / 5) * Math.PI * 2) * 0.03, Math.sin((i / 5) * Math.PI * 2) * 0.03, 0]} scale={[1, 1, 0.5]}>
            <sphereGeometry args={[0.022, 8, 6]} />
          </mesh>
        ))}
        <mesh material={mats.white} position-z={0.01}>
          <sphereGeometry args={[0.016, 8, 6]} />
        </mesh>
      </group>
    </>
  )
}

function Head({ mats }: { mats: Mats }) {
  const blinkR = useRef<Group>(null)
  const blinkL = useRef<Group>(null)
  const head = useRef<Group>(null!)
  const hairBack = useRef<Group>(null)
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
      hairBack.current!.rotation.x = -player.speed * 0.15 + Math.sin(t * 9 * Math.max(player.speed, 0.15)) * 0.025 * player.speed
    }
  })

  return (
    <group ref={head} position-y={1.66}>
      <mesh material={mats.skin} scale={[1.02, 0.99, 0.96]} castShadow>
        <sphereGeometry args={[0.25, 40, 28]} />
      </mesh>
      <Eye side={1} mats={mats} blinkRef={blinkR} />
      <Eye side={-1} mats={mats} blinkRef={blinkL} />
      <mesh material={mats.skin} position={[0, -0.07, 0.242]} scale={[1, 0.75, 0.8]}>
        <sphereGeometry args={[0.018, 10, 8]} />
      </mesh>
      <mesh material={mats.lips} position={[0, -0.13, 0.218]} rotation={[0.35, 0, Math.PI]}>
        <torusGeometry args={[0.024, 0.0065, 6, 16, Math.PI]} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} material={mats.blush} position={[0.14 * sd, -0.075, 0.2]} rotation={[0, 0.6 * sd, 0]}>
          <circleGeometry args={[0.03, 18]} />
        </mesh>
      ))}
      <Hair mats={mats} backRef={hairBack} />
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
  const foreL = useRef<Group>(null!)
  const foreR = useRef<Group>(null!)
  const anim = useRef({ phase: 0, s: 0 })

  useFrame(({ clock }, dt) => {
    const a = anim.current
    a.s = MathUtils.damp(a.s, player.speed, 8, dt)
    a.phase += dt * (4 + a.s * 6) * (a.s > 0.02 ? 1 : 0)
    const t = clock.elapsedTime
    const s = a.s
    const swing = Math.sin(a.phase)
    const breathe = reducedMotion ? 0 : Math.sin(t * 2.1)

    legL.current.rotation.x = swing * 0.6 * s
    legR.current.rotation.x = -swing * 0.6 * s
    armL.current.rotation.x = -swing * 0.5 * s
    armR.current.rotation.x = swing * 0.5 * s
    armL.current.rotation.z = -0.1 - breathe * 0.012 * (1 - s)
    armR.current.rotation.z = 0.1 + breathe * 0.012 * (1 - s)
    // cotovelo dobra um pouco mais ao andar
    foreL.current.rotation.x = -0.18 - s * (0.25 + Math.max(0, -swing) * 0.3)
    foreR.current.rotation.x = -0.18 - s * (0.25 + Math.max(0, swing) * 0.3)
    body.current.position.y = Math.abs(Math.cos(a.phase)) * 0.05 * s
    body.current.rotation.x = s * 0.07
    body.current.rotation.z = swing * 0.022 * s
    torso.current.scale.set(1 + breathe * 0.008, 1 + breathe * 0.012, 1 + breathe * 0.01)
  })

  return (
    <group ref={body}>
      {/* pernas */}
      {[legL, legR].map((ref, i) => (
        <group key={i} ref={ref} position={[i ? -0.078 : 0.078, 0.78, 0]}>
          <mesh material={mats.skin} position-y={-0.36} castShadow>
            <capsuleGeometry args={[0.054, 0.6, 6, 14]} />
          </mesh>
          <mesh material={mats.white} position-y={-0.63} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.052, 0.012, 6, 14]} />
          </mesh>
          <group position={[0, -0.715, 0.035]}>
            <mesh material={mats.shoes} rotation-x={Math.PI / 2} scale={[1, 1, 0.66]} castShadow>
              <capsuleGeometry args={[0.068, 0.11, 6, 14]} />
            </mesh>
            <mesh material={mats.sole} position-y={-0.035} rotation-x={Math.PI / 2} scale={[1.04, 1.02, 0.25]}>
              <capsuleGeometry args={[0.068, 0.11, 4, 14]} />
            </mesh>
          </group>
        </group>
      ))}
      <mesh material={mats.skirt} geometry={skirtGeo} position-y={0.6} castShadow />
      <mesh material={mats.accent} position-y={0.995} rotation-x={Math.PI / 2} scale={[1, 0.8, 1]}>
        <torusGeometry args={[0.158, 0.022, 8, 28]} />
      </mesh>
      <group ref={torso} position-y={0.93}>
        <mesh material={mats.top} geometry={torsoGeo} castShadow />
        {[-1, 1].map((sd) => (
          <mesh key={sd} material={mats.top} position={[0.17 * sd, 0.39, 0]} scale={[1, 0.85, 0.85]}>
            <sphereGeometry args={[0.072, 16, 12]} />
          </mesh>
        ))}
        <mesh material={mats.top} position-y={0.5} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.065, 0.026, 8, 20]} />
        </mesh>
      </group>
      <mesh material={mats.skin} position-y={1.47}>
        <cylinderGeometry args={[0.045, 0.05, 0.1, 14]} />
      </mesh>
      {/* braços com cotovelo */}
      {[
        [armL, foreL],
        [armR, foreR],
      ].map(([arm, fore], i) => (
        <group key={i} ref={arm} position={[i ? -0.2 : 0.2, 1.33, 0]}>
          <mesh material={mats.top} position-y={-0.12} castShadow>
            <capsuleGeometry args={[0.05, 0.18, 6, 14]} />
          </mesh>
          <group ref={fore} position-y={-0.25}>
            <mesh material={mats.top}>
              <sphereGeometry args={[0.048, 12, 10]} />
            </mesh>
            <mesh material={mats.top} position-y={-0.1} castShadow>
              <capsuleGeometry args={[0.045, 0.16, 6, 14]} />
            </mesh>
            <mesh material={mats.cuff} position-y={-0.2} rotation-x={Math.PI / 2}>
              <torusGeometry args={[0.043, 0.014, 6, 14]} />
            </mesh>
            <mesh material={mats.skin} position-y={-0.255} scale={[0.85, 1.1, 0.65]}>
              <sphereGeometry args={[0.048, 12, 10]} />
            </mesh>
          </group>
        </group>
      ))}
      <Head mats={mats} />
    </group>
  )
}
