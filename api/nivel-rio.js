// Vercel Serverless Function — proxy para API HidroWeb da ANA
// Contorna CORS e centraliza a lógica de estação mais próxima

// Estações do Rio Tietê no interior de SP (código ANA, lat, lon, nome)
const STATIONS = [
  { code: '62091000', lat: -23.117, lon: -48.883, name: 'Tietê - Barra Bonita' },
  { code: '62101000', lat: -22.233, lon: -48.567, name: 'Tietê - Bauru' },
  { code: '62097000', lat: -22.617, lon: -48.567, name: 'Tietê - Bariri' },
  { code: '62111000', lat: -21.733, lon: -49.917, name: 'Tietê - Promissão' },
  { code: '62121000', lat: -21.200, lon: -50.950, name: 'Tietê - Araçatuba' },
]

function nearestStation(lat, lon) {
  let best = null
  let bestDist = Infinity
  for (const s of STATIONS) {
    const d = Math.hypot(s.lat - lat, s.lon - lon)
    if (d < bestDist) { bestDist = d; best = s }
  }
  return best
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { lat, lon } = req.query
  if (!lat || !lon) return res.status(400).json({ error: 'lat e lon obrigatórios' })

  const station = nearestStation(parseFloat(lat), parseFloat(lon))

  try {
    // HidroWeb API v1 — dados fluviométricos em tempo real
    const url = `https://telemetria.ana.gov.br/Share/GetValoresData?codEstacao=${station.code}&dataInicio=&dataFim=&tipo=2&nivelConsistencia=&internoObsNivel=&internoObsCota=&internoObsVazao=`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'PesqueiApp/1.0' },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) throw new Error('ANA API error')

    const data = await response.json()

    // Extrai as duas últimas leituras para calcular tendência
    const readings = data?.SerieHistorica?.slice(-2) ?? []
    const current = readings[1]?.Nivel ?? readings[0]?.Nivel ?? null
    const previous = readings[0]?.Nivel ?? null

    return res.json({
      level: current ? parseFloat(current).toFixed(2) : null,
      previousLevel: previous ? parseFloat(previous).toFixed(2) : null,
      stationName: station.name,
      stationCode: station.code,
    })
  } catch {
    // Fallback: retorna estação sem dados de nível
    return res.json({
      level: null,
      previousLevel: null,
      stationName: station.name,
      error: 'ANA indisponível',
    })
  }
}
