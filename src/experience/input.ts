// Sem dependência de three: é importado pela UI (chunk inicial).
export const input = {
  keys: new Set<string>(),
  joy: { x: 0, y: 0 },
  teleport: null as 'cake' | 'garden' | null,
}
