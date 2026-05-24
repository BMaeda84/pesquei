import { useState, useEffect } from 'react'
import LocationPicker from './components/LocationPicker'
import FishingDashboard from './components/FishingDashboard'
import Diary from './components/Diary'
import FishGuide from './components/FishGuide'
import GpsConfirmModal from './components/GpsConfirmModal'
import HowToUse from './components/HowToUse'
import './App.css'

const TABS = [
  { id: 'index', label: '🎣 Índice' },
  { id: 'map', label: '📍 Local' },
  { id: 'guide', label: '🐟 Guia' },
  { id: 'diary', label: '📓 Diário' },
]

export default function App() {
  const [tab, setTab] = useState('index')
  const [location, setLocation] = useState(null)
  const [gpsCandidate, setGpsCandidate] = useState(null)
  const [showHowTo, setShowHowTo] = useState(false)

  // Solicita GPS ao abrir o app
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCandidate({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        // Permissão negada ou erro — sem modal, usuário escolhe no mapa
      },
      { timeout: 8000, maximumAge: 60000 }
    )
  }, [])

  function handleConfirmGps() {
    setLocation(gpsCandidate)
    setGpsCandidate(null)
  }

  function handleManualPick() {
    setGpsCandidate(null)
    setTab('map')
  }

  function handleSelectLocation(latlng) {
    setLocation(latlng)
    setTab('index')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pesquei!</h1>
        <div className="header-right">
          {location && <span className="header-coords">📍 {location.lat.toFixed(3)}, {location.lng.toFixed(3)}</span>}
          <button className="btn-help" onClick={() => setShowHowTo(true)} title="Como usar">?</button>
        </div>
      </header>

      <main className="app-main">
        {tab === 'index' && <FishingDashboard location={location} />}
        {tab === 'map' && <LocationPicker location={location} onSelect={handleSelectLocation} />}
        {tab === 'guide' && <FishGuide location={location} />}
        {tab === 'diary' && <Diary location={location} />}
      </main>

      <nav className="bottom-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Modal de confirmação de GPS */}
      {gpsCandidate && (
        <GpsConfirmModal
          coords={gpsCandidate}
          onConfirm={handleConfirmGps}
          onManual={handleManualPick}
          onClose={() => setGpsCandidate(null)}
        />
      )}

      {/* Modal de instruções */}
      {showHowTo && <HowToUse onClose={() => setShowHowTo(false)} />}
    </div>
  )
}
