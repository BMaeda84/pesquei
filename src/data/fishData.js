// Peixes comuns no Rio Tietê - interior de SP
// Horários: array de intervalos [horaInicio, horaFim] (0-23)
export const FISH = [
  {
    id: 'tilapia',
    dex: '001',
    name: 'Tilápia',
    icon: '🐟',
    description: 'A mais abundante do Tietê. Resistente, briga bastante.',
    activeHours: [[6, 10], [15, 19]],
    peak: 'Manhã e entardecer',
    baits: [
      { name: 'Ração peletizada', tip: 'Melhor opção — aroma forte atrai de longe', type: 'natural' },
      { name: 'Milho cozido', tip: 'Barato e eficiente, 2-3 grãos no anzol', type: 'natural' },
      { name: 'Pão francês', tip: 'Amasse bem ao redor do anzol. Funciona na superfície', type: 'natural' },
      { name: 'Minhoca', tip: 'Pedaço pequeno; tilápia tem boca pequena', type: 'natural' },
    ],
    technique: 'Fundo ou meia água. Anzol fino nº 8 a 10. Linha 0.25mm.',
  },
  {
    id: 'carpa',
    dex: '002',
    name: 'Carpa',
    icon: '🐠',
    description: 'Peixe grande e cauteloso. Exige paciência e silêncio.',
    activeHours: [[5, 9], [16, 20]],
    peak: 'Amanhecer e entardecer',
    baits: [
      { name: 'Milho cozido', tip: 'Clássico para carpa. Coloque 3-4 grãos', type: 'natural' },
      { name: 'Boilie', tip: 'Isca esférica importada, muito eficaz para carpas grandes', type: 'artificial' },
      { name: 'Ração granulada', tip: 'Misture com farinha de milho para fazer massa', type: 'natural' },
      { name: 'Batata cozida', tip: 'Cubo de 1cm, funciona surpreendentemente bem', type: 'natural' },
    ],
    technique: 'Fundo. Pesca de espera com chocalho. Linha 0.35mm+. Use chumbo pesado.',
  },
  {
    id: 'pacu',
    dex: '003',
    name: 'Pacu',
    icon: '🐡',
    description: 'Ótimo para comer. Ativo quando a temperatura está agradável.',
    activeHours: [[6, 11], [14, 18]],
    peak: 'Manhã e início da tarde',
    baits: [
      { name: 'Milho cozido', tip: 'Pacu ama milho. Grãos inteiros no fundo', type: 'natural' },
      { name: 'Goiaba', tip: 'Pedaço de goiaba madura é irresistível para pacu', type: 'natural' },
      { name: 'Coquinho de palmeira', tip: 'Fruto nativo que imita alimentação natural', type: 'natural' },
      { name: 'Ração para peixe', tip: 'Pellets médios, deixe afundar devagar', type: 'natural' },
    ],
    technique: 'Fundo ou meia água. Anzol nº 2 a 4. Linha 0.30mm.',
  },
  {
    id: 'traira',
    dex: '004',
    name: 'Traíra',
    icon: '🦈',
    description: 'Predadora feroz, especialmente ativa no amanhecer e anoitecer.',
    activeHours: [[5, 8], [17, 21]],
    peak: 'Amanhecer e anoitecer',
    baits: [
      { name: 'Isca artificial (colher)', tip: 'Lance perto de vegetação e recupere lentamente', type: 'artificial' },
      { name: 'Lambari vivo', tip: 'Melhor isca natural — traíra é agressiva com peixinhos', type: 'natural' },
      { name: 'Minhocuçu', tip: 'Minhoca grande no fundo funciona bem à noite', type: 'natural' },
      { name: 'Jig de silicone', tip: 'Cor escura próximo ao fundo em áreas rasas', type: 'artificial' },
    ],
    technique: 'Perto da margem, entre plantas aquáticas. Anzol duplo nº 1/0. Linha de nylon grossa 0.40mm.',
  },
  {
    id: 'bagre',
    dex: '005',
    name: 'Bagre / Mandi',
    icon: '🐟',
    description: 'Noturno por excelência. Usa quimiorreceptores para localizar comida.',
    activeHours: [[20, 24], [0, 6]],
    peak: 'Noite (20h às 5h)',
    baits: [
      { name: 'Minhoca', tip: 'A isca mais eficaz para bagre. Use minhocuçu inteira', type: 'natural' },
      { name: 'Camarão', tip: 'Camarão de rio fresco é excelente', type: 'natural' },
      { name: 'Pedaço de peixe', tip: 'Postas de lambari ou tilápia no fundo', type: 'natural' },
      { name: 'Fígado de frango', tip: 'Cheiro forte atrai muito à noite', type: 'natural' },
    ],
    technique: 'Fundo em água parada ou de pouca correnteza. Anzol nº 4 a 6. Noite com luzes na margem.',
  },
  {
    id: 'tucunare',
    dex: '006',
    name: 'Tucunaré',
    icon: '🐠',
    description: 'Predador agressivo, mais comum em represas. Briga muito no anzol.',
    activeHours: [[6, 9], [16, 20]],
    peak: 'Amanhecer e entardecer',
    baits: [
      { name: 'Isca artificial (Popper)', tip: 'Na superfície, movimentos curtos e pausas longas', type: 'artificial' },
      { name: 'Peixinho vivo (lambari)', tip: 'Lance próximo a pedras e galhos submersos', type: 'natural' },
      { name: 'Jig (1/4 oz)', tip: 'Cor laranja ou chartreuse em águas mais claras', type: 'artificial' },
      { name: 'Isca de silicone (shad)', tip: 'Imita peixinho, recuperação lenta e irregular', type: 'artificial' },
    ],
    technique: 'Perto de estruturas (pedras, galhos, pilastras). Carretilha com linha de 0.35mm ou multifilamento.',
  },
  {
    id: 'lambari',
    dex: '007',
    name: 'Lambari',
    icon: '🐟',
    description: 'Pequeno e abundante. Ótimo para iniciantes e crianças. Também serve de isca viva.',
    activeHours: [[6, 18]],
    peak: 'Durante o dia todo',
    baits: [
      { name: 'Miolo de pão', tip: 'Minúsculo no anzol nº 14-16', type: 'natural' },
      { name: 'Minhoca pequena', tip: 'Pedaço bem pequeno no anzol fino', type: 'natural' },
      { name: 'Milho triturado', tip: 'Massa fina ao redor do anzol', type: 'natural' },
    ],
    technique: 'Anzol muito pequeno nº 12 a 16. Linha fina 0.15mm. Boia pequena. Qualquer ponto do rio.',
  },
]

// Retorna quais peixes estão ativos no horário atual
export function getActiveFishNow(hour = new Date().getHours()) {
  return FISH.filter(fish =>
    fish.activeHours.some(([start, end]) => {
      if (start <= end) return hour >= start && hour < end
      // intervalo que cruza meia-noite (ex: 20-6)
      return hour >= start || hour < end
    })
  )
}

// Retorna peixes ativos ordenados por relevância no horário
export function getFishByHour(hour) {
  const active = getActiveFishNow(hour)
  const rest = FISH.filter(f => !active.find(a => a.id === f.id))
  return { active, inactive: rest }
}

// Trechos/represas do Rio Tietê no interior de SP
// prominentFish: espécies com maior presença naquele trecho
export const TIETE_ZONES = [
  { id: 'barra-bonita', name: 'Represa Barra Bonita',     shortName: 'Bonita',   lat: -22.51, lon: -48.56, type: 'represa', prominentFish: ['tilapia', 'carpa', 'pacu'] },
  { id: 'bariri',       name: 'Represa Bariri',           shortName: 'Bariri',   lat: -22.08, lon: -48.74, type: 'represa', prominentFish: ['tilapia', 'tucunare', 'pacu'] },
  { id: 'ibitinga',     name: 'Represa Ibitinga',         shortName: 'Ibitinga', lat: -21.76, lon: -48.99, type: 'represa', prominentFish: ['tucunare', 'tilapia', 'carpa'] },
  { id: 'promissao',    name: 'Represa Promissão',        shortName: 'Promissão',lat: -21.49, lon: -49.86, type: 'represa', prominentFish: ['tucunare', 'tilapia', 'bagre'] },
  { id: 'nova-av',      name: 'Represa Nova Avanhandava', shortName: 'Avanha',   lat: -21.12, lon: -50.42, type: 'represa', prominentFish: ['tucunare', 'traira', 'tilapia'] },
  { id: 'tres-irmaos',  name: 'Represa Três Irmãos',     shortName: 'Irmãos',   lat: -20.68, lon: -51.21, type: 'represa', prominentFish: ['tucunare', 'tilapia', 'pacu'] },
  { id: 'rio-medio',    name: 'Rio Tietê (trecho livre)', shortName: 'Tietê',    lat: -22.62, lon: -48.95, type: 'rio',     prominentFish: ['bagre', 'traira', 'lambari'] },
  // Região metropolitana de SP
  { id: 'sp-metro',     name: 'Tietê — Grande SP',       shortName: 'Tietê',    lat: -23.50, lon: -46.80, type: 'rio',     prominentFish: ['tilapia', 'bagre', 'traira'] },
]

// Retorna a zona mais próxima da coordenada informada
export function getNearestZone(lat, lon) {
  if (!lat || !lon) return null
  let best = null, bestDist = Infinity
  for (const z of TIETE_ZONES) {
    const d = Math.hypot(z.lat - lat, z.lon - lon)
    if (d < bestDist) { bestDist = d; best = z }
  }
  return best
}

// Reordena peixes colocando os proeminentes da zona no topo
export function getFishByZoneAndHour(hour, zone) {
  const { active, inactive } = getFishByHour(hour)
  if (!zone) return { active, inactive }

  const sortByZone = (list) =>
    [...list].sort((a, b) => {
      const aIdx = zone.prominentFish.indexOf(a.id)
      const bIdx = zone.prominentFish.indexOf(b.id)
      const aVal = aIdx === -1 ? 99 : aIdx
      const bVal = bIdx === -1 ? 99 : bIdx
      return aVal - bVal
    })

  return { active: sortByZone(active), inactive: sortByZone(inactive) }
}
