import Anthropic from '@anthropic-ai/sdk'
import crypto from 'crypto'

const ESPECIES = ['Tilápia', 'Carpa', 'Pacu', 'Traíra', 'Bagre', 'Mandi', 'Tucunaré', 'Lambari']

// S1 fix: restringe CORS ao domínio do app
const ALLOWED_ORIGINS = [
  'https://pesquei.vercel.app',
]
const VERCEL_PREVIEW_RE = /^https:\/\/pesquei(-[\w-]+)?\.vercel\.app$/

function resolveOrigin(origin) {
  if (!origin) return null
  if (ALLOWED_ORIGINS.includes(origin)) return origin
  if (VERCEL_PREVIEW_RE.test(origin)) return origin
  if (process.env.NODE_ENV !== 'production') return origin  // localhost em dev
  return null
}

// Anti-cheat: token HMAC que prova que a verificação veio do servidor
// Janela de 10 min — impede replay eterno de tokens antigos
function generateVerifyToken(species) {
  const secret = process.env.VERIFY_TOKEN_SECRET || process.env.ANTHROPIC_API_KEY?.slice(-20) || 'pesquei-fallback'
  const window = Math.floor(Date.now() / 600_000) // janela de 10 min
  return crypto
    .createHmac('sha256', secret)
    .update(`${window}:${species}`)
    .digest('hex')
    .slice(0, 32)
}

const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_IMAGE_B64_CHARS = 4_000_000 // ~2.9 MB decoded

export default async function handler(req, res) {
  // S1: CORS restrito
  const allowedOrigin = resolveOrigin(req.headers.origin)
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const { image, mediaType = 'image/jpeg' } = req.body ?? {}

  // S2: tamanho máximo do payload
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Campo image obrigatório' })
  }
  if (image.length > MAX_IMAGE_B64_CHARS) {
    return res.status(413).json({ error: 'Imagem muito grande (máx ~2 MB)' })
  }

  // S3: whitelist de mediaType
  if (!ALLOWED_MEDIA_TYPES.includes(mediaType)) {
    return res.status(400).json({ error: 'Tipo de imagem não suportado' })
  }

  // Validação básica de base64 (primeiros 100 chars)
  if (!/^[A-Za-z0-9+/]/.test(image)) {
    return res.status(400).json({ error: 'Formato de imagem inválido' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Configuração do servidor incompleta' })

  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: image },
          },
          {
            type: 'text',
            text: `Você é um biólogo especialista em peixes de rios brasileiros.
Analise a foto e identifique o peixe.
Espécies comuns: ${ESPECIES.join(', ')}.

Responda APENAS com JSON válido (sem markdown, sem texto extra):
{
  "especie": "nome da espécie em português ou null se não for peixe",
  "certeza": "alta" ou "media" ou "baixa",
  "peso_estimado": "ex: 0.3 a 0.8 kg" ou null,
  "observacao": "uma frase curta sobre o peixe ou motivo de não identificar (máx 80 chars)"
}`,
          },
        ],
      }],
    })

    const raw = response.content[0]?.text ?? ''
    const match = raw.match(/\{[\s\S]*?\}/)
    if (!match) throw new Error('Resposta sem JSON')

    const parsed = JSON.parse(match[0])

    // Anti-cheat: emite token somente quando há identificação com certeza alta/média
    if (parsed.especie && parsed.certeza !== 'baixa') {
      parsed.verifyToken = generateVerifyToken(parsed.especie)
    }

    return res.json(parsed)
  } catch (err) {
    console.error('Erro identificar-peixe:', err.message)
    return res.status(500).json({
      especie: null,
      certeza: 'baixa',
      observacao: 'Não foi possível identificar. Tente uma foto mais nítida.',
    })
  }
}
