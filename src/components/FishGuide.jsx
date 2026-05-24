import { useState, useMemo } from 'react'
import { FISH, getFishByHour } from '../data/fishData'

function BaitTag({ type }) {
  return <span className={`bait-tag bait-${type}`}>{type === 'artificial' ? 'Artificial' : 'Natural'}</span>
}

function FishCard({ fish, isActive }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`fish-card ${isActive ? 'fish-active' : 'fish-inactive'}`}>
      <div className="fish-card-header" onClick={() => setOpen(!open)}>
        <div className="fish-name-row">
          <span className="fish-emoji">{fish.icon}</span>
          <div>
            <div className="fish-name">{fish.name}</div>
            <div className="fish-peak">{fish.peak}</div>
          </div>
        </div>
        <div className="fish-header-right">
          {isActive && <span className="fish-badge-active">Ativo agora</span>}
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

export default function FishGuide() {
  const [selectedHour, setSelectedHour] = useState(new Date().getHours())
  const { active, inactive } = useMemo(() => getFishByHour(selectedHour), [selectedHour])

  const hourLabel = `${String(selectedHour).padStart(2, '0')}:00`

  return (
    <div className="fish-guide">
      <div className="guide-header">
        <h2>Guia de Peixes</h2>
        <p className="guide-subtitle">Rio Tietê — interior de SP</p>
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
      </div>

      <div className="fish-list">
        {active.map(f => <FishCard key={f.id} fish={f} isActive />)}
        {inactive.length > 0 && (
          <>
            <div className="fish-section-divider">Menos ativos neste horário</div>
            {inactive.map(f => <FishCard key={f.id} fish={f} isActive={false} />)}
          </>
        )}
      </div>
    </div>
  )
}
