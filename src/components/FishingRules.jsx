import {
  isPiracema, daysUntilPiracema, daysUntilPiracemaEnd,
  PIRACEMA, FISHING_RULES, getNavStatus, NAV_LINKS,
} from '../data/fishingRules'

function PiracemaBanner() {
  const active = isPiracema()
  const days   = active ? daysUntilPiracemaEnd() : daysUntilPiracema()

  if (active) {
    return (
      <div className="piracema-banner piracema-active">
        <div className="piracema-row">
          <span className="piracema-icon">🐟</span>
          <div>
            <div className="piracema-title">Período de Piracema ativo</div>
            <div className="piracema-sub">{PIRACEMA.label} · encerra em {days} dia{days !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <p className="piracema-note">
          Pesca amadora permitida <strong>somente com vara e anzol</strong>. Redes e tarrafas proibidas.
          Prefira praticar captura &amp; soltura.
        </p>
        <a
          className="piracema-link"
          href={PIRACEMA.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver legislação MPA/IBAMA ↗
        </a>
      </div>
    )
  }

  return (
    <div className="piracema-banner piracema-off">
      <div className="piracema-row">
        <span className="piracema-icon">✅</span>
        <div>
          <div className="piracema-title">Fora da piracema</div>
          <div className="piracema-sub">Próxima começa em {days} dia{days !== 1 ? 's' : ''} (1º nov)</div>
        </div>
      </div>
    </div>
  )
}

function NavSection({ riverLevel, stationName }) {
  const nav = getNavStatus(riverLevel != null ? parseFloat(riverLevel) : null)
  const hasLocation = !!stationName

  return (
    <div className="rules-section">
      <h3 className="rules-section-title">⚓ Navegação</h3>

      {nav ? (
        <>
          <div className="nav-status" style={{ borderColor: nav.color }}>
            <span className="nav-status-icon">{nav.icon}</span>
            <div>
              <div className="nav-status-label" style={{ color: nav.color }}>{nav.label}</div>
              <div className="nav-status-tip">{nav.tip}</div>
            </div>
          </div>
          {stationName && (
            <p className="rules-note nav-station-note">📊 Estação: {stationName}</p>
          )}
        </>
      ) : hasLocation ? (
        // Localização definida mas ANA não retornou dados
        <div className="nav-unavailable">
          <span className="nav-unavailable-icon">📡</span>
          <div>
            <div className="nav-unavailable-label">Dados indisponíveis</div>
            <div className="nav-unavailable-sub">
              {stationName ? `Estação ${stationName} sem resposta.` : 'ANA sem resposta.'}{' '}
              Consulte os links abaixo antes de navegar.
            </div>
          </div>
        </div>
      ) : (
        <p className="rules-note">Defina sua localização para ver o nível do rio.</p>
      )}

      <div className="rules-note nav-arrais-note">
        Portador de habilitação <strong>Arrais-Amador</strong>: consulte os avisos vigentes antes de navegar.
      </div>

      <div className="nav-links">
        {NAV_LINKS.map(link => (
          <a
            key={link.url}
            className="nav-link-card"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="nav-link-icon">{link.icon}</span>
            <div>
              <div className="nav-link-label">{link.label}</div>
              <div className="nav-link-sub">{link.sublabel}</div>
            </div>
            <span className="nav-link-arrow">↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function FishingRules({ riverLevel, stationName }) {
  return (
    <div className="fishing-rules">
      <PiracemaBanner />

      <div className="rules-section">
        <h3 className="rules-section-title">📋 Regras — pesca amadora</h3>
        <div className="rules-list">
          {FISHING_RULES.map((r, i) => (
            <div key={i} className="rule-row">
              <span className="rule-icon">{r.icon}</span>
              <span className="rule-text">{r.text}</span>
            </div>
          ))}
        </div>
        <a
          className="piracema-link"
          href="https://servicos.ibama.gov.br"
          target="_blank"
          rel="noopener noreferrer"
        >
          Emitir/renovar licença amadora (IBAMA) ↗
        </a>
      </div>

      <NavSection riverLevel={riverLevel} stationName={stationName} />
    </div>
  )
}
