import { getTable, insert, raw, update } from '@/lib/db'
import { nowISO, uid, pct } from '@/lib/utils'
import type { LessonProgress, ProjectProgress, Lesson } from '@/types'

// Progresso do aluno: aulas, checks de prática/checklist, quizzes e projetos.
// XP/conquistas são DERIVADOS deste estado (função pura) — nada de contadores
// soltos que desincronizam.

export function myProgress(userId: string): LessonProgress[] {
  return getTable('lesson_progress').filter(p => p.userId === userId)
}

export function lessonProgressRow(userId: string, lessonId: string): LessonProgress | undefined {
  return raw().lesson_progress.find(p => p.userId === userId && p.lessonId === lessonId)
}

export function startOrToggleCheck(userId: string, lesson: Lesson, key: string, checked: boolean): void {
  const row = lessonProgressRow(userId, lesson.id)
  const checks = new Set(row?.checks ?? [])
  if (checked) checks.add(key); else checks.delete(key)
  if (row) {
    update('lesson_progress', row.id, { checks: [...checks] })
  } else {
    insert('lesson_progress', {
      id: uid('lp'), userId, lessonId: lesson.id, courseId: lesson.courseId, moduleId: lesson.moduleId,
      completedAt: '', checks: [...checks],
    } as LessonProgress)
  }
}

export function completeLesson(userId: string, lesson: Lesson): boolean {
  const row = lessonProgressRow(userId, lesson.id)
  if (row?.completedAt) return false
  if (row) update('lesson_progress', row.id, { completedAt: nowISO() })
  else insert('lesson_progress', {
    id: uid('lp'), userId, lessonId: lesson.id, courseId: lesson.courseId, moduleId: lesson.moduleId, completedAt: nowISO(),
  } as LessonProgress)
  return true
}

export function uncompleteLesson(userId: string, lessonId: string) {
  const row = lessonProgressRow(userId, lessonId)
  if (row) update('lesson_progress', row.id, { completedAt: '' })
}

export function saveQuizScore(userId: string, lessonId: string, score: number) {
  const row = lessonProgressRow(userId, lessonId)
  const lesson = raw().lessons.find(l => l.id === lessonId)
  if (!lesson) return
  if (row) update('lesson_progress', row.id, { quizScore: Math.max(row.quizScore ?? 0, score) })
  else insert('lesson_progress', {
    id: uid('lp'), userId, lessonId, courseId: lesson.courseId, moduleId: lesson.moduleId, completedAt: '', quizScore: score,
  } as LessonProgress)
}

export function moduleProgress(userId: string, moduleId: string): number {
  const lessons = raw().lessons.filter(l => l.moduleId === moduleId)
  const done = lessons.filter(l => (raw().lesson_progress.find(p => p.userId === userId && p.lessonId === l.id)?.completedAt)).length
  return pct(done, lessons.length)
}

export function courseProgress(userId: string, courseId: string): number {
  const lessons = raw().lessons.filter(l => l.courseId === courseId)
  const done = lessons.filter(l => raw().lesson_progress.find(p => p.userId === userId && p.lessonId === l.id)?.completedAt).length
  return pct(done, lessons.length)
}

export function isCourseComplete(userId: string, courseId: string): boolean {
  const lessons = raw().lessons.filter(l => l.courseId === courseId)
  if (!lessons.length) return false
  const prog = raw().lesson_progress.filter(p => p.userId === userId)
  return lessons.every(l => prog.some(p => p.lessonId === l.id && p.completedAt))
}

/** Próxima aula recomendada: segue o progresso linear dos cursos publicados. */
export function nextLessonFor(userId: string, preferredCourseId?: string): Lesson | undefined {
  const prog = new Set(raw().lesson_progress.filter(p => p.userId === userId && p.completedAt).map(p => p.lessonId))
  const courses = raw().courses.filter(c => c.published).sort((a, b) => a.order - b.order)
  const ordered = preferredCourseId ? [courses.find(c => c.id === preferredCourseId)!, ...courses.filter(c => c.id !== preferredCourseId)] : courses
  for (const course of ordered) {
    if (!course) continue
    const lessons = raw().lessons.filter(l => l.courseId === course.id).sort((a, b) => a.order - b.order)
    const next = lessons.find(l => !prog.has(l.id))
    if (next) return next
  }
  return undefined
}

// ── Projetos ─────────────────────────────────────────────────────────────────

export function myProjectProgress(userId: string): ProjectProgress[] {
  return getTable('project_progress').filter(p => p.userId === userId)
}

export function projectProgressRow(userId: string, projectId: string): ProjectProgress | undefined {
  return raw().project_progress.find(p => p.userId === userId && p.projectId === projectId)
}

export function startProject(userId: string, projectId: string) {
  if (projectProgressRow(userId, projectId)) return
  insert('project_progress', {
    id: uid('pp'), userId, projectId, status: 'em_andamento', checked: [], startedAt: nowISO(),
  } as ProjectProgress)
}

export function toggleProjectCheck(userId: string, projectId: string, item: string) {
  startProject(userId, projectId)
  const row = projectProgressRow(userId, projectId)!
  const set = new Set(row.checked)
  if (set.has(item)) set.delete(item); else set.add(item)
  update('project_progress', row.id, { checked: [...set] })
}

export function completeProject(userId: string, projectId: string): boolean {
  const row = projectProgressRow(userId, projectId)
  if (!row || row.status === 'concluido') return false
  const project = raw().projects.find(p => p.id === projectId)
  const allChecked = !project || project.checklist.every(c => row.checked.includes(c))
  if (!allChecked) throw new Error('Conclua todos os itens do checklist antes de finalizar o projeto.')
  update('project_progress', row.id, { status: 'concluido', completedAt: nowISO() })
  return true
}
