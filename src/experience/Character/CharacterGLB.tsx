import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { Box3, Group, Mesh, Vector3, type AnimationAction } from 'three'
import { player } from '../runtime'

const HEIGHT = 1.75

function pick(actions: Record<string, AnimationAction | null>, patterns: RegExp[]) {
  const names = Object.keys(actions)
  for (const re of patterns) {
    const n = names.find((k) => re.test(k))
    if (n) return actions[n]
  }
  return null
}

export function CharacterGLB({ url }: { url: string }) {
  const { scene, animations } = useGLTF(url)
  const group = useRef<Group>(null!)
  const { actions } = useAnimations(animations, group)

  // normaliza altura e coloca os pés no chão
  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const k = size.y > 0 ? HEIGHT / size.y : 1
    return { scale: k, offset: -box.min.y * k }
  }, [scene])

  useEffect(() => {
    scene.traverse((o) => {
      if ((o as Mesh).isMesh) o.castShadow = true
    })
  }, [scene])

  const clips = useMemo(
    () => ({
      idle: pick(actions, [/idle/i, /stand/i, /breath/i]),
      walk: pick(actions, [/walk/i, /run/i, /jog/i]),
    }),
    [actions],
  )
  const current = useRef<AnimationAction | null>(null)

  useFrame(() => {
    const next = player.speed > 0.15 ? clips.walk ?? clips.idle : clips.idle
    if (clips.walk) clips.walk.timeScale = 0.6 + player.speed * 0.6
    if (!next || next === current.current) return
    next.reset().fadeIn(0.3).play()
    current.current?.fadeOut(0.3)
    current.current = next
  })

  return (
    <group ref={group} scale={scale} position-y={offset}>
      <primitive object={scene} />
    </group>
  )
}
