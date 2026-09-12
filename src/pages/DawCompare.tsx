import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Minus, ArrowRight } from 'lucide-react'
import { MarketingShell } from '@/components/shell'
import { SectionTitle, Badge, Card } from '@/components/ui'
import { getDaws } from '@/services/content'
import { useSeo } from '@/lib/seo'
import { cn } from '@/lib/utils'

// Comparativo honesto: nenhuma DAW é "universalmente melhor". A página ajuda a
// decidir por FIT de workflow, e deixa claro que o método da plataforma é DAW-agnóstico.

const MATRIX: { axis: string; fl: [string, 0 | 1 | 2]; ab: [string, 0 | 1 | 2]; cu: [string, 0 | 1 | 2] }[] = [
  { axis: 'Velocidade de loop/ideia', fl: ['Pattern-based: altíssima', 2], ab: ['Session launch: altíssima', 2], cu: ['Linear: média-alta', 1] },
  { axis: 'Piano roll / edição MIDI', fl: ['Excelente', 2], ab: ['Boa (11+ melhorou)', 1], cu: ['Profunda (lanes/expressions)', 2] },
  { axis: 'Gravação de voz/instrumento + comp', fl: ['Funcional', 1], ab: ['Funcional', 1], cu: ['Excelente (comping nativo)', 2] },
  { axis: 'Performance ao vivo', fl: ['Posição/clip — possível', 1], ab: ['Razão de existir — referência', 2], cu: ['Baixo foco', 0] },
  { axis: 'Mixing / routing clássico', fl: ['Bom (mixer + sends)', 1], ab: ['Bom (retornos + groups)', 1], cu: ['Excelente (mixconsole completo)', 2] },
  { axis: 'Ecossistema de plugins nativos', fl: ['Ótimo (tudo incluso)', 2], ab: ['Ótimo (Standard/Suite)', 2], cu: ['Ótimo (Pro)', 2] },
]

const RATING = ['❌', '◐', '●']

export default function DawCompare() {
  useSeo({ title: 'FL Studio vs Ableton Live vs Cubase — qual escolher para produzir', description: 'Comparativo honesto de workflow para produção de música eletrônica. Nenhuma é "a melhor"; a certa é a que combina com como você compõe. Aprenda o conceito + o caminho na sua DAW.', path: '/daws' })
  const daws = getDaws()
  const navigate = useNavigate()
  const [pick, setPick] = useState<string | null>(null)

  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle center kicker="Escolha sua DAW" title="Nenhuma é universalmente melhor. A certa é a que casa com o seu cérebro." sub="A plataforma ensina o CONCEITO em qualquer software e mostra o passo a passo versionado da DAW que você escolher. Abaixo, trade-offs reais para a produção eletrônica." />

        <div className="grid gap-4 md:grid-cols-3">
          {daws.map(d => (
            <Card key={d.id} className={cn('flex flex-col gap-3 transition', pick === d.id && 'border-brand/70 ring-1 ring-brand/40')}>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full" style={{ background: d.color }} />
                <h2 className="text-base font-black text-white">{d.name}</h2>
                <Badge className="ml-auto">{d.vendor}</Badge>
              </div>
              <p className="text-[13px] leading-relaxed text-zinc-300">{d.blurb}</p>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Forte em</div>
                <ul className="mt-1 space-y-1 text-[12px] text-zinc-300">{d.strengths.map(s => <li key={s} className="flex gap-1.5"><Check size={13} className="mt-0.5 shrink-0 text-emerald-400" />{s}</li>)}</ul>
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">Exige adaptação</div>
                <ul className="mt-1 space-y-1 text-[12px] text-zinc-400">{d.caveats.map(s => <li key={s} className="flex gap-1.5"><Minus size={13} className="mt-0.5 shrink-0 text-amber-400" />{s}</li>)}</ul>
              </div>
              <p className="rounded-xl border border-white/[.07] bg-white/[.02] p-2.5 font-mono text-[10.5px] leading-relaxed text-zinc-500">{d.workflow}</p>
              <button onClick={() => setPick(pick === d.id ? null : d.id)} className={cn('btn mt-auto', pick === d.id ? 'btn-primary' : 'btn-ghost')}>{pick === d.id ? '✓ Vou com esta' : 'Escolher ' + d.name.split(' ')[0]}</button>
            </Card>
          ))}
        </div>

        <Card className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="py-3 pr-4 font-bold">Critério (para eletrônica)</th>
                {daws.map(d => <th key={d.id} className="py-3 pr-4 font-black text-white">{d.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map(row => (
                <tr key={row.axis} className="border-b border-white/[.05] last:border-0">
                  <td className="py-3 pr-4 font-bold text-zinc-300">{row.axis}</td>
                  {([row.fl, row.ab, row.cu] as const).map(([txt, lvl], i) => (
                    <td key={i} className="py-3 pr-4 text-zinc-400"><span className="mr-1.5 text-brand-300">{RATING[lvl]}</span>{txt}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[10.5px] leading-relaxed text-zinc-500">● = ponto forte do software para o critério · ◐ = bom, exige ajustes · ❌ = não é o foco de design. Baseado nos recursos padrão documentados das versões atuais verificadas pela equipe (FL 21 · Live 11 · Cubase 13 — os menus mudam entre releases; as academias da plataforma carimbam versão).</p>
        </Card>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="text-sm font-extrabold text-white">Escolhas rápidas por objetivo</h3>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-zinc-300">
              <li><b className="text-brand-300">"Quero fazer beats e loops rápido, sou novo em tudo:"</b> FL Studio — curva de loop mais gentil, piano roll que ensina.</li>
              <li><b className="text-brand-300">"Toco DJ/performance e quero remixar ao vivo:"</b> Ableton Live — Session View é um instrumento.</li>
              <li><b className="text-brand-300">"Vou gravar voz, instrumentos e tratar MIDI fino:"</b> Cubase — comping, VariAudio e mesa madura.</li>
              <li><b className="text-brand-300">"Meu estúdio/amigo usa X e quero colaboração:"</b> a mesma DAW do círculo elimina 90% do atrito de troca.</li>
              <li><b className="text-brand-300">"Não sei ainda:"</b> o onboarding deixa você continuar sem DAW — aulas de conceito funcionam para todas.</li>
            </ul>
          </Card>
          <Card className="flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white">Decidiu?</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">Seu roadmap inteiro — trilhas, exercícios, mentor — passa a falar a língua da sua DAW. E se você trocar depois, 80% do que aprendeu vai junto, porque foi ensinado como <b className="text-zinc-200">conceito</b>.</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => navigate(`/criar-conta${pick ? `?daw=${pick}` : ''}`)} className="btn-primary flex-1">Começar com {pick ? daws.find(d => d.id === pick)?.name : 'minha conta'} <ArrowRight size={15} /></button>
              <Link to="/#metodo" className="btn-ghost">Ver o método</Link>
            </div>
          </Card>
        </div>
      </div>
    </MarketingShell>
  )
}
