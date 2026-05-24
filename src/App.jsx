import { useState, useEffect } from 'react'
import LocationPicker from './components/LocationPicker'
import FishingDashboard from './components/FishingDashboard'
import FishDex from './components/FishDex'
import FishGuide from './components/FishGuide'
import GpsConfirmModal from './components/GpsConfirmModal'
import HowToUse from './components/HowToUse'
import InstallBanner from './components/InstallBanner'
import ProfileSetup from './components/ProfileSetup'
import DayRanking from './components/DayRanking'
import { useInstallPrompt } from './hooks/useInstallPrompt'
import { useProfile } from './hooks/useProfile'
import './App.css'

const TABS = [
  { id: 'index',   label: '🎣 Índice' },
  { id: 'map',     label: '📍 Local' },
  { id: 'guide',   label: '🐟 Guia' },
  { id: 'diary',   label: '🏆 Dex' },
  { id: 'ranking', label: '📊 Ranking' },
]

function HeaderWave() {
  return (
    <div className="header-wave">
      <svg viewBox="0 0 480 14" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,7 C80,14 160,0 240,7 C320,14 400,0 480,7 L480,14 L0,14 Z" fill="#061520"/>
      </svg>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('index')
  const [location, setLocation] = useState(null)
  const [gpsCandidate, setGpsCandidate] = useState(null)
  const [showHowTo, setShowHowTo] = useState(false)
  const [showInstall, setShowInstall] = useState(false)
  const { canInstall, install } = useInstallPrompt()
  const { profile, loading: profileLoading, saveProfile } = useProfile()

  // Solicita GPS ao abrir
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setGpsCandidate({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 8000, maximumAge: 60000 }
    )
  }, [])

  // Mostra banner de instalação após 4 segundos
  useEffect(() => {
    if (!canInstall) return
    const t = setTimeout(() => setShowInstall(true), 4000)
    return () => clearTimeout(t)
  }, [canInstall])

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

  // Enquanto o perfil carrega, mostra nada (evita flash do setup)
  if (profileLoading) return null

  // Perfil não configurado → exibe tela de setup
  if (!profile) {
    return (
      <div className="app">
        <ProfileSetup onSave={saveProfile} />
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pesquei!</h1>
        <div className="header-right">
          {location && (
            <span className="header-coords">
              {location.lat.toFixed(3)}, {location.lng.toFixed(3)}
            </span>
          )}
          {/* Avatar do perfil */}
          <div className="header-avatar" title={profile.name}>
            {profile.photoData
              ? <img src={profile.photoData} className="header-avatar-img" alt="" />
              : <span>{profile.avatar || '🎣'}</span>
            }
          </div>
          <button className="btn-help" onClick={() => setShowHowTo(true)} title="Como usar">?</button>
        </div>
        <HeaderWave />
      </header>

      <main className="app-main">
        {tab === 'index'   && <FishingDashboard location={location} />}
        {tab === 'map'     && <LocationPicker location={location} onSelect={handleSelectLocation} />}
        {tab === 'guide'   && <FishGuide location={location} />}
        {tab === 'diary'   && <FishDex />}
        {tab === 'ranking' && <DayRanking profile={profile} />}
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

      {gpsCandidate && (
        <GpsConfirmModal
          coords={gpsCandidate}
          onConfirm={handleConfirmGps}
          onManual={handleManualPick}
          onClose={() => setGpsCandidate(null)}
        />
      )}

      {showHowTo && <HowToUse onClose={() => setShowHowTo(false)} />}

      {showInstall && (
        <InstallBanner
          onInstall={() => { install(); setShowInstall(false) }}
          onDismiss={() => setShowInstall(false)}
        />
      )}
    </div>
  )
}
