// Pontuação por espécie (mais raro = mais pontos)
const SPECIES_PTS = {
  'Lambari':      5,
  'Tilápia':      10,
  'Carpa':        12,
  'Pacu':         15,
  'Bagre / Mandi':15,
  'Bagre':        15,
  'Mandi':        15,
  'Traíra':       18,
  'Tucunaré':     20,
}

const DEFAULT_PTS  = 10
const AI_BONUS     = 15   // captura verificada por foto IA com token válido
const WEIGHT_PTS   = 2    // por cada 0.5 kg
const STAR_MULT    = { 1: 0.6, 2: 0.8, 3: 1.0, 4: 1.2, 5: 1.5 }

// S4/S5 fix: limites razoáveis para evitar pontuações absurdas por dados manipulados
const MAX_QUANTITY = 99
const MAX_WEIGHT   = 200   // kg — maior peixe de rio do Brasil não chega perto disso

// Anti-cheat: verifica apenas o formato do token (32 hex chars).
// A validação criptográfica real acontece no servidor ao emitir o token.
// Impede que verified=true sem token (D1/D2) ganhe o bônus.
function hasValidTokenFormat(token) {
  return typeof token === 'string' && /^[0-9a-f]{32}$/.test(token)
}

export function scoreEntry(entry) {
  const qty    = Math.min(Math.max(Number(entry.quantity) || 1, 1), MAX_QUANTITY)
  const base   = (SPECIES_PTS[entry.species] ?? DEFAULT_PTS) * qty

  const rawWeight = entry.weight ? parseFloat(entry.weight) : 0
  const clampedW  = isNaN(rawWeight) ? 0 : Math.min(Math.max(rawWeight, 0), MAX_WEIGHT)
  const weight    = Math.floor(clampedW / 0.5) * WEIGHT_PTS

  // Bônus IA só com token de formato válido
  const ai     = (entry.verified && hasValidTokenFormat(entry.verifyToken)) ? AI_BONUS : 0

  const rawRating = Number(entry.rating)
  const rating    = isNaN(rawRating) ? 3 : Math.min(Math.max(Math.round(rawRating), 1), 5)
  const mult      = STAR_MULT[rating] ?? 1.0

  return Math.round((base + weight + ai) * mult)
}

export function scoreSummary(entries) {
  const today = new Date().toDateString()
  // Só entradas de hoje; limite de 50 por dia para evitar flood de registros
  const todayEntries = entries
    .filter(e => new Date(e.date || e.createdAt).toDateString() === today)
    .slice(0, 50)

  const total         = todayEntries.reduce((s, e) => s + scoreEntry(e), 0)
  const fishCount     = todayEntries.reduce((s, e) => s + (Number(e.quantity) || 1), 0)
  const speciesSet    = new Set(todayEntries.map(e => e.species))
  const verifiedCount = todayEntries.filter(e => e.verified && hasValidTokenFormat(e.verifyToken)).length

  return { total, fishCount, species: [...speciesSet], speciesCount: speciesSet.size, verifiedCount, entries: todayEntries }
}

export function scoreLabel(pts) {
  if (pts >= 200) return { label: 'Lendário 🏆', color: '#f59e0b' }
  if (pts >= 120) return { label: 'Mestre 🥇',   color: '#22c55e' }
  if (pts >=  60) return { label: 'Experiente 🥈', color: '#0ea5b5' }
  if (pts >=  20) return { label: 'Iniciante 🥉',  color: '#94a3b8' }
  return { label: 'Começando…', color: '#475569' }
}
