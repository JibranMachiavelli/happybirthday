import { useFrame } from '@react-three/fiber'
import { POINT_IDS, useExperience, type Target } from '../../stores/useExperience'
import { EGG, POINTS, type V2 } from '../layout'
import { player } from '../runtime'
import { EasterEgg } from './EasterEgg'
import { Gift } from './Gift'
import { BookPoint, FloatingStar, SpecialFlower } from './Points'
import { Portal } from './Portal'

const RADIUS: Record<Target, number> = { flower: 1.8, star: 1.9, book: 1.9, gift: 1.9, portal: 2.6, egg: 1.5 }

function InteractionManager() {
  useFrame(() => {
    const s = useExperience.getState()
    if (s.phase !== 'exploring' || s.open) return
    const targets: [Target, V2][] = [...POINT_IDS.map((id) => [id, POINTS[id]] as [Target, V2]), ['portal', POINTS.portal]]
    if (!s.eggFound) targets.push(['egg', EGG])
    let best: Target | null = null
    let bestD = Infinity
    for (const [id, [x, z]] of targets) {
      const d = Math.hypot(player.pos.x - x, player.pos.z - z)
      if (d < RADIUS[id] && d < bestD) {
        best = id
        bestD = d
      }
    }
    s.setNearby(best)
    // atravessar o portal
    const [px, pz] = POINTS.portal
    if (s.found.length === POINT_IDS.length && Math.abs(player.pos.x - px) < 0.9 && Math.abs(player.pos.z - pz) < 0.35) s.interact('portal')
  })
  return null
}

export function Discoveries() {
  return (
    <>
      <InteractionManager />
      <SpecialFlower />
      <FloatingStar />
      <BookPoint />
      <Gift />
      <Portal />
      <EasterEgg />
    </>
  )
}
