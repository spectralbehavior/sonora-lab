import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Lock, PlayCircle, FileDown, Sparkles } from 'lucide-react'
import type { Course, Lesson, Quiz, Level, DawId, AssetRef } from '@/types'
import { Badge, Button, ProgressBar, Card } from '@/components/ui'
import { lessonVersionInfo } from '@/services/content'
import { startOrToggleCheck, saveQuizScore } from '@/services/progress'
import { gradeQuiz } from '@/lib/gamify'
import { useApp } from '@/store/app'
import { track } from '@/services/analytics'
import { raw } from '@/lib/db'
import { cn, downloadText } from '@/lib/utils'

export const LEVEL_LABEL: Record<Level, string> = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' }
export const DAW_LABEL: Record<DawId, string> = { 'fl-studio': 'FL Studio', ableton: 'Ableton Live', cubase: 'Cubase' }

export function LevelBadge({ level }: { level: Level }) {
  return <Badge tone={level === 'iniciante' ? 'success' : level === 'intermediario' ? 'warn' : 'danger'}>{LEVEL_LABEL[level]}</Badge>
}

export function DawBadge({ dawId }: { dawId?: DawId }) {
  if (!dawId) return <Badge tone="info">Conceito universal</Badge>
  return <Badge tone="brand">🎛 {DAW_LABEL[dawId]}</Badge>
}

export function CourseCard({ course, pct: progress, href }: { course: Course; pct: number; href: string }) {
  return (
    <Card className="group flex flex-col gap-3 transition hover:border-brand/40">
      <Link to={href} className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-300">{course.track === 'daw' ? 'Trilha de DAW' : 'Fundamentos'}</div>
            <h3 className="mt-1 text-[15px] font-extrabold leading-snug text-white group-hover:text-brand-300">{course.title}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">{course.subtitle}</p>
          </div>
          <span className="text-2xl">{progress === 100 ? '🏆' : progress > 0 ? '⏳' : '🎯'}</span>
        </div>
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2">
            <LevelBadge level={course.level} />
            <Badge>{course.estHours}h</Badge>
            {course.dawId && <DawBadge dawId={course.dawId} />}
          </div>
          <ProgressBar value={progress} tone={progress === 100 ? 'lime' : 'brand'} />
          <div className="flex justify-between text-[11px] text-zinc-500">
            <span>{progress}% concluído</span>
            <span className="font-semibold text-zinc-400 group-hover:text-brand-300">{progress > 0 ? 'Continuar →' : 'Começar →'}</span>
          </div>
        </div>
      </Link>
    </Card>
  )
}

export function LessonRow({ lesson, done, onClick, locked }: { lesson: Lesson; done: boolean; onClick: () => void; locked?: boolean }) {
  return (
    <button onClick={onClick} className={cn('flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition hover:border-white/10 hover:bg-white/[.04]', done && 'opacity-70')}>
      {done ? <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
        : locked ? <Lock size={16} className="shrink-0 text-zinc-500" />
        : <PlayCircle size={18} className="shrink-0 text-brand-300" />}
      <span className={cn('flex-1 text-sm', done ? 'text-zinc-400 line-through decoration-emerald-500/40' : 'text-zinc-200')}>{lesson.title}</span>
      {lesson.quiz && <Badge tone="info">Quiz</Badge>}
      <span className="text-[11px] text-zinc-500">{lesson.durationMin} min</span>
    </button>
  )
}

// ── Blocos da aula ──────────────────────────────────────────────────────────

export function LessonChecklist({ lesson }: { lesson: Lesson }) {
  const { user, afterProgress } = useApp()
  if (!user) return null
  const items = lesson.checklist.map((item, i) => ({ item, key: `c:${i}` }))
  const allDone = items.length > 0 && items.every(({ key }) => lessonCheck(user.id, lesson.id, key))
  return (
    <div className="space-y-1.5">
      {items.map(({ item, key }) => (
        <CheckRow
          key={key} label={item} checked={lessonCheck(user.id, lesson.id, key)}
          onToggle={v => { startOrToggleCheck(user.id, lesson, key, v); afterProgress() }}
        />
      ))}
      {allDone && <div className="text-[11px] font-bold text-emerald-400">✓ Checklist completo — você pode concluir a aula.</div>}
    </div>
  )
}

function lessonCheck(userId: string, lessonId: string, key: string): boolean {
  const row = raw().lesson_progress.find(p => p.userId === userId && p.lessonId === lessonId)
  return !!row?.checks?.includes(key)
}

export function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: (v: boolean) => void }) {
  return (
    <button onClick={() => onToggle(!checked)} className="flex w-full items-start gap-2.5 rounded-lg px-1 py-1 text-left transition hover:bg-white/[.03]">
      <span className={cn('mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border text-[10px] transition', checked ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300' : 'border-white/20 text-transparent')} style={{ height: 18, width: 18 }}>✓</span>
      <span className={cn('text-[13px] leading-snug', checked ? 'text-zinc-500 line-through' : 'text-zinc-300')}>{label}</span>
    </button>
  )
}

export function PracticeBlock({ lesson }: { lesson: Lesson }) {
  const { user, afterProgress, pushToast } = useApp()
  if (!user || !lesson.practice?.length) return null
  const allDone = lesson.practice.every((_, i) => lessonCheck(user.id, lesson.id, `p:${i}`))
  return (
    <div className="space-y-2">
      {lesson.practice.map((p, i) => (
        <CheckRow key={i} label={p} checked={lessonCheck(user.id, lesson.id, `p:${i}`)}
          onToggle={v => {
            startOrToggleCheck(user.id, lesson, `p:${i}`, v)
            if (v && lesson.practice!.every((_, j) => j === i || lessonCheck(user.id, lesson.id, `p:${j}`))) {
              track('exercise_complete', { lessonId: lesson.id })
              pushToast('💪 Exercício concluído — +100 XP no seu total.', 'success')
            }
            afterProgress()
          }} />
      ))}
      {allDone && <div className="text-[11px] font-bold text-emerald-400">✓ Prática concluída</div>}
    </div>
  )
}

export function ChallengeBlock({ lesson }: { lesson: Lesson }) {
  const { user, afterProgress, pushToast } = useApp()
  if (!user || !lesson.challenge) return null
  const done = lessonCheck(user.id, lesson.id, 'challenge')
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-brand/25 bg-brand-soft p-3.5">
      <div className="text-xs font-extrabold uppercase tracking-wider text-brand-300">🏆 Desafio</div>
      <p className="text-[13px] leading-relaxed text-zinc-200">{lesson.challenge}</p>
      <Button size="sm" variant={done ? 'soft' : 'primary'} className="self-start" onClick={() => {
        startOrToggleCheck(user.id, lesson, 'challenge', !done)
        if (!done) { track('challenge_complete', { lessonId: lesson.id }); pushToast('🏆 Desafio concluído — +250 XP.', 'success') }
        afterProgress()
      }}>
        {done ? '✓ Registrado como concluído' : 'Marcar desafio concluído'}
      </Button>
    </div>
  )
}

export function QuizRunner({ quiz, onDone }: { quiz: Quiz; onDone: (score: number) => void }) {
  const { user } = useApp()
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const result = submitted ? gradeQuiz(answers, quiz.questions) : null

  return (
    <div className="space-y-4">
      {quiz.questions.map((q, qi) => (
        <div key={q.id} className="card p-4">
          <div className="mb-3 text-sm font-bold text-white">{qi + 1}. {q.prompt}</div>
          <div className="grid gap-2">
            {q.options.map((opt, oi) => {
              const picked = answers[q.id] === oi
              const correct = submitted && oi === q.correct
              const wrong = submitted && picked && oi !== q.correct
              return (
                <button key={oi} disabled={submitted} onClick={() => setAnswers(a => ({ ...a, [q.id]: oi }))}
                  className={cn('rounded-lg border px-3 py-2 text-left text-[13px] transition',
                    correct ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200'
                      : wrong ? 'border-rose-400/50 bg-rose-400/10 text-rose-200'
                      : picked ? 'border-brand/60 bg-brand-soft text-white'
                      : 'border-white/10 bg-white/[.02] text-zinc-300 hover:border-white/25')}>
                  {opt}
                </button>
              )
            })}
          </div>
          {submitted && <p className="mt-2 text-xs leading-relaxed text-zinc-400">💡 {q.explain}</p>}
        </div>
      ))}
      {!submitted ? (
        <Button disabled={Object.keys(answers).length < quiz.questions.length} onClick={() => {
          setSubmitted(true)
          const r = gradeQuiz(answers, quiz.questions)
          if (user) saveQuizScore(user.id, quiz.lessonId, r.score)
          onDone(r.score)
        }}>Corrigir quiz</Button>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className={cn('text-sm font-extrabold', result!.perfect ? 'text-emerald-400' : 'text-zinc-200')}>
            {result!.correct}/{result!.total} — {result!.score}% {result!.perfect ? '🎯 perfeito! (+50 XP de bônus)' : ''}
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setSubmitted(false); setAnswers({}) }}>Refazer</Button>
        </div>
      )}
    </div>
  )
}

export function FileList({ files }: { files: AssetRef[] }) {
  if (!files.length) return null
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {files.map(f => (
        <div key={f.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2.5">
          <div className="min-w-0">
            <div className="truncate text-xs font-bold text-zinc-200">{f.name}</div>
            <div className="truncate text-[11px] text-zinc-500">{f.note}</div>
          </div>
          {f.content
            ? <Button size="sm" variant="ghost" onClick={() => downloadText(f.name, f.content!)}><FileDown size={14} /> Baixar</Button>
            : <Badge tone="info">{f.kind}</Badge>}
        </div>
      ))}
    </div>
  )
}

/** Abas por DAW para conceitos com instrução específica — nunca misturadas. */
export function DawStepsTabs({ lesson }: { lesson: Lesson }) {
  const { user } = useApp()
  const [tab, setTab] = useState<DawId>(user?.profile.daw && user.profile.daw !== 'none' ? (user.profile.daw as DawId) : (user?.profile.daw as DawId) || 'fl-studio')
  if (!lesson.dawSteps) return null
  const opts: DawId[] = ['fl-studio', 'ableton', 'cubase']
  const steps = lesson.dawSteps[tab === 'fl-studio' ? 'fl' : tab === 'ableton' ? 'ab' : 'cu'] ?? []
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {opts.map(d => (
          <button key={d} onClick={() => setTab(d)} className={cn('chip transition', tab === d && 'border-brand/60 bg-brand-soft text-white')}>
            {DAW_LABEL[d]}{user?.profile.daw === d ? ' • sua DAW' : ''}
          </button>
        ))}
      </div>
      {steps.length ? (
        <>
          <ol className="ml-1 space-y-1.5">
            {steps.map((s, i) => <li key={i} className="text-[13px] leading-relaxed text-zinc-300"><span className="mr-1.5 font-mono text-brand-300">{i + 1}.</span>{s}</li>)}
          </ol>
          {lesson.verified && (
            <p className="mt-2 text-[11px] text-zinc-500">🔖 {lessonVersionInfo(lesson).label}</p>
          )}
        </>
      ) : (
        <p className="text-xs text-zinc-500">Passo específico ainda não curado para esta DAW — veja as outras abas ou a aula da academia correspondente.</p>
      )}
    </div>
  )
}

export function VerifiedStamp({ lesson }: { lesson: Lesson }) {
  const info = lessonVersionInfo(lesson)
  return (
    <Link to="/app/biblioteca" className="group inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300">
      <Sparkles size={12} className="text-brand-300" /> {info.label}
    </Link>
  )
}

export function CourseProgressBar({ course, pct }: { course: Course; pct: number }) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold text-white">{course.title}</span>
        <Badge tone={pct === 100 ? 'success' : 'brand'}>{pct}%</Badge>
      </div>
      <ProgressBar value={pct} tone={pct === 100 ? 'lime' : 'brand'} />
    </Card>
  )
}
