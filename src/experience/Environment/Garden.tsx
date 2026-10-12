import { ISLAND_R } from '../layout'
import { Clouds, Fireflies } from './Atmosphere'
import { Balloon } from './Balloon'
import { Flowers } from './Flowers'
import { Grass } from './Grass'
import { Island, Lamps, Paths, Rocks } from './Island'
import { Trees } from './Trees'

export function Garden() {
  return (
    <>
      <Island radius={ISLAND_R} />
      <Grass radius={ISLAND_R} count={5000} />
      <Flowers radius={ISLAND_R} count={260} />
      <Paths />
      <Rocks />
      <Lamps />
      <Trees />
      <Clouds />
      <Fireflies />
      <Balloon position={[-3.8, 0, -0.8]} color="#efb8c8" height={1.9} />
      <Balloon position={[-3.5, 0, -1.1]} color="#ffd6a5" height={1.6} phase={1.3} />
      <Balloon position={[8.2, 0, -1.2]} color="#c9d9f2" height={2.1} phase={2.1} />
    </>
  )
}
