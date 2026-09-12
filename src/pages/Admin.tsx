import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { raw, resetDb, getSetting, setSetting, update, insert } from '@/lib/db'
import { cms, listCourses, listModules, listLessons, getCourse, getDawVersions } from '@/services/content'
import { revenueSnapshot, listPlans } from '@/services/billing'
import { pendingReports, resolveReports, deletePost } from '@/services/community'
import { Logo } from '@/components/visuals'
import { Card, Badge, Button, Field, Md, ProgressBar } from '@/components/ui'
import { cn, uid } from '@/lib/utils'
import type { Course, Lesson, ModuleRow, Genre, PlanDef } from '@/types'

const TABS = ['Visão', 'Cursos & Aulas (CMS)', 'Gêneros', 'DAWs & Versões', 'Planos & Cupons', 'Gamificação', 'Usuários', 'Moderação', 'Analytics'] as const
type Tab = typeof TABS[number]

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('Visão')
  return (
    <div className="min-h-screen bg-night-950">
      <header className="sticky top-0 z-40 border-b border-white/[.07] bg-night-900/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <Logo compact />
          <span className="text-sm font-black text-white">{`Painel Admin`}</span>
          <Badge tone="danger">restrito · auditoria ativa</Badge>
          <Link to="/app" className="btn-ghost btn-sm ml-auto">← Voltar ao app</Link>
          <Button size="sm" variant="ghost" onClick={() => { if (confirm('Restaurar todo o banco local ao seed? (demo)')) { resetDb(); window.location.reload() } }}>♻ reseed</Button>
        </div>
        <div className="hide-scroll mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={cn('whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-bold transition', tab === t ? 'bg-brand text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white')}>{t}</button>)}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === 'Visão' && <Overview />}
        {tab === 'Cursos & Aulas (CMS)' && <ContentCms />}
        {tab === 'Gêneros' && <Genres />}
        {tab === 'DAWs & Versões' && <DawVersions />}
        {tab === 'Planos & Cupons' && <Billing />}
        {tab === 'Gamificação' && <Gamification />}
        {tab === 'Usuários' && <Users />}
        {tab === 'Moderação' && <Moderation />}
        {tab === 'Analytics' && <Events />}
      </main>
    </div>
  )
}

// ── Visão ────────────────────────────────────────────────────────────────────

function Overview() {
  const db = raw()
  const rev = revenueSnapshot()
  const signups = db.users.length
  const lessonsDone = db.lesson_progress.filter(p => p.completedAt).length
  const projDone = db.project_progress.filter(p => p.status === 'concluido').length
  const cards = [
    ['Usuários', String(signups), 'contas locais (demo)'],
    ['Alunos ativos (7d)', String(new Set(db.lesson_progress.filter(p => p.completedAt && Date.now() - new Date(p.completedAt).getTime() < 7 * 864e5).map(p => p.userId)).size), 'com conclusão de aula na semana'],
    ['Aulas concluídas', String(lessonsDone), 'total cumulativo'],
    ['Projetos concluídos', String(projDone), 'entregas reais'],
    ['Assinantes pagantes', String(rev.subscribers), `${rev.conversion}% de conversão`],
    ['MRR (demo)', `R$ ${rev.mrr.toFixed(2)}`, `ARPU ${rev.arpu.toFixed(2)} · churn flags ${rev.canceled}`],
    ['Certificados', String(db.certificates.length), 'emitidos'],
    ['Tracks', String(db.tracks.length), 'registradas (finalizadas: ' + db.tracks.filter(t => t.status === 'finalizada').length + ')'],
  ]
  const retention = rev.retention
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([l, v, h]) => (
          <Card key={l}><div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{l}</div><div className="mt-1 text-2xl font-black text-white">{v}</div><div className="text-[11px] text-zinc-500">{h}</div></Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="text-sm font-extrabold text-white">Saúde do funil</div>
          {[['cadastro → onboarding', Math.round(db.profiles.filter(p => p.level).length / Math.max(1, signups) * 100)],
            ['onboarding → 1ª aula concluída', Math.round(new Set(db.lesson_progress.filter(p => p.completedAt).map(p => p.userId)).size / Math.max(1, db.profiles.filter(p => p.level).length) * 100)],
            ['aulas → projeto ativo', Math.round(db.project_progress.length / Math.max(1, db.profiles.filter(p => p.level).length) * 100)],
            ['retenção (com progresso)', retention]].map(([label, pctVal]) => (
            <div key={label as string} className="mt-3">
              <div className="flex justify-between text-[12px] text-zinc-400"><span>{label}</span><b className="text-zinc-200">{pctVal}%</b></div>
              <ProgressBar value={pctVal as number} className="mt-1" />
            </div>
          ))}
        </Card>
        <Card>
          <div className="text-sm font-extrabold text-white">Checklist de lançamento (gate de qualidade)</div>
          <ul className="mt-3 space-y-1.5 text-[12px] leading-relaxed text-zinc-400">
            <li>✅ Rotas públicas + app renderizando (tests: smoke)</li>
            <li>✅ Auth/onboarding/progresso funcionais (demo local)</li>
            <li>✅ Content versionado por DAW + fluxo de report</li>
            <li>◐ Supabase + RLS + webhooks (trocar por env; schema pronto)</li>
            <li>◐ PSP real (Stripe/MP/Asaas) + cobrança recorrente</li>
            <li>◐ Storage de áudio/marketplace (Fases 7–8)</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

// ── CMS Educação ─────────────────────────────────────────────────────────────

function ContentCms() {
  const [courseId, setCourseId] = useState<string>(listCourses()[0]?.id ?? '')
  const [, force] = useState(0)
  const re = () => force(x => x + 1)
  const course = getCourse(courseId)
  const modules = useMemo(() => (courseId ? listModules(courseId) : []), [courseId, course])
  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <Card>
        <div className="flex items-center justify-between"><span className="text-xs font-extrabold uppercase text-zinc-400">Cursos</span>
          <Button size="sm" variant="soft" onClick={() => { const slug = prompt('slug do novo curso (kebab-case):'); if (slug) { cms.createCourse({ slug, title: 'Novo curso', subtitle: '', description: '', track: 'foundations', level: 'iniciante', order: 99, estHours: 1, objectives: [], tags: [], published: false }); re() } }}>+ Curso</Button>
        </div>
        <div className="mt-2 space-y-1">
          {raw().courses.sort((a, b) => a.order - b.order).map(c => (
            <button key={c.id} onClick={() => setCourseId(c.id)} className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-bold transition', courseId === c.id ? 'bg-brand-soft text-white' : 'text-zinc-400 hover:bg-white/5')}>
              <span className={cn('h-1.5 w-1.5 rounded-full', c.published ? 'bg-emerald-400' : 'bg-zinc-600')} /> {c.title}
            </button>
          ))}
        </div>
      </Card>
      {course ? <CourseEditor key={course.id} course={course} modules={modules} reload={re} /> : <EmptyTab />}
    </div>
  )
}

function EmptyTab() { return <Card className="text-sm text-zinc-500">Selecione ou crie um curso à esquerda.</Card> }

function CourseEditor({ course, modules, reload }: { course: Course; modules: ModuleRow[]; reload: () => void }) {
  const [title, setTitle] = useState(course.title)
  const [subtitle, setSubtitle] = useState(course.subtitle)
  const [description, setDescription] = useState(course.description)
  const [sel, setSel] = useState<string | null>(null)
  const lessons = sel ? listLessons(course.id).filter(l => l.moduleId === sel) : []
  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex items-center justify-between"><span className="text-xs font-extrabold uppercase text-zinc-400">Metadados do curso</span>
          <div className="flex gap-2">
            <Button size="sm" variant={course.published ? 'soft' : 'primary'} onClick={() => { cms.saveCourse(course.id, { published: !course.published }); reload() }}>{course.published ? '🟢 Publicado — despublicar' : '📕 Despublicado — publicar'}</Button>
            <Button size="sm" variant="danger" onClick={() => { if (confirm('Remover curso + módulos + aulas?')) { cms.removeCourse(course.id); reload() } }}>Excluir</Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Título"><input className="input" value={title} onChange={e => setTitle(e.target.value)} /></Field>
          <Field label="Subtítulo"><input className="input" value={subtitle} onChange={e => setSubtitle(e.target.value)} /></Field>
        </div>
        <Field label="Descrição"><textarea className="input min-h-20" value={description} onChange={e => setDescription(e.target.value)} /></Field>
        <div className="flex flex-wrap gap-3 text-[12px] text-zinc-400">
          <span>track: <b className="text-zinc-200">{course.track}</b>{course.dawId ? ` · ${course.dawId}` : ''}</span>
          <span>order: <b className="text-zinc-200">{course.order}</b></span>
          <span>horas: <b className="text-zinc-200">{course.estHours}</b></span>
        </div>
        <Button size="sm" onClick={() => { cms.saveCourse(course.id, { title, subtitle, description }); reload(); alert('Curso salvo.') }}>Salvar curso</Button>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase text-zinc-400">Módulos ({modules.length})</span>
          <Button size="sm" variant="soft" onClick={() => { const t = prompt('Título do módulo:'); if (t) { cms.createModule(course.id, t, ''); reload() } }}>+ Módulo</Button>
        </div>
        <div className="mt-3 space-y-2">
          {modules.map(m => (
            <div key={m.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[.06] p-2.5">
              <button className="text-[13px] font-bold text-brand-300 hover:underline" onClick={() => setSel(sel === m.id ? null : m.id)}>{sel === m.id ? '▾' : '▸'} {m.title}</button>
              <span className="text-[11px] text-zinc-500">{listLessons(course.id).filter(l => l.moduleId === m.id).length} aulas</span>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => { const t = prompt('Nova aula em ' + m.title + ':', 'Aula X'); if (t) { const l = cms.createLesson(course.id, m.id, t); setSel(m.id); void l; reload() } }}>+ aula</Button>
              <Button size="sm" variant="ghost" onClick={() => { const t = prompt('Renomear módulo:', m.title); if (t) { update('modules', m.id, { title: t }); reload() } }}>renomear</Button>
            </div>
          ))}
        </div>
        {sel && (
          <div className="mt-4 space-y-3">
            {lessons.map(l => <LessonEditor key={l.id} lesson={l} reload={reload} />)}
          </div>
        )}
      </Card>
    </div>
  )
}

function LessonEditor({ lesson, reload }: { lesson: Lesson; reload: () => void }) {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ ...lesson })
  const [verify, setVerify] = useState({ version: lesson.verified?.version ?? '', date: lesson.verified?.date ?? '' })
  return (
    <div className={cn('rounded-xl border', open ? 'border-brand/40 bg-brand-soft/20' : 'border-white/[.06]')}>
      <button className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left" onClick={() => setOpen(o => !o)}>
        <span className="font-mono text-[10px] text-zinc-600">L{String(lesson.order).padStart(2, '0')}</span>
        <span className="text-[13px] font-bold text-zinc-200">{lesson.title}</span>
        <Badge className="ml-auto">{lesson.durationMin}min</Badge>
        <Badge tone={lesson.isSample ? 'success' : 'default'}>{lesson.isSample ? '🎁 free' : 'pro'}</Badge>
        {lesson.quiz && <Badge tone="info">quiz</Badge>}
        {open ? '▾' : '▸'}
      </button>
      {open && (
        <div className="space-y-3 border-t border-white/[.07] p-3.5">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Field label="Título"><input className="input !py-2 text-[13px]" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></Field>
            <Field label="URL do vídeo (Supabase Storage/YouTube; vazio = aula texto+prática)"><input className="input !py-2 text-[13px]" value={f.videoUrl ?? ''} onChange={e => setF({ ...f, videoUrl: e.target.value || undefined })} /></Field>
            <Field label="Objetivo"><input className="input !py-2 text-[13px]" value={f.objective} onChange={e => setF({ ...f, objective: e.target.value })} /></Field>
            <Field label="duração (min)"><input className="input !py-2 text-[13px]" inputMode="numeric" value={f.durationMin} onChange={e => setF({ ...f, durationMin: +e.target.value.replace(/\D/g, '') || 0 })} /></Field>
          </div>
          <Field label="Corpo da aula (markdown: ###, -, **negrito**)"><textarea dir="ltr" className="input min-h-40 font-mono !text-[12px]" value={f.body} onChange={e => setF({ ...f, body: e.target.value })} /></Field>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <Field label="Prática (1 por linha)"><textarea className="input min-h-20 !text-[12px]" value={(f.practice ?? []).join('\n')} onChange={e => setF({ ...f, practice: e.target.value.split('\n').filter(Boolean) })} /></Field>
            <Field label="Checklist (1 por linha)"><textarea className="input min-h-20 !text-[12px]" value={f.checklist.join('\n')} onChange={e => setF({ ...f, checklist: e.target.value.split('\n').filter(Boolean) })} /></Field>
            <Field label="Tags (csv)"><input className="input !text-[12px]" value={f.tags.join(',')} onChange={e => setF({ ...f, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></Field>
          </div>
          <Field label="Desafio"><textarea className="input min-h-16 !text-[12px]" value={f.challenge ?? ''} onChange={e => setF({ ...f, challenge: e.target.value || undefined })} /></Field>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <Field label="Nível"><select className="input !py-2 text-[12px]" value={f.level} onChange={e => setF({ ...f, level: e.target.value as never })}><option value="iniciante">iniciante</option><option value="intermediario">intermediário</option><option value="avancado">avancado</option></select></Field>
            <Field label="Aula introdutória (Free)?"><select className="input !py-2 text-[12px]" value={f.isSample ? '1' : '0'} onChange={e => setF({ ...f, isSample: e.target.value === '1' })}><option value="0">não</option><option value="1">sim</option></select></Field>
            <Field label="Ordem"><input className="input !py-2 text-[12px]" value={f.order} onChange={e => setF({ ...f, order: +e.target.value.replace(/\D/g, '') || 1 })} /></Field>
          </div>
          {(f.dawSteps || lesson.dawId) && (
            <div className="grid gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[.05] p-3 sm:grid-cols-3">
              <span className="text-[11px] font-black uppercase text-amber-300 sm:col-span-3">⚠ Conteúdo específico de DAW: exige carimbo de versão verificada antes de publicar</span>
              <Field label="Versão verificada (ex.: FL Studio 21.x)"><input className="input !py-1.5 !text-[12px]" value={verify.version} onChange={e => setVerify({ ...verify, version: e.target.value })} /></Field>
              <Field label="Data da conferência (AAAA-MM-DD)"><input className="input !py-1.5 !text-[12px]" value={verify.date} onChange={e => setVerify({ ...verify, date: e.target.value })} /></Field>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => {
              if ((f.dawSteps || f.dawId) && (!verify.version || !verify.date)) { alert('Para conteúdo DAW específico, preencha versão verificada + data (regra LGPD-editorial do produto).'); return }
              cms.saveLesson(lesson.id, { ...f, verified: f.dawId || f.dawSteps ? (verify.version && verify.date ? { daw: (f.dawId ?? 'fl-studio'), version: verify.version, date: verify.date } : f.verified) : undefined })
              reload(); alert('Aula salva (rascunho). Não esqueça de revisar na rota /app/aula/' + lesson.id)
            }}>💾 Salvar aula</Button>
            <Link to={`/app/aula/${lesson.id}`} className="btn-ghost btn-sm">👁 Pré-visualizar</Link>
            <Button size="sm" variant="danger" onClick={() => { if (confirm('Excluir aula?')) { cms.removeLesson(lesson.id); reload() } }}>Excluir</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Gêneros ──────────────────────────────────────────────────────────────────

function Genres() {
  const [, force] = useState(0)
  const g = raw().genres
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-zinc-400">Trilhas de gênero ({g.length}) — arquitetura aberta: criar aqui = disponível no onboarding e nas trilhas.</p>
        <Button size="sm" variant="soft" onClick={() => { const n = prompt('Nome do gênero:'); if (n) { cms.createGenre(n); force(x => x + 1) } }}>+ Gênero</Button>
      </div>
      {g.map(genre => <GenreEditor key={genre.id} genre={genre} reload={() => force(x => x + 1)} />)}
    </div>
  )
}

function GenreEditor({ genre, reload }: { genre: Genre; reload: () => void }) {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ ...genre })
  const num = (s: string) => +s.replace(/\D/g, '') || 0
  return (
    <Card className="!p-3">
      <div className="flex cursor-pointer flex-wrap items-center gap-3" onClick={() => setOpen(o => !o)}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.color }} />
        <span className="text-sm font-extrabold text-white">{f.name}</span>
        <Badge tone="warn">{f.bpm[0]}–{f.bpm[1]} BPM</Badge>
        <span className="ml-auto text-[10px] text-zinc-600">{open ? '▾ fechar' : '▸ editar'}</span>
      </div>
      {open && (
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {([['structure', 'Estrutura típica'], ['drums', 'Padrões rítmicos'], ['bass', 'Características de baixo'], ['melodic', 'Elementos melódicos'], ['soundDesign', 'Sound design'], ['arrangement', 'Arranjo'], ['mixing', 'Mixagem'], ['references', 'Referências (csv)']] as const).map(([k, label]) => (
            <Field key={k} label={label}>
              {k === 'references'
                ? <textarea className="input !py-1.5 text-[12px]" value={f.references.join(', ')} onChange={e => setF({ ...f, references: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                : <textarea className="input !py-1.5 text-[12px]" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />}
            </Field>
          ))}
          <Field label="BPM min"><input className="input !py-1.5" value={f.bpm[0]} onChange={e => setF({ ...f, bpm: [num(e.target.value), f.bpm[1]] })} /></Field>
          <Field label="BPM max"><input className="input !py-1.5" value={f.bpm[1]} onChange={e => setF({ ...f, bpm: [f.bpm[0], num(e.target.value)] })} /></Field>
          <div className="sm:col-span-2"><Button size="sm" onClick={() => { cms.saveGenre(genre.id, f); reload(); }}>Salvar {f.name}</Button></div>
        </div>
      )}
    </Card>
  )
}

// ── DAWs & versões ───────────────────────────────────────────────────────────

function DawVersions() {
  const [, force] = useState(0)
  const versions = getDawVersions()
  const add = () => {
    const daw = prompt('DAW (fl-studio, ableton, cubase):', 'fl-studio')
    if (daw && ['fl-studio', 'ableton', 'cubase'].includes(daw)) {
      const v = prompt('Versão verificada:', 'FL Studio 21.x')
      if (v) { cms.createDawVersion(daw, v); force(x => x + 1) }
    }
  }
  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-relaxed text-zinc-400">Registro de <b>DAW · versão · SO · data de atualização · versão do conteúdo</b> (exigência do produto para instruções específicas). Ao marcar uma nova release, as aulas com versão anterior ganham o selo "⚠ revisar" automaticamente no player e aqui.</p>
      <Button size="sm" variant="soft" onClick={add}>+ Registrar versão/daw</Button>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {versions.map(v => (
          <Card key={v.id} className="text-[12px]">
            <div className="flex items-center justify-between"><b className="text-white">{v.dawId}</b><Badge tone="info">{v.version}</Badge></div>
            <p className="mt-1.5 text-zinc-500">SO: {v.os} · conteúdo {v.contentVersion} · atualizado {v.updatedAt}</p>
            <p className="mt-1 text-zinc-400">{v.notes}</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { const d = prompt('Notas de revisão:', v.notes); if (d !== null) { cms.saveDawVersion(v.id, { notes: d, updatedAt: new Date().toISOString().slice(0, 10) }); cms.saveDawVersion(v.id, { contentVersion: `r${(parseInt(v.contentVersion.replace(/\D/g, '') || '1', 10) + 1)}` }); force(x => x + 1) } }}>registrar revisão (bump r+1)</Button>
              <Button size="sm" variant="danger" onClick={() => { cms.removeDawVersion(v.id); force(x => x + 1) }}>×</Button>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="text-[11px] font-extrabold uppercase text-amber-300">Fila de revisão disparada</div>
        <VersionStaleList />
      </Card>
    </div>
  )
}

function VersionStaleList() {
  const db = raw()
  const stale = db.lessons.filter(l => {
    if (!l.verified) return false
    const cur = db.daw_versions.find(v => v.dawId === l.verified!.daw)
    return !!cur && cur.version !== l.verified.version
  })
  if (!stale.length) return <p className="mt-2 text-[12px] text-zinc-500">Nenhuma aula DAW desalinhada da versão registrada atual. ✅</p>
  return (
    <ul className="mt-2 space-y-1.5">
      {stale.map(l => <li key={l.id} className="flex items-center gap-2 text-[12px] text-zinc-300">⚠ <b>{l.title}</b><span className="text-zinc-500">({l.verified!.daw} · conteúdo em {l.verified!.version})</span><Link to={`/app/aula/${l.id}`} className="link ml-auto">revisar →</Link></li>)}
    </ul>
  )
}

// ── Billing admin ────────────────────────────────────────────────────────────

function Billing() {
  const [plans, setPlans] = useState<PlanDef[]>(listPlans().map(p => ({ ...p })))
  const [coupons, setCoupons] = useState([...raw().coupons])
  const [code, setCode] = useState('')
  const [pctOff, setPctOff] = useState('20')
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {plans.map((p, i) => (
          <Card key={p.id} className="space-y-2">
            <div className="flex items-center gap-2"><b className="text-white">{p.name}</b><Badge tone={p.priceMonthly > 0 ? 'brand' : 'default'}>{p.priceMonthly === 0 ? 'free' : 'pago'}</Badge><span className="ml-auto text-[11px] text-zinc-500">id: {p.id}</span></div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Preço mensal (R$)"><input className="input !py-1.5 text-[12px]" value={p.priceMonthly} onChange={e => setPlans(ps => ps.map((x, xi) => xi === i ? { ...x, priceMonthly: +e.target.value.replace(/[^\d.]/g, '') || 0 } : x))} /></Field>
              <Field label="Preço anual (R$)"><input className="input !py-1.5 text-[12px]" value={p.priceAnnual} onChange={e => setPlans(ps => ps.map((x, xi) => xi === i ? { ...x, priceAnnual: +e.target.value.replace(/[^\d.]/g, '') || 0 } : x))} /></Field>
            </div>
            <Field label="Features (1 por linha)"><textarea className="input min-h-20 !text-[12px]" value={p.features.join('\n')} onChange={e => setPlans(ps => ps.map((x, xi) => xi === i ? { ...x, features: e.target.value.split('\n').filter(Boolean) } : x))} /></Field>
            <Button size="sm" onClick={() => { const cur = listPlans(); const updated = cur.map((x, xi) => (plans[xi]?.id === x.id ? plans[xi] : x)); setSetting('plans', updated); alert('Planos salvos nas settings (preço NÃO fica no código — conforme exigência do produto).') }}>Salvar {p.name}</Button>
          </Card>
        ))}
      </div>
      <Card className="space-y-2">
        <div className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Cupons</div>
        {coupons.map(c => (
          <div key={c.id} className="flex items-center gap-2 rounded-lg border border-white/[.06] px-2.5 py-2 text-[12px]">
            <code className="font-black text-brand-300">{c.code}</code><Badge tone={c.active ? 'success' : 'default'}>{c.active ? c.percent + '%' : 'inativo'}</Badge>
            <button className="ml-auto text-[11px] text-zinc-500 hover:text-rose-300" onClick={() => { update('coupons', c.id, { active: !c.active }); setCoupons([...raw().coupons]) }}>{c.active ? 'pausar' : 'reativar'}</button>
          </div>
        ))}
        <div className="flex gap-2">
          <input className="input !py-1.5 text-[12px] uppercase" placeholder="CODIGO" value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
          <input className="input !w-20 !py-1.5 text-[12px]" value={pctOff} onChange={e => setPctOff(e.target.value.replace(/\D/g, ''))} />
        </div>
        <Button size="sm" onClick={() => { if (!code) return; insert('coupons', { id: uid('cp'), code, percent: +pctOff || 10, active: true }); setCoupons([...raw().coupons]); setCode('') }}>Criar</Button>
        <p className="text-[10px] leading-relaxed text-zinc-500">Obs.: cupons persistem na tabela local; no Supabase, o CRUD roda via PostgREST com policy admin. Produção: também vincula a campanha (utm) e limites de uso.</p>
      </Card>
    </div>
  )
}

// ── Gamificação ──────────────────────────────────────────────────────────────

function Gamification() {
  const xp = getSetting<Record<string, number>>('xp', {})
  const levels = getSetting<{ name: string; min: number }[]>('levels', [])
  const [xpF, setXpF] = useState({ ...xp })
  const [lv, setLv] = useState(levels.map(l => ({ ...l })))
  const rows: [string, string][] = [
    ['lessonComplete', 'Aula concluída'], ['exerciseComplete', 'Exercício concluído'], ['challengeComplete', 'Desafio concluído'],
    ['projectComplete', 'Projeto concluído'], ['firstTrackFinished', '1ª música finalizada'], ['courseComplete', 'Curso concluído'],
    ['onboardingComplete', 'Onboarding concluído'], ['quizPerfectBonus', 'Bônus quiz 100%'], ['streakDayBonus', 'Bônus por dia de streak'],
  ]
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Valores de XP (configurável — exigência do produto)</div>
        <div className="mt-3 space-y-2">
          {rows.map(([k, label]) => (
            <div key={k} className="flex items-center gap-3">
              <span className="flex-1 text-[13px] text-zinc-300">{label}</span>
              <input className="input !w-24 !py-1.5 text-right" value={xpF[k] ?? 0} onChange={e => setXpF({ ...xpF, [k]: +e.target.value.replace(/\D/g, '') || 0 })} />
            </div>
          ))}
        </div>
        <Button size="sm" className="mt-3" onClick={() => { setSetting('xp', xpF); alert('XP salvo — todos os cálculos derivados se ajustam (XP é derivado, nunca contador solto).') }}>Salvar XP</Button>
      </Card>
      <Card>
        <div className="flex items-center justify-between"><span className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Níveis (nomes editáveis)</span>
          <Button size="sm" variant="soft" onClick={() => setLv([...lv, { name: 'Novo nível', min: (lv[lv.length - 1]?.min ?? 0) + 5000 }])}>+ Nível</Button></div>
        <div className="mt-3 space-y-2">
          {lv.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-8 text-right font-mono text-[11px] text-zinc-600">{i + 1}</span>
              <input className="input !py-1.5 text-[12px]" value={l.name} onChange={e => setLv(ls => ls.map((x, xi) => xi === i ? { ...x, name: e.target.value } : x))} />
              <input className="input !w-28 !py-1.5 text-[12px]" value={l.min} onChange={e => setLv(ls => ls.map((x, xi) => xi === i ? { ...x, min: +e.target.value.replace(/\D/g, '') } : x))} />
              <button className="text-zinc-600 hover:text-rose-300" onClick={() => setLv(ls => ls.filter((_, xi) => xi !== i))}>×</button>
            </div>
          ))}
        </div>
        <Button size="sm" className="mt-3" onClick={() => { setSetting('levels', lv); alert('Níveis salvos.') }}>Salvar níveis</Button>
      </Card>
    </div>
  )
}

// ── Usuários ─────────────────────────────────────────────────────────────────

function Users() {
  const db = raw()
  const [q, setQ] = useState('')
  const users = db.users.filter(u => (u.name + u.email).toLowerCase().includes(q.toLowerCase()))
  return (
    <Card>
      <div className="flex items-center justify-between gap-3"><input className="input max-w-xs !py-2" placeholder="Buscar por nome/e-mail…" value={q} onChange={e => setQ(e.target.value)} /><Badge tone="info">{users.length} contas</Badge></div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[12px]">
          <thead><tr className="border-b border-white/10 text-zinc-500"><th className="py-2">Usuário</th><th>Perfil</th><th>XP/aulas</th><th>Plano</th><th>Role</th><th /></tr></thead>
          <tbody>
            {users.map(u => {
              const pr = db.profiles.find(p => p.userId === u.id)
              const lessons = db.lesson_progress.filter(p => p.userId === u.id && p.completedAt).length
              const sub = db.subscriptions.find(s => s.userId === u.id && s.status === 'active')
              return (
                <tr key={u.id} className="border-b border-white/[.04]">
                  <td className="py-2.5"><b className="text-zinc-200">{u.name}</b><div className="font-mono text-[10px] text-zinc-600">{u.email}</div></td>
                  <td className="text-zinc-400">{pr?.daw ?? '—'} · {pr?.genre ?? '—'}</td>
                  <td className="text-zinc-400">{lessons} aulas · {lessons * 50 + 100} XP*</td>
                  <td><Badge tone={sub ? 'success' : 'default'}>{sub?.planId ?? 'free'}</Badge></td>
                  <td>
                    <button className={cn('chip', u.role === 'admin' && 'border-rose-400/40 text-rose-300')} onClick={() => update('users', u.id, { role: u.role === 'admin' ? 'user' : 'admin' })}>{u.role === 'admin' ? 'admin ✓ (clique p/ rebaixar)' : 'promover'}</button>
                  </td>
                  <td><Link className="text-[11px] text-zinc-500 hover:text-white" to={`/produtor/${pr?.username ?? ''}`}>perfil</Link></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[10px] text-zinc-600">* XP exibido é amostral (derivado completo na rota do aluno). Auditoria: alterações de role/planos registram trilha em produção (audit log table no schema).</p>
    </Card>
  )
}

// ── Moderação & eventos ──────────────────────────────────────────────────────

function Moderation() {
  const [, force] = useState(0)
  const queue = pendingReports()
  return (
    <div className="space-y-3">
      {queue.length === 0 ? <Card className="text-center text-sm text-zinc-500">Fila de denúncias vazia. 🕊</Card> : queue.map(({ post, unresolved }) => (
        <Card key={post.id} className="border-rose-500/25">
          <div className="flex flex-wrap items-center gap-2"><b className="text-white">{post.title}</b><Badge tone="danger">{unresolved} denúncia(s)</Badge><span className="text-[11px] text-zinc-500">#{post.category} · {post.authorName}</span></div>
          <p className="mt-2 line-clamp-3 text-[12px] text-zinc-400">{post.body}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => { resolveReports(post.id); force(x => x + 1) }}>✓ Manter (resolve denúncias)</Button>
            <Button size="sm" variant="danger" onClick={() => { if (confirm('Excluir post?')) { deletePost(post.id); force(x => x + 1) } }}>Excluir post</Button>
          </div>
        </Card>
      ))}
      <p className="text-[11px] leading-relaxed text-zinc-500">Em produção, denúncias viram tickets (SLA de resposta, notificação ao autor, registro do moderador e decisão). A estrutura de denúncias já mora no post para manter a fila simples no MVP.</p>
    </div>
  )
}

function Events() {
  const db = raw()
  const counts = new Map<string, number>()
  for (const e of db.analytics_events) counts.set(e.event, (counts.get(e.event) ?? 0) + 1)
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const eventsSpec = ['page_view', 'signup', 'login', 'onboarding_completed', 'course_start', 'lesson_complete', 'exercise_complete', 'project_start', 'project_complete', 'track_uploaded', 'certificate_generated', 'ai_mentor_used', 'checkout_started', 'purchase', 'subscription_started', 'subscription_cancelled']
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Eventos registrados (buffer local)</div>
        <div className="mt-3 space-y-1.5">
          {rows.length === 0 && <p className="text-[12px] text-zinc-500">Nenhum evento ainda — navegue como aluno; a página de cada usuário conta o fluxo completo.</p>}
          {rows.map(([e, n]) => <div key={e} className="flex items-center gap-2 text-[12px]"><code className="w-56 truncate font-mono text-brand-300">{e}</code><span className="ml-auto font-black text-zinc-200">{n}</span></div>)}
        </div>
      </Card>
      <Card>
        <div className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Cobertura do spec de analytics</div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {eventsSpec.map(e => <span key={e} className={cn('rounded-full border px-2 py-1 font-mono text-[10px]', counts.has(e) ? 'border-emerald-500/30 bg-emerald-500/[.06] text-emerald-300' : 'border-white/10 text-zinc-600')}>{e} {counts.has(e) ? '✓' : '·'}</span>)}
        </div>
        <Md className="!mt-4 !text-[12px]" text={`Produção: os eventos vão para uma tabela Postgres (ou PostHog/GA4 via Edge Function) **somente com consentimento analytics** — ver Configurações → LGPD. Adaptador pronto em \`src/services/analytics.ts\`.`} />
      </Card>
    </div>
  )
}
