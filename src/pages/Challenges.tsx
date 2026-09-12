import { Link } from 'react-router-dom'
import { Trophy, Timer, Crown } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Badge, Button, ProgressBar } from '@/components/ui'
import { useApp } from '@/store/app'
import { challengeOfWeek } from '@/data/seed/gamification'
import { weekIndex, cn, formatDate } from '@/lib/utils'
import { raw, insert, update, getTable } from '@/lib/db'
import { uid, nowISO } from '@/lib/utils'
import { track } from '@/services/analytics'
import { leaderboard } from '@/services/community'

export default function ChallengesPage() {
  const { user, stats, pushToast, afterProgress } = useApp()
  if (!user || !stats) return null
  const week = weekIndex()
  const key = `W${new Date().getFullYear()}-${week}` // semana corrente (determinística)
  const challenge = challengeOfWeek(week)
  const mine = raw().challenge_claims.find(c => c.userId === user.id && c.weekKey === key)
  const achievements = stats.achievements

  function toggleChallenge() {
    if (mine) return
    insert('challenge_claims', { id: uid('cl'), userId: user!.id, weekKey: key, done: true })
    track('weekly_challenge_completed', { challengeId: challenge.id })
    pushToast(`🏅 Desafio semanal concluído! +${challenge.xp} XP.`, 'success')
    afterProgress()
  }

  const board = leaderboard(8)

  return (
    <div className="space-y-6">
      <PageHeader title="Desafios & conquistas" sub="Gamificação configurável pelo admin (XP e nomes de nível editáveis no painel)." actions={<Badge tone="brand">{stats.xp} XP · {stats.levelName}</Badge>} />

      {/* Weekly */}
      <Card className="relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/15 blur-3xl" aria-hidden />
        <div className="flex flex-wrap items-center gap-2"><Badge tone="warn"><Timer size={11} /> WEEKLY PRODUCER CHALLENGE</Badge><span className="text-[11px] text-zinc-500">rota semanal · v{week % 8 + 1} do ciclo</span></div>
        <h2 className="mt-3 text-xl font-black text-white">{challenge.title}</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-300">{challenge.brief}</p>
        <p className="mt-3 inline-block rounded-lg border border-amber-500/25 bg-amber-500/[.06] px-3 py-1.5 text-[12px] font-semibold text-amber-200">Restrição: {challenge.constraint}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {mine ? <Badge tone="success">✓ Concluído nesta semana — +{challenge.xp} XP creditado</Badge>
            : <Button onClick={toggleChallenge}>Marcar como concluído (+{challenge.xp} XP)</Button>}
          <Link to="/app/comunidade" className="btn-ghost btn-sm">Postar resultado na comunidade</Link>
          <Link to="/app/estudio" className="btn-ghost btn-sm">Registrar sessão no estúdio</Link>
        </div>
        <p className="mt-3 text-[11px] text-zinc-500">Ranking é opcional e só aparece para quem ativa na Comunidade — competição saudável, sem pressão.</p>
      </Card>

      {/* progress to next level */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Conquistas</h2><span className="text-[11px] text-zinc-500">{achievements.filter(a => a.earnedAt).length}/{achievements.length}</span></div>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {achievements.map(({ def, earnedAt }) => (
              <div key={def.id} className={cn('flex items-center gap-3 rounded-xl border p-3', earnedAt ? 'border-brand/40 bg-brand-soft' : 'border-white/[.06] bg-night-800')}>
                <span className={cn('text-2xl', !earnedAt && 'opacity-30 grayscale')}>{def.icon}</span>
                <div className="min-w-0">
                  <div className={cn('truncate text-[13px] font-extrabold', earnedAt ? 'text-white' : 'text-zinc-400')}>{def.title}</div>
                  <div className="truncate text-[11px] text-zinc-500">{def.description}</div>
                  {earnedAt ? <div className="mt-0.5 text-[10px] font-bold text-emerald-400">desbloqueada {formatDate(earnedAt.slice(0, 10))}</div>
                    : <div className="mt-1"><ProgressBar value={progressFor(def.id, stats)} className="!h-1" /></div>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400"><Crown size={14} className="text-amber-400" /> Ranking da semana</div>
          <p className="mt-1 text-[11px] text-zinc-500">Contas de demonstração — ranking real liga na Fase 5 com opt-in do usuário.</p>
          <div className="mt-3 space-y-2">
            {board.map((b, i) => (
              <div key={b.userId} className={cn('flex items-center gap-3 rounded-xl px-3 py-2', b.userId === user.id ? 'border border-brand/40 bg-brand-soft' : 'bg-white/[.02]')}>
                <span className="w-5 font-mono text-xs font-black text-zinc-500">{i + 1}</span>
                <span className="flex-1 truncate text-[13px] font-bold text-zinc-200">{b.name}{b.userId === user.id ? ' (você)' : ''}</span>
                <span className="text-[11px] font-bold text-brand-300">{b.lessons} aulas · {b.xp} XP</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* milestones list = desafios do tipo "troféu" (spec) */}
      <Card>
        <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400"><Trophy size={14} className="text-brand-300" /> Marcos de produtor</div>
        <div className="mt-3 grid gap-2 text-[12px] sm:grid-cols-2 lg:grid-cols-3">
          {['🏆 Criar primeiro beat', '🏆 Criar primeiro bass', '🏆 Criar primeiro drop', '🏆 Completar primeira música', '🏆 Finalizar primeira mix', '🏆 Finalizar primeiro master', '🏆 Completar primeiro curso', '🏆 Produzir 3 músicas', '🏆 Produzir 10 músicas'].map((m, i) => {
            const earned = stats.achievements[i]?.earnedAt
            return <div key={m} className={cn('flex items-center gap-2 rounded-lg border px-3 py-2', earned ? 'border-emerald-500/30 bg-emerald-500/[.06] text-emerald-300' : 'border-white/[.06] text-zinc-400')}>{m}</div>
          })}
        </div>
      </Card>
    </div>
  )
}

function progressFor(achId: string, stats: { lessons: number; projects: number; tracks: number; courses: number; streak: { current: number }; challenges: number; mixDone: boolean; masterDone: boolean }): number {
  const def = getTable('achievements').find(a => a.id === achId)
  if (!def) return 0
  const m = def.criteria
  const value =
    m.metric === 'lessons' ? stats.lessons : m.metric === 'projects' ? stats.projects : m.metric === 'tracks' ? stats.tracks :
    m.metric === 'courses' ? stats.courses : m.metric === 'streak' ? stats.streak.current : m.metric === 'challenges' ? stats.challenges :
    m.metric === 'mixdone' ? (stats.mixDone ? 1 : 0) : m.metric === 'masterdone' ? (stats.masterDone ? 1 : 0) : 0
  return Math.min(100, Math.round((value / m.value) * 100))
}
