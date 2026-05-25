// Exporta e importa a base local do IndexedDB com assinatura HMAC-SHA256
//
// Fluxo de EXPORT:
//   1. Carrega entradas + perfil do IndexedDB
//   2. Envia entradas ao servidor (/api/backup-export)
//   3. Servidor sanitiza → κ(E) → σ = HMAC(S, κ(E)) → devolve { sig, entries }
//   4. Cliente monta JSON final { ..., __sig: σ } e dispara download
//
// Fluxo de IMPORT:
//   1. Usuário seleciona o .json salvo anteriormente
//   2. Cliente lê o arquivo, valida estrutura mínima
//   3. Envia { entries, sig } ao servidor (/api/backup-import)
//   4. Servidor recomputa σ′; comparação em tempo constante
//      → ok: true  → substitui IndexedDB → UI mostra contagem
//      → ok: false → lança "Erro ao recuperar dados" (genérico intencional)

import { getDiaryEntries, getProfile } from './cache'
import { openDB } from 'idb'

// ── Comunicação com as Serverless Functions ────────────────────────────────

async function callApi(path, body) {
  const res = await fetch(path, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Servidor indisponível (${res.status})`)
  return res.json()
}

// ── EXPORT ─────────────────────────────────────────────────────────────────

export async function exportBackup() {
  // Carrega dados locais em paralelo
  const [entries, profile] = await Promise.all([getDiaryEntries(), getProfile()])

  // Pede assinatura ao servidor — ele também sanitiza (clampeia) os campos
  const { sig, entries: signed, exportedAt } = await callApi('/api/backup-export', { entries })

  // Monta o arquivo final
  // Nota: o perfil (nome/avatar/foto) NÃO entra na assinatura pois não afeta
  // pontuação. Apenas as entradas do diário são protegidas criptograficamente.
  const backup = {
    app:        'pesquei',
    version:    1,
    exportedAt,
    profile:    profile || {},
    entries:    signed,
    __sig:      sig,     // σ = HMAC-SHA256(S, κ(entries)) — 64 hex chars
  }

  // Dispara download no browser
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  // Nome inclui data (YYYY-MM-DD) para facilitar organização no Drive/OneDrive
  a.download = `pesquei-backup-${exportedAt.slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5_000)
}

// ── IMPORT ─────────────────────────────────────────────────────────────────

export async function importBackup(file) {
  // Lê o arquivo como texto UTF-8
  const text = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsText(file, 'utf-8')
  })

  // Parse JSON
  let parsed
  try { parsed = JSON.parse(text) }
  catch { throw new Error('Arquivo inválido') }

  // Valida estrutura mínima sem revelar detalhes ao usuário
  if (
    parsed.app !== 'pesquei'       ||
    !Array.isArray(parsed.entries) ||
    typeof parsed.__sig !== 'string'
  ) {
    throw new Error('Arquivo inválido')
  }

  // Envia ao servidor para verificação da assinatura HMAC
  const result = await callApi('/api/backup-import', {
    entries: parsed.entries,
    sig:     parsed.__sig,
  })

  if (!result.ok) {
    // Mensagem genérica intencional — não indica se foi adulteração ou outro erro
    throw new Error('Erro ao recuperar dados')
  }

  // Substitui base local com as entradas verificadas e sanitizadas pelo servidor
  await replaceAllEntries(result.entries)

  return {
    count:   result.entries.length,
    profile: parsed.profile || null,  // para o chamador oferecer restaurar perfil
  }
}

// ── Substituição atômica do IndexedDB ──────────────────────────────────────
// Abre uma única transação readwrite: limpa tudo, reinsere as entradas validadas.
// IDs originais são descartados — IndexedDB autoIncrement gera novos IDs locais.

async function replaceAllEntries(entries) {
  const db = await openDB('pesquei-db', 2)
  const tx = db.transaction('diary', 'readwrite')
  await tx.store.clear()
  for (const entry of entries) {
    // Remove o id original (era do dispositivo anterior) antes de recriar
    const { id: _drop, ...rest } = entry
    await tx.store.add(rest)
  }
  await tx.done
}
