// Modal que aparece na abertura do app pedindo confirmação de localização GPS
export default function GpsConfirmModal({ coords, onConfirm, onManual, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon">📍</div>
        <h2>Sua localização</h2>
        <p className="modal-desc">
          Detectamos sua posição atual. Quer usar ela como ponto de pesca?
        </p>
        <div className="modal-coords">
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </div>
        <div className="modal-actions">
          <button className="btn-primary btn-full" onClick={onConfirm}>
            Sim, usar esta localização
          </button>
          <button className="btn-secondary btn-full" onClick={onManual}>
            Escolher no mapa
          </button>
        </div>
      </div>
    </div>
  )
}
