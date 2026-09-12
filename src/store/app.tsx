import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { subscribe } from '@/lib/db'
import * as authService from '@/services/auth'
import type { PublicUser } from '@/services/auth'
import { userStats, evaluateAchievements, recordSession, weeklyMinutes, type UserStats } from '@/services/gamification'
import { nextLessonFor, courseProgress } from '@/services/progress'
import { effectivePlan } from '@/services/billing'
import { getGenre } from '@/services/content'
import { listNotifications, markAllRead } from '@/services/lgpd'
import { track } from '@/services/analytics'
import type { Genre, Lesson, PlanDef } from '@/types'

// Store do app: sessão + derivados (stats/progress/plan) recompute a cada
// mutação do banco (db.subscribe). Sem estado duplicado = sem dessincronização.

export interface Toast { id: number; text: string; tone?: 'success' | 'info' | 'error' }

interface AppValue {
  user: PublicUser | null
  stats: UserStats | null
  plan: PlanDef | null
  genre: Genre | undefined
  nextLesson: Lesson | undefined
  coursePct: (courseId: string) => number
  weeklyMin: number
  notifications: ReturnType<typeof listNotifications>
  unread: number
  toasts: Toast[]
  pushToast: (text: string, tone?: Toast['tone']) => void
  refresh: () => void
  afterProgress: () => void
  markRead: () => void
  doLogout: () => void
}

const Ctx = createContext<AppValue | null>(null)

let toastSeq = 0

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(() => authService.currentUser())
  const [version, setVersion] = useState(0)
  const [toasts, setToasts] = useState<Toast[]>([])

  const refresh = useCallback(() => {
    setUser(authService.currentUser())
    setVersion(v => v + 1)
  }, [])

  useEffect(() => subscribe(refresh), [refresh])

  const pushToast = useCallback((text: string, tone: Toast['tone'] = 'success') => {
    const id = ++toastSeq
    setToasts(t => [...t, { id, text, tone }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200)
  }, [])

  const afterProgress = useCallback(() => {
    if (!user) return
    const newly = evaluateAchievements(user.id)
    newly.forEach(a => pushToast(`${a.icon} Conquista: ${a.title} (+${a.xp} XP)`))
    setVersion(v => v + 1)
  }, [user, pushToast])

  const stats = useMemo(() => (user ? userStats(user.id) : null), [user, version])
  const plan = useMemo(() => (user ? effectivePlan(user.id) : null), [user, version])
  const genre = useMemo(() => (user ? getGenre(user.profile.genre) : undefined), [user])
  const nextLesson = useMemo(() => (user ? nextLessonFor(user.id) : undefined), [user, version])
  const weeklyMin = useMemo(() => (user ? weeklyMinutes(user.id) : 0), [user, version])
  const notifications = useMemo(() => (user ? listNotifications(user.id) : []), [user, version])

  const value: AppValue = useMemo(() => ({
    user, stats, plan, genre, nextLesson,
    coursePct: (courseId: string) => (user ? courseProgress(user.id, courseId) : 0),
    weeklyMin,
    notifications,
    unread: notifications.filter(n => !n.read).length,
    toasts, pushToast, refresh, afterProgress,
    markRead: () => { if (user) { markAllRead(user.id); setVersion(v => v + 1) } },
    doLogout: () => { track('logout'); authService.logout(); setUser(null) },
  }), [user, stats, plan, genre, nextLesson, weeklyMin, notifications, toasts, pushToast, refresh, afterProgress])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp fora do AppProvider')
  return v
}

export function useRecordStudySession() {
  const v = useApp()
  return useCallback((minutes = 20, note?: string) => {
    if (!v.user) return
    recordSession(v.user.id, minutes, note)
    track('studio_session', { minutes })
    v.afterProgress()
    const s = userStats(v.user.id).streak
    v.pushToast(`🎧 Sessão registrada: +${minutes} min — streak ${s.current} dia(s)`)
  }, [v])
}
