import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { CourseCard } from '@/components/learn'
import { Empty, Badge } from '@/components/ui'
import { listCourses, listLessons } from '@/services/content'
import { courseProgress } from '@/services/progress'
import { useApp } from '@/store/app'
import { cn } from '@/lib/utils'
import type { Course, Level } from '@/types'

export default function Learn() {
  const { user, pushToast } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'foundations' | 'daw' | Level>('all')

  const courses = useMemo(() => {
    let list = listCourses()
    if (filter === 'daw') list = list.filter(c => c.track === 'daw')
    else if (filter === 'foundations') list = list.filter(c => c.track !== 'daw')
    else if (filter === 'iniciante' || filter === 'intermediario' || filter === 'avancado') list = list.filter(c => c.level === filter)
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      list = list.filter(c => {
        if ((c.title + c.subtitle + c.tags.join(' ')).toLowerCase().includes(s)) return true
        return listLessons(c.id).some(l => l.title.toLowerCase().includes(s))
      })
    }
    // Daw academies first if user chose one
    if (user?.profile.daw && user.profile.daw !== 'none') {
      list = [...list].sort((a, b) => (b.dawId === user.profile.daw ? 1 : 0) - (a.dawId === user.profile.daw ? 1 : 0))
    }
    return list
  }, [q, filter, user])

  function openCourse(c: Course) {
    if (c.track === 'daw' && c.dawId && user?.profile.daw && user.profile.daw !== c.dawId) {
      pushToast(`Heads-up: esta trilha é de ${c.dawId === 'fl-studio' ? 'FL Studio' : c.dawId === 'ableton' ? 'Ableton' : 'Cubase'} — você selecionou outra DAW. Os conceitos ainda valem.`, 'info')
    }
    navigate(`/app/curso/${c.id}`)
  }

  const chips: { id: typeof filter; label: string }[] = [
    { id: 'all', label: 'Todos' }, { id: 'foundations', label: 'Fundamentos' }, { id: 'daw', label: 'Academias de DAW' },
    { id: 'iniciante', label: 'Iniciante' }, { id: 'intermediario', label: 'Intermediário' }, { id: 'avancado', label: 'Avançado' },
  ]

  return (
    <div>
      <PageHeader title="Academia" sub="Cursos progressivos com exercícios, desafios e projetos — nada de maratonar vídeo." actions={<Badge tone="brand">20% teoria · 80% prática</Badge>} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input className="input !pl-10" placeholder="Buscar: sidechain, arranjo, synth, LUFS…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="hide-scroll flex gap-1.5 overflow-x-auto pb-1">
          {chips.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)} className={cn('chip whitespace-nowrap transition', filter === c.id && 'border-brand/60 bg-brand-soft text-white')}>{c.label}</button>
          ))}
        </div>
      </div>

      {courses.length === 0 ? (
        <Empty title="Nada encontrado" hint="Busque por outro termo — tente 'bass', 'mix', 'síntese' — ou limpe os filtros." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {courses.map(c => (
            <div key={c.id} onClick={() => openCourse(c)}>
              <CourseCard course={c} pct={user ? courseProgress(user.id, c.id) : 0} href={`/app/curso/${c.id}`} />
            </div>
          ))}
        </div>
      )}
      <p className="mt-6 text-center text-[11px] text-zinc-600">
        Cursos publicados: {courses.length}. Cada aula traz: objetivo, resumo, prática, desafio, checklist e arquivos — quizzes nos pontos-chave.
      </p>
    </div>
  )
}
