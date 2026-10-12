import { lazy, Suspense, useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DiscoveryModal } from './components/ui/DiscoveryModal'
import { Fallback } from './components/ui/Fallback'
import { FinalSequence } from './components/ui/FinalSequence'
import { Hud } from './components/ui/Hud'
import { Intro } from './components/ui/Intro'
import { Letter } from './components/ui/Letter'
import { useKeyboard } from './hooks/useKeyboard'
import { hasWebGL } from './lib/device'
import { useExperience } from './stores/useExperience'

const World = lazy(() => import('./experience/World'))

export default function App() {
  const [webgl] = useState(hasWebGL)
  const phase = useExperience((s) => s.phase)
  useKeyboard()

  if (!webgl) return <Fallback />

  return (
    <ErrorBoundary fallback={<Fallback />}>
      <main className={`stage phase-${phase}`}>
        <div className="canvas-wrap">
          <Suspense fallback={null}>
            <World />
          </Suspense>
        </div>
        {phase !== 'intro' && <Hud />}
        <DiscoveryModal />
        {(phase === 'final' || phase === 'letter') && <FinalSequence />}
        <Letter />
        <Intro />
      </main>
    </ErrorBoundary>
  )
}
