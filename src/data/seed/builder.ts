import type { Course, Lesson, ModuleRow, Quiz, AssetRef, DawSteps, Level, QuizQuestion } from '@/types'

export interface LessonSpec {
  title: string
  objective: string
  body: string
  durationMin?: number
  level?: Level
  tags: string[]
  demo?: string
  practice?: string[]
  challenge?: string
  checklist?: string[]
  files?: AssetRef[]
  quiz?: { title: string; questions: [string, string[], number, string][] }
  dawSteps?: DawSteps
  isSample?: boolean
}

export interface ModuleSpec {
  title: string
  summary: string
  lessons: LessonSpec[]
}

export interface CourseSpec {
  slug: string
  title: string
  subtitle: string
  description: string
  track: Course['track']
  dawId?: Course['dawId']
  level: Level
  order: number
  estHours: number
  objectives: string[]
  tags: string[]
  modules: ModuleSpec[]
  published?: boolean
  /** prefixo usado p/ carimbar versão verificada (academias de DAW) */
  verified?: { version: string; date: string }
}

export interface CourseBuild {
  course: Course
  modules: ModuleRow[]
  lessons: Lesson[]
  quizzes: Quiz[]
}

/** Constrói course + modules + lessons + quizzes com IDs determinísticos e estáveis. */
export function buildCourse(spec: CourseSpec): CourseBuild {
  const course: Course = {
    id: spec.slug,
    slug: spec.slug,
    title: spec.title,
    subtitle: spec.subtitle,
    description: spec.description,
    track: spec.track,
    dawId: spec.dawId,
    level: spec.level,
    order: spec.order,
    estHours: spec.estHours,
    published: spec.published ?? true,
    objectives: spec.objectives,
    tags: spec.tags,
  }
  const modules: ModuleRow[] = []
  const lessons: Lesson[] = []
  const quizzes: Quiz[] = []
  let ln = 0

  spec.modules.forEach((m, mi) => {
    const moduleId = `${spec.slug}-m${mi + 1}`
    modules.push({ id: moduleId, courseId: course.id, title: m.title, summary: m.summary, order: mi + 1 })
    m.lessons.forEach((ls, li) => {
      ln += 1
      const lessonId = `${spec.slug}-l${String(ln).padStart(2, '0')}`
      const quizId = `${lessonId}-quiz`
      if (ls.quiz) {
        const questions: QuizQuestion[] = ls.quiz.questions.map((q, qi) => ({
          id: `${quizId}-q${qi + 1}`,
          prompt: q[0],
          options: q[1],
          correct: q[2],
          explain: q[3],
        }))
        quizzes.push({ id: quizId, title: ls.quiz.title, lessonId, questions })
      }
      const level: Level = ls.level ?? spec.level
      lessons.push({
        id: lessonId,
        courseId: course.id,
        moduleId,
        title: ls.title,
        order: li + 1,
        durationMin: ls.durationMin ?? 12,
        level,
        tags: ls.tags,
        objective: ls.objective,
        body: ls.body,
        demo: ls.demo,
        practice: ls.practice,
        challenge: ls.challenge,
        checklist: ls.checklist ?? defaultChecklist(ls),
        files: ls.files ?? [],
        quiz: undefined, // quizzes ficam em tabela própria; link por lessonId
        dawId: spec.dawId,
        dawSteps: ls.dawSteps,
        isSample: ls.isSample,
        verified: spec.verified ? { daw: spec.dawId!, version: spec.verified.version, date: spec.verified.date } : undefined,
      })
    })
  })
  return { course, modules, lessons, quizzes }
}

function defaultChecklist(ls: LessonSpec): string[] {
  const c = ['Entendi o objetivo da aula', 'Revisitei os pontos principais']
  if (ls.practice?.length) c.push('Concluí a prática na minha DAW')
  if (ls.challenge) c.push('Enviei/registrei o desafio')
  return c
}

export const file = (name: string, kind: AssetRef['kind'], note: string, content?: string): AssetRef => ({
  name, kind, note, content, licensed: true,
})
