import dayjs from 'dayjs'

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// Aplica watermark "Pesquei!" na foto original (arquivo File) e retorna data URL
export function applyWatermark(file, species) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      const date = dayjs().format('DD/MM/YYYY')
      const line1 = '🎣 Pesquei!'
      const line2 = species ? `${species} · ${date}` : `pesquei.vercel.app · ${date}`

      const fontSize = Math.max(Math.round(img.width * 0.038), 16)
      const padding  = fontSize * 0.7
      const lineGap  = fontSize * 1.35

      ctx.font = `bold ${fontSize}px system-ui, sans-serif`
      const w1 = ctx.measureText(line1).width

      ctx.font = `${Math.round(fontSize * 0.78)}px system-ui, sans-serif`
      const w2 = ctx.measureText(line2).width

      const boxW = Math.max(w1, w2) + padding * 2
      const boxH = lineGap + fontSize * 0.78 + padding * 1.6
      const bx   = img.width  - boxW - padding
      const by   = img.height - boxH - padding

      // Caixa semi-transparente
      ctx.fillStyle = 'rgba(6,21,32,0.75)'
      roundRect(ctx, bx, by, boxW, boxH, fontSize * 0.4)
      ctx.fill()

      // Borda teal fina
      ctx.strokeStyle = 'rgba(14,165,181,0.6)'
      ctx.lineWidth = Math.max(1, Math.round(img.width * 0.002))
      roundRect(ctx, bx, by, boxW, boxH, fontSize * 0.4)
      ctx.stroke()

      // Linha 1 — "Pesquei!" em teal
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`
      ctx.fillStyle = '#67e8f2'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(line1, bx + padding, by + padding * 0.9)

      // Linha 2 — espécie + data em branco suave
      ctx.font = `${Math.round(fontSize * 0.78)}px system-ui, sans-serif`
      ctx.fillStyle = 'rgba(223,243,248,0.88)'
      ctx.fillText(line2, bx + padding, by + padding * 0.9 + lineGap)

      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e) }
    img.src = url
  })
}

// Salva dataUrl como arquivo no dispositivo
export function saveImage(dataUrl, filename = 'pescaria-pesquei.jpg') {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

// Compartilha a imagem via Web Share API ou fallback para download
export async function sharePhoto(dataUrl, species) {
  const filename = `pescaria-${species || 'pesquei'}.jpg`.replace(/\s+/g, '-').toLowerCase()
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], filename, { type: 'image/jpeg' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: 'Minha pescaria — Pesquei!', files: [file] })
      return 'share'
    }
  } catch { /* fallthrough */ }
  saveImage(dataUrl, filename)
  return 'download'
}
