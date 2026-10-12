import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { DirectionalLight, HemisphereLight, MathUtils } from 'three'
import { isMobile } from '../lib/device'
import { useExperience } from '../stores/useExperience'
import { FollowCamera } from './Camera/FollowCamera'
import { CakeArea } from './Celebration/CakeArea'
import { Character } from './Character/Character'
import { Garden } from './Environment/Garden'
import { Sky } from './Environment/Sky'
import { Discoveries } from './Interactions/Discoveries'
import { player } from './runtime'

function Lights() {
  const sun = useRef<DirectionalLight>(null!)
  const hemi = useRef<HemisphereLight>(null!)
  useFrame((_, dt) => {
    const p = player.pos
    sun.current.position.set(p.x - 7, 11, p.z + 6)
    sun.current.target.position.copy(p)
    sun.current.target.updateMatrixWorld()
    const party = useExperience.getState().finalStep >= 4
    hemi.current.intensity = MathUtils.damp(hemi.current.intensity, party ? 1.5 : 1.0, 1.5, dt)
  })
  return (
    <>
      <hemisphereLight ref={hemi} args={['#a9b6ee', '#5a3f55', 1.0]} />
      <ambientLight intensity={0.15} color="#ffd6a5" />
      <directionalLight
        ref={sun}
        castShadow
        color="#ffcf9e"
        intensity={2.3}
        shadow-mapSize={isMobile ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={40}
      />
    </>
  )
}

export default function World() {
  return (
    <Canvas
      shadows
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 48, near: 0.1, far: 400, position: [0, 12, 26] }}
      onCreated={() => useExperience.getState().setReady()}
      aria-hidden
    >
      <color attach="background" args={['#0d1022']} />
      <fogExp2 attach="fog" args={['#2b2646', 0.022]} />
      <Lights />
      <Sky />
      <Garden />
      <Discoveries />
      <Character />
      <CakeArea />
      <FollowCamera />
      <EffectComposer multisampling={isMobile ? 2 : 4} enableNormalPass={false}>
        <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.2} intensity={0.55} radius={0.7} />
        <Vignette offset={0.28} darkness={0.55} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  )
}
