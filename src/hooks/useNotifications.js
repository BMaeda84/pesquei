// Alerta matinal de pesca — dispara quando:
//   • O usuário abre o app entre 05:00 e 09:00
//   • Índice de pesca >= 55
//   • Ainda não foi mostrado hoje
//
// Tenta mostrar uma notificação nativa do SO se a permissão foi concedida.
// Caso contrário, retorna `morningAlert` para o componente exibir um banner in-app.
//
// IMPORTANTE: notificação "às 5h sem abrir o app" requer Push API + servidor.
// Essa implementação cobre o caso mais frequente (abrir o app pela manhã).

import { useState, useEffect, useCallback } from 'react'

const SHOWN_KEY   = 'pesquei_morning_shown'   // armazena a data da última exibição
const OPT_IN_KEY  = 'pesquei_notif_optin'     // 'true' | 'false' | null (pendente)

export function useNotifications(score, label) {
  const [permission,    setPermission]    = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [morningAlert,  setMorningAlert]  = useState(null)  // { score, label } | null
  const [optIn,         setOptIn]         = useState(
    () => localStorage.getItem(OPT_IN_KEY)  // 'true' | 'false' | null
  )

  // ── Verifica se deve exibir o alerta matinal ──────────────────────────
  useEffect(() => {
    if (score == null) return

    const hour    = new Date().getHours()
    const isMorn  = hour >= 5 && hour < 9
    if (!isMorn || score < 55) return

    const today     = new Date().toDateString()
    const lastShown = localStorage.getItem(SHOWN_KEY)
    if (lastShown === today) return

    // Marca como exibido hoje
    localStorage.setItem(SHOWN_KEY, today)
    setMorningAlert({ score, label })

    // Tenta notificação nativa se permissão já concedida
    if (permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        reg?.showNotification('🎣 Pesquei! — Bom dia!', {
          body:  `Índice ${score}/100 (${label}) — ótima manhã para pescar!`,
          icon:  '/pwa-192.png',
          badge: '/pwa-192.png',
          tag:   'morning-alert',       // substitui notificação anterior se existir
        })
      })
    }
  }, [score, label, permission])

  // ── Solicita permissão de notificação ao SO ───────────────────────────
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied'
    const result = await Notification.requestPermission()
    setPermission(result)
    localStorage.setItem(OPT_IN_KEY, result === 'granted' ? 'true' : 'false')
    setOptIn(result === 'granted' ? 'true' : 'false')
    return result
  }, [])

  // ── Recusa opt-in sem pedir permissão ao SO ───────────────────────────
  const declineNotifications = useCallback(() => {
    localStorage.setItem(OPT_IN_KEY, 'false')
    setOptIn('false')
  }, [])

  const dismissMorningAlert = useCallback(() => setMorningAlert(null), [])

  return {
    permission,
    morningAlert,
    // null = nunca perguntamos; 'true'/'false' = já decidiu
    optInPending: optIn === null,
    requestPermission,
    declineNotifications,
    dismissMorningAlert,
  }
}
