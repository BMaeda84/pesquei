import { openDB } from 'idb'

const DB_NAME = 'pesquei-db'
const DB_VERSION = 2

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('cache')
        db.createObjectStore('diary', { keyPath: 'id', autoIncrement: true })
      }
      if (oldVersion < 2) {
        db.createObjectStore('profile')
      }
    },
  })
}

// Salva dado com timestamp de expiração
export async function setCache(key, value, ttlSeconds = 3600) {
  const db = await getDB()
  await db.put('cache', { value, expiresAt: Date.now() + ttlSeconds * 1000 }, key)
}

// Lê dado do cache; retorna null se expirado
export async function getCache(key) {
  const db = await getDB()
  const entry = await db.get('cache', key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) return null
  return entry.value
}

// Diary entries
export async function saveDiaryEntry(entry) {
  const now = new Date()

  // S6 fix: sanitiza e clampeia todos os campos antes de persistir
  const qty    = Math.min(Math.max(parseInt(entry.quantity) || 1, 1), 99)
  const wt     = parseFloat(entry.weight)
  const weight = !isNaN(wt) && wt > 0 ? Math.min(wt, 200) : null
  const rating = Math.min(Math.max(parseInt(entry.rating) || 3, 1), 5)

  // Anti-cheat D4: data nunca pode ser futura
  const entryDate = entry.date ? new Date(entry.date) : now
  const safeDate  = entryDate > now ? now : entryDate

  // Anti-cheat D1/D2: verified só é aceito se vier com token de formato válido
  const hasToken = typeof entry.verifyToken === 'string' && /^[0-9a-f]{32}$/.test(entry.verifyToken)
  const verified = !!(entry.verified && hasToken)

  const clean = {
    species:     String(entry.species || '').slice(0, 60),
    icon:        String(entry.icon || '🐟').slice(0, 8),
    quantity:    qty,
    weight,
    rating,
    notes:       String(entry.notes || '').slice(0, 500),
    verified,
    verifyToken: verified ? entry.verifyToken : null,
    date:        safeDate.toISOString(),
    createdAt:   now.toISOString(),
  }

  const db = await getDB()
  return db.add('diary', clean)
}

export async function getDiaryEntries() {
  const db = await getDB()
  const all = await db.getAll('diary')
  return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function deleteDiaryEntry(id) {
  const db = await getDB()
  return db.delete('diary', id)
}

// Profile store — single record keyed 'current'
export async function getProfile() {
  const db = await getDB()
  return db.get('profile', 'current') ?? null
}

export async function saveProfile(profile) {
  const db = await getDB()
  return db.put('profile', profile, 'current')
}

export async function clearProfile() {
  const db = await getDB()
  return db.delete('profile', 'current')
}
