import { useState, useEffect } from 'react'
import { saveDiaryEntry, getDiaryEntries, deleteDiaryEntry } from '../utils/cache'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
dayjs.locale('pt-br')

const SPECIES = ['Tilápia', 'Carpa', 'Pacu', 'Tucunaré', 'Bagre', 'Traíra', 'Lambari', 'Outro']

export default function Diary({ location }) {
  const [entries, setEntries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ species: 'Tilápia', quantity: 1, weight: '', notes: '', rating: 3 })

  useEffect(() => {
    getDiaryEntries().then(setEntries)
  }, [])

  async function handleSave() {
    await saveDiaryEntry({
      ...form,
      lat: location?.lat,
      lng: location?.lng,
      date: new Date().toISOString(),
    })
    setEntries(await getDiaryEntries())
    setShowForm(false)
    setForm({ species: 'Tilápia', quantity: 1, weight: '', notes: '', rating: 3 })
  }

  async function handleDelete(id) {
    await deleteDiaryEntry(id)
    setEntries(await getDiaryEntries())
  }

  return (
    <div className="diary">
      <div className="diary-header">
        <h2>Diário de Pesca</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Registrar'}
        </button>
      </div>

      {showForm && (
        <div className="diary-form">
          <label>Espécie
            <select value={form.species} onChange={e => setForm({ ...form, species: e.target.value })}>
              {SPECIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>Quantidade
            <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })} />
          </label>
          <label>Peso estimado (kg)
            <input type="number" step="0.1" placeholder="opcional" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
          </label>
          <label>Avaliação do dia
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(n => (
                <span key={n} className={`star ${n <= form.rating ? 'active' : ''}`} onClick={() => setForm({ ...form, rating: n })}>★</span>
              ))}
            </div>
          </label>
          <label>Observações
            <textarea placeholder="Isca usada, condições, spots..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </label>
          <button className="btn-primary btn-save" onClick={handleSave}>Salvar registro</button>
        </div>
      )}

      {entries.length === 0 && !showForm && (
        <div className="diary-empty">
          <span>🐟</span>
          <p>Nenhuma pescaria registrada ainda. Comece agora!</p>
        </div>
      )}

      <div className="entries-list">
        {entries.map(entry => (
          <div key={entry.id} className="entry-card">
            <div className="entry-top">
              <span className="entry-species">{entry.species}</span>
              <span className="entry-date">{dayjs(entry.date).format('DD MMM YYYY')}</span>
            </div>
            <div className="entry-details">
              <span>🎣 {entry.quantity} peixe{entry.quantity > 1 ? 's' : ''}</span>
              {entry.weight && <span>⚖️ {entry.weight} kg</span>}
              <span>{'★'.repeat(entry.rating)}{'☆'.repeat(5 - entry.rating)}</span>
            </div>
            {entry.notes && <p className="entry-notes">{entry.notes}</p>}
            <button className="btn-delete" onClick={() => handleDelete(entry.id)}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  )
}
