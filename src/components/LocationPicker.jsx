import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import { useState, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import SavedSpots from './SavedSpots'

// Corrige ícone padrão do Leaflet que some no Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Ícone de ponto salvo — círculo vermelho sem imagem CDN
const spotIcon = L.divIcon({
  html: `<div style="
    background:#ef4444;width:14px;height:14px;
    border-radius:50%;border:2px solid #fff;
    box-shadow:0 1px 5px rgba(0,0,0,.6)"></div>`,
  iconSize:   [14, 14],
  iconAnchor: [7, 7],
  className:  '',
})

// ── Handlers internos do mapa ──────────────────────────────────────────────

function ClickHandler({ onSelect }) {
  useMapEvents({ click(e) { onSelect(e.latlng) } })
  return null
}

// Voa para um ponto salvo ao clicar no card fora do mapa
function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 15, { duration: 1.2 })
  }, [target, map])
  return null
}

// ── Componente principal ───────────────────────────────────────────────────
export default function LocationPicker({ location, onSelect, spots = [] }) {
  const center    = location ?? { lat: -22.4, lng: -48.5 }
  const [flyTarget, setFlyTarget] = useState(null)

  return (
    <div className="location-picker">
      <p className="picker-hint">Toque no mapa para marcar onde vai pescar</p>

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={location ? 13 : 8}
        style={{ height: '300px', borderRadius: '12px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        />

        <ClickHandler onSelect={onSelect} />
        <FlyTo target={flyTarget} />

        {/* Marcador da localização atual (azul padrão) */}
        {location && <Marker position={[location.lat, location.lng]} />}

        {/* Marcadores dos spots salvos (vermelho) */}
        {spots.map(s => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={spotIcon}>
            <Popup>
              <strong>{s.name}</strong>
              {s.notes && <><br /><span style={{ fontSize: 12 }}>{s.notes}</span></>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {location && (
        <p className="coords-label">
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      )}

      {/* SavedSpots abaixo do mapa — recebe a localização pendente para salvar */}
      <SavedSpots
        pendingLoc={location}
        onClearPending={() => onSelect(null)}
        onFocusSpot={setFlyTarget}
        spots={spots}
      />
    </div>
  )
}
