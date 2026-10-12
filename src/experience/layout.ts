import { Vector3 } from 'three'
import type { PointId } from '../stores/useExperience'

export type V2 = [number, number]

export const ISLAND_R = 13
export const WALK_R = 12.2
export const SPAWN: V2 = [0, 8]

export const POINTS: Record<PointId | 'portal', V2> = {
  flower: [-6.2, 2.4],
  star: [6.6, 0.8],
  camera: [-4.8, -6.4],
  gift: [4.8, -6.6],
  portal: [0, -10.4],
}

// atrás da árvore grande da direita
export const EGG: V2 = [9.9, 6.7]

// clareira do bolo: outra ilha, fora do alcance da névoa
export const CAKE = new Vector3(0, 0, -80)
export const CAKE_R = 8.5
export const CAKE_WALK_R = 7.6

export type TreeKind = 'round' | 'blossom' | 'pine'
export const TREES: { x: number; z: number; s: number; kind: TreeKind }[] = [
  { x: -9.2, z: -1.5, s: 1.25, kind: 'round' },
  { x: -8.6, z: -7.4, s: 1.05, kind: 'pine' },
  { x: -3.0, z: -10.7, s: 0.85, kind: 'pine' },
  { x: 3.3, z: -10.8, s: 0.9, kind: 'blossom' },
  { x: 9.4, z: -4.6, s: 1.15, kind: 'blossom' },
  { x: 8.7, z: 5.7, s: 1.3, kind: 'round' },
  { x: -9.6, z: 6.2, s: 1.0, kind: 'blossom' },
  { x: -4.6, z: 10.3, s: 0.9, kind: 'round' },
  { x: 5.2, z: 10.2, s: 0.8, kind: 'pine' },
  { x: 2.8, z: 3.4, s: 0.7, kind: 'blossom' },
]

// x, z, escala
export const ROCKS: [number, number, number][] = [
  [-11.2, 2.6, 0.7], [-10.6, 3.4, 0.4], [11.4, -1.2, 0.6], [10.8, 1.6, 0.35],
  [-6.4, -11.0, 0.55], [7.2, -9.6, 0.5], [-1.6, 11.8, 0.45], [11.2, 8.2, 0.4],
  [-3.8, 3.8, 0.3], [6.8, -3.2, 0.32],
]

export const LAMPS: V2[] = [
  [1.1, 1.3], [-1.4, 5.4], [1.4, -5.6], [-3.6, -2.0], [3.6, 2.2], [-1.4, -8.6], [1.4, -8.6],
]

export const PATHS: V2[][] = [
  [SPAWN, [0, 0]],
  [[0, 0], [-2.8, 1.6], POINTS.flower],
  [[0, 0], [3.2, -0.2], POINTS.star],
  [[0, 0], [-2.2, -3.6], POINTS.camera],
  [[0, 0], [2.4, -3.8], POINTS.gift],
  [[0, 0], [0, -5], [0, -9.2]],
]

type Circle = [number, number, number]
export const OBSTACLES: Circle[] = [
  ...TREES.map((t) => [t.x, t.z, 0.35 * t.s + 0.15] as Circle),
  ...ROCKS.map(([x, z, s]) => [x, z, s * 0.9] as Circle),
  ...LAMPS.map(([x, z]) => [x, z, 0.18] as Circle),
  [POINTS.flower[0], POINTS.flower[1], 0.3],
  [POINTS.camera[0], POINTS.camera[1], 0.5],
  [POINTS.gift[0], POINTS.gift[1], 0.55],
  [POINTS.portal[0] - 1.25, POINTS.portal[1], 0.3],
  [POINTS.portal[0] + 1.25, POINTS.portal[1], 0.3],
]

export const CAKE_OBSTACLES: Circle[] = [[CAKE.x, CAKE.z, 1.5]]

const PLAYER_R = 0.3

export function resolveCollisions(p: Vector3, inCakeArea: boolean) {
  const [cx, cz, limit, list] = inCakeArea
    ? [CAKE.x, CAKE.z, CAKE_WALK_R, CAKE_OBSTACLES]
    : [0, 0, WALK_R, OBSTACLES]
  for (const [ox, oz, r] of list) {
    const dx = p.x - ox
    const dz = p.z - oz
    const d = Math.hypot(dx, dz)
    const min = r + PLAYER_R
    if (d < min && d > 1e-4) {
      p.x = ox + (dx / d) * min
      p.z = oz + (dz / d) * min
    }
  }
  const dx = p.x - cx
  const dz = p.z - cz
  const d = Math.hypot(dx, dz)
  if (d > limit) {
    p.x = cx + (dx / d) * limit
    p.z = cz + (dz / d) * limit
  }
}
