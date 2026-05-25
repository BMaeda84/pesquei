// Vercel Serverless Function — assina backup com HMAC-SHA256
//
// O segredo BACKUP_HMAC_SECRET fica exclusivamente no servidor (env var Vercel).
// O cliente envia suas entradas → o servidor sanitiza, canoniza e devolve a
// assinatura opaca. A assinatura é incluída no arquivo .json pelo cliente.
//
// ── Matemática do token ──────────────────────────────────────────────────────
//
//  Seja:
//    S   = BACKUP_HMAC_SECRET  (32 bytes aleatórios, só no servidor)
//    E   = array de entradas do diário
//    κ(E)= forma canônica de E:
//            • projetar apenas campos da whitelist
//            • clampear: qty ∈ [1,99], peso ∈ [0,200], rating ∈ [1,5]
//            • ordenar por `id` (lexicográfico) — determinístico
//            • JSON.stringify do resultado
//    σ   = HMAC-SHA256(S, κ(E))  →  64 hex chars (256 bits)
//
//  Propriedades:
//    • Integridade:    qualquer alteração em E muda κ(E) → σ′ ≠ σ
//    • Unforgeability: sem S não é possível calcular σ válido (HMAC pré-imagem)
//    • Canonização:    campos extras injetados pelo atacante são ignorados
//    • Idempotência:   clampear entradas já clampeadas produz mesmo resultado
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'crypto'

const SECRET = process.env.BACKUP_HMAC_SECRET || 'dev-secret-change-me-in-vercel'

// SAST-03: restringe CORS ao mesmo padrão de identificar-peixe.js
const ALLOWED_ORIGINS   = ['https://pesquei.vercel.app']
const VERCEL_PREVIEW_RE = /^https:\/\/pesquei(-[\w-]+)?\.vercel\.app$/
function resolveOrigin(origin) {
  if (!origin) return null
  if (ALLOWED_ORIGINS.includes(origin)) return origin
  if (VERCEL_PREVIEW_RE.test(origin)) return origin
  if (process.env.NODE_ENV !== 'production') return origin
  return null
}

// Campos aceitos na assinatura (whitelist explícita)
const ALLOWED = ['id', 'species', 'icon', 'quantity', 'weight', 'rating',
                 'notes', 'verified', 'verifyToken', 'date', 'createdAt']

// κ(E) — forma canônica das entradas
// Idempotente: aplicar duas vezes produz o mesmo resultado que uma
export function canonicalize(entries) {
  const sanitized = entries
    .filter(e => e && typeof e === 'object')
    .map(e => {
      const obj = {}
      for (const k of ALLOWED) {
        if (e[k] !== undefined) obj[k] = e[k]
      }
      // Clampeia para impedir inflação de dados via chamada direta à API
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
    // Ordena por id (string lexicográfica) — garante forma determinística
    // independente da ordem de inserção no IndexedDB
    .sort((a, b) => String(a.id ?? '').localeCompare(String(b.id ?? '')))

  return JSON.stringify(sanitized)
}

// σ = HMAC-SHA256(S, κ(E))
function sign(canonical) {
  return crypto
    .createHmac('sha256', SECRET)
    .update(canonical, 'utf8')
    .digest('hex') // 64 hex chars = 256 bits
}

export default async function handler(req, res) {
  const allowedOrigin = resolveOrigin(req.headers.origin)
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { entries = [] } = req.body || {}
  if (!Array.isArray(entries))        return res.status(400).json({ error: 'entries deve ser array' })
  if (entries.length > 10_000)        return res.status(400).json({ error: 'muitas entradas' })

  const canonical        = canonicalize(entries)
  const sig              = sign(canonical)
  const sanitizedEntries = JSON.parse(canonical)
  const exportedAt       = new Date().toISOString()

  return res.json({ sig, entries: sanitizedEntries, exportedAt })
}
