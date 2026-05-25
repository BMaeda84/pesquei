// Vercel Serverless Function — verifica assinatura HMAC do backup
//
// Recebe { entries, sig }.
// Recomputa σ′ = HMAC-SHA256(S, κ(entries)) com o mesmo segredo do export.
// Compara σ == σ′ em tempo constante (sem timing attack).
//
// Em caso de falha: { ok: false } — sem detalhar o motivo.
// O cliente exibe apenas "Erro ao recuperar dados", impedindo engenharia reversa.
//
// ── Por que tempo constante importa ─────────────────────────────────────────
//  Uma comparação == com short-circuit vaza bits da assinatura esperada via
//  diferença de tempo de resposta. crypto.timingSafeEqual elimina isso.
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'crypto'

const SECRET = process.env.BACKUP_HMAC_SECRET || 'dev-secret-change-me-in-vercel'

const ALLOWED = ['id', 'species', 'icon', 'quantity', 'weight', 'rating',
                 'notes', 'verified', 'verifyToken', 'date', 'createdAt']

// κ(E) — idêntica ao backup-export.js; deve permanecer sincronizada
function canonicalize(entries) {
  const sanitized = entries
    .filter(e => e && typeof e === 'object')
    .map(e => {
      const obj = {}
      for (const k of ALLOWED) {
        if (e[k] !== undefined) obj[k] = e[k]
      }
      obj.quantity = Math.min(Math.max(Number(obj.quantity) || 1, 1), 99)
      obj.rating   = Math.min(Math.max(Number(obj.rating)   || 3, 1), 5)
      obj.weight   = (obj.weight != null && obj.weight !== '')
        ? String(Math.min(Math.max(parseFloat(obj.weight) || 0, 0), 200))
        : null
      obj.verified = !!obj.verified
      obj.species  = String(obj.species || '').slice(0, 60)
      obj.notes    = String(obj.notes   || '').slice(0, 500)
      obj.icon     = String(obj.icon    || '🐟').slice(0, 8)
      return obj
    })
    .sort((a, b) => String(a.id ?? '').localeCompare(String(b.id ?? '')))

  return JSON.stringify(sanitized)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { entries = [], sig = '' } = req.body || {}

  // Falha silenciosa para qualquer entrada inválida
  if (!Array.isArray(entries) || typeof sig !== 'string') return res.json({ ok: false })
  if (entries.length > 10_000)                            return res.json({ ok: false })

  const canonical = canonicalize(entries)
  const expected  = crypto
    .createHmac('sha256', SECRET)
    .update(canonical, 'utf8')
    .digest('hex')

  // ── Comparação em tempo constante ────────────────────────────────────────
  // timingSafeEqual exige buffers do mesmo tamanho; ambos são 32 bytes (hex64).
  // Se sig tiver tamanho diferente, já sabemos que é inválida — mas ainda
  // comparamos para não vazar esse fato via tempo de resposta.
  let valid = false
  try {
    const received = Buffer.from(sig.slice(0, 64).padEnd(64, '0'), 'hex')
    const exp      = Buffer.from(expected, 'hex')
    // timingSafeEqual: O(n) independente de onde os bytes divergem
    valid = crypto.timingSafeEqual(received, exp) && sig.length === 64
  } catch {
    valid = false
  }

  if (!valid) {
    // Não revelamos: arquivo adulterado? chave errada? formato inválido?
    // O cliente só vê "Erro ao recuperar dados"
    return res.json({ ok: false })
  }

  // Retorna entradas sanitizadas (re-clampeadas pelo servidor)
  const sanitized = JSON.parse(canonical)
  return res.json({ ok: true, entries: sanitized })
}
