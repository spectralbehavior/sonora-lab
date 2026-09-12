import { Link, useNavigate, useParams } from 'react-router-dom'
import { Award, Lock } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Badge, ProgressBar, Empty, Button } from '@/components/ui'
import { getCourse, listModules, listLessons } from '@/services/content'
import { courseProgress, moduleProgress, lessonProgressRow } from '@/services/progress'
import { useApp } from '@/store/app'
import { canAccessLesson } from '@/services/billing'
import { LevelBadge, DawBadge, LessonRow } from '@/components/learn'
import { track } from '@/services/analytics'

export default function CourseDetail() {
  const { courseId = '' } = useParams()
  const { user, plan, pushToast } = useApp()
  const navigate = useNavigate()
  const course = getCourse(courseId)
  if (!course) return <Empty title="Curso não encontrado" hint="Ele pode ter sido despublicado no CMS." action={<Link className="link" to="/app/aprender">← Voltar à academia</Link>} />

  const modules = listModules(course.id)
  const pct = user ? courseProgress(user.id, course.id) : 0

  function openLesson(lessonId: string, isSample?: boolean) {
    if (!user) return
    if (!canAccessLesson(user.id, isSample)) {
      track('paywall_view', { courseId })
      pushToast('Plano Free acessa as aulas introdutórias (marcadas 🎁). Faça upgrade para liberar tudo.', 'info')
      navigate('/planos')
      return
    }
    track('course_start', { courseId: course!.id })
    navigate(`/app/aula/${lessonId}`)
  }

  const allLessons = listLessons(course.id)
  const next = user ? allLessons.find(l => !lessonProgressRow(user.id, l.id)?.completedAt) : undefined
  const idx = next ? allLessons.indexOf(next) : -1

  return (
    <div className="space-y-5">
      <PageHeader title={course.title} sub={course.subtitle} actions={<LevelBadge level={course.level} />} />

      <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            {course.dawId && <DawBadge dawId={course.dawId} />}
            <Badge>{course.estHours}h de prática guiada</Badge>
            <Badge tone="info">{allLessons.length} aulas · {modules.length} módulos</Badge>
            {plan?.id === 'free' && course.track === 'foundations' && <Badge tone="warn">Free: {allLessons.filter(l => l.isSample).length} aulas liberadas</Badge>}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{course.description}</p>
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-[11px] text-zinc-500"><span>Progresso do curso</span><span>{pct}%</span></div>
            <ProgressBar value={pct} tone={pct === 100 ? 'lime' : 'brand'} />
          </div>

          <div className="mt-6 space-y-5">
            {modules.map(m => {
              const lessons = listLessons(course.id).filter(l => l.moduleId === m.id)
              const mpct = user ? moduleProgress(user.id, m.id) : 0
              return (
                <div key={m.id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-extrabold text-white">{m.title}</h3>
                        {mpct === 100 && <Badge tone="success">✓ módulo completo</Badge>}
                      </div>
                      <p className="text-xs text-zinc-500">{m.summary}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-zinc-500">{mpct}%</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/[.06]">
                    {lessons.map(l => {
                      const done = user ? !!lessonProgressRow(user.id, l.id)?.completedAt : false
                      const locked = user ? !canAccessLesson(user.id, l.isSample) && !done : false
                      return (
                        <div key={l.id} className="border-b border-white/[.04] last:border-0">
                          <LessonRow lesson={l} done={done} locked={locked} onClick={() => openLesson(l.id, l.isSample)} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Objetivos</div>
            <ul className="mt-3 space-y-2 text-[13px] text-zinc-300">
              {course.objectives.map(o => <li key={o} className="flex gap-2"><span className="text-emerald-400">◈</span>{o}</li>)}
            </ul>
          </Card>

          {user && (
            <Card>
              <div className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Você está aqui</div>
              {next ? (
                <>
                  <p className="mt-2 text-[13px] text-zinc-300">{idx >= 0 ? `Aula ${idx + 1} de ${allLessons.length}: ` : ''}<b className="text-white">{next.title}</b></p>
                  <Button className="mt-3 w-full" onClick={() => openLesson(next.id, next.isSample)}>{pct > 0 ? 'Continuar curso' : 'Começar o curso'}</Button>
                </>
              ) : <p className="mt-2 text-[13px] font-bold text-emerald-400">✓ Curso 100% concluído!</p>}
            </Card>
          )}

          <Card>
            <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400"><Award size={14} className="text-brand-300" /> Certificado</div>
            {pct === 100 ? <p className="mt-2 text-[13px] text-zinc-300">Emita o seu em <Link to="/app/certificados" className="link">Certificados</Link> (ID único + QR + URL pública de validação).</p>
              : <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">Disponível ao concluir 100% das aulas {user && plan?.id === 'free' ? 'e com plano ativo' : ''}. {user && plan?.id === 'free' && <Link to="/planos" className="link">Ver planos →</Link>}</p>}
          </Card>

          {course.dawId && (
            <Card className="border-brand/30 bg-brand-soft">
              <div className="text-sm font-extrabold text-white">🔖 Conteúdo versionado</div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-300">Os passos desta academia são verificados na versão registrada da DAW (ver no rodapé de cada aula). Se sua versão divergir, a aula mostra como sinalizar no CMS.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
