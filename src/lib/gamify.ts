// Cálculos puros de gamificação — testados em src/__tests__/gamify.test.ts.
// Sem dependência de DOM/banco para facilitar testes.

export interface XpCounts {
  lessons: number
  exercises: number
  challenges: number
  projects: number
  courses: number
  firstTrack: boolean
  quizPerfets: number
  streakDays: number
}

export type XpConfig = Partial<Record<keyof typeof BASE, number>> & Record<string, number | undefined>

const BASE = {
  lessonComplete: 50,
  exerciseComplete: 100,
  challengeComplete: 250,
  projectComplete: 500,
  firstTrackFinished: 1000,
  courseComplete: 2500,
  onboardingComplete: 100,
  quizPerfectBonus: 50,
  streakDayBonus: 10,
}

export function xpFromProgress(c: XpCounts, cfg: XpConfig, onboardingDone: boolean): number {
  const g = (k: keyof typeof BASE) => cfg[k] ?? BASE[k]
  let xp = 0
  xp += c.lessons * g('lessonComplete')
  xp += c.exercises * g('exerciseComplete')
  xp += c.challenges * g('challengeComplete')
  xp += c.projects * g('projectComplete')
  xp += c.courses * g('courseComplete')
  xp += c.quizPerfets * g('quizPerfectBonus')
  xp += c.streakDays * g('streakDayBonus')
  if (c.firstTrack) xp += g('firstTrackFinished')
  if (onboardingDone) xp += g('onboardingComplete')
  return xp
}

export function levelFor(xp: number, levels: { name: string; min: number }[]): { index: number; name: string; next: { name: string; min: number } | null } {
  const sorted = [...levels].sort((a, b) => a.min - b.min)
  let index = 0
  for (let i = 0; i < sorted.length; i++) if (xp >= sorted[i].min) index = i
  const next = index + 1 < sorted.length ? sorted[index + 1] : null
  return { index, name: sorted[index]?.name ?? 'Iniciante', next }
}

export function levelProgress(xp: number, levels: { name: string; min: number }[]): number {
  const { index, next } = levelFor(xp, levels)
  const sorted = [...levels].sort((a, b) => a.min - b.min)
  if (!next) return 100
  const cur = sorted[index]?.min ?? 0
  return Math.max(0, Math.min(100, Math.round(((xp - cur) / (next.min - cur)) * 100)))
}

export interface Streak {
  current: number
  best: number
  activeToday: boolean
  monthMinutes: number
}

export function computeStreak(sessionDates: string[], monthKey: string, allMonthMinutes: number[]): Streak {
  const days = new Set(sessionDates.filter(Boolean))
  const sorted = [...days].sort()
  let best = 0
  let run = 0
  let prev: Date | null = null
  for (const d of sorted) {
    const dt = new Date(`${d}T12:00:00`)
    if (prev && Math.round((dt.getTime() - prev.getTime()) / 86400000) === 1) run += 1
    else run = 1
    best = Math.max(best, run)
    prev = dt
  }
  // Janela de tolerância: quem praticou ontem mantém a streak durante hoje
  // (ela só quebra quando o dia vira sem prática). Conta a partir de HOJE
  // se existir sessão hoje; senão de ONTEM.
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  let cursor: Date | null = days.has(fmt(today)) ? today : days.has(fmt(yesterday)) ? yesterday : null
  let current = 0
  while (cursor) {
    current += 1
    const prev = new Date(cursor)
    prev.setDate(prev.getDate() - 1)
    cursor = days.has(fmt(prev)) ? prev : null
  }
  return { current, best: Math.max(best, current), activeToday: days.has(new Date().toISOString().slice(0, 10)), monthMinutes: allMonthMinutes.reduce((a, b) => a + b, 0) }
}

export function computeProgress(done: number, total: number): number {
  if (total <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)))
}

export interface GradeResult {
  correct: number
  total: number
  score: number
  perfect: boolean
}

export function gradeQuiz(answers: Record<string, number>, questions: { id: string; correct: number }[]): GradeResult {
  const total = questions.length
  const correct = questions.filter(q => answers[q.id] === q.correct).length
  return { correct, total, score: total ? Math.round((correct / total) * 100) : 0, perfect: total > 0 && correct === total }
}

export function weeklyGoalReached(minutes: number, target: number): boolean {
  return target > 0 && minutes >= target
}
