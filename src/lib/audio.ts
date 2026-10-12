import { birthday } from '../config/birthday'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let fx: GainNode | null = null
let musicGain: GainNode | null = null
let muted = false

// Tudo só é criado depois do clique em "Entrar" (política de autoplay).
export function startAudio() {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC || ctx) return
  ctx = new AC()
  ctx.resume().catch(() => {})
  master = ctx.createGain()
  master.gain.value = muted ? 0 : 1
  master.connect(ctx.destination)

  // eco suave para os sinos
  const delay = ctx.createDelay()
  delay.delayTime.value = 0.32
  const feedback = ctx.createGain()
  feedback.gain.value = 0.38
  fx = ctx.createGain()
  fx.gain.value = 0.35
  fx.connect(delay).connect(feedback).connect(delay)
  delay.connect(master)

  const el = new Audio(birthday.assets.music)
  el.loop = true
  el.preload = 'auto'
  el.addEventListener('error', () => el.removeAttribute('src'))
  // volume via WebAudio: no iOS a propriedade volume do <audio> é somente leitura
  musicGain = ctx.createGain()
  musicGain.gain.value = 0
  ctx.createMediaElementSource(el).connect(musicGain).connect(master)
  el.play()
    .then(() => fadeMusic(birthday.assets.musicVolume, 2.5))
    .catch(() => {})
}

export function setMuted(m: boolean) {
  muted = m
  if (ctx && master) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.15)
}

export function fadeMusic(volume: number, seconds = 1.5) {
  if (ctx && musicGain) musicGain.gain.setTargetAtTime(volume, ctx.currentTime, seconds / 3)
}

function bell(freq: number, at: number, gain = 0.18, decay = 1.6) {
  if (!ctx || !master || !fx) return
  for (const [mult, g] of [[1, 1], [2, 0.25], [3.01, 0.08]]) {
    const o = ctx.createOscillator()
    const v = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = freq * mult
    v.gain.setValueAtTime(0, at)
    v.gain.linearRampToValueAtTime(gain * g, at + 0.01)
    v.gain.exponentialRampToValueAtTime(0.0001, at + decay)
    o.connect(v)
    v.connect(master)
    v.connect(fx)
    o.start(at)
    o.stop(at + decay + 0.05)
  }
}

export function chime() {
  if (!ctx) return
  const t = ctx.currentTime
  ;[783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => bell(f, t + i * 0.09, 0.09, 2))
}

const N: Record<string, number> = {
  G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
  C3: 130.81, F3: 174.61, G3: 196,
}

// "Parabéns pra você" (domínio público) em caixinha de música
const SONG: [string, number][] = [
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
  ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3],
]
const BASS: [string, number][] = [
  ['C3', 1], ['C3', 3], ['G3', 3], ['G3', 3], ['C3', 3], ['C3', 3], ['F3', 3], ['C3', 1.5], ['G3', 1.5], ['C3', 3],
]

export function musicBox() {
  if (!ctx) return
  const beat = 0.5
  fadeMusic(0.08, 1)
  let t = ctx.currentTime + 0.4
  for (const [n, d] of SONG) {
    bell(N[n], t, 0.16, 2.2)
    t += d * beat
  }
  let b = ctx.currentTime + 0.4
  for (const [n, d] of BASS) {
    bell(N[n], b, 0.12, 2.6)
    b += d * beat
  }
  const ms = (t - ctx.currentTime + 1.5) * 1000
  setTimeout(() => fadeMusic(birthday.assets.musicVolume * 1.4, 4), ms)
}
