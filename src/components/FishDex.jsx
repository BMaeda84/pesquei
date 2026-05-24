import { useState, useEffect, useMemo } from 'react'
import { FISH } from '../data/fishData'
import { getDiaryEntries, saveDiaryEntry, deleteDiaryEntry } from '../utils/cache'
import CameraCapture from './CameraCapture'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
dayjs.locale('pt-br')

// ── Card do grid ──────────────────────────────────────────
function DexCard({ fish, catches, onClick }) {
  const caught = catches.length > 0
  return (
    <div className={`dex-card ${caught ? 'dex-caught' : 'dex-unseen'}`} onClick={onClick}>
      <span className="dex-num">#{fish.dex}</span>
      {caught && <span className="dex-catch-badge">{catches.length}×</span>}
      <div className={`dex-sprite ${caught ? '' : 'dex-silhouette'}`}>
        {fish.icon}
      </div>
      <div className="dex-card-name">{caught ? fish.name : '???'}</div>
    </div>
  )
}

// ── Formulário de nova captura ────────────────────────────
function CatchForm({ fish, prefill, onSave, onCancel }) {
  const [form, setForm] = useState({
    species: prefill?.especie || fish?.name || '',
    quantity: 1,
    weight: prefill?.peso_estimado?.match(/[\d,.]+/)?.[0] || '',
    notes: '',
    rating: 4,
  })

  // Se a IA identificou outra espécie do nosso dex, usa ela; senão mantém o peixe selecionado
  const speciesOptions = FISH.map(f => f.name)

  return (
    <div className="catch-form">
      <h3 className="catch-form-title">📝 Registrar captura</h3>

      <label className="form-label">Espécie
        <select
          value={form.species}
          onChange={e => setForm({ ...form, species: e.target.value })}
        >
          {speciesOptions.map(s => <option key={s}>{s}</option>)}
          <option value="Outro">Outro</option>
        </select>
      </label>

      <div className="form-row">
        <label className="form-label">Qtd
          <input
            type="number" min="1" value={form.quantity}
            onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
          />
        </label>
        <label className="form-label">Peso (kg)
          <input
            type="number" step="0.1" placeholder="Opcional"
            value={form.weight}
            onChange={e => setForm({ ...form, weight: e.target.value })}
          />
        </label>
      </div>

      <label className="form-label">Avaliação do dia
        <div className="rating-stars">
          {[1,2,3,4,5].map(n => (
            <span
              key={n}
              className={`star ${n <= form.rating ? 'active' : ''}`}
              onClick={() => setForm({ ...form, rating: n })}
            >★</span>
          ))}
        </div>
      </label>

      <label className="form-label">Observações
        <textarea
          placeholder="Isca usada, local exato, condições..."
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
        />
      </label>

      <div className="form-actions">
        <button className="btn-primary btn-full" onClick={() => onSave(form)}>Salvar captura</button>
        <button className="btn-secondary btn-full" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

// ── Painel de detalhe do peixe ────────────────────────────
function DexDetail({ fish, catches, onClose, onRefresh }) {
  const [mode, setMode] = useState('info') // 'info' | 'camera' | 'form'
  const [prefill, setPrefill] = useState(null)
  const caught = catches.length > 0

  async function handleSave(form) {
    await saveDiaryEntry({ ...form, date: new Date().toISOString() })
    await onRefresh()
    setMode('info')
    setPrefill(null)
  }

  async function handleDelete(id) {
    await deleteDiaryEntry(id)
    await onRefresh()
  }

  function handleIdentified(result) {
    setPrefill(result)
    setMode('form')
  }

  return (
    <div className="dex-detail-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="dex-detail">
        <button className="dex-close" onClick={onClose}>✕</button>

        {/* Hero */}
        <div className="detail-hero">
          <div className="detail-num">#{fish.dex}</div>
          <div className={`detail-sprite ${caught ? 'detail-sprite-glow' : 'dex-silhouette'}`}>
            {caught ? fish.icon : '❓'}
          </div>
          <h2 className="detail-name">{caught ? fish.name : '???'}</h2>
          {caught && <p className="detail-desc">{fish.description}</p>}
        </div>

        {/* Conteúdo por modo */}
        {mode === 'info' && (
          <>
            {caught ? (
              <>
                {/* Stats */}
                <div className="detail-stats">
                  <div className="stat-box">
                    <span className="stat-n">{catches.length}</span>
                    <span className="stat-l">saídas</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-n">{catches.reduce((s, e) => s + (Number(e.quantity) || 1), 0)}</span>
                    <span className="stat-l">peixes</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-n">
                      {catches.filter(e => e.weight).length > 0
                        ? Math.max(...catches.filter(e => e.weight).map(e => parseFloat(e.weight))) + 'kg'
                        : '—'}
                    </span>
                    <span className="stat-l">maior</span>
                  </div>
                </div>

                {/* Melhor isca */}
                <div className="detail-section">
                  <div className="detail-section-label">Melhor isca</div>
                  <div className="detail-bait-chip">
                    🪱 {fish.baits[0].name}
                    <span className="detail-bait-tip"> — {fish.baits[0].tip}</span>
                  </div>
                </div>

                {/* Horários */}
                <div className="detail-section">
                  <div className="detail-section-label">Melhor horário</div>
                  <div className="detail-peak">🕐 {fish.peak}</div>
                </div>

                {/* Histórico */}
                <div className="detail-section">
                  <div className="detail-section-label">Histórico de capturas</div>
                  <div className="detail-history">
                    {catches.slice(0, 6).map((e, i) => (
                      <div key={i} className="history-row">
                        <span className="history-date">{dayjs(e.date || e.createdAt).format('DD MMM YY')}</span>
                        <span className="history-qty">{e.quantity}× {e.weight ? `· ${e.weight}kg` : ''}</span>
                        <span className="history-stars">{'★'.repeat(e.rating)}{'☆'.repeat(5 - e.rating)}</span>
                        <button className="history-del" onClick={() => handleDelete(e.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="detail-locked">
                <p>Registre sua primeira captura desta espécie para desbloquear informações!</p>
                <div className="detail-hint-chips">
                  <span>⏰ {fish.peak}</span>
                  <span>🎣 {fish.baits[0].name}</span>
                </div>
              </div>
            )}

            <div className="detail-actions">
              <button className="btn-camera-big" onClick={() => setMode('camera')}>
                📸 Fotografar e identificar
              </button>
              <button className="btn-primary btn-full" onClick={() => { setPrefill(null); setMode('form') }}>
                ✏️ Registrar manualmente
              </button>
            </div>
          </>
        )}

        {mode === 'camera' && (
          <CameraCapture
            onIdentified={handleIdentified}
            onSkip={() => { setPrefill(null); setMode('form') }}
          />
        )}

        {mode === 'form' && (
          <CatchForm
            fish={fish}
            prefill={prefill}
            onSave={handleSave}
            onCancel={() => setMode('info')}
          />
        )}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────
export default function FishDex() {
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)

  async function loadEntries() {
    setEntries(await getDiaryEntries())
  }

  useEffect(() => { loadEntries() }, [])

  const catchesByFish = useMemo(() => {
    const map = {}
    for (const fish of FISH) {
      map[fish.id] = entries.filter(e =>
        e.species?.toLowerCase().includes(fish.name.toLowerCase().split('/')[0].trim().toLowerCase())
      )
    }
    return map
  }, [entries])

  const totalCaught = Object.values(catchesByFish).filter(c => c.length > 0).length
  const selectedFish = selected ? FISH.find(f => f.id === selected) : null

  return (
    <div className="fishdex">
      {/* Cabeçalho estilo Pokédex */}
      <div className="dex-header">
        <div className="dex-title-area">
          <span className="dex-title-pre">Tietê</span>
          <span className="dex-title-main">DEX</span>
        </div>
        <div className="dex-progress-area">
          <div className="dex-progress-bar">
            <div
              className="dex-progress-fill"
              style={{ width: `${(totalCaught / FISH.length) * 100}%` }}
            />
          </div>
          <span className="dex-progress-label">
            {totalCaught}/{FISH.length} capturados
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="dex-grid">
        {FISH.map(fish => (
          <DexCard
            key={fish.id}
            fish={fish}
            catches={catchesByFish[fish.id] || []}
            onClick={() => setSelected(fish.id)}
          />
        ))}
      </div>

      {/* Dica para novos usuários */}
      {totalCaught === 0 && (
        <div className="dex-empty-hint">
          <span>🎣</span>
          <p>Registre suas capturas para desbloquear o Tietê Dex!</p>
        </div>
      )}

      {/* Painel de detalhe */}
      {selectedFish && (
        <DexDetail
          fish={selectedFish}
          catches={catchesByFish[selectedFish.id] || []}
          onClose={() => setSelected(null)}
          onRefresh={loadEntries}
        />
      )}
    </div>
  )
}
