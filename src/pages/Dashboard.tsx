import { Link } from 'react-router-dom'
import { Flame, Clock, FileText, Trophy, PlayCircle, Sparkles, Target } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Button, ProgressBar, Badge, Md } from '@/components/ui'
import { WaveBars } from '@/components/visuals'
import { useApp, useRecordStudySession } from '@/store/app'
import { weeklyGoalReached } from '@/lib/gamify'
import { challengeOfWeek } from '@/data/seed/gamification'
import { weekIndex } from '@/lib/utils'
import { listCourses } from '@/services/content'

export default function Dashboard() {
  const { user, stats, plan, genre, nextLesson, coursePct, weeklyMin, pushToast } = useApp()
  const recordSession = useRecordStudySession()
  if (!user || !stats) return null

  const firstName = user.name.split(' ')[0]
  const challenge = challengeOfWeek(weekIndex())
  const continueCourse = nextLesson ? listCourses().find(c => c.id === nextLesson.courseId) : undefined
  const goalPct = Math.min(100, Math.round((weeklyMin / Math.max(1, user.profile.weeklyGoalMin || 120)) * 100))
  const streakHint = stats.streak.current === 0 ? 'Quebre o gelo: 20 minutos hoje já iniciam a streak.' : stats.streak.current >= 7 ? `🔥 ${stats.streak.current} dias seguidos de produção.` : `Você está produzindo há ${stats.streak.current} dia(s). Bora manter.`

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${firstName}`}
        sub={<span>{streakHint}</span>}
        actions={<><Badge tone="brand">{plan?.name === 'Free' ? 'Free' : plan?.name}</Badge><Button size="sm" variant="ghost" onClick={() => { recordSession(20, 'check-in'); }}>+ Registrar 20 min</Button></>}
      />

      {/* Nudge de retenção */}
      {continueCourse && coursePct(continueCourse.id) > 0 && coursePct(continueCourse.id) < 100 && (
        <div className="glass flex flex-wrap items-center gap-3 rounded-2xl border-l-4 !border-l-brand p-4 text-sm text-zinc-300">
          <Target size={16} className="text-brand-300" />
          Você está a {countRemaining(user.id, continueCourse.id)} aula(s) de terminar <b className="text-white">{continueCourse.title}</b>.
          <Link to={`/app/aula/${nextLesson!.id}`} className="btn-primary btn-sm ml-auto">Continuar de onde parei</Link>
        </div>
      )}

      {/* Grid principal */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Seu progresso</h2>
            <Badge tone="brand">{stats.levelName}</Badge>
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <div className="text-4xl font-black text-white">{stats.xp}<span className="ml-1 text-sm font-bold text-zinc-500">XP</span></div>
              <div className="mt-1 text-[11px] text-zinc-500">{stats.nextLevel ? `faltam ${Math.max(0, stats.nextLevel.min - stats.xp)} XP para ${stats.nextLevel.name}` : 'nível máximo — lendário 🏆'}</div>
            </div>
            <WaveBars n={16} className="!h-8" seed={stats.xp} />
          </div>
          <ProgressBar value={stats.levelPct} className="mt-3" />
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {([[stats.lessons, 'aulas', PlayCircle], [Math.round(stats.hours), 'horas', Clock], [stats.projects, 'projetos', FileText], [stats.challenges, 'desafios', Trophy]] as [number, string, typeof PlayCircle][]).map(([v, l, Icon]) => (
              <div key={l as string} className="rounded-xl border border-white/[.06] bg-night-800 p-3 text-center">
                <Icon size={14} className="mx-auto mb-1 text-brand-300" />
                <div className="text-lg font-black text-white">{v as number}</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">{l as string}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Próxima aula */}
        <Card className="flex flex-col">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Próxima aula</h2>
          {nextLesson ? (
            <>
              <div className="mt-3 flex-1">
                <div className="text-[11px] text-zinc-500">{continueCourse?.title}</div>
                <div className="mt-1 text-base font-extrabold leading-snug text-white">{nextLesson.title}</div>
                <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-zinc-400">{nextLesson.objective}</p>
                <div className="mt-3 flex gap-2"><Badge>{nextLesson.durationMin} min</Badge>{nextLesson.dawId ? <Badge tone="info">sua DAW</Badge> : <Badge tone="success">conceito</Badge>}</div>
              </div>
              <Link to={`/app/aula/${nextLesson.id}`} className="btn-primary mt-4 w-full">{nextLesson.isSample ? 'Assistir agora' : 'Continuar aprendendo'}</Link>
            </>
          ) : (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
              <span className="text-3xl">🎉</span>
              <p className="text-sm text-zinc-400">Você concluiu tudo que está publicado. Hora do projeto livre — ou aponte para o EP no Projeto 08.</p>
              <Link to="/app/projetos" className="btn-ghost btn-sm">Ver projetos</Link>
            </div>
          )}
        </Card>
      </div>

      {/* Config do aluno + streak + meta */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Sua configuração</h2>
          <div className="mt-3 space-y-2.5 text-sm">
            <Row k="Sua DAW" v={user.profile.daw === 'none' || !user.profile.daw ? 'Comparativo →' : ({ 'fl-studio': 'FL Studio', ableton: 'Ableton Live', cubase: 'Cubase' } as Record<string, string>)[user.profile.daw]} to={user.profile.daw === 'none' ? '/daws' : '/app/aprender'} />
            <Row k="Seu gênero" v={genre ? `${genre.name} · ${genre.bpm[0]}–${genre.bpm[1]} BPM` : 'Definir no perfil'} to="/app/configuracoes" />
            <Row k="Nível" v={({ iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' } as Record<string, string>)[user.profile.level ?? 'iniciante']} to="/app/configuracoes" />
            <Row k="Modo" v={user.profile.mode === 'beginner' ? 'Iniciante (simplificado)' : 'Avançado'} to="/app/configuracoes" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Producer streak</h2>
            <Flame size={16} className={stats.streak.current > 0 ? 'text-amber-400' : 'text-zinc-600'} />
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-black text-white">{stats.streak.current}</span>
            <span className="pb-1 text-sm text-zinc-500">dias · recorde {stats.streak.best}</span>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={i < (stats.streak.current % 7 || (stats.streak.current > 0 ? 7 : 0)) ? 'h-2 flex-1 rounded-full bg-amber-400' : 'h-2 flex-1 rounded-full bg-white/[.06]'} />
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-zinc-500">{stats.streak.activeToday ? 'Hoje já conta! 🎧' : 'Registre a sessão de hoje:'}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[15, 20, 45, 60].map(m => <Button key={m} size="sm" variant="soft" onClick={() => recordSession(m, 'check-in')}>+{m} min</Button>)}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Meta semanal</h2>
            {weeklyGoalReached(weeklyMin, user.profile.weeklyGoalMin) && <Badge tone="success">✓ batida</Badge>}
          </div>
          <div className="mt-3 flex items-end justify-between text-sm">
            <span className="text-2xl font-black text-white">{weeklyMin}<span className="ml-1 text-xs font-bold text-zinc-500">min</span></span>
            <span className="text-xs text-zinc-500">de {user.profile.weeklyGoalMin} min</span>
          </div>
          <ProgressBar value={goalPct} tone="cyan" className="mt-2" />
          <p className="mt-3 text-[12px] text-zinc-500">Total este mês: {stats.streak.monthMinutes} min de produção registrada.</p>
        </Card>
      </div>

      {/* Weekly challenge + AI */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/20 blur-2xl" aria-hidden />
          <div className="flex items-center gap-2"><span className="text-lg">⚡</span><h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Weekly Producer Challenge</h2></div>
          <div className="mt-3 text-lg font-black text-white">{challenge.title}</div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">{challenge.brief}</p>
          <p className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/[.06] px-3 py-2 text-[12px] text-amber-200">Restrição: {challenge.constraint}</p>
          <div className="mt-4 flex items-center justify-between">
            <Badge tone="warn">+{challenge.xp} XP</Badge>
            <Link to="/app/desafios" className="btn-ghost btn-sm">Aceitar desafio</Link>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2"><Sparkles size={16} className="text-brand-300" /><h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">AI Music Mentor</h2></div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">Travou no sidechain? No kick que briga com o bass? Manda a pergunta — o mentor responde com o material <b>curado para {user.profile.daw === 'none' || !user.profile.daw ? 'sua próxima escolha de' : 'a'} DAW</b>.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            {['sidechain', 'meu kick briga com o bass', 'LUFS ideal', 'terminar músicas'].map(s => <Badge key={s}>{s}</Badge>)}
          </div>
          <Link to="/app/mentor" className="btn-primary mt-4 w-full">Falar com o AI Music Mentor</Link>
        </Card>
      </div>

      {user.profile.mode === 'beginner' && (
        <Card>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">🌱 Modo iniciante · conceito do dia</h2>
          <Md className="!mt-2 !text-[13px]" text={`**Sidechain** — de forma simples: quando o **kick** bate, ele "empurra" o volume do **bass** para baixo por um instante. É o "fôlego" da música eletrônica: os dois não disputam o mesmo espaço de grave e a pista sente o movimento.`} />
        </Card>
      )}
    </div>
  )
}

function Row({ k, v, to }: { k: string; v: string; to: string }) {
  return <Link to={to} className="flex items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-white/[.04]"><span className="text-zinc-500">{k}</span><span className="font-bold text-zinc-200">{v} →</span></Link>
}

function countRemaining(userId: string, courseId: string): number {
  const lessons = raw().lessons.filter(l => l.courseId === courseId).map(l => l.id)
  const done = new Set(raw().lesson_progress.filter(p => p.userId === userId && p.courseId === courseId && p.completedAt).map(p => p.lessonId))
  return lessons.filter(l => !done.has(l)).length
}

import { raw } from '@/lib/db'
