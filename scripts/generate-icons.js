import sharp from 'sharp'
import { writeFileSync } from 'fs'

// SVG do ícone: vara de pesca com peixe pulando, fundo em gradiente de água
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0d3d56"/>
      <stop offset="100%" stop-color="#061520"/>
    </radialGradient>
    <radialGradient id="water" cx="50%" cy="80%" r="50%">
      <stop offset="0%" stop-color="#0ea5b5" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#061520" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Fundo -->
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <rect width="512" height="512" rx="96" fill="url(#water)"/>

  <!-- Ondas sutis no fundo -->
  <path d="M0 380 Q128 360 256 380 Q384 400 512 380 L512 512 L0 512 Z" fill="#0a2035" opacity="0.7"/>
  <path d="M0 420 Q128 400 256 420 Q384 440 512 420 L512 512 L0 512 Z" fill="#061520" opacity="0.9"/>

  <!-- Vara de pesca (diagonal, de canto sup.esq. ao centro-dir.) -->
  <line x1="100" y1="100" x2="320" y2="280" stroke="#c8a96e" stroke-width="12" stroke-linecap="round"/>
  <!-- Ponta fina da vara -->
  <line x1="320" y1="280" x2="370" y2="240" stroke="#c8a96e" stroke-width="6" stroke-linecap="round"/>

  <!-- Linha de pesca -->
  <path d="M370 240 Q420 260 390 320 Q360 375 340 340" fill="none" stroke="#e2f5f8" stroke-width="3" stroke-dasharray="8 4" opacity="0.8"/>

  <!-- Anzol -->
  <path d="M340 340 Q355 360 345 375 Q330 390 320 375" fill="none" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
  <line x1="320" y1="375" x2="315" y2="365" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>

  <!-- Peixe saltando (estilizado) -->
  <g transform="translate(240, 190) rotate(-30)">
    <!-- Corpo do peixe -->
    <ellipse cx="0" cy="0" rx="48" ry="22" fill="#0ea5b5"/>
    <ellipse cx="8" cy="0" rx="38" ry="17" fill="#22d3e3"/>
    <!-- Cauda -->
    <path d="M-44 0 L-65 -20 L-55 0 L-65 20 Z" fill="#0ea5b5"/>
    <!-- Olho -->
    <circle cx="32" cy="-6" r="6" fill="white"/>
    <circle cx="34" cy="-6" r="3" fill="#061520"/>
    <!-- Escamas (linhas) -->
    <path d="M10 -12 Q0 0 10 12" fill="none" stroke="#0a8a9a" stroke-width="2" opacity="0.6"/>
    <path d="M-5 -14 Q-15 0 -5 14" fill="none" stroke="#0a8a9a" stroke-width="2" opacity="0.6"/>
    <!-- Nadadeiras -->
    <path d="M5 -22 Q0 -10 -10 -18 Z" fill="#0ea5b5"/>
    <path d="M5 22 Q0 10 -10 18 Z" fill="#0ea5b5"/>
  </g>

  <!-- Gotículas de água ao redor do peixe -->
  <circle cx="210" cy="200" r="4" fill="#67e8f2" opacity="0.7"/>
  <circle cx="305" cy="175" r="3" fill="#67e8f2" opacity="0.6"/>
  <circle cx="290" cy="215" r="2" fill="#67e8f2" opacity="0.5"/>

  <!-- Letras "P!" pequenas no canto inferior -->
  <text x="60" y="465" font-family="system-ui,sans-serif" font-weight="900" font-size="52" fill="#f59e0b" opacity="0.9">Pesquei!</text>
</svg>`

async function generate() {
  const svgBuffer = Buffer.from(iconSvg)

  await sharp(svgBuffer).resize(192, 192).png().toFile('public/pwa-192.png')
  console.log('✓ pwa-192.png')

  await sharp(svgBuffer).resize(512, 512).png().toFile('public/pwa-512.png')
  console.log('✓ pwa-512.png')

  // Apple touch icon
  await sharp(svgBuffer).resize(180, 180).png().toFile('public/apple-touch-icon.png')
  console.log('✓ apple-touch-icon.png')

  // Favicon 32x32
  await sharp(svgBuffer).resize(32, 32).png().toFile('public/favicon-32.png')
  console.log('✓ favicon-32.png')
}

generate().catch(console.error)
