import { raw, upsert, remove, insert, update } from '@/lib/db'
import { nowISO } from '@/lib/utils'
import type { ConsentRow, NotificationRow } from '@/types'

// LGPD: consentimento granular, exportação de dados (portabilidade), exclusão,
// preferências de notificação. O banner de cookies usa o consentimento 'cookies'.

export function getConsent(userId: string): ConsentRow {
  return raw().consent.find(c => c.userId === userId) ?? { userId, analytics: false, marketing: false, cookies: false, ts: '' }
}

export function saveConsent(userId: string, patch: Partial<ConsentRow>) {
  const cur = getConsent(userId)
  const next = { ...cur, ...patch, userId, ts: nowISO() }
  upsert('consent', c => c.userId === userId, next as ConsentRow)
}

export function cookiesBannerDismissed(): 'accepted' | 'managed' | null {
  try { return localStorage.getItem('sonora.cookies') as 'accepted' | 'managed' } catch { return null }
}

export function dismissCookiesBanner(kind: 'accepted' | 'managed') {
  try { localStorage.setItem('sonora.cookies', kind) } catch { /* noop */ }
}

/** Portabilidade: JSON com TUDO que a conta contém no banco local. */
export function exportUserData(userId: string): string {
  const db = raw()
  if (!db.users.some(u => u.id === userId)) throw new Error('Usuário não encontrado — nada será exportado.')
  const data = {
    exportedAt: nowISO(),
    note: 'Exportação completa dos dados da conta (modo demonstração local). Em produção: endpoint server-side com verificação de identidade.',
    user: db.users.find(u => u.id === userId),
    profile: db.profiles.find(p => p.userId === userId),
    lesson_progress: db.lesson_progress.filter(r => r.userId === userId),
    project_progress: db.project_progress.filter(r => r.userId === userId),
    tracks: db.tracks.filter(r => r.userId === userId),
    ideas: db.ideas.filter(r => r.userId === userId),
    studio_sessions: db.studio_sessions.filter(r => r.userId === userId),
    finish_track: db.finish_track.filter(r => r.userId === userId),
    challenge_claims: db.challenge_claims.filter(r => r.userId === userId),
    user_achievements: db.user_achievements.filter(r => r.userId === userId),
    certificates: db.certificates.filter(r => r.userId === userId),
    community_posts: db.community_posts.filter(r => r.userId === userId),
    community_comments: db.community_comments.filter(r => r.userId === userId),
    notifications: db.notifications.filter(r => r.userId === userId),
    subscriptions: db.subscriptions.filter(r => r.userId === userId),
    payments: db.payments.filter(r => r.userId === userId),
    consent: db.consent.filter(r => r.userId === userId),
  }
  return JSON.stringify(data, null, 2)
}

/** Direito ao esquecimento: remove a conta e dados pessoais; posts ficam como "Removido" (integridade do fio). */
export function deleteAccount(userId: string) {
  const db = raw()
  // anonimiza conteúdo publicado (mantém fio legível)
  db.community_posts.forEach(p => { if (p.userId === userId) { p.userId = 'deleted'; p.authorName = 'Usuário removido' } })
  db.community_comments.forEach(c => { if (c.userId === userId) { c.userId = 'deleted'; c.authorName = 'Usuário removido' } })
  for (const t of ['users', 'profiles', 'lesson_progress', 'project_progress', 'tracks', 'ideas', 'studio_sessions', 'finish_track', 'challenge_claims', 'user_achievements', 'certificates', 'notifications', 'subscriptions', 'payments', 'consent'] as const) {
    const rm = remove as unknown as (table: string, pred: (r: { id?: string; userId?: string }) => boolean) => number
    rm(t, r => r.userId === userId || r.id === userId)
  }
}

// ── Notificações ────────────────────────────────────────────────────────────

export function listNotifications(userId: string): NotificationRow[] {
  return raw().notifications.filter(n => n.userId === userId).sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, 30)
}

export function markAllRead(userId: string) {
  const unread = raw().notifications.filter(n => n.userId === userId && !n.read)
  unread.forEach(n => update('notifications', n.id, { read: true }))
  insert('analytics_events', { id: `evt-${Date.now()}`, event: 'notifications_read', ts: nowISO(), userId })
}
