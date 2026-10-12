import { BufferGeometry, Float32BufferAttribute, MathUtils, SphereGeometry, Vector3 } from 'three'
import { FACE_PHI, FACE_THETA } from './faceTexture'

const ss = MathUtils.smoothstep

// Superfície paramétrica simples (u, v em 0..1) com UVs e normais suaves.
function surface(ws: number, hs: number, f: (u: number, v: number, out: Vector3) => void) {
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const p = new Vector3()
  for (let j = 0; j <= hs; j++)
    for (let i = 0; i <= ws; i++) {
      f(i / ws, j / hs, p)
      pos.push(p.x, p.y, p.z)
      uv.push(i / ws, 1 - j / hs)
    }
  for (let j = 0; j < hs; j++)
    for (let i = 0; i < ws; i++) {
      const a = j * (ws + 1) + i
      const b = a + ws + 1
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

// ângulo a=0 aponta para a frente (+z)
const polar = (r: number, a: number, theta: number, out: Vector3) =>
  out.set(r * Math.sin(theta) * Math.sin(a), r * Math.cos(theta), r * Math.sin(theta) * Math.cos(a))

export const HEAD_R = 0.25

// Esculpe a esfera: queixo mais fino, bochechas cheias, nuca levemente maior.
function sculpt(p: Vector3) {
  const n = p.clone().normalize()
  const r = p.length()
  if (n.y < 0) {
    const d = Math.pow(-n.y, 1.6)
    p.x *= 1 - 0.17 * d * (0.55 + 0.45 * Math.max(0, n.z))
    p.z *= 1 - 0.05 * d
    p.y -= r * 0.04 * Math.pow(-n.y, 3) * Math.max(0, n.z)
  }
  const cheek = Math.exp(-((Math.abs(n.x) - 0.5) ** 2) / 0.025 - ((n.y + 0.28) ** 2) / 0.03) * Math.max(0, n.z)
  p.addScaledVector(n, r * 0.05 * cheek)
  if (n.z < 0) p.z *= 1.04
}

function sculptGeometry(g: BufferGeometry) {
  const a = g.attributes.position
  const p = new Vector3()
  for (let i = 0; i < a.count; i++) {
    p.fromBufferAttribute(a, i)
    sculpt(p)
    a.setXYZ(i, p.x, p.y, p.z)
  }
  g.computeVertexNormals()
  return g
}

export const headGeo = sculptGeometry(new SphereGeometry(HEAD_R, 64, 48))

// mesmo formato da cabeça, só a frente, para receber a textura do rosto
export const faceGeo = sculptGeometry(
  new SphereGeometry(HEAD_R * 1.003, 64, 48, Math.PI / 2 - FACE_PHI / 2, FACE_PHI, Math.PI / 2 - FACE_THETA / 2, FACE_THETA),
)

export const capGeo = surface(96, 24, (u, v, out) => {
  const a = Math.PI + u * Math.PI * 2
  const th = v * 1.45
  const r = 0.268 + 0.005 * Math.sin(a * 26) * ss(v, 0.15, 0.6)
  polar(r, a, th, out)
  out.y += 0.03
  if (out.z < 0) out.z *= 1.06
})

// franja com mechas em ponta, levemente varrida para o lado
export const bangsGeo = surface(80, 18, (u, v, out) => {
  const a0 = -1.0 + u * 2.0
  const side = Math.abs(a0) / 1.0
  const lock = 0.5 + 0.5 * Math.cos(a0 * 11)
  const end = 1.27 + 0.2 * side * side + 0.07 * lock
  const th = 0.25 + v * (end - 0.25)
  const a = a0 + 0.1 * v * v
  const r = 0.279 + 0.012 * v * v + 0.004 * Math.sin(a0 * 32) * v - 0.006 * lock * v * v
  polar(r, a, th, out)
  out.y += 0.03
})

// cabelo longo: cortina ao redor da cabeça, abrindo nos ombros, pontas viradas
export const curtainGeo = surface(96, 30, (u, v, out) => {
  const a = 0.66 + u * (Math.PI * 2 - 1.32)
  const lock = 0.5 + 0.5 * Math.cos(a * 13)
  const yEnd = -0.6 - 0.06 * lock
  const y = MathUtils.lerp(0.13, yEnd, v)
  const r =
    0.272 +
    0.025 * ss(v, 0.2, 0.5) -
    0.03 * ss(v, 0.55, 0.85) +
    0.04 * ss(v, 0.82, 1) +
    0.008 * Math.sin(a * 21 + v * 5) * ss(v, 0.08, 0.35)
  out.set(r * Math.sin(a), y, r * Math.cos(a) * (Math.cos(a) < 0 ? 1.05 : 1))
})
