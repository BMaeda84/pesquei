import { useState, useEffect } from 'react'
import { getCache, setCache } from '../utils/cache'

// Busca nível do rio via proxy Vercel (contorna CORS da ANA)
// Em desenvolvimento usa dados simulados
export function useRiverLevel(lat, lon) {
  const [riverLevel, setRiverLevel] = useState(null)
  const [previousLevel, setPreviousLevel] = useState(null)
  const [stationName, setStationName] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!lat || !lon) return

    async function fetchRiverLevel() {
      setLoading(true)
      const cacheKey = `river-${lat.toFixed(2)}-${lon.toFixed(2)}`

      const cached = await getCache(cacheKey)
      if (cached) {
        setRiverLevel(cached.level)
        setPreviousLevel(cached.previousLevel)
        setStationName(cached.stationName)
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/nivel-rio?lat=${lat}&lon=${lon}`)
        const data = await res.json()

        const payload = {
          level: data.level,
          previousLevel: data.previousLevel,
          stationName: data.stationName,
        }

        // Cache por 2 horas
        await setCache(cacheKey, payload, 60 * 60 * 2)
        setRiverLevel(data.level)
        setPreviousLevel(data.previousLevel)
        setStationName(data.stationName)
      } catch {
        // Sem internet ou API indisponível — usa cache antigo sem TTL
        const old = await getCache(cacheKey + '-stale')
        if (old) {
          setRiverLevel(old.level)
          setPreviousLevel(old.previousLevel)
          setStationName(old.stationName + ' (cache)')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRiverLevel()
  }, [lat, lon])

  return { riverLevel, previousLevel, stationName, loading }
}
