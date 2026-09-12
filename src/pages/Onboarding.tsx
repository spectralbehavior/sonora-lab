import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Rocket, Check, ArrowLeft } from 'lucide-react'
import { Button, Badge, ProgressBar, Card } from '@/components/ui'
import { useApp } from '@/store/app'
import { updateProfile } from '@/services/auth'
import { listCourses, getDaws, getGenres } from '@/services/content'
import { track } from '@/services/analytics'
import { raw } from '@/lib/db'
import { uid } from '@/lib/utils'
import { insert } from '@/lib/db'
import { nowISO } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { DawChoice, Level } from '@/types'
import { DAW_LABEL } from '@/components/learn'

const LEVELS: { id: Level; label: string; sub: string }[] = [
  { id: 'iniciante', label: 'Nunca produzi', sub: 'Primeiro contato com qualquer software de música' },
  { id: 'intermediario', label: 'Iniciante / Intermediário', sub: 'Já abro a DAW, faço loops, raramente termino músicas' },
  { id: 'avancado', label: 'Avançado', sub: 'Finalizo tracks e quero refinar técnica, som e workflow' },
]

const GOALS = [
  { id: 'hobby', label: 'Aprender por hobby', weeks: ['Fundamentos + sua DAW', 'Ritmo e Beat', 'Primeiro loop de 16 c.', 'Groove completo', 'Bassline', 'Um som próprio', 'Mix básica', 'Sua track nº 1'] },
  { id: 'produzir', label: 'Produzir minhas próprias músicas', weeks: ['Fundamentos', 'Drums e groove', 'Bassline profissional', 'Sound Design', 'Arranjo completo', 'Mixagem', 'Masterização', 'Primeira Track finalizada'] },
  { id: 'pro', label: 'Virar produtor profissional', weeks: ['Técnica completa', 'Identidade sonora', '3 tracks em 90 dias', 'Feedback público e iteração', 'EP de 3 músicas', 'Release plan', 'Portfólio e contatos', 'Monetização'] },
  { id: 'artista', label: 'Criar um projeto artístico', weeks: ['Produção autoral', 'Sound design-assinatura', 'Arranjo narrativo', 'EP de 3 faixas', 'Arte + narrativa', 'Portfólio público', 'Comunidade e collabs', 'Lançamento'] },
  { id: 'terceiros', label: 'Produzir para outros artistas', weeks: ['Versatilidade de gênero', 'Workflow de sessão', 'Stems, templates e handoff', 'Mix para clientes', 'Prazos e revisão', 'Portfólio de serviços', 'Precificação', 'Contratos'] },
  { id: 'trabalho', label: 'Trabalhar com música', weeks: ['Base sólida (cursos 01–06)', 'Mix/master de mercado', 'Nichos: sync, games, trilhas', 'Portfólio segmentado', 'Networking na comunidade', 'Primeiros jobs', 'Estúdio e fluxo', 'Carreira contínua'] },
]

export default function Onboarding() {
  const { user, pushToast, afterProgress, refresh } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const daws = getDaws()
  const genres = getGenres()

  const dawFromQuery = params.get('daw') as DawChoice | null
  const [step, setStep] = useState(1)
  const [level, setLevel] = useState<Level | null>(null)
  const [daw, setDaw] = useState<DawChoice | null>(dawFromQuery)
  const [genre, setGenre] = useState<string | null>(null)
  const [goal, setGoal] = useState<string | null>(null)
  const [modeBeginner, setModeBeginner] = useState(true)

  if (!user) return null

  const total = 5
  const weeks = GOALS.find(g => g.id === goal)?.weeks ?? []
  const genreName = genres.find(g => g.id === genre)?.name ?? 'Eletrônica'
  const dawLabel = daw && daw !== 'none' ? DAW_LABEL[daw] : 'Ainda escolhendo'

  function finish() {
    if (!level || !genre || !goal || !daw) return
    updateProfile(user!.id, { level, daw, genre, goal, mode: modeBeginner ? 'beginner' : 'advanced' })
    // roadmap snapshot (registro inicial de metas)
    track('onboarding_completed', { level, daw, genre, goal })
    insert('notifications', { id: uid('ntf'), userId: user!.id, text: '🗺️ Roadmap gerado! Comece pela Semana 1 — Fundamentos.', ts: nowISO(), read: false })
    pushToast('✅ Roadmap personalizado criado. Bora produzir!')
    afterProgress()
    refresh()
    navigate(params.get('next') ?? '/app')
  }

  return (
    <div className="min-h-screen bg-night-950">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[.25em] text-zinc-500">Onboarding · Passo {step}/{total}</span>
          <Badge tone="brand">gera seu roadmap</Badge>
        </div>
        <ProgressBar value={(step / total) * 100} className="mb-8" />

        {step === 1 && (
          <StepShell title="Qual é o seu nível?" sub="Sem julgamento — só para calibrar onde começamos.">
            <div className="grid gap-3">
              {LEVELS.map(l => (
                <button key={l.id} onClick={() => setLevel(l.id)} className={cn('card flex items-center gap-4 p-4 text-left transition hover:border-brand/50', level === l.id && 'border-brand/70 ring-1 ring-brand/40')}>
                  <span className="text-2xl">{l.id === 'iniciante' ? '🌱' : l.id === 'intermediario' ? '🎚️' : '🎛️'}</span>
                  <span className="flex-1"><span className="block text-sm font-extrabold text-white">{l.label}</span><span className="block text-xs text-zinc-400">{l.sub}</span></span>
                  {level === l.id && <Check size={18} className="text-emerald-400" />}
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Qual DAW você utiliza?" sub="Todo conceito é DAW-agnóstico; o passo a passo específico segue a sua escolha.">
            <div className="grid gap-3 sm:grid-cols-2">
              {daws.map(d => (
                <button key={d.id} onClick={() => setDaw(d.id)} className={cn('card p-4 text-left transition hover:border-brand/50', daw === d.id && 'border-brand/70 ring-1 ring-brand/40')}>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: d.color }} /><span className="text-sm font-extrabold text-white">{d.name}</span></div>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{d.blurb}</p>
                </button>
              ))}
              <button onClick={() => setDaw('none')} className={cn('card p-4 text-left transition hover:border-brand/50', daw === 'none' && 'border-brand/70 ring-1 ring-brand/40')}>
                <div className="text-sm font-extrabold text-white">🤔 Ainda não escolhi</div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">Você fará uma experiência comparativa (sem "qual é a melhor para todo mundo" — é sobre o seu fluxo). <Link to="/daws" className="link">Ver comparação</Link></p>
              </button>
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="Qual estilo você quer produzir?" sub="Isso define BPM, estrutura e referências do seu roadmap — e pode ser mudado depois.">
            <div className="flex flex-wrap gap-2">
              {genres.map(g => (
                <button key={g.id} onClick={() => setGenre(g.id)} className={cn('glass rounded-xl px-3.5 py-2 text-[13px] font-bold transition hover:text-white', genre === g.id ? 'border-brand/70 text-white ring-1 ring-brand/40' : 'text-zinc-300')}>
                  {g.name} <span className="ml-1 font-mono text-[10px] text-zinc-500">{g.bpm[0]}–{g.bpm[1]}</span>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title="Qual seu objetivo?" sub="O roadmap muda de rota conforme o destino.">
            <div className="grid gap-3 sm:grid-cols-2">
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setGoal(g.id)} className={cn('card p-4 text-left text-sm font-bold text-zinc-200 transition hover:border-brand/50', goal === g.id && 'border-brand/70 ring-1 ring-brand/40')}>
                  <span className="text-brand-300">→</span> {g.label}
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title="Seu roadmap de produção" sub="Gerei com base nas suas respostas. Ajuste tudo depois no Perfil.">
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge tone="brand">DAW: {dawLabel}</Badge>
              <Badge tone="info">Gênero: {genreName}</Badge>
              <Badge tone="success">Nível: {LEVELS.find(l => l.id === level)?.label}</Badge>
              <Badge tone="warn">Objetivo: {GOALS.find(g => g.id === goal)?.label}</Badge>
            </div>
            <Card className="mb-5 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-white"><Rocket size={16} className="text-brand-300" /> 8 semanas até sua primeira track</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {weeks.map((w, i) => (
                  <div key={w} className="flex items-center gap-3 rounded-xl border border-white/[.07] bg-night-800 px-3 py-2.5" style={{ animation: `rise .4s ease ${i * 0.06}s both` }}>
                    <span className="font-mono text-[10px] font-black text-brand-300">S{i + 1}</span>
                    <span className="text-[13px] font-semibold text-zinc-200">{w}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">Cada semana: aulas do curso correspondente + exercício + desafio. O roadmap completo (13 etapas) fica no menu Roadmap, com % de conclusão real.</p>
            </Card>
            <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="text-sm font-extrabold text-white">Modo Iniciante</div>
                <div className="text-[12px] text-zinc-400">Interface simplificada, termos técnicos sempre com "explique de forma simples". Recomendado para o seu nível informado.</div>
              </div>
              <button onClick={() => setModeBeginner(m => !m)} className={cn('relative h-7 w-13 rounded-full border transition', modeBeginner ? 'border-brand/60 bg-brand' : 'border-white/10 bg-white/[.07]')} style={{ width: 52 }} aria-pressed={modeBeginner}>
                <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white transition-all')} style={{ left: modeBeginner ? 26 : 4 }} />
              </button>
            </div>
          </StepShell>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => setStep(s => Math.max(1, s - 1))} className={cn('btn-ghost', step === 1 && 'invisible')}><ArrowLeft size={15} /> Voltar</button>
          {step < total
            ? <Button onClick={() => setStep(s => s + 1)} disabled={(step === 1 && !level) || (step === 2 && !daw) || (step === 3 && !genre) || (step === 4 && !goal)}>Continuar</Button>
            : <Button onClick={finish} disabled={!level || !genre || !goal || !daw} size="lg">Gerar meu roadmap 🚀</Button>}
        </div>
      </div>
    </div>
  )
}

function StepShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="animate-rise">
      <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
      <p className="mb-6 mt-1.5 text-sm text-zinc-400">{sub}</p>
      {children}
    </div>
  )
}
