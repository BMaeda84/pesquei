// Vercel Serverless Function — proxy para API HidroWeb da ANA
// Contorna CORS e centraliza a lógica de estação mais próxima

const STATIONS = [
  // SP capital / grande SP
  { code: '62031000', lat: -23.396, lon: -47.019, name: 'Tietê — Pirapora do Bom Jesus' },
  // Interior de SP
  { code: '62091000', lat: -23.117, lon: -48.883, name: 'Tietê — Barra Bonita' },
  { code: '62097000', lat: -22.617, lon: -48.567, name: 'Tietê — Bariri' },
  { code: '62101000', lat: -22.233, lon: -48.567, name: 'Tietê — Bauru' },
  { code: '62111000', lat: -21.733, lon: -49.917, name: 'Tietê — Promissão' },
  { code: '62121000', lat: -21.200, lon: -50.950, name: 'Tietê — Araçatuba' },
]

function nearestStation(lat, lon) {
  let best = null, bestDist = Infinity
  for (const s of STATIONS) {
    const d = Math.hypot(s.lat - lat, s.lon - lon)
    if (d < bestDist) { bestDist = d; best = s }
  }
  return best
}

// Extrai nível de qualquer formato que a ANA já retornou
function extractLevel(data) {
  // Formato atual: { SerieHistorica: [ { Nivel, DataHora }, ... ] }
  if (Array.isArray(data?.SerieHistorica) && data.SerieHistorica.length > 0) {
    const readings = data.SerieHistorica.slice(-2)
    const cur  = readings[readings.length - 1]
    const prev = readings.length > 1 ? readings[0] : null
    const level    = cur?.Nivel  ?? cur?.nivel  ?? cur?.Cota  ?? cur?.cota  ?? null
    const previous = prev?.Nivel ?? prev?.nivel ?? prev?.Cota ?? prev?.cota ?? null
    if (level !== null) return { level: parseFloat(level).toFixed(2), previousLevel: previous ? parseFloat(previous).toFixed(2) : null }
  }

  // Formato alternativo: { Data: [ { Nivel, ... } ] }
  if (Array.isArray(data?.Data) && data.Data.length > 0) {
    const readings = data.Data.slice(-2)
    const cur  = readings[readings.length - 1]
    const prev = readings.length > 1 ? readings[0] : null
    const level    = cur?.Nivel  ?? cur?.nivel  ?? cur?.Value ?? null
    const previous = prev?.Nivel ?? prev?.nivel ?? prev?.Value ?? null
    if (level !== null) return { level: parseFloat(level).toFixed(2), previousLevel: previous ? parseFloat(previous).toFixed(2) : null }
  }

  return { level: null, previousLevel: null }
}

async function fetchFromANA(stationCode) {
  // Endpoint principal da telemetria ANA
  const url = `https://telemetria.ana.gov.br/Share/GetValoresData?codEstacao=${stationCode}&dataInicio=&dataFim=&tipo=2&nivelConsistencia=&internoObsNivel=&internoObsCota=&internoObsVazao=`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'PesqueiApp/1.0', 'Accept': 'application/json' },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`ANA HTTP ${res.status}`)
  const text = await res.text()
  // Às vezes a ANA envolve o JSON num callback JSONP ou adiciona BOM
  const cleaned = text.replace(/^\s*[^{[]*/, '').replace(/[^}\]]*\s*$/, '')
  return JSON.parse(cleaned || '{}')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { lat, lon } = req.query
  if (!lat || !lon) return res.status(400).json({ error: 'lat e lon obrigatórios' })

  // SAST-02 / DAST: NaN propagava silenciosamente para Math.hypot → sempre retornava
  // a primeira estação. Clampe dentro do bounding-box do Brasil.
  const latN = parseFloat(lat)
  const lonN = parseFloat(lon)
  if (isNaN(latN) || isNaN(lonN) || latN < -35 || latN > 5 || lonN < -74 || lonN > -28)
    return res.status(400).json({ error: 'Coordenadas fora do Brasil' })

  const station = nearestStation(latN, lonN)

  try {
    const data = await fetchFromANA(station.code)
    const { level, previousLevel } = extractLevel(data)

    return res.json({
      level,
      previousLevel,
      stationName: station.name,
      stationCode: station.code,
    })
  } catch (err) {
    console.error('nivel-rio error:', station.code, err.message)
    return res.json({
      level: null,
      previousLevel: null,
      stationName: station.name,
      stationCode: station.code,
      error: 'ANA indisponível',
    })
  }
}
