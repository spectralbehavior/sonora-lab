import type { Tables, TableName } from '@/types'
import { uid } from './utils'
import { buildSeed } from '@/data/seed'

// ─────────────────────────────────────────────────────────────────────────────
// Camada de dados. Em produção, o frontend fala com Supabase (PostgREST +
// RLS — ver supabase/schema.sql). Enquanto não há projeto Supabase configurado,
// este módulo persiste em localStorage com MESMAS tabelas/colunas, então os
// services não mudam. `src/lib/supabase.ts` documenta a troca por env var.
// ─────────────────────────────────────────────────────────────────────────────

const KEY = 'sonora.db.v1'
const SCHEMA_V = 1

let cache: Tables | null = null
const listeners = new Set<() => void>()

function clone<T>(x: T): T {
  return typeof structuredClone === 'function' ? structuredClone(x) : JSON.parse(JSON.stringify(x))
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch { /* quota/sem DOM */ }
}

function emit() {
  listeners.forEach(fn => { try { fn() } catch { /* noop */ } })
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function ensure(): Tables {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Tables
      if (parsed?.__v === SCHEMA_V) { cache = parsed; return cache }
    }
  } catch { /* corrompido → reseed */ }
  cache = buildSeed()
  persist()
  return cache
}

export function raw(): Tables {
  return ensure()
}

export function getTable<T extends TableName>(table: T): Tables[T] {
  return clone(ensure()[table])
}

export function insert<T extends TableName>(table: T, row: Partial<Tables[T][number]> & { id?: string }): Tables[T][number] {
  const db = ensure()
  const full = { ...(row as object), id: row.id ?? uid(table) } as Tables[T][number]
  ;(db[table] as unknown[]).push(full)
  persist(); emit()
  return clone(full)
}

export function upsert<T extends TableName>(table: T, match: (r: Tables[T][number]) => boolean, row: Tables[T][number]): void {
  const db = ensure()
  const arr = db[table] as unknown[]
  const i = arr.findIndex(r => match(r as Tables[T][number]))
  if (i >= 0) arr[i] = row
  else arr.push(row)
  persist(); emit()
}

export function update<T extends TableName>(table: T, id: string, patch: Partial<Tables[T][number]>): boolean {
  const db = ensure()
  const arr = db[table] as { id: string }[]
  const i = arr.findIndex(r => r.id === id)
  if (i < 0) return false
  arr[i] = { ...arr[i], ...patch }
  persist(); emit()
  return true
}

export function remove<T extends TableName>(table: T, pred: (r: Tables[T][number]) => boolean): number {
  const db = ensure()
  const arr = db[table] as unknown[]
  const before = arr.length
  const keep = arr.filter(r => !pred(r as Tables[T][number]))
  db[table] = keep as never
  persist(); emit()
  return before - keep.length
}

// ── Configurações (plans, XP, níveis, versões de DAW editáveis pelo admin) ──
export function getSetting<T>(key: string, fallback: T): T {
  const row = ensure().settings.find(s => s.key === key)
  return (row?.value as T) ?? fallback
}

export function setSetting(key: string, value: unknown) {
  const db = ensure()
  const row = db.settings.find(s => s.key === key)
  if (row) row.value = value
  else db.settings.push({ key, value })
  persist(); emit()
}

export function resetDb() {
  cache = buildSeed()
  persist(); emit()
}

export function hardResetDb() {
  try { localStorage.removeItem(KEY) } catch { /* noop */ }
  cache = null
  ensure()
}
