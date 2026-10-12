import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Group, LatheGeometry, MathUtils, MeshPhysicalMaterial, MeshStandardMaterial, Vector2 } from 'three'
import { birthday } from '../../config/birthday'
import { reducedMotion } from '../../lib/device'
import { player } from '../runtime'
import { createFaceTextures } from './faceTexture'
import { bangsGeo, capGeo, curtainGeo, faceGeo, headGeo } from './geometry'

const C = birthday.character

function useMaterials() {
  const mats = useMemo(() => {
    const m = (color: string, roughness = 0.75, extra = {}) => new MeshStandardMaterial({ color, roughness, ...extra })
    const faces = createFaceTextures(C.eyes)
    return {
      faces,
      // leve emissivo simula subsurface e evita rosto escuro na contraluz
      skin: m(C.skin, 0.55, { emissive: C.skin, emissiveIntensity: 0.18 }),
      face: new MeshStandardMaterial({
        map: faces.open,
        emissiveMap: faces.open,
        emissive: '#ffffff',
        emissiveIntensity: 0.22,
        transparent: true,
        roughness: 0.45,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        depthWrite: false,
      }),
      hair: new MeshPhysicalMaterial({
        color: C.hair, emissive: C.hair, emissiveIntensity: 0.3, roughness: 0.42,
        clearcoat: 0.5, clearcoatRoughness: 0.35, sheen: 0.8, sheenColor: '#c08a62', sheenRoughness: 0.4, side: DoubleSide,
      }),
      dress: m(C.top, 0.9),
      skirt: m(C.skirt, 0.85),
      collar: m('#fffdf9', 0.7),
      socks: m('#fffdf9', 0.8),
      shoes: m(C.shoes, 0.35, { metalness: 0.05 }),
      accent: m(C.accent, 0.45, { emissive: C.accent, emissiveIntensity: 0.12 }),
    }
  }, [])
  useEffect(
    () => () => {
      mats.faces.open.dispose()
      mats.faces.closed.dispose()
    },
    [mats],
  )
  return mats
}

type Mats = ReturnType<typeof useMaterials>

const torsoGeo = new LatheGeometry(
  [[0, 0], [0.135, 0], [0.14, 0.08], [0.15, 0.2], [0.165, 0.3], [0.17, 0.35], [0.15, 0.41], [0.1, 0.45], [0.05, 0.47], [0, 0.475]].map(
    ([r, y]) => new Vector2(r, y),
  ),
  32,
).scale(1, 1, 0.8)

// saia rodada com pregas suaves
const skirtGeo = (() => {
  const g = new LatheGeometry(
    [[0.14, 0.36], [0.16, 0.3], [0.22, 0.17], [0.3, 0.04], [0.32, 0.0], [0.305, -0.015]].map(([r, y]) => new Vector2(r, y)).reverse(),
    64,
  )
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const z = p.getZ(i)
    const t = MathUtils.clamp((0.36 - p.getY(i)) / 0.36, 0, 1)
    const k = 1 + Math.sin(Math.atan2(z, x) * 16) * 0.04 * t
    p.setX(i, x * k)
    p.setZ(i, z * k * 0.92)
  }
  g.computeVertexNormals()
  return g
})()

function Bow({ mats }: { mats: Mats }) {
  return (
    <group position={[-0.17, 0.22, 0.06]} rotation={[0.2, -0.5, 0.45]} scale={0.9}>
      {[-1, 1].map((s) => (
        <mesh key={s} material={mats.accent} position={[0.055 * s, 0, 0]} rotation-z={0.25 * s} scale={[1.25, 0.8, 0.45]}>
          <sphereGeometry args={[0.05, 16, 12]} />
        </mesh>
      ))}
      <mesh material={mats.accent} scale={[0.8, 0.8, 0.6]}>
        <sphereGeometry args={[0.025, 12, 10]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={mats.accent} position={[0.025 * s, -0.05, 0]} rotation-z={0.35 * s} scale={[0.5, 1.4, 0.3]}>
          <sphereGeometry args={[0.03, 10, 8]} />
        </mesh>
      ))}
    </group>
  )
}

function Head({ mats }: { mats: Mats }) {
  const head = useRef<Group>(null!)
  const hairBack = useRef<Group>(null!)
  const blink = useRef({ next: 2.5, t: -1 })

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const b = blink.current
    if (t > b.next && b.t < 0) b.t = 0
    let closed = false
    if (b.t >= 0) {
      b.t += dt
      closed = b.t < 0.13
      if (b.t > 0.13) {
        b.t = -1
        b.next = t + 2.2 + Math.random() * 3.5
      }
    }
    const map = closed ? mats.faces.closed : mats.faces.open
    if (mats.face.map !== map) {
      mats.face.map = map
      mats.face.emissiveMap = map
    }
    if (!reducedMotion) {
      head.current.rotation.z = Math.sin(t * 0.7) * 0.035
      head.current.rotation.x = Math.sin(t * 0.5) * 0.025 - player.speed * 0.05
      hairBack.current.rotation.x = -player.speed * 0.12 + Math.sin(t * 9 * Math.max(player.speed, 0.15)) * 0.02 * player.speed
      hairBack.current.rotation.z = Math.sin(t * 1.1) * 0.012
    }
  })

  return (
    <group ref={head} position-y={1.66} scale={1.06}>
      <mesh geometry={headGeo} material={mats.skin} castShadow />
      <mesh geometry={faceGeo} material={mats.face} renderOrder={1} />
      <mesh geometry={capGeo} material={mats.hair} castShadow />
      <mesh geometry={bangsGeo} material={mats.hair} />
      <group ref={hairBack}>
        <mesh geometry={curtainGeo} material={mats.hair} castShadow />
      </group>
      <Bow mats={mats} />
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

    legL.current.rotation.x = swing * 0.6 * s
    legR.current.rotation.x = -swing * 0.6 * s
    armL.current.rotation.x = -swing * 0.5 * s
    armR.current.rotation.x = swing * 0.5 * s
    armL.current.rotation.z = -0.16 - breathe * 0.012 * (1 - s)
    armR.current.rotation.z = 0.16 + breathe * 0.012 * (1 - s)
    body.current.position.y = Math.abs(Math.cos(a.phase)) * 0.05 * s
    body.current.rotation.x = s * 0.07
    body.current.rotation.z = swing * 0.022 * s
    torso.current.scale.set(1 + breathe * 0.008, 1 + breathe * 0.012, 1 + breathe * 0.01)
  })

  return (
    <group ref={body}>
      {/* pernas com meia e sapatinho boneca */}
      {[legL, legR].map((ref, i) => (
        <group key={i} ref={ref} position={[i ? -0.075 : 0.075, 0.78, 0]}>
          <mesh material={mats.skin} position-y={-0.33} castShadow>
            <capsuleGeometry args={[0.05, 0.52, 6, 16]} />
          </mesh>
          <mesh material={mats.socks} position-y={-0.6}>
            <cylinderGeometry args={[0.054, 0.05, 0.12, 16]} />
          </mesh>
          <mesh material={mats.socks} position-y={-0.54} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.054, 0.012, 6, 16]} />
          </mesh>
          <group position={[0, -0.71, 0.03]}>
            <mesh material={mats.shoes} rotation-x={Math.PI / 2} scale={[1, 1, 0.62]} castShadow>
              <capsuleGeometry args={[0.064, 0.1, 6, 16]} />
            </mesh>
            <mesh material={mats.shoes} position={[0, 0.045, -0.01]} rotation-x={Math.PI / 2}>
              <torusGeometry args={[0.052, 0.008, 6, 16, Math.PI]} />
            </mesh>
          </group>
        </group>
      ))}
      <mesh material={mats.skirt} geometry={skirtGeo} position-y={0.62} castShadow />
      <group ref={torso} position-y={0.95}>
        <mesh material={mats.dress} geometry={torsoGeo} castShadow />
        {/* gola Peter Pan */}
        {[-1, 1].map((s) => (
          <mesh key={s} material={mats.collar} position={[0.045 * s, 0.43, 0.075]} rotation={[-1.05, 0, 0.35 * s]} scale={[1.2, 1, 0.22]}>
            <sphereGeometry args={[0.055, 16, 12]} />
          </mesh>
        ))}
        {/* botõezinhos */}
        {[0.33, 0.25, 0.17].map((y) => (
          <mesh key={y} material={mats.collar} position={[0, y, 0.128]}>
            <sphereGeometry args={[0.011, 8, 6]} />
          </mesh>
        ))}
      </group>
      <mesh material={mats.accent} position-y={0.98} rotation-x={Math.PI / 2} scale={[1, 0.82, 1]}>
        <torusGeometry args={[0.142, 0.02, 8, 32]} />
      </mesh>
      <mesh material={mats.accent} position={[0, 0.98, -0.12]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1.4, 0.5]}>
        <sphereGeometry args={[0.035, 12, 10]} />
      </mesh>
      <mesh material={mats.skin} position-y={1.45}>
        <cylinderGeometry args={[0.042, 0.048, 0.1, 16]} />
      </mesh>
      {/* braços com manga bufante */}
      {[armL, armR].map((arm, i) => (
        <group key={i} ref={arm} position={[i ? -0.185 : 0.185, 1.33, 0]}>
          <mesh material={mats.dress} position-y={-0.03} scale={[1, 0.95, 0.95]} castShadow>
            <sphereGeometry args={[0.07, 18, 14]} />
          </mesh>
          <mesh material={mats.collar} position-y={-0.085} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.052, 0.01, 6, 16]} />
          </mesh>
          <mesh material={mats.skin} position-y={-0.24} castShadow>
            <capsuleGeometry args={[0.038, 0.26, 6, 14]} />
          </mesh>
          <mesh material={mats.skin} position-y={-0.42} scale={[0.85, 1.1, 0.7]}>
            <sphereGeometry args={[0.045, 12, 10]} />
          </mesh>
        </group>
      ))}
      <Head mats={mats} />
    </group>
  )
}
