import { openDB } from 'idb'

const DB_NAME = 'pesquei-db'
const DB_VERSION = 1

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('cache')
      db.createObjectStore('diary', { keyPath: 'id', autoIncrement: true })
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
  const db = await getDB()
  return db.add('diary', { ...entry, createdAt: new Date().toISOString() })
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
