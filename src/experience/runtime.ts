import { Vector3 } from 'three'
import { CAKE, SPAWN } from './layout'

// Estado mutável lido a cada frame (fora do React para não re-renderizar).
export { input } from './input'
export const player = {
  pos: new Vector3(SPAWN[0], 0, SPAWN[1]),
  yaw: Math.PI,
  speed: 0,
  inCakeArea: false,
}

export const cam = {
  yaw: 0,
  pitch: 0.36,
  snap: false,
}

export function teleportToCake() {
  player.pos.set(CAKE.x, 0, CAKE.z + 6.5)
  player.yaw = Math.PI
  player.inCakeArea = true
  cam.snap = true
}
