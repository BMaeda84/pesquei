const STEPS = [
  {
    icon: '📍',
    title: 'Marque onde vai pescar',
    desc: 'Na aba "Local", toque no mapa para marcar seu ponto. O app usa sua localização para buscar dados precisos do clima e do nível do rio.',
  },
  {
    icon: '🎣',
    title: 'Veja o índice de pesca',
    desc: 'A aba "Índice" mostra um score de 0 a 100 calculado com pressão atmosférica, temperatura, chuva, fase da lua e nível do Tietê.',
  },
  {
    icon: '🐟',
    title: 'Consulte o Guia de Peixes',
    desc: 'A aba "Guia" mostra quais peixes estão ativos agora, qual isca usar para cada um e a técnica recomendada.',
  },
  {
    icon: '📓',
    title: 'Registre suas pescarias',
    desc: 'Na aba "Diário", anote espécie, quantidade, peso e observações. Com o tempo, o histórico revela os melhores padrões para cada ponto.',
  },
  {
    icon: '📵',
    title: 'Funciona sem internet',
    desc: 'Abra o app em casa antes de sair. Ele baixa tudo que precisa. No rio, pode colocar no modo avião — funciona normalmente.',
  },
  {
    icon: '📲',
    title: 'Instale no celular',
    desc: 'No Safari (iPhone) ou Chrome (Android), toque em "Compartilhar" → "Adicionar à tela de início" para instalar como app nativo.',
  },
]

export default function HowToUse({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-tall">
        <div className="modal-header">
          <h2>Como usar o Pesquei!</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="steps-list">
          {STEPS.map((s, i) => (
            <div key={i} className="step">
              <div className="step-icon">{s.icon}</div>
              <div className="step-content">
                <strong>{s.title}</strong>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-primary btn-full" onClick={onClose} style={{ marginTop: 8 }}>
          Entendi, vamos pescar!
        </button>
      </div>
    </div>
  )
}
