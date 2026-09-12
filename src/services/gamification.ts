import { raw, insert, getSetting, getTable } from '@/lib/db'
import { nowISO, uid } from '@/lib/utils'
import { xpFromProgress, computeStreak, levelFor, levelProgress, type XpCounts } from '@/lib/gamify'
import type { AchievementDef } from '@/types'

// Deriva XP, nível, streak, conquistas e roadmap a partir do estado do banco.
// Tudo recomputado — impossível dessincronizar.

export interface UserStats {
  lessons: number
  exercises: number
  projects: number
  courses: number
  tracks: number
  challenges: number
  mixDone: boolean
  masterDone: boolean
  hours: number
  xp: number
  levelIndex: number
  levelName: string
  nextLevel: { name: string; min: number } | null
  levelPct: number
  streak: { current: number; best: number; activeToday: boolean; monthMinutes: number }
  achievements: { def: AchievementDef; earnedAt?: string }[]
  recentEarned: AchievementDef[]
}

export function userStats(userId: string): UserStats {
  const db = raw()
  const prog = db.lesson_progress.filter(p => p.userId === userId)
  const completed = prog.filter(p => p.completedAt)
  const exercisesDone = completed.filter(p => {
    const lesson = db.lessons.find(l => l.id === p.lessonId)
    if (!lesson?.practice?.length) return true
    const checks = p.checks ?? []
    return lesson.practice.every((_, i) => checks.includes(`p:${i}`))
  }).length
  const proj = db.project_progress.filter(p => p.userId === userId)
  const projectsDone = proj.filter(p => p.status === 'concluido').length
  const tracks = db.tracks.filter(t => t.userId === userId && t.status === 'finalizada').length
  const challenges = db.challenge_claims.filter(c => c.userId === userId && c.done).length
  const mixDone = proj.some(p => p.status === 'concluido' && p.projectId === 'proj-primeira-mixagem')
  const masterDone = proj.some(p => p.status === 'concluido' && p.projectId === 'proj-primeiro-master')

  const publishedCourseIds = db.courses.filter(c => c.published).map(c => c.id)
  const coursesDone = publishedCourseIds.filter(cid => {
    const lessons = db.lessons.filter(l => l.courseId === cid)
    return lessons.length > 0 && lessons.every(l => completed.some(p => p.lessonId === l.id))
  }).length

  const hours = completed.reduce((acc, p) => acc + (db.lessons.find(l => l.id === p.lessonId)?.durationMin ?? 0), 0) / 60

  const sessions = db.studio_sessions.filter(s => s.userId === userId)
  const monthKey = new Date().toISOString().slice(0, 7)
  const streak = computeStreak(sessions.map(s => s.date.slice(0, 10)), monthKey, sessions.filter(s => s.date.startsWith(monthKey)).map(s => s.minutes))

  const profile = db.profiles.find(p => p.userId === userId)
  const xpCfg = getSetting<Record<string, number>>('xp', {})
  const counts: XpCounts = {
    lessons: completed.length, exercises: exercisesDone, challenges, projects: projectsDone,
    courses: coursesDone, firstTrack: tracks > 0, quizPerfets: completed.filter(p => p.quizScore === 100).length,
    streakDays: streak.current,
  }
  const xp = xpFromProgress(counts, xpCfg, !!profile?.level) + db.user_achievements.filter(a => a.userId === userId).reduce((acc, id) => acc + (db.achievements.find(a => a.id === id.achievementId)?.xp ?? 0), 0)

  const levels = getSetting('levels', [])
  const lvl = levelFor(xp, levels)

  const earnedMap = new Map(db.user_achievements.filter(a => a.userId === userId).map(a => [a.achievementId, a.earnedAt]))
  const achievements = db.achievements.map(def => ({ def, earnedAt: earnedMap.get(def.id) }))
  const recentEarned = [...achievements].filter(a => a.earnedAt).sort((a, b) => (b.earnedAt! > a.earnedAt! ? 1 : -1)).slice(0, 3).map(a => a.def)

  return {
    lessons: completed.length, exercises: exercisesDone, projects: projectsDone, courses: coursesDone,
    tracks, challenges, mixDone, masterDone, hours: Math.round(hours * 10) / 10,
    xp, levelIndex: lvl.index, levelName: lvl.name, nextLevel: lvl.next, levelPct: levelProgress(xp, levels),
    streak, achievements, recentEarned,
  }
}

/** Avalia critérios e concede novas conquistas (notificações + toast). Retorna as novas. */
export function evaluateAchievements(userId: string): AchievementDef[] {
  const s = userStats(userId)
  const db = raw()
  const earned = new Set(db.user_achievements.filter(a => a.userId === userId).map(a => a.achievementId))
  const newly: AchievementDef[] = []
  for (const def of db.achievements) {
    if (earned.has(def.id)) continue
    const m = def.criteria
    const value =
      m.metric === 'lessons' ? s.lessons :
      m.metric === 'projects' ? s.projects :
      m.metric === 'tracks' ? s.tracks :
      m.metric === 'courses' ? s.courses :
      m.metric === 'streak' ? s.streak.current :
      m.metric === 'challenges' ? s.challenges :
      m.metric === 'mixdone' ? (s.mixDone ? 1 : 0) :
      m.metric === 'masterdone' ? (s.masterDone ? 1 : 0) : 0
    if (value >= m.value) {
      insert('user_achievements', { id: uid('ua'), userId, achievementId: def.id, earnedAt: nowISO() })
      insert('notifications', { id: uid('ntf'), userId, text: `${def.icon} Conquista desbloqueada: ${def.title} (+${def.xp} XP)`, ts: nowISO(), read: false })
      newly.push(def)
    }
  }
  return newly
}

export function recordSession(userId: string, minutes: number, note?: string) {
  const date = new Date().toISOString()
  insert('studio_sessions', { id: uid('ss'), userId, date, minutes: Math.max(5, Math.min(600, Math.round(minutes))), note })
}

export function weeklyMinutes(userId: string): number {
  const cutoff = Date.now() - 7 * 86400000
  return raw().studio_sessions
    .filter(s => s.userId === userId && new Date(s.date).getTime() >= cutoff)
    .reduce((a, b) => a + b.minutes, 0)
}

export function listAchievements(): AchievementDef[] {
  return getTable('achievements')
}
