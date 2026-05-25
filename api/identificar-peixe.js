import Anthropic from '@anthropic-ai/sdk'
import crypto from 'crypto'

const ESPECIES = ['Tilápia', 'Carpa', 'Pacu', 'Traíra', 'Bagre', 'Mandi', 'Tucunaré', 'Lambari']

const ALLOWED_ORIGINS = ['https://pesquei.vercel.app']
const VERCEL_PREVIEW_RE = /^https:\/\/pesquei(-[\w-]+)?\.vercel\.app$/

function resolveOrigin(origin) {
  if (!origin) return null
  if (ALLOWED_ORIGINS.includes(origin)) return origin
  if (VERCEL_PREVIEW_RE.test(origin)) return origin
  if (process.env.NODE_ENV !== 'production') return origin
  return null
}

function generateVerifyToken(species) {
  const secret = process.env.VERIFY_TOKEN_SECRET || process.env.ANTHROPIC_API_KEY?.slice(-20) || 'pesquei-fallback'
  const window = Math.floor(Date.now() / 600_000)
  return crypto
    .createHmac('sha256', secret)
    .update(`${window}:${species}`)
    .digest('hex')
    .slice(0, 32)
}

const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_IMAGE_B64_CHARS = 4_000_000

export default async function handler(req, res) {
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

  if (!image || typeof image !== 'string')
    return res.status(400).json({ error: 'Campo image obrigatório' })
  if (image.length > MAX_IMAGE_B64_CHARS)
    return res.status(413).json({ error: 'Imagem muito grande (máx ~2 MB)' })
  if (!ALLOWED_MEDIA_TYPES.includes(mediaType))
    return res.status(400).json({ error: 'Tipo de imagem não suportado' })
  // SAST-01: valida amostra da string; um único char não é suficiente
  // base64 válido contém apenas A-Z a-z 0-9 + / e = no padding
  const b64Sample = image.replace(/\s/g, '').slice(0, 200)
  if (!/^[A-Za-z0-9+/]+=*$/.test(b64Sample))
    return res.status(400).json({ error: 'Formato de imagem inválido' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Configuração do servidor incompleta' })

  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
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
Analise a foto e responda APENAS com JSON válido (sem markdown, sem texto extra):
{
  "especie": "nome da espécie em português ou null se não for peixe",
  "certeza": "alta" | "media" | "baixa",
  "peso_estimado": "ex: 0.3 a 0.8 kg" | null,
  "observacao": "uma frase curta sobre o peixe (máx 80 chars)",
  "congelado": true se o peixe parece congelado, em freezer, já filetado, processado, ou não foi pescado agora — false caso contrário,
  "com_pessoa": true se há uma pessoa claramente visível segurando ou ao lado do peixe — false caso contrário
}

Espécies comuns em rios brasileiros: ${ESPECIES.join(', ')}.`,
          },
        ],
      }],
    })

    const raw = response.content[0]?.text ?? ''
    const match = raw.match(/\{[\s\S]*?\}/)
    if (!match) throw new Error('Resposta sem JSON')

    const parsed = JSON.parse(match[0])

    // Token apenas para peixe fresco identificado com certeza alta/média
    if (parsed.especie && parsed.certeza !== 'baixa' && !parsed.congelado) {
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
