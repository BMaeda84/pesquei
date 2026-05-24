import { scoreEntry, scoreLabel } from './scoring'

// Gera o card de ranking como imagem PNG usando Canvas API
export async function generateShareCard({ profile, summary, date }) {
  const W = 400, H = 680
  const canvas = document.createElement('canvas')
  canvas.width = W * 2   // retina
  canvas.height = H * 2
  const ctx = canvas.getContext('2d')
  ctx.scale(2, 2)

  // ── Fundo gradiente água ──
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#061520')
  bg.addColorStop(0.5, '#0d2a3d')
  bg.addColorStop(1, '#061520')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Reflexo de água no fundo
  const glow = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, W * 0.8)
  glow.addColorStop(0, 'rgba(14,165,181,0.12)')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // ── Borda teal ──
  ctx.strokeStyle = 'rgba(14,165,181,0.4)'
  ctx.lineWidth = 2
  roundRect(ctx, 4, 4, W - 8, H - 8, 16)
  ctx.stroke()

  // ── Header: logo ──
  ctx.font = 'bold 13px system-ui'
  ctx.fillStyle = 'rgba(103,232,249,0.6)'
  ctx.textAlign = 'center'
  ctx.fillText('PESQUEI!', W / 2, 30)

  // Data
  ctx.font = '11px system-ui'
  ctx.fillStyle = 'rgba(107,155,170,0.8)'
  ctx.fillText(date, W / 2, 46)

  // ── Avatar ──
  const avatarY = 80
  ctx.font = '40px serif'
  ctx.textAlign = 'center'

  if (profile.photoData) {
    await drawRoundImage(ctx, profile.photoData, W / 2 - 28, avatarY, 56)
  } else {
    // Círculo avatar
    ctx.fillStyle = 'rgba(14,165,181,0.15)'
    ctx.beginPath()
    ctx.arc(W / 2, avatarY + 28, 32, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(14,165,181,0.4)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillText(profile.avatar || '🎣', W / 2, avatarY + 42)
  }

  // Nome
  ctx.font = 'bold 18px system-ui'
  ctx.fillStyle = '#dff3f8'
  ctx.textAlign = 'center'
  ctx.fillText(profile.name || 'Pescador', W / 2, avatarY + 80)

  // Rio
  if (profile.river) {
    ctx.font = '11px system-ui'
    ctx.fillStyle = 'rgba(14,165,181,0.7)'
    ctx.fillText(`📍 ${profile.river}`, W / 2, avatarY + 96)
  }

  // ── Score principal ──
  const { label, color } = scoreLabel(summary.total)
  const scoreY = avatarY + 124

  ctx.font = 'bold 48px system-ui'
  ctx.fillStyle = color
  ctx.fillText(summary.total, W / 2, scoreY)

  ctx.font = 'bold 11px system-ui'
  ctx.fillStyle = color
  ctx.fillText('PONTOS', W / 2, scoreY + 16)

  ctx.font = 'bold 13px system-ui'
  ctx.fillStyle = '#dff3f8'
  ctx.fillText(label, W / 2, scoreY + 34)

  // ── Stats bar ──
  const statsY = scoreY + 56
  const stats = [
    { v: summary.fishCount,    l: 'peixes' },
    { v: summary.speciesCount, l: 'espécies' },
    { v: summary.verifiedCount, l: '📸 c/ IA' },
  ]
  const colW = W / 3
  stats.forEach((s, i) => {
    const x = i * colW + colW / 2
    ctx.font = 'bold 22px system-ui'
    ctx.fillStyle = '#67e8f2'
    ctx.fillText(s.v, x, statsY)
    ctx.font = '10px system-ui'
    ctx.fillStyle = 'rgba(107,155,170,0.8)'
    ctx.fillText(s.l, x, statsY + 15)
  })

  // Divisor
  ctx.strokeStyle = 'rgba(14,165,181,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(24, statsY + 28)
  ctx.lineTo(W - 24, statsY + 28)
  ctx.stroke()

  // ── Lista de capturas ──
  const listY = statsY + 44
  ctx.font = 'bold 10px system-ui'
  ctx.fillStyle = 'rgba(107,155,170,0.7)'
  ctx.textAlign = 'left'
  ctx.fillText('CAPTURAS DO DIA', 24, listY)

  const entriesSorted = [...summary.entries].sort((a, b) => scoreEntry(b) - scoreEntry(a)).slice(0, 6)
  entriesSorted.forEach((e, i) => {
    const y = listY + 18 + i * 36
    const pts = scoreEntry(e)

    // Linha de fundo
    ctx.fillStyle = 'rgba(14,165,181,0.05)'
    roundRect(ctx, 20, y - 14, W - 40, 30, 6)
    ctx.fill()

    // Emoji
    ctx.font = '18px serif'
    ctx.textAlign = 'left'
    ctx.fillText(e.icon || '🐟', 28, y + 4)

    // Nome + detalhes
    ctx.font = 'bold 12px system-ui'
    ctx.fillStyle = '#dff3f8'
    ctx.fillText(e.species, 54, y - 1)

    ctx.font = '10px system-ui'
    ctx.fillStyle = 'rgba(107,155,170,0.8)'
    const detail = `${e.quantity}×${e.weight ? ` · ${e.weight}kg` : ''}${e.verified ? ' · ✓ IA' : ''}`
    ctx.fillText(detail, 54, y + 12)

    // Pontos
    ctx.font = 'bold 13px system-ui'
    ctx.fillStyle = e.verified ? '#f59e0b' : '#67e8f2'
    ctx.textAlign = 'right'
    ctx.fillText(`+${pts}`, W - 24, y + 4)
  })

  // ── Footer ──
  const footerY = H - 18
  ctx.font = '10px system-ui'
  ctx.fillStyle = 'rgba(107,155,170,0.4)'
  ctx.textAlign = 'center'
  ctx.fillText('gerado por Pesquei! · pesquei.vercel.app', W / 2, footerY)

  return canvas.toDataURL('image/png')
}

// Compartilha via Web Share API (WhatsApp, Facebook, etc.)
export async function shareRankingCard({ dataUrl, profile, summary, date }) {
  const text = buildShareText({ profile, summary, date })

  // Tenta compartilhar como arquivo (Android Chrome, Safari iOS)
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], 'pescaria-do-dia.png', { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: 'Minha Pescaria', text, files: [file] })
      return { method: 'share' }
    }
  } catch { /* fallthrough */ }

  // Tenta compartilhar só texto
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Minha Pescaria - Pesquei!', text })
      return { method: 'text' }
    }
  } catch { /* fallthrough */ }

  // Fallback: baixa a imagem
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `pescaria-${date.replace(/\//g, '-')}.png`
  a.click()
  return { method: 'download' }
}

export function shareWhatsApp(profile, summary, date) {
  const text = buildShareText({ profile, summary, date })
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

export function shareFacebook() {
  const url = encodeURIComponent('https://pesquei.vercel.app')
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

// ── Helpers ──────────────────────────────────────────────

function buildShareText({ profile, summary, date }) {
  const { label } = scoreLabel(summary.total)
  const lines = [
    `🎣 *Pescaria do Dia — ${date}*`,
    `👤 ${profile.name}${profile.river ? ` · 📍 ${profile.river}` : ''}`,
    '',
    `🏆 *${summary.total} pontos* — ${label}`,
    `🐟 ${summary.fishCount} peixe${summary.fishCount !== 1 ? 's' : ''} · ${summary.speciesCount} espécie${summary.speciesCount !== 1 ? 's' : ''}`,
    summary.verifiedCount > 0 ? `📸 ${summary.verifiedCount} verificado${summary.verifiedCount !== 1 ? 's' : ''} por IA` : '',
    '',
    ...summary.entries.slice(0, 5).map(e => {
      const pts = scoreEntry(e)
      return `• ${e.species} ×${e.quantity}${e.weight ? ` (${e.weight}kg)` : ''}${e.verified ? ' ✓IA' : ''} → +${pts}pts`
    }),
    '',
    '_Gerado pelo app Pesquei! 🎣_',
  ]
  return lines.filter(l => l !== null).join('\n')
}

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

function drawRoundImage(ctx, src, x, y, size) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      ctx.save()
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, x, y, size, size)
      ctx.restore()
      resolve()
    }
    img.onerror = resolve
    img.src = src
  })
}
