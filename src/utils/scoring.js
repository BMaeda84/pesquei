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

const DEFAULT_PTS = 10
const AI_BONUS    = 15  // captura verificada por foto IA
const WEIGHT_PTS  = 2   // por cada 0.5 kg
const STAR_MULT   = { 1: 0.6, 2: 0.8, 3: 1.0, 4: 1.2, 5: 1.5 }

export function scoreEntry(entry) {
  const base   = (SPECIES_PTS[entry.species] ?? DEFAULT_PTS) * (Number(entry.quantity) || 1)
  const weight = entry.weight ? Math.floor(parseFloat(entry.weight) / 0.5) * WEIGHT_PTS : 0
  const ai     = entry.verified ? AI_BONUS : 0
  const mult   = STAR_MULT[entry.rating] ?? 1.0
  return Math.round((base + weight + ai) * mult)
}

export function scoreSummary(entries) {
  const today = new Date().toDateString()
  const todayEntries = entries.filter(e => new Date(e.date || e.createdAt).toDateString() === today)

  const total        = todayEntries.reduce((s, e) => s + scoreEntry(e), 0)
  const fishCount    = todayEntries.reduce((s, e) => s + (Number(e.quantity) || 1), 0)
  const speciesSet   = new Set(todayEntries.map(e => e.species))
  const verifiedCount= todayEntries.filter(e => e.verified).length

  return { total, fishCount, species: [...speciesSet], speciesCount: speciesSet.size, verifiedCount, entries: todayEntries }
}

export function scoreLabel(pts) {
  if (pts >= 200) return { label: 'Lendário 🏆', color: '#f59e0b' }
  if (pts >= 120) return { label: 'Mestre 🥇',   color: '#22c55e' }
  if (pts >=  60) return { label: 'Experiente 🥈', color: '#0ea5b5' }
  if (pts >=  20) return { label: 'Iniciante 🥉',  color: '#94a3b8' }
  return { label: 'Começando…', color: '#475569' }
}
