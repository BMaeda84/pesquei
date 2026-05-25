import { useState, useEffect } from 'react'
import { getDiaryEntries } from '../utils/cache'
import { scoreSummary, scoreEntry, scoreLabel } from '../utils/scoring'
import { generateShareCard, shareRankingCard, shareWhatsApp, shareFacebook } from '../utils/shareCard'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
dayjs.locale('pt-br')

export default function DayRanking({ profile }) {
  const [summary, setSummary] = useState(null)
  const [sharing, setSharing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    getDiaryEntries().then(entries => setSummary(scoreSummary(entries)))
  }, [])

  if (!summary) return <div className="ranking-loading">Carregando…</div>

  const date = dayjs().format('DD/MM/YYYY')
  const { label, color } = scoreLabel(summary.total)
  const sorted = [...summary.entries].sort((a, b) => scoreEntry(b) - scoreEntry(a)).slice(0, 6)

  async function handleShare() {
    setSharing(true)
    try {
      const dataUrl = await generateShareCard({ profile, summary, date })
      setPreviewUrl(dataUrl)
      await shareRankingCard({ dataUrl, profile, summary, date })
    } catch (err) {
      console.error(err)
    } finally {
      setSharing(false)
    }
  }

  function handleWhatsApp() {
    shareWhatsApp(profile, summary, date)
  }

  function handleFacebook() {
    shareFacebook()
  }

  return (
    <div className="day-ranking">
      {/* Cabeçalho */}
      <div className="ranking-header">
        <div className="ranking-avatar">
          {profile?.photoData
            ? <img src={profile.photoData} className="ranking-avatar-img" alt="" />
            : <span className="ranking-avatar-emoji">{profile?.avatar || '🎣'}</span>
          }
        </div>
        <div className="ranking-name">{profile?.name || 'Pescador'}</div>
        {profile?.river && <div className="ranking-river">📍 {profile.river}</div>}
      </div>

      {/* Score */}
      <div className="ranking-score-block">
        <div className="ranking-pts" style={{ color }}>{summary.total}</div>
        <div className="ranking-pts-label" style={{ color }}>PONTOS</div>
        <div className="ranking-rank-label">{label}</div>
      </div>

      {/* Stats */}
      <div className="ranking-stats">
        <div className="rank-stat">
          <span className="rank-stat-n">{summary.fishCount}</span>
          <span className="rank-stat-l">peixes</span>
        </div>
        <div className="rank-stat">
          <span className="rank-stat-n">{summary.speciesCount}</span>
          <span className="rank-stat-l">espécies</span>
        </div>
        <div className="rank-stat">
          <span className="rank-stat-n">{summary.verifiedCount}</span>
          <span className="rank-stat-l">📸 c/ IA</span>
        </div>
      </div>

      <div className="ranking-divider" />

      {/* Lista de capturas */}
      {sorted.length === 0 ? (
        <div className="ranking-empty">
          <p>Nenhuma captura hoje ainda.</p>
          <p>Vá para o PeixeDEX e registre sua primeira pescada! 🎣</p>
        </div>
      ) : (
        <div className="ranking-list">
          <div className="ranking-list-title">CAPTURAS DO DIA</div>
          {sorted.map((e, i) => {
            const pts = scoreEntry(e)
            return (
              <div key={i} className="rank-entry">
                <span className="rank-entry-icon">{e.icon || '🐟'}</span>
                <div className="rank-entry-info">
                  <span className="rank-entry-species">{e.species}</span>
                  <span className="rank-entry-detail">
                    {e.quantity}×{e.weight ? ` · ${e.weight}kg` : ''}
                    {e.verified ? ' · ✓ IA' : ''}
                  </span>
                </div>
                <span className="rank-entry-pts" style={{ color: e.verified ? '#f59e0b' : '#67e8f2' }}>
                  +{pts}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Preview do card gerado */}
      {previewUrl && (
        <div className="ranking-preview">
          <img src={previewUrl} className="ranking-preview-img" alt="Card da pescaria" />
          <button className="btn-tiny ranking-preview-close" onClick={() => setPreviewUrl(null)}>✕</button>
        </div>
      )}

      {/* Botões de compartilhamento */}
      <div className="ranking-actions">
        <button
          className="btn-share btn-share-main"
          onClick={handleShare}
          disabled={sharing || summary.entries.length === 0}
        >
          {sharing ? 'Gerando…' : '📤 Compartilhar card'}
        </button>
        <div className="ranking-share-row">
          <button
            className="btn-share btn-whatsapp"
            onClick={handleWhatsApp}
            disabled={summary.entries.length === 0}
          >
            💬 WhatsApp
          </button>
          <button
            className="btn-share btn-facebook"
            onClick={handleFacebook}
          >
            📘 Facebook
          </button>
        </div>
      </div>

      <div className="ranking-date">{dayjs().format('dddd, DD [de] MMMM [de] YYYY')}</div>
    </div>
  )
}
