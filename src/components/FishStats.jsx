// Histórico de pescarias — visualização temporal dos registros do diário
// Totalmente client-side, sem dependência de bibliotecas de gráfico.

import { useMemo } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
dayjs.locale('pt-br')

// ── Barra CSS simples ──────────────────────────────────────────────────────
function Bar({ value, max, color = '#67e8f2', label, sublabel }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="stat-bar-row">
      <div className="stat-bar-label">{label}</div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="stat-bar-val">{sublabel ?? value}</div>
    </div>
  )
}

export default function FishStats({ entries }) {
  // ── Totais gerais ────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const totalFish  = entries.reduce((s, e) => s + (Number(e.quantity) || 1), 0)
    const sessions   = new Set(entries.map(e =>
      new Date(e.date || e.createdAt).toDateString()
    )).size
    const species    = new Set(entries.map(e => e.species)).size
    const verified   = entries.filter(e => e.verified).length
    const bestWeight = entries
      .filter(e => e.weight)
      .reduce((m, e) => Math.max(m, parseFloat(e.weight) || 0), 0)

    return { totalFish, sessions, species, verified, bestWeight }
  }, [entries])

  // ── Por espécie ──────────────────────────────────────────────────────
  const bySpecies = useMemo(() => {
    const map = {}
    for (const e of entries) {
      const sp = e.species || 'Outro'
      map[sp] = (map[sp] || 0) + (Number(e.quantity) || 1)
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
  }, [entries])

  // ── Por mês (últimos 6 meses) ────────────────────────────────────────
  const byMonth = useMemo(() => {
    const map = {}
    const now = dayjs()
    // Inicializa 6 meses, do mais antigo ao mais recente
    for (let i = 5; i >= 0; i--) {
      const key = now.subtract(i, 'month').format('MMM/YY')
      map[key] = 0
    }
    for (const e of entries) {
      const key = dayjs(e.date || e.createdAt).format('MMM/YY')
      if (key in map) map[key] += (Number(e.quantity) || 1)
    }
    return Object.entries(map)
  }, [entries])

  // ── Por hora do dia ──────────────────────────────────────────────────
  const byHour = useMemo(() => {
    const slots = [
      { label: '🌙 Madrugada (0–5h)',    hours: [0,1,2,3,4],      count: 0 },
      { label: '🌅 Amanhecer (5–8h)',    hours: [5,6,7],          count: 0 },
      { label: '☀️ Manhã (8–12h)',       hours: [8,9,10,11],      count: 0 },
      { label: '🌤️ Tarde (12–17h)',      hours: [12,13,14,15,16], count: 0 },
      { label: '🌇 Entardecer (17–20h)', hours: [17,18,19],       count: 0 },
      { label: '🌙 Noite (20–24h)',      hours: [20,21,22,23],    count: 0 },
    ]
    for (const e of entries) {
      const h = new Date(e.date || e.createdAt).getHours()
      const slot = slots.find(s => s.hours.includes(h))
      if (slot) slot.count += (Number(e.quantity) || 1)
    }
    return slots
  }, [entries])

  const maxSpecies = bySpecies[0]?.[1] ?? 1
  const maxMonth   = Math.max(...byMonth.map(([,v]) => v), 1)
  const maxHour    = Math.max(...byHour.map(s => s.count), 1)

  if (entries.length === 0) {
    return (
      <div className="stats-empty">
        <p>Sem registros ainda.</p>
        <p>Vá ao PeixeDEX e registre sua primeira captura! 🎣</p>
      </div>
    )
  }

  return (
    <div className="fish-stats">
      {/* Cartões de totais */}
      <div className="stats-totals">
        <div className="stat-chip">
          <span className="stat-chip-n">{totals.totalFish}</span>
          <span className="stat-chip-l">peixes</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-n">{totals.sessions}</span>
          <span className="stat-chip-l">saídas</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-n">{totals.species}</span>
          <span className="stat-chip-l">espécies</span>
        </div>
        {totals.bestWeight > 0 && (
          <div className="stat-chip">
            <span className="stat-chip-n">{totals.bestWeight}kg</span>
            <span className="stat-chip-l">recorde</span>
          </div>
        )}
        {totals.verified > 0 && (
          <div className="stat-chip">
            <span className="stat-chip-n">{totals.verified}</span>
            <span className="stat-chip-l">📸 c/ IA</span>
          </div>
        )}
      </div>

      {/* Por espécie */}
      {bySpecies.length > 0 && (
        <div className="stats-section">
          <div className="stats-section-title">🐟 Por espécie</div>
          {bySpecies.map(([sp, cnt]) => (
            <Bar key={sp} label={sp} value={cnt} max={maxSpecies}
                 color="#67e8f2" sublabel={`${cnt}×`} />
          ))}
        </div>
      )}

      {/* Por mês */}
      <div className="stats-section">
        <div className="stats-section-title">📅 Últimos 6 meses</div>
        {byMonth.map(([mon, cnt]) => (
          <Bar key={mon} label={mon} value={cnt} max={maxMonth}
               color="#4ade80" sublabel={cnt > 0 ? `${cnt}` : '—'} />
        ))}
      </div>

      {/* Por horário */}
      <div className="stats-section">
        <div className="stats-section-title">🕐 Por horário</div>
        {byHour.map(s => (
          <Bar key={s.label} label={s.label} value={s.count} max={maxHour}
               color="#f59e0b" sublabel={s.count > 0 ? `${s.count}` : '—'} />
        ))}
      </div>
    </div>
  )
}
