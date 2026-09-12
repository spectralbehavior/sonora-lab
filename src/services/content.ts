import { getTable, raw, update, insert, remove, getSetting } from '@/lib/db'
import type { Course, Lesson, ModuleRow, Quiz, Genre, DawSoftware, DawVersionRec, Project, PluginEntry, ResourceRow, DawChoice, Level } from '@/types'
import { uid } from '@/lib/utils'

// Leitura do catálogo educacional. Fontes = tabelas `courses/modules/lessons/...`
// editáveis pelo CMS do admin (publicação = `published`).

export function listCourses(opts?: { track?: Course['track']; dawId?: DawChoice; level?: Level; q?: string }): Course[] {
  let courses = getTable('courses').filter(c => c.published)
  if (opts?.track) courses = courses.filter(c => c.track === opts.track)
  if (opts?.dawId && opts.dawId !== 'none') courses = courses.filter(c => c.track !== 'daw' || c.dawId === opts.dawId)
  if (opts?.level) courses = courses.filter(c => c.level === opts.level)
  if (opts?.q) {
    const q = opts.q.trim().toLowerCase()
    courses = courses.filter(c => (c.title + c.subtitle + c.description + c.tags.join(' ')).toLowerCase().includes(q))
  }
  return courses.sort((a, b) => a.order - b.order)
}

export function getCourse(courseId: string): Course | undefined {
  return raw().courses.find(c => c.id === courseId)
}

export function listModules(courseId: string): ModuleRow[] {
  return raw().modules.filter(m => m.courseId === courseId).sort((a, b) => a.order - b.order)
}

export function listLessons(courseId: string): Lesson[] {
  return raw().lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order)
}

export function getLesson(lessonId: string): Lesson | undefined {
  return raw().lessons.find(l => l.id === lessonId)
}

export function getQuizByLesson(lessonId: string): Quiz | undefined {
  return raw().quizzes.find(q => q.lessonId === lessonId)
}

export function allPublishedLessons(): Lesson[] {
  const published = new Set(raw().courses.filter(c => c.published).map(c => c.id))
  return raw().lessons.filter(l => published.has(l.courseId))
}

export function lessonsByTag(tag: string): Lesson[] {
  return allPublishedLessons().filter(l => l.tags.includes(tag))
}

export function getGenres(): Genre[] {
  return getTable('genres')
}

export function getGenre(id?: string | null): Genre | undefined {
  if (!id) return undefined
  return raw().genres.find(g => g.id === id)
}

export function getDaws(): DawSoftware[] {
  return getTable('daw_software')
}

export function getDaw(id?: DawChoice | null): DawSoftware | undefined {
  if (!id || id === 'none') return undefined
  return raw().daw_software.find(d => d.id === id)
}

export function getDawVersions(dawId?: string): DawVersionRec[] {
  const all = getTable('daw_versions')
  return dawId ? all.filter(v => v.dawId === dawId) : all
}

/** Registro de versão de conteúdo por aula (regra: instruções DAW são versionadas). */
export function lessonVersionInfo(lesson: Lesson): { label: string; stale: boolean } {
  if (!lesson.verified) return { label: 'Conteúdo DAW-agnóstico — não depende de versão de software', stale: false }
  const current = raw().daw_versions.find(v => v.dawId === lesson.verified!.daw)
  const stale = !!current && current.version !== lesson.verified.version
  return {
    label: `Verificado em ${lesson.verified.version} · atualização do conteúdo ${lesson.verified.date}${stale ? ` · há versão ${current!.version} registrada (revisar)` : ''}`,
    stale,
  }
}

export function listProjects(): Project[] {
  return getTable('projects')
}

export function getProject(id: string): Project | undefined {
  return raw().projects.find(p => p.id === id)
}

export function listPlugins(category?: PluginEntry['category']): PluginEntry[] {
  const all = getTable('plugins')
  return category ? all.filter(p => p.category === category) : all
}

export function listResources(category?: ResourceRow['category']): ResourceRow[] {
  const all = getTable('resources')
  return category ? all.filter(r => r.category === category) : all
}

// ── CMS (Admin) ──────────────────────────────────────────────────────────────

export const cms = {
  saveCourse(courseId: string, patch: Partial<Course>) { update('courses', courseId, patch) },
  createCourse(patch: Omit<Course, 'id' | 'slug'> & { slug?: string }) {
    const id = patch.slug || uid('crs')
    return insert('courses', { ...patch, id, slug: id } as Course)
  },
  removeCourse(courseId: string) {
    remove('lessons', l => l.courseId === courseId)
    remove('modules', m => m.courseId === courseId)
    remove('courses', c => c.id === courseId)
  },
  saveModule(moduleId: string, patch: Partial<ModuleRow>) { update('modules', moduleId, patch) },
  createModule(courseId: string, title: string, summary: string) {
    const order = raw().modules.filter(m => m.courseId === courseId).length + 1
    return insert('modules', { id: uid('mod'), courseId, title, summary, order } as ModuleRow)
  },
  saveLesson(lessonId: string, patch: Partial<Lesson>) { update('lessons', lessonId, patch) },
  createLesson(courseId: string, moduleId: string, title: string) {
    const order = raw().lessons.filter(l => l.moduleId === moduleId).length + 1
    const course = raw().courses.find(c => c.id === courseId)
    return insert('lessons', {
      id: uid('les'), courseId, moduleId, title, order, durationMin: 10,
      level: course?.level ?? 'iniciante', tags: [...(course?.tags ?? [])],
      objective: '', body: '### Rascunho\nEscreva o conteúdo desta aula no editor.', checklist: [], files: [],
    } as Lesson)
  },
  removeLesson(lessonId: string) { remove('lessons', l => l.id === lessonId); remove('quizzes', q => q.lessonId === lessonId) },
  saveGenre(genreId: string, patch: Partial<Genre>) { update('genres', genreId, patch) },
  createGenre(name: string) {
    return insert('genres', {
      id: uid('gen'), name, bpm: [120, 130], color: '#7C5CFF', structure: '', drums: '', bass: '', melodic: '', soundDesign: '', arrangement: '', mixing: '', references: [],
    } as Genre)
  },
  removeGenre(genreId: string) { remove('genres', g => g.id === genreId) },
  saveDawVersion(id: string, patch: Partial<DawVersionRec>) { update('daw_versions', id, patch) },
  createDawVersion(dawId: string, version: string) {
    return insert('daw_versions', { id: uid('dv'), dawId, version, os: 'Windows/macOS', updatedAt: new Date().toISOString().slice(0, 10), contentVersion: 'r1', notes: '' } as DawVersionRec)
  },
  removeDawVersion(id: string) { remove('daw_versions', v => v.id === id) },
  savePlan(planId: string, patch: Partial<Course>) { void planId; void patch },
}

export function gamificationConfig() {
  return {
    xp: getSetting('xp', {} as Record<string, number>),
    levels: getSetting('levels', [] as { name: string; min: number }[]),
  }
}
