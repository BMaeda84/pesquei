import { useState, useMemo } from 'react'
import { getFishByZoneAndHour, getNearestZone } from '../data/fishData'

function BaitTag({ type }) {
  return <span className={`bait-tag bait-${type}`}>{type === 'artificial' ? 'Artificial' : 'Natural'}</span>
}

function ProminentBadge() {
  return <span className="fish-badge-prominent">Destaque aqui</span>
}

function FishCard({ fish, isActive, isProminent }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`fish-card ${isActive ? 'fish-active' : 'fish-inactive'} ${isProminent ? 'fish-prominent' : ''}`}>
      <div className="fish-card-header" onClick={() => setOpen(!open)}>
        <div className="fish-name-row">
          <span className="fish-emoji">{fish.icon}</span>
          <div>
            <div className="fish-name">{fish.name}</div>
            <div className="fish-peak">{fish.peak}</div>
          </div>
        </div>
        <div className="fish-header-right">
          {isProminent && <ProminentBadge />}
          {isActive && !isProminent && <span className="fish-badge-active">Ativo agora</span>}
          <span className="fish-chevron">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div className="fish-details">
          <p className="fish-desc">{fish.description}</p>

          <div className="fish-section-title">Iscas recomendadas</div>
          <div className="baits-list">
            {fish.baits.map((b, i) => (
              <div key={i} className="bait-item">
                <div className="bait-name-row">
                  <span className="bait-name">{b.name}</span>
                  <BaitTag type={b.type} />
                </div>
                <p className="bait-tip">{b.tip}</p>
              </div>
            ))}
          </div>

          <div className="fish-section-title">Técnica</div>
          <p className="fish-technique">{fish.technique}</p>
        </div>
      )}
    </div>
  )
}

export default function FishGuide({ location }) {
  const [selectedHour, setSelectedHour] = useState(new Date().getHours())

  // Zona mais próxima baseada no GPS/ponto marcado
  const zone = useMemo(() => getNearestZone(location?.lat, location?.lng), [location])

  const { active, inactive } = useMemo(
    () => getFishByZoneAndHour(selectedHour, zone),
    [selectedHour, zone]
  )

  const hourLabel = `${String(selectedHour).padStart(2, '0')}:00`
  const prominentIds = zone?.prominentFish ?? []

  return (
    <div className="fish-guide">
      <div className="guide-header">
        <h2>Guia de Peixes</h2>
        {zone
          ? <p className="guide-subtitle">📍 {zone.name}</p>
          : <p className="guide-subtitle">Rio Tietê — interior de SP</p>
        }
        {!location && (
          <p className="guide-no-location">Marque um ponto no mapa para ver as espécies do seu trecho</p>
        )}
      </div>

      <div className="hour-selector">
        <label className="hour-label">Horário: <strong>{hourLabel}</strong></label>
        <input
          type="range"
          min="0" max="23"
          value={selectedHour}
          onChange={e => setSelectedHour(parseInt(e.target.value))}
          className="hour-range"
        />
        <div className="hour-marks">
          <span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span>
        </div>
      </div>

      <div className="active-count">
        🎣 {active.length} espécie{active.length !== 1 ? 's' : ''} ativa{active.length !== 1 ? 's' : ''} às {hourLabel}
        {zone && <span className="zone-type-badge">{zone.type === 'represa' ? '🏞️ Represa' : '🌊 Rio'}</span>}
      </div>

      <div className="fish-list">
        {active.map(f => (
          <FishCard
            key={f.id}
            fish={f}
            isActive
            isProminent={prominentIds.includes(f.id)}
          />
        ))}
        {inactive.length > 0 && (
          <>
            <div className="fish-section-divider">Menos ativos neste horário</div>
            {inactive.map(f => (
              <FishCard
                key={f.id}
                fish={f}
                isActive={false}
                isProminent={prominentIds.includes(f.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
