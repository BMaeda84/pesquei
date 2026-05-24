import { useState, useRef } from 'react'

const AVATARS = ['🧑‍🎣', '👴', '👩‍🎣', '🤠', '🎣', '🐟']

export default function ProfileSetup({ onSave, onCancel, initial }) {
  const [name, setName] = useState(initial?.name || '')
  const [river, setRiver] = useState(initial?.river || '')
  const [avatar, setAvatar] = useState(initial?.avatar || AVATARS[0])
  const [photoData, setPhotoData] = useState(initial?.photoData || null)
  const [cameraError, setCameraError] = useState(false)
  const fileRef = useRef()
  const isEdit = !!initial

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      // Reduz para max 120px (avatar pequeno)
      const size = Math.min(img.width, img.height, 120)
      canvas.width = size; canvas.height = size
      const ctx = canvas.getContext('2d')
      const sx = (img.width - size) / 2
      const sy = (img.height - size) / 2
      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)
      setPhotoData(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => setCameraError(true)
    img.src = URL.createObjectURL(file)
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
              >
                📷 Usar selfie
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
      </div>
    </div>
  )
}
