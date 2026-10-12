const mq = (q: string) => window.matchMedia(q).matches

export const isTouch = mq('(pointer: coarse)')
export const isMobile = isTouch || mq('(max-width: 768px)')
export const reducedMotion = mq('(prefers-reduced-motion: reduce)')

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

// Vite dev devolve index.html para arquivos inexistentes, então checar o content-type também.
export async function assetExists(url: string) {
  try {
    const r = await fetch(url, { method: 'HEAD' })
    return r.ok && !(r.headers.get('content-type') ?? '').includes('text/html')
  } catch {
    return false
  }
}
