import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Corrige ícone padrão do Leaflet que some no Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng)
    },
  })
  return null
}

export default function LocationPicker({ location, onSelect }) {
  // Centro aproximado do Rio Tietê no interior de SP
  const center = location ?? { lat: -22.4, lng: -48.5 }

  return (
    <div className="location-picker">
      <p className="picker-hint">Toque no mapa para marcar onde vai pescar</p>
      <MapContainer center={[center.lat, center.lng]} zoom={location ? 13 : 8} style={{ height: '320px', borderRadius: '12px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        />
        <ClickHandler onSelect={onSelect} />
        {location && <Marker position={[location.lat, location.lng]} />}
      </MapContainer>
      {location && (
        <p className="coords-label">
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      )}
    </div>
  )
}
