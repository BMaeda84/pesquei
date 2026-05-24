import { useState, useEffect } from 'react'
import { getCache, setCache } from '../utils/cache'

// Open-Meteo: gratuito, sem chave de API, CORS liberado
export function useWeather(lat, lon) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lat || !lon) return

    async function fetchWeather() {
      setLoading(true)
      const cacheKey = `weather-${lat.toFixed(3)}-${lon.toFixed(3)}`

      const cached = await getCache(cacheKey)
      if (cached) {
        setWeather(cached)
        setLoading(false)
        return
      }

      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,surface_pressure,rain,wind_speed_10m,weather_code&hourly=temperature_2m,rain&timezone=America%2FSao_Paulo&forecast_days=2`
        const res = await fetch(url)
        const data = await res.json()

        const current = {
          temperature: data.current.temperature_2m,
          pressure: data.current.surface_pressure,
          rain: data.current.rain,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
          hourly: data.hourly,
        }

        // Cache por 3 horas
        await setCache(cacheKey, current, 60 * 60 * 3)
        setWeather(current)
      } catch (e) {
        setError('Sem internet. Usando dados em cache.')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [lat, lon])

  return { weather, loading, error }
}
