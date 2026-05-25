// Previsão de 3 dias usando Open-Meteo (mesma fonte do clima atual, sem CORS)
// Calcula o índice de pesca para cada dia futuro com os mesmos pesos do dashboard.

import { useState, useEffect } from 'react'
import { getCache, setCache } from '../utils/cache'
import { getMoonScore } from '../utils/moonPhase'
import { calcFishingIndex, getIndexLabel } from '../utils/fishingIndex'

// Mapeia WMO weather code para emoji — Open-Meteo usa o padrão WMO
function weatherEmoji(code) {
  if (code === 0)           return '☀️'
  if (code <= 3)            return '⛅'
  if (code <= 48)           return '🌫️'
  if (code <= 67)           return '🌧️'
  if (code <= 77)           return '❄️'
  if (code <= 82)           return '🌦️'
  return '⛈️'
}

export function useForecast(lat, lon) {
  const [days, setDays]     = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // SAST-04: valida coordenadas antes de enviar (mesmo padrão do nivel-rio.js)
    if (!lat || !lon) return
    if (lat < -35 || lat > 5 || lon < -74 || lon > -28) return

    async function fetch3Days() {
      setLoading(true)
      const cacheKey = `forecast3-${lat.toFixed(3)}-${lon.toFixed(3)}`

      const cached = await getCache(cacheKey)
      if (cached) { setDays(cached); setLoading(false); return }

      try {
        // Pedimos: temperatura máx/mín, precipitação, pressão e código climático
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${lat}&longitude=${lon}` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,` +
          `surface_pressure_msl,weather_code` +
          `&timezone=America%2FSao_Paulo&forecast_days=3`

        const res  = await fetch(url)
        const data = await res.json()

        const result = data.daily.time.map((dateStr, i) => {
          // Temperatura média do dia
          const temp = (data.daily.temperature_2m_max[i] +
                        data.daily.temperature_2m_min[i]) / 2
          const rain     = data.daily.precipitation_sum[i]    ?? 0
          const pressure = data.daily.surface_pressure_msl[i] ?? null
          const code     = data.daily.weather_code[i]         ?? 0

          // Fase da lua para aquele dia específico
          const date      = new Date(dateStr + 'T12:00:00')
          const moonScore = getMoonScore(date)

          // Mesmo algoritmo do dashboard — sem nível do rio (não há previsão)
          const { score } = calcFishingIndex({
            weather: { temperature: temp, rain, pressure },
            riverLevel: null,
            previousRiverLevel: null,
            moonScore,
          })

          const { label, color } = getIndexLabel(score)

          return {
            dateStr,                    // 'YYYY-MM-DD'
            score,
            label,
            color,
            temp: Math.round(temp),
            rain: Math.round(rain * 10) / 10,
            emoji: weatherEmoji(code),
          }
        })

        // Cache por 6h — previsão muda pouco ao longo do dia
        await setCache(cacheKey, result, 60 * 60 * 6)
        setDays(result)
      } catch {
        // Falha silenciosa — previsão é informação supplementar
      } finally {
        setLoading(false)
      }
    }

    fetch3Days()
  }, [lat, lon])

  return { days, loading }
}
