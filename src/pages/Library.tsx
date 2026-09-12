import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, ShieldQuestion } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Badge, Button, Empty, Modal } from '@/components/ui'
import { listResources, listPlugins } from '@/services/content'
import { useApp } from '@/store/app'
import { cn, downloadText } from '@/lib/utils'
import type { ResourceRow } from '@/types'

const CATS: { id: ResourceRow['category'] | 'all'; label: string; note?: string }[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'checklists', label: 'Checklists' },
  { id: 'guides', label: 'Guias' },
  { id: 'ebooks', label: 'E-books' },
  { id: 'templates', label: 'Templates' },
  { id: 'midi', label: 'MIDI' },
  { id: 'presets', label: 'Presets' },
  { id: 'samples', label: 'Samples', note: 'acervo próprio em curadoria' },
  { id: 'stems', label: 'Stems' },
  { id: 'projects', label: 'Projetos' },
]

export default function LibraryPage({ tab = 'resources' }: { tab?: 'resources' | 'plugins' }) {
  const [view, setView] = useState<'resources' | 'plugins'>(tab as 'resources')
  return (
    <div>
      <PageHeader title={view === 'resources' ? 'Biblioteca' : 'Catálogo de plugins'} sub="Somente material próprio ou licenciado — cada item declara sua licença." actions={
        <div className="flex rounded-xl border border-white/10 p-1 text-xs font-bold">
          {(['resources', 'plugins'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={cn('rounded-lg px-3 py-1.5 transition', view === v ? 'bg-brand text-white' : 'text-zinc-400 hover:text-white')}>{v === 'resources' ? 'Materiais' : 'Plugins (educ.)'}</button>
          ))}
        </div>
      } />
      {view === 'resources' ? <Resources /> : <Plugins />}
    </div>
  )
}

function Resources() {
  const { user } = useApp()
  const [cat, setCat] = useState<string>('all')
  const [open, setOpen] = useState<ResourceRow | null>(null)
  const items = listResources(cat === 'all' ? undefined : cat as ResourceRow['category'])
  return (
    <div>
      <div className="hide-scroll mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {CATS.map(c => <button key={c.id} onClick={() => setCat(c.id)} className={cn('chip whitespace-nowrap', cat === c.id && 'border-brand/60 bg-brand-soft text-white')}>{c.label}{c.note ? ' · ' + c.note : ''}</button>)}
      </div>
      {items.length === 0 ? (
        <Empty title="Categoria em curadoria" hint="Este espaço só recebe material licenciado ou produzido pela equipe — nada é publicado sem verificação de direitos. Enquanto isso, as checklists, guias e templates estão prontos nas outras abas." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map(r => (
            <Card key={r.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge tone="brand">{r.category}</Badge>
                <Badge>{r.level}</Badge>
                <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-400"><ShieldQuestion size={11} /> {r.license.startsWith('Próprio') ? 'licença própria' : 'licença verificada'}</span>
              </div>
              <h3 className="text-sm font-extrabold text-white">{r.title}</h3>
              <p className="flex-1 text-[12px] leading-relaxed text-zinc-400">{r.description}</p>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-zinc-500">{r.dawIds.map(d => <span key={d} className="rounded bg-white/[.05] px-1.5 py-0.5">{d}</span>)}</div>
              <div className="mt-1 flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setOpen(r)}>Ver conteúdo</Button>
                {r.content && <Button size="sm" variant="soft" onClick={() => downloadText(`${r.id}.txt`, r.content!)}><Download size={13} /> Baixar</Button>}
              </div>
            </Card>
          ))}
        </div>
      )}
      <p className="mt-5 text-[11px] leading-relaxed text-zinc-500">
        💡 Templates de projeto (DAW × gênero × nível) trazem BPM, canais, routing, buses, estrutura e automações padrão — <b>sem plugins ou samples de terceiros</b>, apenas configurações. Para abrir no seu software.
        {' '}<Link to="/app/desafios" className="link">Desafios</Link> · <Link to="/app/projetos" className="link">Projetos</Link>
      </p>
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ''} wide>
        <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-xl border border-white/[.07] bg-night-900 p-4 font-mono text-[12px] leading-relaxed text-zinc-300">{open?.content ?? 'Este item é um catálogo informativo: o arquivo final é publicado pelo CMS quando o acervo licenciado for registrado.'}</pre>
        {open && <p className="mt-2 text-[11px] text-zinc-500">Licença: {open.license} · Aplicável em: {open.dawIds.join(', ')}</p>}
      </Modal>
      {!user && null}
    </div>
  )
}

function Plugins() {
  const [cat, setCat] = useState<string>('all')
  const cats = ['all', 'synth', 'sampler', 'eq', 'compressor', 'reverb', 'delay', 'saturation', 'limiter', 'utility'] as const
  const items = listPlugins(cat === 'all' ? undefined : cat as never)
  return (
    <div>
      <div className="hide-scroll mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {cats.map(c => <button key={c} onClick={() => setCat(c)} className={cn('chip whitespace-nowrap capitalize', cat === c && 'border-brand/60 bg-brand-soft text-white')}>{c === 'all' ? 'Tudo' : c}</button>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(p => (
          <Card key={p.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-white">{p.name}</h3>
              <Badge tone={p.kind === 'stock' ? 'success' : p.kind === 'free' ? 'info' : 'default'}>{p.kind === 'stock' ? 'nativo da DAW' : p.kind === 'free' ? 'grátis' : 'comercial'}</Badge>
            </div>
            <div className="text-[11px] text-zinc-500">{p.vendor} · <span className="capitalize">{p.category}</span></div>
            <p className="text-[12px] leading-relaxed text-zinc-400">{p.role}</p>
            <ul className="mt-auto space-y-1 border-t border-white/[.06] pt-2 text-[11px] leading-relaxed text-zinc-500">
              {p.tips.map(t => <li key={t} className="flex gap-1.5"><span className="text-brand-300">▸</span>{t}</li>)}
            </ul>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="rounded bg-white/[.05] px-1.5 py-0.5 text-zinc-400">{p.price}</span>
              <span className="rounded bg-white/[.05] px-1.5 py-0.5 text-zinc-400 capitalize">{p.level}</span>
              {p.dawIds.map(d => <span key={d} className="rounded bg-brand-soft px-1.5 py-0.5 text-brand-300">{d === 'fl-studio' ? 'FL' : d === 'ableton' ? 'Live' : 'Cubase'}</span>)}
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-5 rounded-xl border border-white/[.06] bg-white/[.02] p-4 text-[11px] leading-relaxed text-zinc-500">
        ⚖️ Este catálogo é <b>exclusivamente educativo</b>: não vendemos, hospedamos nem distribuímos software de terceiros. Os itens "nativo da DAW" já vêm instalados no seu software — foque nos que você já tem antes de comprar qualquer coisa.
      </p>
    </div>
  )
}
