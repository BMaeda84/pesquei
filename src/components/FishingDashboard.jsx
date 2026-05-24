import { useMemo } from 'react'
import { getMoonScore } from '../utils/moonPhase'
import { calcFishingIndex, getIndexLabel, getBestHours } from '../utils/fishingIndex'
import { useWeather } from '../hooks/useWeather'
import { useRiverLevel } from '../hooks/useRiverLevel'

function ScoreRing({ score, color }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const filled = circ * (score / 100)

  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#1e3a2a" strokeWidth="12" />
      <circle
        cx="65" cy="65" r={r} fill="none"
        stroke={color} strokeWidth="12"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 65 65)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x="65" y="60" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold">{score}</text>
      <text x="65" y="80" textAnchor="middle" fill="#86efac" fontSize="11">/100</text>
    </svg>
  )
}

function FactorBadge({ factor }) {
  const colors = { good: '#22c55e', medium: '#f59e0b', bad: '#ef4444' }
  return (
    <div className="factor-badge" style={{ borderColor: colors[factor.status] }}>
      <span className="factor-label">{factor.label}</span>
      <span className="factor-value" style={{ color: colors[factor.status] }}>{factor.value}</span>
    </div>
  )
}

export default function FishingDashboard({ location }) {
  const { weather, loading: wLoading } = useWeather(location?.lat, location?.lng)
  const { riverLevel, previousLevel, stationName } = useRiverLevel(location?.lat, location?.lng)
  const moonScore = useMemo(() => getMoonScore(), [])

  const { score, factors } = useMemo(() =>
    calcFishingIndex({ weather, riverLevel: riverLevel ? parseFloat(riverLevel) : null, previousRiverLevel: previousLevel ? parseFloat(previousLevel) : null, moonScore }),
    [weather, riverLevel, previousLevel, moonScore]
  )

  const { label, color } = getIndexLabel(score)
  const bestHours = useMemo(() => getBestHours(weather), [weather])

  if (!location) {
    return (
      <div className="no-location">
        <span className="fish-emoji">🎣</span>
        <p>Marque o ponto no mapa para ver o índice de pesca</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="score-section">
        <ScoreRing score={score} color={color} />
        <div className="score-info">
          <div className="score-label" style={{ color }}>{label}</div>
          <div className="score-sub">para pescar hoje</div>
          {stationName && <div className="station-name">📍 {stationName}</div>}
        </div>
      </div>

      <div className="moon-bar">
        <span>{moonScore.icon} {moonScore.name}</span>
        {wLoading && <span className="loading-dot">Atualizando...</span>}
      </div>

      <div className="factors-grid">
        {factors.map((f, i) => <FactorBadge key={i} factor={f} />)}
      </div>

      <div className="best-hours">
        <h3>Melhores horários</h3>
        {bestHours.map((h, i) => (
          <div key={i} className="hour-row">
            <span className="hour-time">{h.time}</span>
            <span className="hour-reason">{h.reason}</span>
            <span className={`hour-quality quality-${h.quality === 'Ótimo' ? 'great' : 'good'}`}>{h.quality}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
