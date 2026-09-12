export function uid(prefix = ''): string {
  const rnd = Math.random().toString(36).slice(2, 10)
  const t = Date.now().toString(36)
  return `${prefix}${prefix ? '_' : ''}${t}${rnd}`
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatMoney(v: number, currency = 'BRL'): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency })
}

export function formatBRL(v: number): string {
  return formatMoney(v)
}

export function pct(a: number, b: number): number {
  if (!b) return 0
  return Math.min(100, Math.round((a / b) * 100))
}

export function cn(...xs: (string | false | null | undefined)[]): string {
  return xs.filter(Boolean).join(' ')
}

export function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

// Hash de senha em MODO DEMO local (função síncrona e determinística, para
// semear contas de teste no banco local). NÃO usar em produção: a produção
// real delega autenticação ao Supabase Auth (ver src/lib/supabase.ts).
export function hashPassword(pass: string): string {
  const salt = 'sonora-demo-v1'
  let h = 0x811c9dc5
  for (const b of new TextEncoder().encode(salt + pass)) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0 }
  return `fnv${h.toString(16).padStart(8, '0')}`
}

export function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8') {
  try {
    const blob = new Blob([text], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  } catch { /* ambiente sem DOM */ }
}

export function weekIndex(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1)
  return Math.floor((date.getTime() - start.getTime()) / (7 * 24 * 3600 * 1000))
}
