import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Flag, BookOpen, Lightbulb } from 'lucide-react'
import { Card, Badge, Button, Md, Modal } from '@/components/ui'
import { LessonChecklist, PracticeBlock, ChallengeBlock, QuizRunner, FileList, DawStepsTabs, VerifiedStamp, DAW_LABEL, LevelBadge } from '@/components/learn'
import { getLesson, listLessons, getCourse, getQuizByLesson } from '@/services/content'
import { lessonProgressRow, completeLesson, uncompleteLesson } from '@/services/progress'
import { lessonVersionInfo } from '@/services/content'
import { useApp } from '@/store/app'
import { canAccessLesson } from '@/services/billing'
import { GLOSSARY } from '@/data/glossary'
import { track } from '@/services/analytics'
import { insert, raw, getTable } from '@/lib/db'
import { uid, nowISO } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function LessonPage() {
  const { lessonId = '' } = useParams()
  const navigate = useNavigate()
  const { user, pushToast, afterProgress } = useApp()
  const [quizOpen, setQuizOpen] = useState(false)
  const [gloss, setGloss] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportText, setReportText] = useState('')

  const lesson = getLesson(lessonId)
  const course = lesson ? getCourse(lesson.courseId) : undefined
  const siblings = useMemo(() => (lesson ? listLessons(lesson.courseId) : []), [lesson])
  const idx = lesson ? siblings.findIndex(l => l.id === lesson.id) : -1
  const prev = idx > 0 ? siblings[idx - 1] : undefined
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined
  const quiz = lesson ? getQuizByLesson(lesson.id) : undefined
  const done = user && lesson ? !!lessonProgressRow(user.id, lesson.id)?.completedAt : false

  const glossary = useMemo(() => {
    if (!lesson) return []
    const hay = `${lesson.title} ${lesson.body}`.toLowerCase()
    return GLOSSARY.filter(g => hay.includes(g.term.toLowerCase())).slice(0, 6)
  }, [lesson])

  if (!lesson || !course) return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <div className="text-3xl">🤔</div>
      <h1 className="mt-2 text-lg font-extrabold text-white">Aula não encontrada</h1>
      <p className="mt-1 text-sm text-zinc-400">O link pode estar quebrado ou o conteúdo foi despublicado pelo CMS.</p>
      <Link to="/app/aprender" className="btn-primary mt-4">Voltar à academia</Link>
    </Card>
  )

  if (!canAccessLesson(user!.id, lesson.isSample) && !done) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <div className="text-3xl">🔒</div>
        <h1 className="mt-2 text-lg font-extrabold text-white">Aula no plano Pro</h1>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">O Free inclui as aulas introdutórias (🎁) para você sentir o método. O plano Pro libera todos os cursos, projetos, mentor e certificados.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link to="/planos" className="btn-primary">Ver planos</Link>
          <Link to="/app/aprender" className="btn-ghost">Voltar</Link>
        </div>
      </Card>
    )
  }

  const versionInfo = lessonVersionInfo(lesson)

  function finishToggle() {
    if (!user || !lesson) return
    if (done) { uncompleteLesson(user.id, lesson.id); pushToast('Aula reaberta (XP derivado recalculado).', 'info'); afterProgress(); return }
    completeLesson(user.id, lesson)
    track('lesson_complete', { lessonId: lesson.id, courseId: lesson.courseId })
    pushToast(next ? '🎧 +50 XP — aula concluída. Próximo passo? ' : '🎧 Aula concluída! +50 XP.', 'success')
    afterProgress()
    if (next) navigate(`/app/aula/${next.id}`)
  }

  function sendReport() {
    if (!user || !reportText.trim() || reportText.trim().length < 8) return
    insert('notifications', { id: uid('ntf'), userId: 'u-admin', text: `🚩 Report de aula ${lesson!.id} (${user.name}): ${reportText.slice(0, 140)}`, ts: nowISO(), read: false })
    setReportOpen(false); setReportText('')
    pushToast('Report enviado. Conteúdo de DAW é versionado — se o menu divergiu da sua versão, o time revisa pelo CMS.', 'success')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to={`/app/curso/${course.id}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-zinc-400 hover:text-white"><ChevronLeft size={15} /> {course.title}</Link>
        <div className="flex items-center gap-2">
          <LevelBadge level={lesson.level} />
          {lesson.dawId && <Badge tone="info">🎛 {DAW_LABEL[lesson.dawId]}</Badge>}
          {lesson.isSample && <Badge tone="success">🎁 Aula grátis</Badge>}
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-black leading-tight text-white sm:text-2xl">{lesson.title}</h1>
        <button onClick={() => setReportOpen(true)} className="mt-1 shrink-0 rounded-lg p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white" title="Reportar divergência de menu/versão"><Flag size={15} /></button>
      </div>

      <div className="hide-scroll flex gap-1.5 text-[11px]">
        <Badge tone="default">aula {idx + 1}/{siblings.length}</Badge>
        <Badge tone="default">⏱ {lesson.durationMin} min</Badge>
        {quiz && <Badge tone="brand">quiz incluso</Badge>}
        {lesson.files.length > 0 && <Badge tone="info">{lesson.files.length} arquivo(s)</Badge>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {/* OBJETIVO */}
          <Card className="border-l-4 !border-l-brand">
            <div className="flex gap-3">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-brand-300" />
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-brand-300">Objetivo da aula</div>
                <p className="mt-1 text-sm font-semibold text-zinc-100">{lesson.objective}</p>
              </div>
            </div>
          </Card>

          {/* VÍDEO (honesto: só aparece se houver mídia registrada no CMS) */}
          {(lesson as unknown as { videoUrl?: string }).videoUrl ? (
            <Card className="overflow-hidden !p-0">
              <video controls className="w-full" src={(lesson as unknown as { videoUrl: string }).videoUrl} poster="/logo.svg" />
            </Card>
          ) : (
            <Card className="flex items-center gap-3 border-dashed">
              <span className="text-xl">🎬</span>
              <p className="text-[12px] leading-relaxed text-zinc-400">Esta aula é 100% texto + prática (a gravação do vídeo fica disponível quando o material for publicado no CMS com a mídia linkada — a plataforma ensina o método sem depender de vídeo).</p>
            </Card>
          )}

          {/* AULA */}
          <Card>
            <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400">A aula</h2>
            <Md text={lesson.body} />
          </Card>

          {/* DEMONSTRAÇÃO */}
          {lesson.demo && (
            <Card>
              <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400">Demonstração (professor executando)</h2>
              <Md text={lesson.demo} className="!text-[14px]" />
            </Card>
          )}

          {/* CONCEITO + FERRAMENTA */}
          {lesson.dawSteps && (
            <Card>
              <h2 className="mb-1 text-sm font-extrabold uppercase tracking-wider text-zinc-400">Na sua DAW — o conceito vira procedimento</h2>
              <p className="mb-3 text-[11px] text-zinc-500">Escolha uma DAW: as instruções nunca se misturam entre softwares.</p>
              <DawStepsTabs lesson={lesson} />
            </Card>
          )}

          {/* PRÁTICA */}
          {lesson.practice?.length ? (
            <Card>
              <h2 className="mb-1 text-sm font-extrabold uppercase tracking-wider text-zinc-400">✏️ Prática na DAW</h2>
              <p className="mb-3 text-[11px] text-zinc-500">Aula só termina com a sua DAW aberta. Marque cada item executado.</p>
              <PracticeBlock lesson={lesson} />
            </Card>
          ) : null}

          {/* DESAFIO */}
          {lesson.challenge && <ChallengeBlock lesson={lesson} />}

          {/* QUIZ */}
          {quiz && (
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-white">{quiz.title}</div>
                <div className="text-[12px] text-zinc-400">{quiz.questions.length} perguntas rápidas · 100% dá +50 XP de bônus</div>
              </div>
              <div className="flex items-center gap-2">
                {done && <Badge tone="success">score salvo: {lessonProgressRow(user!.id, lesson.id)?.quizScore ?? '—'}%</Badge>}
                <Button variant="soft" onClick={() => setQuizOpen(true)}>Abrir quiz</Button>
              </div>
            </Card>
          )}

          {/* ARQUIVOS */}
          {lesson.files.length > 0 && (
            <Card>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-zinc-400">📦 Arquivos da aula</h2>
              <FileList files={lesson.files} />
              <p className="mt-2 text-[11px] text-zinc-500">Somente material próprio ou licenciado — cada item carrega sua licença.</p>
            </Card>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-zinc-400">✅ Checklist de conclusão</h2>
            <LessonChecklist lesson={lesson} />
            <Button className="mt-4 w-full" variant={done ? 'ghost' : 'primary'} onClick={finishToggle}>
              {done ? '↺ Reabrir aula' : 'Concluir aula · +50 XP'}
            </Button>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="ghost" className="flex-1" disabled={!prev} onClick={() => prev && navigate(`/app/aula/${prev.id}`)}><ChevronLeft size={14} /> Anterior</Button>
              <Button size="sm" variant="ghost" className="flex-1" disabled={!next} onClick={() => next && navigate(`/app/aula/${next.id}`)}>Próxima <ChevronRight size={14} /></Button>
            </div>
          </Card>

          {lesson.videoUrl == null && (
            <Card className="border-white/[.06] bg-white/[.02]">
              <div className="flex items-center gap-2 text-[12px] font-bold text-zinc-300"><BookOpen size={13} className="text-brand-300" /> Resumo didático</div>
              <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">Leia a aula acima como roteiro e vá direto à prática. Revisite o resumo depois de executar — reforço espaçado fixa o conceito.</p>
              <Button size="sm" variant="soft" className="mt-3 w-full" onClick={() => setGloss(true)}>💬 Explique de forma simples</Button>
            </Card>
          )}

          <Card>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500">Versão do conteúdo</div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-400">{versionInfo.label}</p>
            {versionInfo.stale && <Badge tone="warn" className="mt-2">⚠ revisar para release atual</Badge>}
            <button onClick={() => setReportOpen(true)} className="mt-2 block text-[11px] text-brand-300 hover:underline">O menu da minha versão é diferente → reportar</button>
          </Card>
        </div>
      </div>

      <Modal open={quizOpen} onClose={() => setQuizOpen(false)} title={quiz?.title ?? 'Quiz'} wide>
        {quiz && <QuizRunner quiz={quiz} onDone={(score) => { track('quiz_completed', { lessonId: lesson.id, score }); afterProgress(); if (score === 100) pushToast('🎯 100% — bônus +50 XP somado ao seu total.', 'success') }} />}
      </Modal>

      <Modal open={gloss} onClose={() => setGloss(false)} title="Conceitos da aula, de forma simples" wide>
        {glossary.length === 0 ? <p className="text-sm text-zinc-400">Nenhum termo do glossário casou com o título/descrição desta aula. Use "buscar" na Biblioteca para ver todos.</p> : (
          <div className="space-y-3">
            {glossary.map(g => (
              <div key={g.term} className="rounded-xl border border-white/10 bg-night-800 p-3.5">
                <div className="text-sm font-extrabold text-white">{g.term}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-zinc-300">{g.simple}</p>
                <p className="mt-1.5 border-t border-white/[.06] pt-1.5 text-[11px] leading-relaxed text-zinc-500"><b className="text-zinc-400">Versão técnica:</b> {g.technical}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Reportar divergência de DAW/versão">
        <p className="text-[13px] leading-relaxed text-zinc-400">Descreva o que a aula afirma x o que existe na sua versão. O time corrige o conteúdo no CMS e atualiza o carimbo de versão (DAW · versão · SO · data).</p>
        <textarea className="input mt-3 min-h-28" value={reportText} onChange={e => setReportText(e.target.value)} placeholder="Ex.: no FL 24 o parâmetro 'Track number' aparece como 'Routing' na minha versão…" />
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setReportOpen(false)}>Cancelar</Button>
          <Button onClick={sendReport}>Enviar report</Button>
        </div>
      </Modal>
    </div>
  )
}
