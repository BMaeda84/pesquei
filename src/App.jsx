import { useState } from 'react'
import LocationPicker from './components/LocationPicker'
import FishingDashboard from './components/FishingDashboard'
import Diary from './components/Diary'
import './App.css'

const TABS = [
  { id: 'index', label: '🎣 Índice' },
  { id: 'map', label: '📍 Local' },
  { id: 'diary', label: '📓 Diário' },
]

export default function App() {
  const [tab, setTab] = useState('index')
  const [location, setLocation] = useState(null)

  function handleSelectLocation(latlng) {
    setLocation(latlng)
    setTab('index')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pesquei!</h1>
        {location && <span className="header-coords">📍 {location.lat.toFixed(3)}, {location.lng.toFixed(3)}</span>}
      </header>

      <main className="app-main">
        {tab === 'index' && <FishingDashboard location={location} />}
        {tab === 'map' && <LocationPicker location={location} onSelect={handleSelectLocation} />}
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
    </div>
  )
}
