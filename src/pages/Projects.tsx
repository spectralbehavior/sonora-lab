import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, CalendarClock, BadgeCheck } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Badge, ProgressBar, Button, Md, Empty } from '@/components/ui'
import { CheckRow } from '@/components/learn'
import { listProjects, getProject } from '@/services/content'
import { myProjectProgress, projectProgressRow, startProject, toggleProjectCheck, completeProject } from '@/services/progress'
import { useApp } from '@/store/app'
import { track } from '@/services/analytics'
import { raw, insert, update } from '@/lib/db'
import { uid, nowISO, cn, formatDate, pct } from '@/lib/utils'

export default function ProjectsPage({ detail = false }: { detail?: boolean }) {
  const { projectId = '' } = useParams()
  return detail ? <ProjectDetail id={projectId} /> : <ProjectsList />
}

function ProjectsList() {
  const { user } = useApp()
  const projects = listProjects()
  const progress = user ? myProjectProgress(user.id) : []
  const doneCount = progress.filter(p => p.status === 'concluido').length
  return (
    <div>
      <PageHeader title="Projetos práticos" sub="Aprender fazendo: cada projeto é uma entrega real na sua DAW, com briefing, checklist e critérios de avaliação." actions={<Badge tone="brand">{doneCount}/{projects.length} concluídos</Badge>} />
      <div className="grid gap-3 md:grid-cols-2">
        {projects.map((p, i) => {
          const pp = progress.find(x => x.projectId === p.id)
          const pctVal = pp ? pct(pp.checked.length, p.checklist.length) : 0
          return (
            <Link key={p.id} to={`/app/projeto/${p.id}`} className="block">
              <Card className="flex h-full flex-col gap-3 transition hover:border-brand/40" >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-black text-brand-300">P{String(i + 1).padStart(2, '0')}</span>
                      {pp?.status === 'concluido' && <Badge tone="success"><BadgeCheck size={12} /> concluído</Badge>}
                      {pp?.status === 'em_andamento' && <Badge tone="warn">em andamento</Badge>}
                    </div>
                    <h3 className="mt-1 text-[15px] font-extrabold text-white">{p.title}</h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{p.tagline}</p>
                  </div>
                  <span className="text-2xl">{['🥁', '🎸', '💥', '🧩', '💿', '🎚️', '🏆', '🚀'][i]}</span>
                </div>
                <div className="mt-auto space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500"><CalendarClock size={12} /> prazo sugerido: {p.suggestedDays} dias · +{p.xp} XP</div>
                  {pp ? <><ProgressBar value={pctVal} tone={pp.status === 'concluido' ? 'lime' : 'brand'} /><span className="text-[11px] text-zinc-500">{pctVal}% do checklist</span></> : <span className="text-[11px] text-zinc-600">Não iniciado — clique para ver o briefing.</span>}
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function ProjectDetail({ id }: { id: string }) {
  const { user, pushToast, afterProgress } = useApp()
  const navigate = useNavigate()
  const project = getProject(id)
  const [error, setError] = useState<string | null>(null)
  if (!project) return <Empty title="Projeto não encontrado" action={<Link to="/app/projetos" className="link">← Projetos</Link>} />
  const pp = user ? projectProgressRow(user.id, project.id) : undefined
  const checked = pp?.checked ?? []
  const done = pp?.status === 'concluido'

  if (!user) return null

  function toggle(item: string) {
    startProject(user!.id, project!.id)
    toggleProjectCheck(user!.id, project!.id, item)
    afterProgress()
  }

  function finish() {
    setError(null)
    try {
      const all = project!.checklist.every(c => checked.includes(c))
      if (!all) throw new Error('Conclua todos os itens do checklist antes de finalizar.')
      completeProject(user!.id, project!.id)
      // registra track finalizada quando o projeto é a Primeira Track
      if (project!.id === 'proj-primeira-track') {
        const t = insert('tracks', { id: uid('trk'), userId: user!.id, title: `Track do projeto — ${new Date().toLocaleDateString('pt-BR')}`, status: 'finalizada', createdAt: nowISO(), versions: [{ n: 1, date: nowISO(), note: 'Gerada ao concluir P05' }], feedback: [] })
        void t
        track('track_uploaded', { via: 'project' })
      }
      track('project_complete', { projectId: project!.id })
      pushToast(`✅ Projeto concluído! +${project!.xp} XP.`, 'success')
      afterProgress()
      navigate('/app/projetos')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro.')
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title={project.title} sub={project.tagline} actions={<Badge tone="warn">+{project.xp} XP</Badge>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Card>
            <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400">Briefing</h2>
            <Md text={project.briefing} />
          </Card>
          <Card>
            <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400">Objetivos de aprendizagem</h2>
            <ul className="space-y-2 text-[13px] text-zinc-300">{project.objectives.map(o => <li key={o} className="flex gap-2"><span className="text-brand-300">◈</span>{o}</li>)}</ul>
          </Card>
          <Card>
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-zinc-400">Checklist de execução</h2>
            <div className="space-y-1.5">
              {project.checklist.map(c => <CheckRow key={c} label={c} checked={checked.includes(c)} onToggle={() => toggle(c)} />)}
            </div>
            {error && <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
          </Card>
          {project.files.length > 0 && (
            <Card>
              <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400">Arquivos do projeto</h2>
              <ul className="space-y-2 text-[13px] text-zinc-300">{project.files.map(f => <li key={f.name} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-300" /><span><b className="text-white">{f.name}</b> — {f.note} <Badge>{f.kind}</Badge></span></li>)}</ul>
            </Card>
          )}
        </div>
        <div className="space-y-4">
          <Card>
            <div className="text-sm font-extrabold text-white">Status</div>
            <Badge tone={done ? 'success' : pp ? 'warn' : 'default'} className="mt-2">{done ? 'Concluído 🏆' : pp ? 'Em andamento' : 'Não iniciado'}</Badge>
            {pp?.startedAt && <p className="mt-2 text-[12px] text-zinc-500">Iniciado em {formatDate(pp.startedAt.slice(0, 10))}</p>}
            {pp?.completedAt && <p className="mt-2 text-[12px] text-zinc-500">Finalizado em {formatDate(pp.completedAt.slice(0, 10))}</p>}
            {!done && <Button className="mt-3 w-full" onClick={finish}>Finalizar projeto</Button>}
            {!pp && <Button className="mt-2 w-full" variant="ghost" onClick={() => { startProject(user.id, project.id); track('project_start', { projectId: project.id }); pushToast('Projeto iniciado — prazo sugerido de ' + project.suggestedDays + ' dias.', 'info'); afterProgress() }}>Começar agora</Button>}
          </Card>
          <Card>
            <div className="text-sm font-extrabold text-white">Critérios de avaliação</div>
            <ul className="mt-2 space-y-2 text-[12px] leading-relaxed text-zinc-400">{project.criteria.map(c => <li key={c} className="flex gap-2"><span className="text-emerald-400">✓</span>{c}</li>)}</ul>
          </Card>
          <Card className="border-brand/25 bg-brand-soft">
            <div className="text-sm font-extrabold text-white">Prazo sugerido</div>
            <p className="mt-1 text-[12px] text-zinc-300">{project.suggestedDays} dias. Não é corte — é antifuga: projeto sem data vira loop eterno.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
