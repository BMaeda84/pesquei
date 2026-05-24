import { useState, useRef } from 'react'

// Comprime a imagem via canvas antes de enviar à API
async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 768
        let { width, height } = img
        if (width > height) {
          if (width > MAX) { height = Math.round(height * MAX / width); width = MAX }
        } else {
          if (height > MAX) { width = Math.round(width * MAX / height); height = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve({
          data: canvas.toDataURL('image/jpeg', 0.85).split(',')[1],
          mediaType: 'image/jpeg',
        })
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

const CERTEZA_LABEL = { alta: 'Alta confiança', media: 'Confiança média', baixa: 'Baixa confiança' }
const CERTEZA_COLOR = { alta: '#22c55e', media: '#f59e0b', baixa: '#ef4444' }

export default function CameraCapture({ onIdentified, onSkip }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const { data, mediaType } = await compressImage(file)
      const res = await fetch('/api/identificar-peixe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: data, mediaType }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setResult(await res.json())
    } catch {
      setError('Não foi possível conectar. Verifique sua internet.')
    } finally {
      setLoading(false)
    }
  }

  function retry() {
    setPreview(null)
    setResult(null)
    setError(null)
    // pequeno delay para o browser resetar o input
    setTimeout(() => inputRef.current?.click(), 50)
  }

  return (
    <div className="camera-capture">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {!preview && (
        <div className="camera-idle">
          <div className="camera-icon-wrap">
            <span className="camera-icon">📸</span>
          </div>
          <p className="camera-hint">Fotografe o peixe que você pescou e a IA identifica a espécie</p>
          <button className="btn-primary btn-full" onClick={() => inputRef.current?.click()}>
            Abrir câmera
          </button>
          <button className="btn-secondary btn-full" style={{ marginTop: 8 }} onClick={onSkip}>
            Escolher espécie manualmente
          </button>
        </div>
      )}

      {preview && (
        <div className="capture-preview-wrap">
          <div className="capture-preview">
            <img src={preview} alt="Foto capturada" />
            {loading && (
              <div className="scan-overlay">
                <div className="scan-line" />
                <span className="scan-text">Analisando...</span>
              </div>
            )}
          </div>

          {!loading && !result && !error && (
            <button className="btn-secondary btn-full" onClick={retry}>Nova foto</button>
          )}

          {error && (
            <div className="id-error">
              <p>{error}</p>
              <div className="id-actions">
                <button className="btn-primary" onClick={retry}>Tentar novamente</button>
                <button className="btn-secondary" onClick={onSkip}>Manual</button>
              </div>
            </div>
          )}

          {result && (
            <div className="id-result">
              {result.especie ? (
                <>
                  <div className="id-species-name">{result.especie}</div>
                  <div className="id-meta">
                    <span className="id-certeza" style={{ color: CERTEZA_COLOR[result.certeza] }}>
                      ● {CERTEZA_LABEL[result.certeza]}
                    </span>
                    {result.peso_estimado && (
                      <span className="id-peso">⚖️ {result.peso_estimado}</span>
                    )}
                  </div>
                  {result.observacao && (
                    <p className="id-obs">{result.observacao}</p>
                  )}
                  <div className="id-actions">
                    <button className="btn-primary" onClick={() => onIdentified(result)}>
                      Usar este resultado
                    </button>
                    <button className="btn-secondary" onClick={retry}>Nova foto</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="id-obs id-not-found">❓ {result.observacao}</p>
                  <div className="id-actions">
                    <button className="btn-primary" onClick={retry}>Tentar novamente</button>
                    <button className="btn-secondary" onClick={onSkip}>Escolher manualmente</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
