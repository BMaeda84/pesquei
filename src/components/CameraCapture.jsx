import { useState, useRef } from 'react'
import { applyWatermark, saveImage, sharePhoto } from '../utils/watermark'
import dayjs from 'dayjs'

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
        canvas.width = width; canvas.height = height
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
  const [loading, setLoading]         = useState(false)
  const [result, setResult]           = useState(null)
  const [preview, setPreview]         = useState(null)
  const [originalFile, setOriginalFile] = useState(null)
  const [error, setError]             = useState(null)
  const [wmDataUrl, setWmDataUrl]     = useState(null)
  const [wmLoading, setWmLoading]     = useState(false)
  const inputRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setOriginalFile(file)
    setLoading(true)
    setResult(null)
    setError(null)
    setWmDataUrl(null)

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
    setPreview(null); setResult(null); setError(null)
    setOriginalFile(null); setWmDataUrl(null)
    setTimeout(() => inputRef.current?.click(), 50)
  }

  async function handleCreateWatermark() {
    if (!originalFile) return
    setWmLoading(true)
    try {
      const url = await applyWatermark(originalFile, result?.especie)
      setWmDataUrl(url)
    } catch { /* silently fail */ }
    setWmLoading(false)
  }

  // Peixe congelado — Easter egg
  if (result?.congelado) {
    return (
      <div className="camera-capture">
        <div className="frozen-banner">
          <div className="frozen-emoji">🧊🐟🧊</div>
          <h3 className="frozen-title">Bem espertinho você! =P</h3>
          <p className="frozen-msg">
            Esse peixe parece estar congelado ou já processado.<br />
            Só capturas frescas entram no ranking!
          </p>
          <div className="id-actions">
            <button className="btn-primary" onClick={retry}>Fotografar peixe fresco</button>
            <button className="btn-secondary" onClick={onSkip}>Registrar manualmente</button>
          </div>
        </div>
      </div>
    )
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

          {result && !result.congelado && (
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

                  {/* Watermark — só aparece se há pessoa na foto */}
                  {result.com_pessoa && (
                    <div className="watermark-section">
                      {!wmDataUrl ? (
                        <button
                          className="btn-watermark"
                          onClick={handleCreateWatermark}
                          disabled={wmLoading}
                        >
                          {wmLoading ? 'Criando…' : '🏷️ Criar foto com marca Pesquei!'}
                        </button>
                      ) : (
                        <div className="wm-result">
                          <img src={wmDataUrl} className="wm-preview" alt="Foto com marca" />
                          <div className="wm-actions">
                            <button
                              className="btn-share btn-share-main"
                              onClick={() => sharePhoto(wmDataUrl, result.especie)}
                            >
                              📤 Compartilhar foto
                            </button>
                            <div className="wm-save-row">
                              <button
                                className="btn-share btn-whatsapp"
                                onClick={async () => {
                                  const blob = await (await fetch(wmDataUrl)).blob()
                                  const file = new File([blob], 'pescaria.jpg', { type: 'image/jpeg' })
                                  if (navigator.share && navigator.canShare?.({ files: [file] })) {
                                    await navigator.share({ title: 'Minha pescaria', files: [file] })
                                  } else {
                                    const t = encodeURIComponent(`🎣 Pescando com o Pesquei! — ${result.especie}`)
                                    window.open(`https://wa.me/?text=${t}`, '_blank')
                                  }
                                }}
                              >
                                💬 WhatsApp
                              </button>
                              <button
                                className="btn-share btn-facebook"
                                onClick={() => {
                                  const u = encodeURIComponent('https://pesquei.vercel.app')
                                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, '_blank')
                                }}
                              >
                                📘 Facebook
                              </button>
                            </div>
                            <button
                              className="btn-secondary btn-full"
                              onClick={() => saveImage(wmDataUrl, `pescaria-${result.especie || 'pesquei'}.jpg`)}
                            >
                              💾 Salvar no celular
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="id-actions" style={{ marginTop: 8 }}>
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
