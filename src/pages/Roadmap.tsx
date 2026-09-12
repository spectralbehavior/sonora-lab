import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shell'
import { Card, Badge, ProgressBar } from '@/components/ui'
import { useApp } from '@/store/app'
import { raw } from '@/lib/db'
import { cn, pct } from '@/lib/utils'

// Roadmap visual de 13 etapas. Cada etapa mapeia para AULAS (por tag) ou
// RESOLVEDORES especiais (projeto/portfolio/carreira) — % real de conclusão.

interface Stage { n: number; title: string; tag?: string; special?: 'track' | 'portfolio' | 'career'; desc: string }

const STAGES: Stage[] = [
  { n: 1, title: 'Fundamentos', tag: 'fund', desc: 'O que é produção, DAW, áudio, MIDI, ritmo, harmonia mínima.' },
  { n: 2, title: 'DAW', tag: 'daw', desc: 'Sua DAW por dentro — a trilha específica do seu software.' },
  { n: 3, title: 'Ritmo', tag: 'ritmo', desc: 'Groove, grid 16th, swing, humanização.' },
  { n: 4, title: 'Melodia', tag: 'melodia', desc: 'Tema pergunta/resposta, escala, função melódica.' },
  { n: 5, title: 'Drums', tag: 'drums', desc: 'Bateria completa: layering, processamento, bus.' },
  { n: 6, title: 'Bass', tag: 'bass', desc: 'Sistema kick/bass, envelope, sidechain, saturação.' },
  { n: 7, title: 'Sound Design', tag: 'synth', desc: 'Sínteses, matriz de modulação, banco próprio de presets.' },
  { n: 8, title: 'Arranjo', tag: 'arranjo', desc: 'Do loop à forma: blocos, transições, automação.' },
  { n: 9, title: 'Mixagem', tag: 'mix', desc: 'Gain staging → balance → moldagem → espaço → audit.' },
  { n: 10, title: 'Masterização', tag: 'master', desc: 'Alvos, cadeia mínima, validação em 3 sistemas.' },
  { n: 11, title: 'Track Finalizada', special: 'track', desc: 'Projeto 05: música completa, mixada e masterizada.' },
  { n: 12, title: 'Portfólio', special: 'portfolio', desc: 'Página pública de artista com tracks e certificados.' },
  { n: 13, title: 'Carreira', special: 'career', desc: 'EP, releases, identidade e caminhos de monetização.' },
]

export default function RoadmapPage() {
  const { user } = useApp()
  if (!user) return null
  const db = raw()
  const completed = new Set(db.lesson_progress.filter(p => p.userId === user.id && p.completedAt).map(p => p.lessonId))
  const doneProjects = new Set(db.project_progress.filter(p => p.userId === user.id && p.status === 'concluido').map(p => p.projectId))
  const tracks = db.tracks.filter(t => t.userId === user.id && t.status === 'finalizada').length
  const published = new Set(db.courses.filter(c => c.published).map(c => c.id))

  function stageStatus(s: Stage) {
    if (s.special === 'track') {
      const total = 1
      const done = doneProjects.has('proj-primeira-track') ? 1 : 0
      return { done, total, nextLessonId: undefined as string | undefined }
    }
    if (s.special === 'portfolio') {
      const has = user!.profile.publicPortfolio && tracks >= 1 ? 1 : 0
      return { done: has, total: 1 }
    }
    if (s.special === 'career') {
      const done = tracks >= 3 && user!.profile.publicPortfolio ? 1 : 0
      return { done, total: 1 }
    }
    // tag: usa aulas das trilhas do aluno (fund/daw tags globais)
    let lessons = db.lessons.filter(l => published.has(l.courseId) && l.tags.includes(s.tag!))
    if (s.tag === 'daw' && user!.profile.daw && user!.profile.daw !== 'none') {
      lessons = lessons.filter(l => l.dawId === user!.profile.daw)
    }
    const done = lessons.filter(l => completed.has(l.id)).length
    const next = lessons.find(l => !completed.has(l.id))
    return { done, total: lessons.length, nextLessonId: next?.id }
  }

  const results = STAGES.map(stageStatus)
  const overall = Math.round(results.reduce((a, r) => a + pct(r.done, r.total), 0) / STAGES.length)
  const nextIdx = results.findIndex(r => r.done < r.total)

  return (
    <div>
      <PageHeader title="Roadmap do produtor" sub="Da fundamentação ao portfólio — sua jornada completa em 13 etapas, com % real por etapa." actions={<Badge tone="brand">{overall}% geral</Badge>} />

      <div className="relative space-y-2.5 pl-6 before:absolute before:bottom-4 before:left-[11px] before:top-4 before:w-0.5 before:bg-gradient-to-b before:from-brand before:to-neon-cyan before:opacity-40">
        {STAGES.map((s, i) => {
          const r = results[i]
          const p = pct(r.done, r.total)
          const state = p === 100 ? 'done' : i === nextIdx ? 'now' : 'todo'
          return (
            <div key={s.n} className="relative">
              <span className={cn('absolute -left-[26px] top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-black',
                state === 'done' ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300' : state === 'now' ? 'border-brand bg-brand text-white shadow-glow' : 'border-white/15 bg-night-800 text-zinc-600')}>
                {state === 'done' ? '✓' : s.n}
              </span>
              <Card className={cn('flex flex-wrap items-center gap-3 p-4', state === 'now' && 'border-brand/50')}>
                <div className="min-w-[180px] flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-zinc-600">{String(s.n).padStart(2, '0')}</span>
                    <h3 className="text-[14px] font-extrabold text-white">{s.title}</h3>
                    {state === 'done' && <Badge tone="success">concluída</Badge>}
                    {state === 'now' && <Badge tone="brand">você está aqui</Badge>}
                  </div>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-400">{s.desc}</p>
                </div>
                <div className="w-full sm:w-44">
                  <ProgressBar value={p} tone={state === 'done' ? 'lime' : 'brand'} />
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">{r.total ? `${r.done}/${r.total}` : '0/1'}</span>
                    {r.nextLessonId && <Link className="text-[11px] font-bold text-brand-300 hover:text-white" to={`/app/aula/${r.nextLessonId}`}>continuar →</Link>}
                    {s.special === 'track' && state !== 'done' && <Link className="text-[11px] font-bold text-brand-300 hover:text-white" to="/app/projeto/proj-primeira-track">projeto →</Link>}
                    {s.special === 'portfolio' && state !== 'done' && <Link className="text-[11px] font-bold text-brand-300 hover:text-white" to="/app/portefolio">abrir →</Link>}
                    {s.special === 'career' && state !== 'done' && <Link className="text-[11px] font-bold text-brand-300 hover:text-white" to="/app/projeto/proj-ep-tres-musicas">EP →</Link>}
                  </div>
                </div>
              </Card>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-center text-[11px] text-zinc-600">O roadmap reflete publicações do CMS e a sua DAW escolhida — novas trilhas (gêneros, cursos avançados) aparecem automaticamente quando publicadas.</p>
    </div>
  )
}
