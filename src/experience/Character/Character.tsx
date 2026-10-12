import { Suspense, useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Vector2 } from 'three'
import { birthday } from '../../config/birthday'
import { assetExists } from '../../lib/device'
import { useExperience } from '../../stores/useExperience'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { CAKE, resolveCollisions } from '../layout'
import { cam, input, player, teleportToCake, teleportToGarden } from '../runtime'
import { CharacterGLB } from './CharacterGLB'
import { CharacterProcedural } from './CharacterProcedural'

const MAX_SPEED = 3.4
const k = input.keys

function dampAngle(from: number, to: number, lambda: number, dt: number) {
  const d = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + d * (1 - Math.exp(-lambda * dt))
}

export function Character() {
  const ref = useRef<Group>(null!)
  const vel = useRef(new Vector2())
  const [glb, setGlb] = useState<boolean | null>(null)

  useEffect(() => {
    assetExists(birthday.assets.model).then(setGlb)
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const s = useExperience.getState()
    if (input.teleport) {
      if (input.teleport === 'cake') teleportToCake()
      else teleportToGarden()
      input.teleport = null
      vel.current.set(0, 0)
    }
    let mx = 0
    let mz = 0
    let face: number | null = null

    if (s.phase === 'exploring' && !s.open) {
      let ix = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0) + input.joy.x
      let iy = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) + input.joy.y
      const len = Math.hypot(ix, iy)
      if (len > 1) {
        ix /= len
        iy /= len
      }
      // relativo à câmera: frente = direção câmera→personagem
      const sy = Math.sin(cam.yaw)
      const cy = Math.cos(cam.yaw)
      mx = cy * ix - sy * iy
      mz = -sy * ix - cy * iy
    } else if (player.inCakeArea) {
      // caminha sozinha até o bolo
      const dx = CAKE.x - player.pos.x
      const dz = CAKE.z - player.pos.z
      const d = Math.hypot(dx, dz)
      if (d > 2.6) {
        mx = (dx / d) * 0.42
        mz = (dz / d) * 0.42
      } else face = Math.atan2(dx, dz)
    }

    const v = vel.current
    const a = 1 - Math.exp(-dt * 7)
    v.x += (mx * MAX_SPEED - v.x) * a
    v.y += (mz * MAX_SPEED - v.y) * a
    player.pos.x += v.x * dt
    player.pos.z += v.y * dt
    resolveCollisions(player.pos, player.inCakeArea)

    const speed = v.length()
    player.speed = MathUtils.clamp(speed / MAX_SPEED, 0, 1)
    if (speed > 0.15) player.yaw = dampAngle(player.yaw, Math.atan2(v.x, v.y), 9, dt)
    else if (face !== null) player.yaw = dampAngle(player.yaw, face, 3, dt)

    ref.current.position.copy(player.pos)
    ref.current.rotation.y = player.yaw
  })

  return (
    <group ref={ref}>
      {glb === false && <CharacterProcedural />}
      {glb && (
        <ErrorBoundary fallback={<CharacterProcedural />}>
          <Suspense fallback={<CharacterProcedural />}>
            <CharacterGLB url={birthday.assets.model} />
          </Suspense>
        </ErrorBoundary>
      )}
    </group>
  )
}
