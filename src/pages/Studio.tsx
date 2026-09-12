import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, Plus, Trash2, Flame, Target } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Badge, Button, Empty, Field } from '@/components/ui'
import { useApp, useRecordStudySession } from '@/store/app'
import { listIdeas, addIdea, removeIdea, listTracks, listSessions } from '@/services/studio'
import { updateProfile } from '@/services/auth'
import { weeklyMinutes } from '@/services/gamification'
import { formatDate, cn } from '@/lib/utils'
import { raw } from '@/lib/db'

export default function StudioPage() {
  const { user, stats, refresh, pushToast } = useApp()
  const record = useRecordStudySession()
  const [idea, setIdea] = useState({ name: '', bpm: '', musicalKey: '', genreId: '', reference: '', notes: '' })
  if (!user) return null
  const ideas = listIdeas(user.id)
  const tracks = listTracks(user.id)
  const sessions = listSessions(user.id)
  const genre = (id?: string) => (id ? raw().genres.find(g => g.id === id)?.name : undefined)
  const weekMin = weeklyMinutes(user.id)

  return (
    <div className="space-y-5">
      <PageHeader title="Meu Estúdio" sub="Painel operacional do produtor: projetos ativos, ideias que não podem morrer, metas e sessões." actions={<Badge tone={stats!.streak.current > 0 ? 'warn' : 'default'}><Flame size={11} className={stats!.streak.current > 0 ? 'text-amber-400' : ''} /> {stats!.streak.current}d</Badge>} />

      {/* Kanban de produção */}
      <div className="grid gap-3 md:grid-cols-4">
        {([['ideia', '💡 Ideias', 'text-zinc-400'], ['producao', '🎛 Em produção', 'text-brand-300'], ['mix', '🎚 Na mix', 'text-amber-300'], ['finalizada', '🏆 Finalizadas', 'text-emerald-400']] as const).map(([st, label, tone]) => {
          const col = tracks.filter(t => t.status === st || (st === 'ideia' && t.status === 'ideia') || (st === 'finalizada' && (t.status === 'finalizada' || t.status === 'master')))
          return (
            <Card key={st} className="min-h-28">
              <div className={cn('text-[11px] font-extrabold uppercase tracking-wider', tone)}>{label} <span className="text-zinc-600">({col.length})</span></div>
              <div className="mt-2 space-y-2">
                {col.length === 0 && <p className="text-[11px] leading-relaxed text-zinc-600">{st === 'ideia' ? 'Use o bloco de ideias abaixo.' : st === 'finalizada' ? 'O Projeto 05 enche esta coluna.' : 'Arraste status no Portfólio.'}</p>}
                {col.slice(0, 4).map(t => (
                  <Link key={t.id} to="/app/portefolio" className="block rounded-xl border border-white/[.06] bg-night-800 px-3 py-2.5 text-[12px] transition hover:border-brand/40">
                    <div className="font-bold text-zinc-200">{t.title}</div>
                    <div className="text-[10px] text-zinc-500">{genre(t.genreId) ?? '—'} · {t.bpm ?? '—'} BPM · {t.musicalKey ?? '—'}</div>
                  </Link>
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Nova ideia */}
        <Card>
          <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400"><Lightbulb size={14} className="text-amber-400" /> Nova ideia musical</div>
          <p className="mt-1 text-[11px] text-zinc-500">Idia boa sem registro = ideia morta em 48h. Leva 30 segundos.</p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <Field label="Nome"><input className="input" value={idea.name} onChange={e => setIdea({ ...idea, name: e.target.value })} placeholder="Riff do chuveiro v2" /></Field>
            <Field label="Gênero">
              <select className="input" value={idea.genreId} onChange={e => setIdea({ ...idea, genreId: e.target.value })}>
                <option value="">—</option>
                {raw().genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
            <Field label="BPM"><input className="input" inputMode="numeric" value={idea.bpm} onChange={e => setIdea({ ...idea, bpm: e.target.value.replace(/\D/g, '') })} /></Field>
            <Field label="Tonalidade"><input className="input" value={idea.musicalKey} onChange={e => setIdea({ ...idea, musicalKey: e.target.value })} placeholder="F#m" /></Field>
            <Field label="Referência"><input className="input" value={idea.reference} onChange={e => setIdea({ ...idea, reference: e.target.value })} placeholder="track/artista que puxa a vibe" /></Field>
            <Field label="Observações"><input className="input" value={idea.notes} onChange={e => setIdea({ ...idea, notes: e.target.value })} placeholder="ideia central, tom, intenção" /></Field>
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={() => {
              try {
                addIdea(user.id, { name: idea.name, bpm: idea.bpm ? +idea.bpm : undefined, musicalKey: idea.musicalKey || undefined, genreId: idea.genreId || undefined, reference: idea.reference || undefined, notes: idea.notes || undefined })
                setIdea({ name: '', bpm: '', musicalKey: '', genreId: '', reference: '', notes: '' })
                pushToast('💡 Ideia salva — ela não escapa mais.', 'success'); refresh()
              } catch (e) { pushToast(e instanceof Error ? e.message : 'Erro', 'error') }
            }}><Plus size={14} /> Salvar ideia</Button>
          </div>
          <div className="mt-4 space-y-2">
            {ideas.length === 0 && <Empty title="Gaveta de ideias vazia" hint="Registre a próxima que aparecer no banho, na rua, no showcase." />}
            {ideas.map(i => (
              <div key={i.id} className="flex items-center gap-3 rounded-xl border border-white/[.06] bg-night-800 px-3.5 py-2.5">
                <span className="text-amber-400">💡</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-bold text-zinc-200">{i.name}</div>
                  <div className="truncate text-[10px] text-zinc-500">{genre(i.genreId) ?? '—'} · {i.bpm ?? '—'} bpm · {i.musicalKey ?? '—'}{i.reference ? ` · ref: ${i.reference}` : ''} · {formatDate(i.createdAt.slice(0, 10))}</div>
                </div>
                <Link to="/app/projeto/proj-primeiro-beat" className="btn-ghost btn-sm">→ projeto</Link>
                <button className="rounded-lg p-1.5 text-zinc-600 hover:bg-white/10 hover:text-rose-300" onClick={() => { removeIdea(i.id); refresh() }} aria-label="Remover ideia"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400"><Target size={14} className="text-brand-300" /> Meta semanal</div>
            <div className="mt-2 flex items-end gap-2"><span className="text-3xl font-black text-white">{weekMin}</span><span className="pb-1 text-xs text-zinc-500">/ {user.profile.weeklyGoalMin} min</span></div>
            <div className="mt-3 flex gap-1.5">{[60, 120, 240, 420, 600].map(m => <button key={m} onClick={() => { updateProfile(user.id, { weeklyGoalMin: m }); refresh() }} className={cn('chip', user.profile.weeklyGoalMin === m && 'border-brand/60 bg-brand-soft text-white')}>{m / 60 < 1 ? `${m}m` : `${m / 60}h`}</button>)}</div>
            <p className="mt-3 text-[11px] text-zinc-500">Registrar sessão conta para streak, meta e evolução. Produção "só ouvindo referência" também vale — mas marque o que foi análise.</p>
          </Card>
          <Card>
            <div className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Sessões recentes</div>
            <div className="mt-2 space-y-1.5 text-[12px]">
              {sessions.length === 0 && <p className="text-zinc-500">Nenhuma sessão ainda.</p>}
              {sessions.slice(0, 6).map(s => (
                <div key={s.id} className="flex items-center gap-2 rounded-lg border border-white/[.05] px-2.5 py-1.5">
                  <span className="text-zinc-500">{formatDate(s.date.slice(0, 10))}</span>
                  <Badge tone="brand" className="ml-auto">{s.minutes} min</Badge>
                  {s.note && <span className="text-zinc-600">{s.note}</span>}
                </div>
              ))}
            </div>
            <Button size="sm" className="mt-3 w-full" variant="soft" onClick={() => record(30, 'estúdio')}>+ Registrar 30 min agora</Button>
          </Card>
          <Card>
            <div className="text-sm font-extrabold text-white">📥 Uploads futuros</div>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">Hospedagem de áudios/projetos do aluno (Supabase Storage, validação de tipo/tamanho) entra com a Fase 8 do roadmap. A análise do Analyzer roda localmente mesmo sem isso.</p>
            <Link to="/app/analyzer" className="btn-ghost btn-sm mt-2 w-full">Abrir Track Analyzer (beta)</Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
