import { useState, useEffect, useCallback } from 'react'
import { getProfile, saveProfile as persistProfile } from '../utils/cache'

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile().then(p => { setProfile(p); setLoading(false) })
  }, [])

  const saveProfile = useCallback(async (data) => {
    await persistProfile(data)
    setProfile(data)
  }, [])

  return { profile, loading, saveProfile }
}
