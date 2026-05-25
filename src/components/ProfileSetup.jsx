import { useState, useRef } from 'react'
import BackupRestore from './BackupRestore'

const AVATARS = ['🧑‍🎣', '👴', '👩‍🎣', '🤠', '🎣', '🐟']
const AVATAR_OUTPUT_SIZE = 120

// Detecta rosto via FaceDetector API (Chrome/Android) ou usa heurística
// para selfie (rosto tende ao terço superior-central da imagem)
async function detectFaceCrop(img) {
  const { width, height } = img

  if (typeof window.FaceDetector !== 'undefined') {
    try {
      const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
      const faces = await detector.detect(img)
      if (faces.length > 0) {
        const bb = faces[0].boundingBox
        const faceW = bb.width
        const faceH = bb.height
        const faceCx = bb.x + faceW / 2
        const faceCy = bb.y + faceH / 2

        // Crop quadrado com padding de ~80% ao redor do rosto
        let cropSize = Math.max(faceW, faceH) * 1.8
        cropSize = Math.min(cropSize, Math.min(width, height))

        let sx = faceCx - cropSize / 2
        let sy = faceCy - cropSize / 2
        sx = Math.max(0, Math.min(sx, width  - cropSize))
        sy = Math.max(0, Math.min(sy, height - cropSize))

        return { sx, sy, cropSize }
      }
    } catch { /* FaceDetector falhou, usa fallback */ }
  }

  // Fallback heurístico: rosto de selfie fica no terço superior-central
  const cropSize = Math.min(width, height)
  const sx = (width - cropSize) / 2
  // Desloca para cima: começa em ~8% do topo em vez do centro
  const sy = height > width
    ? Math.max(0, height * 0.08)           // retrato: puxa para cima
    : Math.max(0, (height - cropSize) / 2) // paisagem: centra
  return { sx, sy, cropSize }
}

export default function ProfileSetup({ onSave, onCancel, initial }) {
  const [name, setName] = useState(initial?.name || '')
  const [river, setRiver] = useState(initial?.river || '')
  const [avatar, setAvatar] = useState(initial?.avatar || AVATARS[0])
  const [photoData, setPhotoData] = useState(initial?.photoData || null)
  const [cameraError, setCameraError] = useState(false)
  const [processing, setProcessing] = useState(false)
  const fileRef = useRef()
  const isEdit = !!initial

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setProcessing(true)
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = async () => {
      try {
        const { sx, sy, cropSize } = await detectFaceCrop(img)
        const canvas = document.createElement('canvas')
        canvas.width  = AVATAR_OUTPUT_SIZE
        canvas.height = AVATAR_OUTPUT_SIZE
        canvas.getContext('2d').drawImage(img, sx, sy, cropSize, cropSize, 0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE)
        setPhotoData(canvas.toDataURL('image/jpeg', 0.85))
      } catch {
        setCameraError(true)
      } finally {
        URL.revokeObjectURL(objectUrl)
        setProcessing(false)
      }
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); setCameraError(true); setProcessing(false) }
    img.src = objectUrl
  }

  function handleSave() {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      river: river.trim() || 'Meu Rio',
      avatar,
      photoData: photoData || null,
    })
  }

  return (
    <div className="profile-setup-overlay">
      <div className="profile-setup">
        <h2 className="profile-setup-title">{isEdit ? '✏️ Editar perfil' : '🎣 Bem-vindo ao Pesquei!'}</h2>
        <p className="profile-setup-sub">{isEdit ? 'Atualize seus dados de pescador' : 'Configure seu perfil de pescador'}</p>

        {/* Avatar / foto */}
        <div className="avatar-section">
          {photoData ? (
            <div className="avatar-preview-wrap">
              <img src={photoData} className="avatar-preview-img" alt="Foto" />
              <button className="btn-tiny" onClick={() => setPhotoData(null)}>✕</button>
            </div>
          ) : (
            <div className="avatar-grid">
              {AVATARS.map(a => (
                <button
                  key={a}
                  className={`avatar-option ${avatar === a ? 'selected' : ''}`}
                  onClick={() => setAvatar(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          )}

          {!photoData && (
            <>
              <button
                className="btn-secondary btn-sm"
                onClick={() => fileRef.current?.click()}
                disabled={processing}
              >
                {processing ? 'Detectando rosto…' : '📷 Usar selfie'}
              </button>
              {cameraError && <p className="form-hint">Câmera não disponível</p>}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="user"
                style={{ display: 'none' }}
                onChange={handlePhoto}
              />
            </>
          )}
        </div>

        {/* Nome */}
        <label className="form-label">
          Seu nome
          <input
            type="text"
            placeholder="Ex: João"
            value={name}
            maxLength={30}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        </label>

        {/* Rio */}
        <label className="form-label">
          Seu rio / represa <span className="form-hint-inline">(opcional)</span>
          <input
            type="text"
            placeholder="Ex: Rio Tietê, Represa Bariri…"
            value={river}
            maxLength={40}
            onChange={e => setRiver(e.target.value)}
          />
        </label>

        <button
          className="btn-primary btn-full"
          onClick={handleSave}
          disabled={!name.trim()}
        >
          {isEdit ? 'Salvar alterações' : 'Entrar na pescaria 🎣'}
        </button>

        {isEdit && onCancel && (
          <button className="btn-secondary btn-full" onClick={onCancel}>
            Cancelar
          </button>
        )}

        {/* Backup & Restauração — disponível no setup inicial (trocar de celular)
            e no modo de edição do perfil */}
        <BackupRestore onRestored={onCancel} />
      </div>
    </div>
  )
}
