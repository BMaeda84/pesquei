import { useState, useEffect } from 'react'
import { getSpots, saveSpot, deleteSpot } from '../utils/cache'

// Redimensiona imagem para max 400px antes de salvar (SAST-06: evita lotar o IndexedDB)
async function resizePhoto(file, maxPx = 400) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img  = new Image()
    img.onload = () => {
      const ratio  = Math.min(maxPx / img.width, maxPx / img.height, 1)
      const w      = Math.round(img.width  * ratio)
      const h      = Math.round(img.height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.80))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('erro ao ler foto')) }
    img.src = url
  })
}

// ── Formulário inline de novo spot ────────────────────────────────────────
function SpotForm({ pendingLoc, onSaved, onCancel }) {
  const [name,     setName]     = useState('')
  const [notes,    setNotes]    = useState('')
  const [photo,    setPhoto]    = useState(null)   // base64
  const [saving,   setSaving]   = useState(false)

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const resized = await resizePhoto(file)
      setPhoto(resized)
    } catch { /* ignora */ }
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await saveSpot({
        name:      name.trim(),
        notes:     notes.trim(),
        lat:       pendingLoc.lat,
        lng:       pendingLoc.lng,
        photoData: photo,
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="spot-form">
      <div className="spot-form-title">📌 Salvar ponto</div>
      <p className="spot-form-coords">
        {pendingLoc.lat.toFixed(5)}, {pendingLoc.lng.toFixed(5)}
      </p>

      <label className="form-label">
        Nome do ponto <span className="form-hint-inline">(obrigatório)</span>
        <input
          type="text"
          placeholder='Ex: "Morro do Bonito — 300m da ponte"'
          maxLength={50}
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </label>

      <label className="form-label">
        Observações <span className="form-hint-inline">(opcional)</span>
        <textarea
          placeholder="Profundidade, isca que funcionou, espécies vistas…"
          maxLength={300}
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </label>

      {/* Foto opcional */}
      {photo ? (
        <div className="spot-photo-preview">
          <img src={photo} className="spot-photo-img" alt="Foto do ponto" />
          <button className="btn-tiny" onClick={() => setPhoto(null)}>✕</button>
        </div>
      ) : (
        <label className="btn-secondary btn-sm spot-photo-btn">
          📷 Foto do local (opcional)
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        </label>
      )}

      <div className="form-actions">
        <button
          className="btn-primary btn-full"
          onClick={handleSave}
          disabled={!name.trim() || saving}
        >
          {saving ? 'Salvando…' : '💾 Salvar ponto'}
        </button>
        <button className="btn-secondary btn-full" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

// ── Card de um spot salvo ──────────────────────────────────────────────────
function SpotCard({ spot, onDelete, onFocus }) {
  const [confirm, setConfirm] = useState(false)

  const mapsUrl = `https://maps.google.com/maps?q=${spot.lat},${spot.lng}`

  return (
    <div className="spot-card" onClick={() => onFocus(spot)}>
      {spot.photoData && (
        <img src={spot.photoData} className="spot-card-photo" alt="" />
      )}
      <div className="spot-card-body">
        <div className="spot-card-name">📍 {spot.name}</div>
        {spot.notes && <div className="spot-card-notes">{spot.notes}</div>}
        <div className="spot-card-coords">
          {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
        </div>
        <div className="spot-card-actions">
          <a
            className="btn-tiny spot-maps-btn"
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            🗺️ Abrir no Maps
          </a>
          {confirm ? (
            <span className="spot-confirm-del">
              Apagar?{' '}
              <button
                className="btn-tiny btn-danger"
                onClick={e => { e.stopPropagation(); onDelete(spot.id) }}
              >Sim</button>{' '}
              <button
                className="btn-tiny"
                onClick={e => { e.stopPropagation(); setConfirm(false) }}
              >Não</button>
            </span>
          ) : (
            <button
              className="btn-tiny"
              onClick={e => { e.stopPropagation(); setConfirm(true) }}
            >✕</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────
export default function SavedSpots({ pendingLoc, onClearPending, onFocusSpot }) {
  const [spots,    setSpots]    = useState([])
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setSpots(await getSpots())
  }

  useEffect(() => { load() }, [])

  async function handleSaved() {
    await load()
    setShowForm(false)
    onClearPending?.()
  }

  async function handleDelete(id) {
    await deleteSpot(id)
    await load()
  }

  return (
    <div className="saved-spots">
      {/* CTA para salvar a localização atual como ponto */}
      {pendingLoc && !showForm && (
        <button className="btn-primary btn-full spot-save-cta" onClick={() => setShowForm(true)}>
          📌 Salvar este ponto
        </button>
      )}

      {showForm && pendingLoc && (
        <SpotForm
          pendingLoc={pendingLoc}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {spots.length > 0 && (
        <>
          <div className="spots-list-title">Meus pontos salvos</div>
          <div className="spots-list">
            {spots.map(s => (
              <SpotCard
                key={s.id}
                spot={s}
                onDelete={handleDelete}
                onFocus={onFocusSpot}
              />
            ))}
          </div>
        </>
      )}

      {spots.length === 0 && !pendingLoc && (
        <div className="spots-empty">
          <p>Toque no mapa para marcar um local e salve-o como ponto de pesca.</p>
        </div>
      )}
    </div>
  )
}
