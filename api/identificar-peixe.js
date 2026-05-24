import Anthropic from '@anthropic-ai/sdk'

// Espécies que o app conhece — ajuda a IA a focar no contexto do Tietê
const ESPECIES = ['Tilápia', 'Carpa', 'Pacu', 'Traíra', 'Bagre', 'Mandi', 'Tucunaré', 'Lambari']

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const { image, mediaType = 'image/jpeg' } = req.body ?? {}
  if (!image) return res.status(400).json({ error: 'Campo image obrigatório' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada' })

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
            text: `Você é um biólogo especialista em peixes do Rio Tietê, interior de São Paulo.
Analise a foto e identifique o peixe.
Espécies comuns nesse rio: ${ESPECIES.join(', ')}.

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
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Resposta sem JSON')

    return res.json(JSON.parse(match[0]))
  } catch (err) {
    console.error('Erro identificar-peixe:', err.message)
    return res.status(500).json({
      especie: null,
      certeza: 'baixa',
      observacao: 'Não foi possível identificar. Tente uma foto mais nítida.',
    })
  }
}
