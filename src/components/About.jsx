const LIBS = [
  { name: 'React 19',          license: 'MIT',        url: 'https://github.com/facebook/react' },
  { name: 'Vite 8',            license: 'MIT',        url: 'https://github.com/vitejs/vite' },
  { name: 'react-leaflet 5',   license: 'MIT',        url: 'https://github.com/PaulLeCam/react-leaflet' },
  { name: 'Leaflet 1.9',       license: 'BSD-2',      url: 'https://github.com/Leaflet/Leaflet' },
  { name: 'dayjs',             license: 'MIT',        url: 'https://github.com/iamkun/dayjs' },
  { name: 'idb',               license: 'ISC',        url: 'https://github.com/jakearchibald/idb' },
  { name: '@anthropic-ai/sdk', license: 'MIT',        url: 'https://github.com/anthropics/anthropic-sdk-js' },
  { name: 'vite-plugin-pwa',   license: 'MIT',        url: 'https://github.com/vite-pwa/vite-plugin-pwa' },
  { name: 'workbox',           license: 'Apache-2.0', url: 'https://github.com/GoogleChrome/workbox' },
]

const DATA_SOURCES = [
  {
    name: 'Open-Meteo',
    note: 'Dados meteorológicos (temperatura, chuva, pressão)',
    license: 'CC BY 4.0 — atribuição obrigatória',
    url: 'https://open-meteo.com',
    icon: '🌤️',
  },
  {
    name: 'ANA — Agência Nacional de Águas',
    note: 'Nível e vazão dos rios brasileiros',
    license: 'Dados públicos — Governo Federal',
    url: 'https://www.gov.br/ana/pt-br',
    icon: '🌊',
  },
  {
    name: 'OpenStreetMap',
    note: 'Mapas e tiles cartográficos',
    license: 'ODbL — © OpenStreetMap contributors',
    url: 'https://www.openstreetmap.org',
    icon: '🗺️',
  },
  {
    name: 'Claude Haiku (Anthropic)',
    note: 'Identificação de espécies por foto',
    license: 'API comercial',
    url: 'https://www.anthropic.com',
    icon: '🤖',
  },
]

const ALGORITHMS = [
  {
    name: 'Índice de pesca',
    desc: 'Fórmula original ponderando temperatura da água, pressão atmosférica, precipitação, fase da lua e nível do rio. Valores normalizados em escala 0–100.',
  },
  {
    name: 'Fase da lua',
    desc: 'Cálculo astronômico baseado nas fórmulas de Jean Meeus (Astronomical Algorithms, 1991) — domínio público. Sem dependência de internet.',
  },
  {
    name: 'Sistema de pontuação',
    desc: 'Algoritmo original com pontos por espécie (raridade), peso (bônus por 0,5 kg), estrelas (multiplicador ×0,6 a ×1,5) e bônus de verificação por IA (+15 pts com token HMAC).',
  },
  {
    name: 'Geração do card de ranking',
    desc: 'Canvas API nativo do browser — sem biblioteca externa. Retina (2×), gradiente de água, avatar e lista de capturas em PNG.',
  },
]

export default function About({ onClose }) {
  return (
    <div className="about-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="about-panel">
        <button className="dex-close" onClick={onClose}>✕</button>

        {/* Hero */}
        <div className="about-hero">
          <div className="about-logo">🎣</div>
          <h2 className="about-app-name">Pesquei!</h2>
          <p className="about-tagline">O app do Téio para pescar melhor</p>
        </div>

        {/* História */}
        <div className="about-section">
          <h3 className="about-section-title">✨ A história</h3>
          <p className="about-text">
            Desenvolvido por <strong>Bruno Maeda</strong> para o seu sogro,
            carinhosamente chamado de <strong>Téio</strong>, para que ele tenha
            uma noção maior da sua pescaria — índice do dia, guia de espécies,
            Teioteca e ranking entre amigos.
          </p>
          <p className="about-text" style={{ marginTop: 8 }}>
            Se você chegou aqui pelo compartilhamento de um ranking, é bem-vindo!
            O app é gratuito e funciona offline. 🎣
          </p>
        </div>

        {/* Algoritmos */}
        <div className="about-section">
          <h3 className="about-section-title">⚙️ Algoritmos originais</h3>
          {ALGORITHMS.map(a => (
            <div key={a.name} className="about-algo-row">
              <div className="about-algo-name">{a.name}</div>
              <div className="about-algo-desc">{a.desc}</div>
            </div>
          ))}
        </div>

        {/* Fontes de dados */}
        <div className="about-section">
          <h3 className="about-section-title">📡 Fontes de dados</h3>
          {DATA_SOURCES.map(d => (
            <a
              key={d.name}
              className="about-source-row"
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="about-source-icon">{d.icon}</span>
              <div className="about-source-info">
                <div className="about-source-name">{d.name}</div>
                <div className="about-source-note">{d.note}</div>
                <div className="about-source-license">{d.license}</div>
              </div>
              <span className="nav-link-arrow">↗</span>
            </a>
          ))}
        </div>

        {/* Bibliotecas */}
        <div className="about-section">
          <h3 className="about-section-title">📦 Bibliotecas open source</h3>
          <div className="about-libs-grid">
            {LIBS.map(l => (
              <a
                key={l.name}
                className="about-lib-chip"
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="about-lib-name">{l.name}</span>
                <span className="about-lib-license">{l.license}</span>
              </a>
            ))}
          </div>
        </div>

        {/* IP */}
        <div className="about-section about-ip-note">
          <p>
            Todo o código é original. Nenhum trecho foi copiado de outros aplicativos.
            As bibliotecas são MIT/BSD/Apache/ISC. A atribuição do Open-Meteo (CC BY 4.0)
            e do OpenStreetMap (ODbL) está declarada neste painel.
          </p>
        </div>

        <div className="about-footer">
          v{__APP_VERSION__} · pesquei.vercel.app
        </div>
      </div>
    </div>
  )
}
