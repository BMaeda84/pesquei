// Página pública de ranking — aberta via link compartilhado
// URL: pesquei.vercel.app/?share=BASE64
//
// SAST-05 (XSS): todos os campos são renderizados via JSX (React escapa automaticamente).
// Os dados são recalculados localmente — nenhum "score" externo é aceito como verdade.

import { useMemo } from 'react'
import { scoreEntry, scoreLabel } from '../utils/scoring'

// Decodifica o payload do link de compartilhamento
export function decodeSharePayload(encoded) {
  try {
    // Suporte a Unicode: btoa/atob base64 usa Latin-1; usamos a variante UTF-8
    return JSON.parse(decodeURIComponent(escape(atob(encoded))))
  } catch {
    return null
  }
}

// Cria o payload e monta a URL compartilhável
export function buildShareUrl(profile, summary) {
  const payload = {
    n: String(profile?.name  || 'Pescador').slice(0, 30),   // name
    a: profile?.photoData ? null : String(profile?.avatar || '🎣'), // emoji avatar
    r: String(profile?.river || '').slice(0, 40),           // rio/represa
    d: new Date().toLocaleDateString('pt-BR'),               // data formatada
    // Entradas: apenas o suficiente para exibir; score é recomputado na leitura
    e: (summary.entries || []).slice(0, 6).map(e => ({
      s: String(e.species || '').slice(0, 40),
      q: Math.min(Number(e.quantity) || 1, 99),
      w: e.weight ? Math.min(parseFloat(e.weight) || 0, 200) : null,
      v: !!e.verified,
      vt: e.verifyToken || null,
      ic: String(e.icon || '🐟').slice(0, 8),
    })),
  }
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
  return `${window.location.origin}/?share=${encoded}`
}

export default function RankingPublic({ data, onClose }) {
  // Reconstrói entradas no formato esperado por scoreEntry
  const entries = useMemo(() =>
    (data.e || []).map(e => ({
      species:     e.s,
      quantity:    e.q,
      weight:      e.w,
      verified:    e.v,
      verifyToken: e.vt,
      icon:        e.ic,
    })),
  [data])

  // Recomputa o score localmente — não confiamos no valor externo
  const total = useMemo(() =>
    entries.reduce((sum, e) => sum + scoreEntry(e), 0),
  [entries])

  const { label, color } = scoreLabel(total)

  return (
    <div className="pub-ranking">
      {/* Cabeçalho com botão de fechar / voltar ao app */}
      <div className="pub-header">
        <span className="pub-app-name">🎣 Pesquei!</span>
        <button className="btn-secondary pub-close" onClick={onClose}>
          Abrir meu app
        </button>
      </div>

      {/* Perfil do pescador */}
      <div className="pub-profile">
        <div className="pub-avatar">
          {data.a ? data.a : '🎣'}
        </div>
        <div className="pub-name">{data.n}</div>
        {data.r && <div className="pub-river">📍 {data.r}</div>}
        <div className="pub-date">📅 {data.d}</div>
      </div>

      {/* Score */}
      <div className="pub-score-block">
        <div className="pub-pts" style={{ color }}>{total}</div>
        <div className="pub-pts-label">PONTOS</div>
        <div className="pub-rank-label" style={{ color }}>{label}</div>
      </div>

      {/* Lista de capturas */}
      {entries.length > 0 && (
        <div className="pub-entries">
          <div className="pub-entries-title">CAPTURAS DO DIA</div>
          {entries.map((e, i) => (
            <div key={i} className="pub-entry">
              <span className="pub-entry-icon">{e.icon || '🐟'}</span>
              <div className="pub-entry-info">
                <span className="pub-entry-sp">{e.species}</span>
                <span className="pub-entry-det">
                  {e.quantity}×{e.weight ? ` · ${e.weight}kg` : ''}
                  {e.verified ? ' · ✓ IA' : ''}
                </span>
              </div>
              <span className="pub-entry-pts" style={{ color: e.verified ? '#f59e0b' : '#67e8f2' }}>
                +{scoreEntry(e)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CTA para download */}
      <div className="pub-cta">
        <p className="pub-cta-text">Quero meu próprio ranking! 🎣</p>
        <a
          className="btn-primary btn-full pub-cta-btn"
          href={window.location.origin}
          onClick={onClose}
        >
          Baixar Pesquei! — é grátis
        </a>
      </div>
    </div>
  )
}
