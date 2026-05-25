import { useState, useRef } from 'react'
import { exportBackup, importBackup } from '../utils/backup'

// ── Backup & Restauração ──────────────────────────────────────────────────
// Exporta a base local como .json assinado por HMAC-SHA256.
// O arquivo pode ser salvo no Google Drive, OneDrive, e-mail, etc.
// Na restauração, o servidor verifica a assinatura antes de aceitar qualquer dado.
// Arquivos adulterados ou gerados fora do app são silenciosamente rejeitados.

export default function BackupRestore({ onRestored }) {
  const [busy,    setBusy]    = useState(null) // null | 'export' | 'import'
  const [result,  setResult]  = useState(null) // { ok, message }
  const fileRef = useRef()

  async function handleExport() {
    setBusy('export')
    setResult(null)
    try {
      await exportBackup()
      setResult({ ok: true, message: 'Backup gerado! Salve o arquivo no Drive, OneDrive ou e-mail.' })
    } catch (err) {
      // Distingue erro de servidor de erro de rede apenas no console
      console.error('[backup export]', err)
      setResult({ ok: false, message: 'Não foi possível gerar o backup. Verifique sua conexão.' })
    } finally {
      setBusy(null)
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset do input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ''

    setBusy('import')
    setResult(null)
    try {
      const { count } = await importBackup(file)
      const plural = count !== 1 ? 's' : ''
      setResult({ ok: true, message: `✅ ${count} registro${plural} recuperado${plural} com sucesso!` })
      // Notifica o componente pai para recarregar as entradas na UI
      onRestored?.()
    } catch (err) {
      // Mensagem exibida ao usuário é sempre genérica (por design anti-cheat)
      // O detalhe técnico vai só para o console
      console.error('[backup import]', err)
      const msg = err.message === 'Erro ao recuperar dados'
        ? 'Erro ao recuperar dados.'          // arquivo inválido / adulterado
        : 'Arquivo inválido ou incompatível.' // parse error / estrutura errada
      setResult({ ok: false, message: msg })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="backup-section">
      <div className="backup-title">💾 Backup & Restauração</div>
      <p className="backup-hint">
        Salve seus dados no Google Drive, OneDrive ou e-mail e recupere ao trocar de celular.
      </p>

      <div className="backup-actions">
        {/* Export — gera o arquivo .json assinado e dispara download */}
        <button
          className="btn-secondary btn-full"
          onClick={handleExport}
          disabled={!!busy}
        >
          {busy === 'export' ? '⏳ Gerando backup…' : '📥 Exportar meus dados'}
        </button>

        {/* Import — abre seletor de arquivo; verificação HMAC acontece no servidor */}
        <button
          className="btn-secondary btn-full"
          onClick={() => fileRef.current?.click()}
          disabled={!!busy}
        >
          {busy === 'import' ? '⏳ Verificando…' : '📤 Restaurar backup'}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {/* Feedback — cor verde para sucesso, vermelho para erro */}
      {result && (
        <p className={`backup-status ${result.ok ? 'backup-ok' : 'backup-err'}`}>
          {result.message}
        </p>
      )}
    </div>
  )
}
