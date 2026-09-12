import { describe, expect, it } from 'vitest'
import {
  xpFromProgress, levelFor, levelProgress, computeProgress,
  gradeQuiz, computeStreak, weeklyGoalReached,
} from '@/lib/gamify'
import { DEFAULT_XP, DEFAULT_LEVELS } from '@/config/gamification'
import { resetDb, raw } from '@/lib/db'

const zero: Record<string, number | boolean> = {
  lessons: 0, exercises: 0, challenges: 0, projects: 0, courses: 0,
  firstTrack: false, quizPerfets: 0, streakDays: 0,
}

describe('xp (configurável — exigência do produto)', () => {
  it('usa os padrões quando sem override', () => {
    expect(xpFromProgress({ ...zero, lessons: 2 } as never, {}, false)).toBe(2 * DEFAULT_XP.lessonComplete)
    expect(xpFromProgress({ ...zero, firstTrack: true } as never, {}, false)).toBe(DEFAULT_XP.firstTrackFinished)
    expect(xpFromProgress({ ...zero } as never, {}, true)).toBe(DEFAULT_XP.onboardingComplete)
  })
  it('respeita overrides do admin (XP não fixo no código)', () => {
    expect(xpFromProgress({ ...zero, lessons: 2 } as never, { lessonComplete: 10 }, false)).toBe(20)
    expect(xpFromProgress({ ...zero, courses: 1 } as never, { courseComplete: 999 }, false)).toBe(999)
  })
})

describe('níveis', () => {
  it('levelFor é 0-based e prende no topo', () => {
    expect(levelFor(0, DEFAULT_LEVELS).name).toBe('Iniciante')
    expect(levelFor(499, DEFAULT_LEVELS).name).toBe('Iniciante')
    expect(levelFor(500, DEFAULT_LEVELS).name).toBe('Beatmaker')
    const top = levelFor(999_999, DEFAULT_LEVELS)
    expect(top.name).toBe('Electronic Music Artist')
    expect(top.next).toBeNull()
  })
  it('levelProgress interpola e clampa', () => {
    expect(levelProgress(250, DEFAULT_LEVELS)).toBe(50)   // 250/500 até Beatmaker
    expect(levelProgress(999999, DEFAULT_LEVELS)).toBe(100)
  })
  it('funciona com lista custom do admin', () => {
    const custom = [{ name: 'A', min: 0 }, { name: 'B', min: 10 }]
    expect(levelFor(10, custom).name).toBe('B')
  })
})

describe('progresso & quiz', () => {
  it('computeProgress clampa 0–100 e tolera total 0', () => {
    expect(computeProgress(1, 4)).toBe(25)
    expect(computeProgress(-5, 4)).toBe(0)
    expect(computeProgress(2, 0)).toBe(0)
    expect(computeProgress(9, 4)).toBe(100)
  })
  it('gradeQuiz corrige e detecta gabarito perfeito', () => {
    const qs = [{ id: 'q1', correct: 0 }, { id: 'q2', correct: 1 }]
    expect(gradeQuiz({ q1: 0, q2: 1 }, qs)).toEqual({ correct: 2, total: 2, score: 100, perfect: true })
    expect(gradeQuiz({ q1: 1 }, qs).perfect).toBe(false)
    expect(gradeQuiz({}, []).score).toBe(0)
  })
  it('weeklyGoalReached exige alvo > 0', () => {
    expect(weeklyGoalReached(120, 120)).toBe(true)
    expect(weeklyGoalReached(119, 120)).toBe(false)
    expect(weeklyGoalReached(500, 0)).toBe(false)
  })
})

describe('streak', () => {
  const d = (off: number) => new Date(Date.now() - off * 864e5).toISOString().slice(0, 10)
  it('dias consecutivos contando até hoje', () => {
    const s = computeStreak([d(0), d(1), d(2)], d(0).slice(0, 7), [10, 20, 30])
    expect(s.current).toBe(3)
    expect(s.best).toBeGreaterThanOrEqual(3)
    expect(s.activeToday).toBe(true)
    expect(s.monthMinutes).toBe(60)
  })
  it('streak quebrou → current 0', () => {
    expect(computeStreak([d(5)], d(0).slice(0, 7), []).current).toBe(0)
  })
  it('sem sessões hoje mas com ontem → streak vivo (janela de graça)', () => {
    const s = computeStreak([d(1)], d(0).slice(0, 7), [])
    expect(s.current).toBe(1)
    expect(s.activeToday).toBe(false)
  })
})

describe('db demo', () => {
  it('reset restaura seed; cache guarda __v de schema', () => {
    resetDb()
    const db = raw()
    expect(db.__v).toBeGreaterThanOrEqual(1)
    expect(db.courses.length).toBeGreaterThanOrEqual(9)
    expect(db.lessons.length).toBeGreaterThan(30)
    expect(db.genres.length).toBeGreaterThanOrEqual(14)
    expect(db.projects.length).toBeGreaterThanOrEqual(8)
    db.courses.push({} as never)
    resetDb()
    expect(raw().courses.every(c => !!c.id && !!c.title)).toBe(true)
  })
})
