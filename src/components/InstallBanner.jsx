export default function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div className="install-banner">
      <div className="install-banner-content">
        <img src="/pwa-192.png" alt="Pesquei!" className="install-icon" />
        <div className="install-text">
          <strong>Instalar Pesquei!</strong>
          <span>Funciona offline, sem internet</span>
        </div>
      </div>
      <div className="install-actions">
        <button className="btn-install" onClick={onInstall}>Instalar</button>
        <button className="btn-dismiss" onClick={onDismiss}>✕</button>
      </div>
    </div>
  )
}
