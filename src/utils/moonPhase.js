// Calcula fase da lua sem internet - baseado em ciclo sinódico de 29.53 dias
export function getMoonPhase(date = new Date()) {
  const known = new Date(2000, 0, 6, 18, 14) // lua nova conhecida: 6 jan 2000
  const synodicMonth = 29.530588853
  const diff = (date - known) / (1000 * 60 * 60 * 24)
  const phase = ((diff % synodicMonth) + synodicMonth) % synodicMonth
  return phase
}

export function getMoonPhaseName(phase) {
  if (phase < 1.85) return { name: 'Lua Nova', icon: '🌑', score: 8 }
  if (phase < 7.38) return { name: 'Crescente', icon: '🌒', score: 6 }
  if (phase < 9.22) return { name: 'Quarto Crescente', icon: '🌓', score: 7 }
  if (phase < 14.77) return { name: 'Crescente Gibosa', icon: '🌔', score: 5 }
  if (phase < 16.61) return { name: 'Lua Cheia', icon: '🌕', score: 9 }
  if (phase < 22.15) return { name: 'Minguante Gibosa', icon: '🌖', score: 5 }
  if (phase < 24.00) return { name: 'Quarto Minguante', icon: '🌗', score: 7 }
  if (phase < 29.53) return { name: 'Minguante', icon: '🌘', score: 6 }
  return { name: 'Lua Nova', icon: '🌑', score: 8 }
}

// Lua nova e cheia são os melhores momentos para pesca
export function getMoonScore(date = new Date()) {
  const phase = getMoonPhase(date)
  return getMoonPhaseName(phase)
}
