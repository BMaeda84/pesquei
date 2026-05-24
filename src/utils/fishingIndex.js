// Calcula índice de pesca de 0-100 combinando clima, pressão, lua e nível do rio
export function calcFishingIndex({ weather, riverLevel, moonScore, previousRiverLevel }) {
  let score = 0
  const factors = []

  // Pressão atmosférica (peso 30%)
  // Pressão estável ou subindo = bom; queda = peixe para de comer
  if (weather?.pressure) {
    const p = weather.pressure
    if (p >= 1013) { score += 30; factors.push({ label: 'Pressão', value: `${p} hPa`, status: 'good' }) }
    else if (p >= 1005) { score += 18; factors.push({ label: 'Pressão', value: `${p} hPa`, status: 'medium' }) }
    else { score += 5; factors.push({ label: 'Pressão', value: `${p} hPa`, status: 'bad' }) }
  }

  // Temperatura do ar (peso 20%)
  // Peixes do Tietê (tilápia, carpa, pacu) preferem 20-28°C
  if (weather?.temperature) {
    const t = weather.temperature
    if (t >= 20 && t <= 28) { score += 20; factors.push({ label: 'Temperatura', value: `${t}°C`, status: 'good' }) }
    else if (t >= 16 && t <= 32) { score += 12; factors.push({ label: 'Temperatura', value: `${t}°C`, status: 'medium' }) }
    else { score += 4; factors.push({ label: 'Temperatura', value: `${t}°C`, status: 'bad' }) }
  }

  // Chuva recente (peso 20%)
  // Chuva forte turva a água e dispersa os peixes
  if (weather?.rain !== undefined) {
    const r = weather.rain
    if (r === 0) { score += 20; factors.push({ label: 'Chuva', value: 'Sem chuva', status: 'good' }) }
    else if (r <= 2) { score += 12; factors.push({ label: 'Chuva', value: `${r} mm`, status: 'medium' }) }
    else { score += 3; factors.push({ label: 'Chuva', value: `${r} mm`, status: 'bad' }) }
  }

  // Fase da lua (peso 20%)
  if (moonScore) {
    const lunarPoints = Math.round((moonScore.score / 10) * 20)
    score += lunarPoints
    factors.push({ label: 'Lua', value: moonScore.name, status: moonScore.score >= 7 ? 'good' : moonScore.score >= 5 ? 'medium' : 'bad' })
  }

  // Nível do rio (peso 10%)
  // Nível estável ou levemente descendo concentra peixes
  if (riverLevel !== null && previousRiverLevel !== null && riverLevel !== undefined) {
    const delta = riverLevel - (previousRiverLevel ?? riverLevel)
    if (Math.abs(delta) < 0.1) { score += 10; factors.push({ label: 'Rio', value: `${riverLevel}m (estável)`, status: 'good' }) }
    else if (delta < 0) { score += 8; factors.push({ label: 'Rio', value: `${riverLevel}m (baixando)`, status: 'good' }) }
    else { score += 3; factors.push({ label: 'Rio', value: `${riverLevel}m (subindo)`, status: 'bad' }) }
  }

  return { score: Math.min(score, 100), factors }
}

export function getIndexLabel(score) {
  if (score >= 75) return { label: 'Excelente', color: '#22c55e' }
  if (score >= 55) return { label: 'Bom', color: '#84cc16' }
  if (score >= 35) return { label: 'Regular', color: '#f59e0b' }
  return { label: 'Ruim', color: '#ef4444' }
}

// Tipos de ponto por espécie ativa — onde procurar no rio/represa
const SPOT_BY_FISH = {
  tilapia:  { icon: '🪨', spot: 'Fundo raso perto de pedras ou entulho submerso', depth: 'Raso (0,5–2m)' },
  carpa:    { icon: '🌿', spot: 'Fundo lodoso em enseadas calmas, longe da correnteza', depth: 'Fundo (2–5m)' },
  pacu:     { icon: '🌳', spot: 'Meia-água sob árvores que penduram sobre o rio', depth: 'Médio (1–3m)' },
  traira:   { icon: '🌾', spot: 'Beira com macrófitas (aguapé, taboas) em água rasa', depth: 'Raso (0,3–1m)' },
  bagre:    { icon: '💧', spot: 'Canal principal em poços fundos, correnteza lenta', depth: 'Fundo (3m+)' },
  tucunare: { icon: '🪵', spot: 'Junto a troncos submersos, pilares de pontes ou pedras grandes', depth: 'Médio (1–4m)' },
  lambari:  { icon: '🏖️', spot: 'Qualquer ponto de margem, especialmente em afluentes', depth: 'Muito raso' },
}

// Gera sugestões de pontos baseadas nos peixes ativos agora
export function getBestSpots(activeFish, zone) {
  if (!activeFish || activeFish.length === 0) return []

  const seen = new Set()
  const spots = []

  for (const fish of activeFish.slice(0, 4)) {
    const s = SPOT_BY_FISH[fish.id]
    if (!s || seen.has(s.spot)) continue
    seen.add(s.spot)
    spots.push({ fish: fish.name, icon: s.icon, spot: s.spot, depth: s.depth })
  }

  // Dica extra baseada no tipo do trecho (represa vs rio livre)
  if (zone?.type === 'represa') {
    spots.push({ fish: null, icon: '⚓', spot: 'Em represas: explore as curvas de nível — peixes seguem as bordas da bacia antiga do rio', depth: 'Varia' })
  } else if (zone?.type === 'rio') {
    spots.push({ fish: null, icon: '🌀', spot: 'Em trecho livre: pesque logo abaixo de corredeiras — oxigênio alto atrai peixes', depth: 'Médio' })
  }

  return spots
}

// Calcula os melhores horários do dia para pescar
export function getBestHours(weather) {
  const hours = []
  // Amanhecer e entardecer são melhores - peixes se alimentam mais
  hours.push({ time: '05:30 - 08:00', reason: 'Amanhecer', quality: 'Ótimo' })
  hours.push({ time: '17:00 - 19:30', reason: 'Entardecer', quality: 'Ótimo' })
  if (weather?.temperature && weather.temperature > 24) {
    hours.push({ time: '10:00 - 12:00', reason: 'Antes do calor', quality: 'Bom' })
  } else {
    hours.push({ time: '10:00 - 12:00', reason: 'Manhã', quality: 'Bom' })
  }
  return hours
}
