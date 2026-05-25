// Faixa de 3 dias de previsão do índice de pesca
// Mostrada no fim do FishingDashboard, abaixo dos horários

import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
dayjs.locale('pt-br')

export default function ForecastStrip({ days }) {
  if (!days || days.length === 0) return null

  return (
    <div className="forecast-strip">
      <h3 className="forecast-title">📅 Próximos 3 dias</h3>
      <div className="forecast-cards">
        {days.map((d, i) => (
          <div key={d.dateStr} className="forecast-card">
            {/* Nome do dia */}
            <div className="fc-day">
              {i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : dayjs(d.dateStr).format('ddd')}
            </div>

            {/* Emoji do tempo */}
            <div className="fc-emoji">{d.emoji}</div>

            {/* Índice de pesca — arco mini */}
            <div className="fc-score" style={{ color: d.color }}>{d.score}</div>
            <div className="fc-label" style={{ color: d.color }}>{d.label}</div>

            {/* Temperatura + chuva */}
            <div className="fc-detail">{d.temp}°C</div>
            {d.rain > 0 && <div className="fc-rain">🌧 {d.rain}mm</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
