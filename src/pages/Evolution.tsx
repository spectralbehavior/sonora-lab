import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shell'
import { Card, Badge } from '@/components/ui'
import { useApp } from '@/store/app'
import { raw } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import type { AchievementDef } from '@/types'

interface Milestone { date: string; icon: string; title: string; detail: string; done: boolean }

export default function EvolutionPage() {
  const { user, stats } = useApp()
  if (!user || !stats) return null
  const db = raw()
  const doneProjects = new Set(db.project_progress.filter(p => p.userId === user.id && p.status === 'concluido').map(p => p.projectId))
  const firstLesson = db.lesson_progress.filter(p => p.userId === user.id && p.completedAt).sort((a, b) => (a.completedAt > b.completedAt ? 1 : -1))[0]
  const earned = (id: string) => db.user_achievements.find(a => a.userId === user.id && a.achievementId === id)
  const project = (pid: string) => db.projects.find(p => p.id === pid)

  const milestones: Milestone[] = [
    { date: firstLesson?.completedAt ?? '', icon: '🎬', title: 'Primeira aula concluída', detail: firstLesson ? db.lessons.find(l => l.id === firstLesson.lessonId)?.title ?? '' : 'Complete qualquer aula para iniciar sua linha do tempo.', done: !!firstLesson },
    { date: earned('ach-first-beat')?.earnedAt ?? '', icon: '🥁', title: 'Primeiro beat', detail: 'Projeto 01 entregue no prazo.', done: doneProjects.has('proj-primeiro-beat') || !!earned('ach-first-beat') },
    { date: project('proj-primeiro-arranjo') && doneProjects.has('proj-primeiro-arranjo') ? db.project_progress.find(p => p.userId === user.id && p.projectId === 'proj-primeiro-arranjo')?.completedAt ?? '' : '', icon: '🧩', title: 'Primeiro arranjo', detail: 'Loop virou música com blocos.', done: doneProjects.has('proj-primeiro-arranjo') },
    { date: '', icon: '🎚️', title: 'Primeira mixagem', detail: 'Pipeline completo + auditoria.', done: stats.mixDone },
    { date: '', icon: '💿', title: 'Primeiro master', detail: 'Alvo medido e validação.', done: stats.masterDone },
    { date: db.tracks.find(t => t.userId === user.id && t.status === 'finalizada')?.createdAt ?? '', icon: '🏆', title: 'Primeira track finalizada', detail: 'A música existe no mundo.', done: stats.tracks > 0 },
    { date: '', icon: '🚀', title: 'Primeiro EP', detail: 'Projeto 08 — consistência em 3 faixas.', done: doneProjects.has('proj-ep-tres-musicas') },
  ]

  // preenche datas dos concluídos via progresso de projetos
  const projDate = (pid: string) => db.project_progress.find(p => p.userId === user.id && p.projectId === pid && p.status === 'concluido')?.completedAt
  milestones[3].date = projDate('proj-primeira-mixagem') ?? ''
  milestones[4].date = projDate('proj-primeiro-master') ?? ''

  const xpByWeek = recentWeeklyXp(user.id, db.user_achievements.length)

  return (
    <div>
      <PageHeader title="Minha evolução" sub="A linha do tempo do seu processo — marcos reais, derivados do seu progresso." actions={<Badge tone="brand">{stats.lessons} aulas · {stats.hours}h</Badge>} />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card>
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-zinc-400">Linha do tempo</h2>
          <ol className="relative space-y-5 pl-7 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-0.5 before:bg-gradient-to-b before:from-brand before:to-neon-cyan before:opacity-30">
            {milestones.map((m, i) => (
              <li key={m.title} className="relative" style={{ animation: `rise .45s ease ${i * 0.07}s both` }}>
                <span className={`absolute -left-7 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[9px] ${m.done ? 'border-emerald-400 bg-emerald-400/20' : 'border-white/15 bg-night-800'}`}>{m.done ? '✓' : ''}</span>
                <div className={`rounded-xl border p-3.5 ${m.done ? 'border-emerald-500/20 bg-emerald-500/[.04]' : 'border-white/[.06] bg-night-800/50 opacity-80'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-sm font-extrabold text-white">{m.title}</span>
                    {m.done && m.date ? <span className="ml-auto text-[10px] text-zinc-500">{formatDate(m.date.slice(0, 10))}</span> : !m.done && <Link to="/app/projetos" className="ml-auto text-[11px] font-bold text-brand-300 hover:text-white">como chegar aqui →</Link>}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{m.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">XP por semana</h2>
            <div className="mt-3 flex h-24 items-end gap-1.5">
              {xpByWeek.map((v, i) => (
                <div key={i} className="group relative flex-1">
                  <div className="w-full rounded-t bg-gradient-to-t from-brand to-neon-cyan transition group-hover:opacity-100" style={{ height: `${Math.max(4, Math.min(100, (v / Math.max(1, Math.max(...xpByWeek))) * 100))}%`, opacity: 0.4 + 0.6 * (v / Math.max(1, Math.max(...xpByWeek))) }} title={`+${v} XP`} />
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-zinc-600"><span>-7 sem</span><span>agora</span></div>
          </Card>
          <Card>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Conquistas recentes</h2>
            <div className="mt-2 space-y-2 text-[12px]">
              {stats.recentEarned.length === 0 && <p className="text-zinc-500">A primeira chega rápido — comece pelo Curso 01.</p>}
              {stats.recentEarned.map((a: AchievementDef) => <div key={a.id} className="flex items-center gap-2 rounded-lg border border-brand/25 bg-brand-soft px-3 py-2"><span className="text-lg">{a.icon}</span><span className="font-bold text-zinc-200">{a.title}</span><span className="ml-auto text-[10px] text-zinc-500">+{a.xp}</span></div>)}
            </div>
          </Card>
          <Card className="text-[12px] leading-relaxed text-zinc-400">
            💬 <b className="text-zinc-200">O que isso significa:</b> evolução de produtor não é só XP — são artefatos que existem (beats, mixes, masters, a track publicada). Esta página existe para você voltar em 6 meses e ver a diferença com seus próprios ouvidos.
            <Link to="/app/portefolio" className="btn-ghost btn-sm mt-3 w-full">Abrir meu portfólio</Link>
          </Card>
        </div>
      </div>
    </div>
  )
}

function recentWeeklyXp(userId: string, _seed: number): number[] {
  const db = raw()
  const weeks = Array.from({ length: 8 }).map(() => 0)
  const now = Date.now()
  for (const p of db.lesson_progress.filter(x => x.userId === userId && x.completedAt)) {
    const d = (now - new Date(p.completedAt).getTime()) / (7 * 86400000)
    const w = 7 - Math.floor(d)
    if (w >= 0 && w < 8) weeks[w] += 50
  }
  for (const a of db.user_achievements.filter(x => x.userId === userId)) {
    const def = db.achievements.find(d => d.id === a.achievementId)
    const d = (now - new Date(a.earnedAt).getTime()) / (7 * 86400000)
    const w = 7 - Math.floor(d)
    if (w >= 0 && w < 8 && def) weeks[w] += def.xp
  }
  return weeks
}
