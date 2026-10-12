import { CanvasTexture, SRGBColorSpace } from 'three'

// Rosto pintado em canvas (estilo boneca), aplicado num "patch" esférico sobre a cabeça.
// O patch cobre FACE_PHI rad na horizontal e FACE_THETA rad na vertical, centrado na frente.
export const FACE_PHI = 1.5
export const FACE_THETA = 1.1

const W = 1024
const H = Math.round((W * FACE_THETA) / FACE_PHI)
const K = W / FACE_PHI // px por radiano

const px = (ax: number) => (ax / FACE_PHI + 0.5) * W
const py = (ay: number) => (FACE_THETA / 2 - ay) * K

type Ctx = CanvasRenderingContext2D

function eyeOpen(c: Ctx, cx: number, cy: number, outer: 1 | -1, iris: string) {
  const rx = 0.15 * K
  const ry = 0.175 * K

  c.save()
  c.beginPath()
  c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  c.clip()
  c.fillStyle = '#fffaf6'
  c.fill()

  // íris em degradê: escura em cima, clara embaixo
  const ix = cx - outer * 0.008 * K
  const iy = cy + 0.012 * K
  const irx = rx * 0.86
  const iry = ry * 0.9
  const g = c.createLinearGradient(0, iy - iry, 0, iy + iry)
  g.addColorStop(0, '#123c28')
  g.addColorStop(0.45, iris)
  g.addColorStop(1, '#a6e8bf')
  c.beginPath()
  c.ellipse(ix, iy, irx, iry, 0, 0, Math.PI * 2)
  c.fillStyle = g
  c.fill()
  const glow = c.createRadialGradient(ix, iy + iry * 0.45, 0, ix, iy + iry * 0.45, irx)
  glow.addColorStop(0, 'rgba(200,255,220,0.55)')
  glow.addColorStop(1, 'rgba(200,255,220,0)')
  c.fillStyle = glow
  c.fill()
  c.lineWidth = 0.012 * K
  c.strokeStyle = '#0b2a1b'
  c.stroke()

  // pupila
  c.beginPath()
  c.ellipse(ix, iy - 0.01 * K, irx * 0.4, iry * 0.42, 0, 0, Math.PI * 2)
  c.fillStyle = '#0a1a12'
  c.fill()

  // sombra da pálpebra
  const lid = c.createLinearGradient(0, cy - ry, 0, cy - ry * 0.3)
  lid.addColorStop(0, 'rgba(70,35,25,0.45)')
  lid.addColorStop(1, 'rgba(70,35,25,0)')
  c.fillStyle = lid
  c.fillRect(cx - rx, cy - ry, rx * 2, ry)

  // brilhos (luz vindo de cima à esquerda nos dois olhos)
  c.fillStyle = '#ffffff'
  c.beginPath()
  c.ellipse(ix - irx * 0.38, iy - iry * 0.42, irx * 0.32, iry * 0.3, -0.4, 0, Math.PI * 2)
  c.fill()
  c.globalAlpha = 0.9
  c.beginPath()
  c.arc(ix + irx * 0.4, iy + iry * 0.38, irx * 0.13, 0, Math.PI * 2)
  c.fill()
  c.globalAlpha = 0.7
  c.beginPath()
  c.arc(ix + irx * 0.05, iy + iry * 0.55, irx * 0.07, 0, Math.PI * 2)
  c.fill()
  c.restore()

  // delineado superior grosso com "asinha"
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.strokeStyle = '#2a1712'
  c.lineWidth = 0.032 * K
  c.beginPath()
  c.ellipse(cx, cy + 0.006 * K, rx * 1.02, ry * 1.0, 0, Math.PI * 1.08, Math.PI * 1.92)
  c.stroke()
  const ox = cx + outer * rx * 0.98
  const oy = cy - ry * 0.25
  c.lineWidth = 0.02 * K
  c.beginPath()
  c.moveTo(ox - outer * 0.02 * K, oy - 0.01 * K)
  c.quadraticCurveTo(ox + outer * 0.03 * K, oy - 0.02 * K, ox + outer * 0.055 * K, oy - 0.055 * K)
  c.stroke()
  // cílios
  c.lineWidth = 0.011 * K
  for (let i = 0; i < 3; i++) {
    const a = Math.PI * (1.62 + i * 0.1) + (outer === 1 ? 0 : 0)
    const ang = outer === 1 ? a : Math.PI * 3 - a
    const sx = cx + Math.cos(ang) * rx
    const sy = cy + Math.sin(ang) * ry
    c.beginPath()
    c.moveTo(sx, sy)
    c.lineTo(sx + outer * (0.03 + i * 0.006) * K, sy - (0.04 - i * 0.008) * K)
    c.stroke()
  }
  // cílio inferior suave
  c.globalAlpha = 0.45
  c.strokeStyle = '#7a4636'
  c.lineWidth = 0.008 * K
  c.beginPath()
  c.ellipse(cx, cy, rx * 0.98, ry * 0.98, 0, Math.PI * 0.2, Math.PI * 0.8)
  c.stroke()
  // vinco da pálpebra
  c.globalAlpha = 0.35
  c.strokeStyle = '#b07a68'
  c.lineWidth = 0.007 * K
  c.beginPath()
  c.ellipse(cx, cy + 0.01 * K, rx * 1.05, ry * 1.12, 0, Math.PI * 1.2, Math.PI * 1.8)
  c.stroke()
  c.globalAlpha = 1
}

function eyeClosed(c: Ctx, cx: number, cy: number, outer: 1 | -1) {
  const rx = 0.15 * K
  c.lineCap = 'round'
  c.strokeStyle = '#2a1712'
  c.lineWidth = 0.024 * K
  c.beginPath()
  c.moveTo(cx - rx, cy + 0.02 * K)
  c.quadraticCurveTo(cx, cy + 0.085 * K, cx + rx, cy + 0.02 * K)
  c.stroke()
  c.lineWidth = 0.012 * K
  c.beginPath()
  c.moveTo(cx + outer * rx, cy + 0.02 * K)
  c.lineTo(cx + outer * (rx + 0.035 * K), cy - 0.01 * K)
  c.stroke()
}

function draw(open: boolean, iris: string) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const c = canvas.getContext('2d')!

  // blush
  for (const s of [-1, 1]) {
    const bx = px(0.53 * s)
    const by = py(-0.27)
    const g = c.createRadialGradient(bx, by, 0, bx, by, 0.12 * K)
    g.addColorStop(0, 'rgba(244,140,150,0.5)')
    g.addColorStop(1, 'rgba(244,140,150,0)')
    c.fillStyle = g
    c.beginPath()
    c.ellipse(bx, by, 0.12 * K, 0.08 * K, 0, 0, Math.PI * 2)
    c.fill()
  }

  // sobrancelhas finas
  c.lineCap = 'round'
  c.strokeStyle = 'rgba(92,56,38,0.85)'
  c.lineWidth = 0.014 * K
  for (const s of [-1, 1]) {
    const bx = px(0.37 * s)
    const by = py(0.17)
    c.beginPath()
    c.moveTo(bx - s * 0.09 * K, by + 0.012 * K)
    c.quadraticCurveTo(bx + s * 0.01 * K, by - 0.03 * K, bx + s * 0.1 * K, by + 0.005 * K)
    c.stroke()
  }

  for (const s of [-1, 1] as const) {
    const ex = px(0.37 * s)
    const ey = py(-0.1)
    if (open) eyeOpen(c, ex, ey, s, iris)
    else eyeClosed(c, ex, ey, s)
  }

  // nariz: só uma sombra delicada
  c.strokeStyle = 'rgba(205,140,120,0.7)'
  c.lineWidth = 0.01 * K
  c.beginPath()
  c.arc(px(0), py(-0.27), 0.016 * K, Math.PI * 0.15, Math.PI * 0.85)
  c.stroke()

  // boca: sorriso pequeno
  const mx = px(0)
  const my = py(-0.38)
  c.fillStyle = '#c45a66'
  c.beginPath()
  c.moveTo(mx - 0.05 * K, my)
  c.quadraticCurveTo(mx, my + 0.055 * K, mx + 0.05 * K, my)
  c.quadraticCurveTo(mx, my + 0.018 * K, mx - 0.05 * K, my)
  c.fill()
  c.strokeStyle = '#a8434f'
  c.lineWidth = 0.008 * K
  c.stroke()

  const t = new CanvasTexture(canvas)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 4
  return t
}

export function createFaceTextures(iris: string) {
  return { open: draw(true, iris), closed: draw(false, iris) }
}
