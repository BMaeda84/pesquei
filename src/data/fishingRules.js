// Regras de pesca amadora e navegação para rios brasileiros
// Fontes: IBAMA / MPA Instrução Normativa vigente + AHRANA + Capitania dos Portos
// Atualizar anualmente: início de novembro (piracema SP)

// ── Piracema ─────────────────────────────────────────────
// Bacia do Alto/Médio Tietê (SP): 1 nov – 28 fev (IN MPA vigente)
// Durante a piracema pesca amadora é PERMITIDA com restrições (varas + anzol, sem rede)
export const PIRACEMA = {
  startMonth: 11, startDay: 1,
  endMonth: 2,    endDay: 28,
  label: '1º nov – 28 fev',
  sourceLabel: 'MPA/IBAMA — IN vigente',
  sourceUrl: 'https://www.gov.br/mpa/pt-br/assuntos/pesca/legislacao',
}

export function isPiracema(date = new Date()) {
  const m = date.getMonth() + 1
  if (m === 11 || m === 12 || m === 1) return true
  if (m === 2 && date.getDate() <= 28) return true
  return false
}

// Dias até o próximo início de piracema (retorna 0 se já estiver dentro)
export function daysUntilPiracema(date = new Date()) {
  if (isPiracema(date)) return 0
  const year = date.getFullYear()
  const nextStart = new Date(
    date.getMonth() + 1 >= 11 ? year + 1 : year,
    10, 1  // mês 10 = novembro (0-based)
  )
  return Math.ceil((nextStart - date) / 86400000)
}

// Dias até o fim da piracema (retorna 0 se fora do período)
export function daysUntilPiracemaEnd(date = new Date()) {
  if (!isPiracema(date)) return 0
  const year = date.getMonth() <= 1 ? date.getFullYear() : date.getFullYear() + 1
  const end = new Date(year, 1, 28, 23, 59, 59)
  return Math.ceil((end - date) / 86400000)
}

// ── Tamanhos mínimos (comprimento total) ────────────────
// Fonte: IBAMA IN 05/2004 e atualizações; espécies exóticas sem mínimo
export const MIN_SIZES = {
  'tilapia':  { cm: null, note: 'Exótica — sem mínimo oficial' },
  'carpa':    { cm: null, note: 'Exótica — sem mínimo oficial' },
  'pacu':     { cm: 30,   note: '≥ 30 cm' },
  'traira':   { cm: 25,   note: '≥ 25 cm' },
  'bagre':    { cm: 25,   note: '≥ 25 cm' },
  'tucunare': { cm: 25,   note: '≥ 25 cm' },
  'lambari':  { cm: null, note: 'Sem mínimo — uso como isca viva permitido' },
}

// ── Regras gerais para pesca amadora ────────────────────
export const FISHING_RULES = [
  { icon: '🎣', text: 'Máximo 2 varas por pescador' },
  { icon: '🐟', text: 'Cota diária: 10 kg + 1 exemplar (ou apenas 5 kg + 1 em áreas protegidas)' },
  { icon: '🚫', text: 'Redes, tarrafas e armadilhas são proibidas para amadores' },
  { icon: '📋', text: 'Licença de pesca amadora obrigatória (IBAMA / RAN)' },
  { icon: '♻️', text: 'Prática C&R (captura e soltura) incentivada na piracema' },
]

// ── Navegação ────────────────────────────────────────────
// Limiares de nível de rio para alertas de navegação (em metros)
export const NAV_THRESHOLDS = {
  low:  1.0,   // abaixo: calado comprometido, risco de encalhe
  high: 4.5,   // acima: correnteza forte, risco de inundação de margem
}

export function getNavStatus(levelMeters) {
  if (levelMeters === null || levelMeters === undefined) return null
  const l = parseFloat(levelMeters)
  if (l < NAV_THRESHOLDS.low)  return { status: 'low',    label: 'Nível baixo',   color: '#f59e0b', icon: '⚠️', tip: 'Atenção ao calado — risco de encalhe em trechos rasos.' }
  if (l > NAV_THRESHOLDS.high) return { status: 'high',   label: 'Nível alto',    color: '#ef4444', icon: '🔴', tip: 'Correnteza forte e margens alagadas — redobre cuidado.' }
  return                              { status: 'normal', label: 'Navegação normal', color: '#22c55e', icon: '🟢', tip: 'Condições habituais para embarcações de pequeno porte.' }
}

export const NAV_LINKS = [
  {
    label: 'Capitania dos Portos — SP',
    sublabel: 'Avisos aos navegantes, habilitação Arrais',
    url: 'https://www.marinha.mil.br/cpsp',
    icon: '⚓',
  },
  {
    label: 'AHRANA — Hidrovia Tietê-Paraná',
    sublabel: 'Boletins aquaviários e condições de tráfego',
    url: 'https://www.gov.br/dnit/pt-br/assuntos/aquaviario',
    icon: '🚢',
  },
  {
    label: 'IBAMA — Licença de pesca amadora',
    sublabel: 'Emissão e renovação online (RAN)',
    url: 'https://servicos.ibama.gov.br',
    icon: '📋',
  },
]
