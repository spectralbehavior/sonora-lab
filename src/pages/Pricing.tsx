import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import { MarketingShell } from '@/components/shell'
import { SectionTitle, Badge, Card } from '@/components/ui'
import { listPlans } from '@/services/billing'
import { useSeo } from '@/lib/seo'
import { useApp } from '@/store/app'
import { formatBRL, cn } from '@/lib/utils'
import { track } from '@/services/analytics'

export default function Pricing() {
  useSeo({ title: 'Planos e preços', description: 'Comece grátis. Pro destrava todos os cursos, projetos, AI Music Mentor e certificados. Creator inclui feedback de tracks e portfólio pro. Academy para escolas.', path: '/planos' })
  const { user, plan } = useApp()
  const [annual, setAnnual] = useState(false)
  const plans = listPlans()

  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle center kicker="Planos" title="Comece grátis. Assine quando fizer sentido." sub="Preços administráveis pelo painel e ajustáveis para promoções/países — nada hardcoded. Sem cobrança surpresa, cancelamento em 1 clique, sem retenção hostil." />

        <div className="mb-10 flex justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.03] p-1 text-sm font-bold">
            <button onClick={() => setAnnual(false)} className={cn('rounded-full px-4 py-1.5 transition', !annual ? 'bg-brand text-white' : 'text-zinc-400')}>Mensal</button>
            <button onClick={() => setAnnual(true)} className={cn('rounded-full px-4 py-1.5 transition', annual ? 'bg-brand text-white' : 'text-zinc-400')}>Anual <span className="text-[10px] text-lime-300">-20%</span></button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map(p => {
            const isCurrent = user && plan?.id === p.id
            const price = annual ? Math.round(p.priceAnnual / 12 * 100) / 100 : p.priceMonthly
            return (
              <Card key={p.id} className={cn('relative flex flex-col gap-4 p-6', p.highlight && 'border-brand/60 ring-1 ring-brand/40')}>
                {p.badge && <span className={cn('absolute -top-2.5 left-5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide', p.highlight ? 'bg-brand text-white' : 'border border-white/15 bg-night-700 text-zinc-300')}>{p.badge}</span>}
                <div>
                  <div className="text-sm font-black uppercase tracking-wider text-zinc-400">{p.name}</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{price === 0 ? 'R$ 0' : formatBRL(price)}</span>
                    <span className="text-[11px] text-zinc-500">/mês{annual && p.priceAnnual > 0 ? ` · ${formatBRL(p.priceAnnual)}/ano` : ''}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-2 text-[12.5px] text-zinc-300">
                  {p.features.map(f => <li key={f} className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-emerald-400" />{f}</li>)}
                </ul>
                {p.id === 'free' ? (
                  <Link to={user ? '/app' : '/criar-conta'} className="btn-ghost">Começar grátis</Link>
                ) : isCurrent ? (
                  <div className="btn-ghost pointer-events-none opacity-70"><Sparkles size={14} className="text-brand-300" /> Seu plano atual</div>
                ) : user ? (
                  <Link to={`/app/checkout/${p.id}`} className={cn(p.highlight ? 'btn-primary' : 'btn-ghost')} onClick={() => track('checkout_started', { planId: p.id, source: 'pricing' })}>Assinar {p.name}</Link>
                ) : (
                  <Link to="/criar-conta" className={cn(p.highlight ? 'btn-primary' : 'btn-ghost')}>Criar conta e assinar</Link>
                )}
              </Card>
            )
          })}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ['🎁 O que o Free realmente entrega', 'Roadmap completo, aulas introdutórias de cada método, streak e desafios limitados, leitura da comunidade. Sem cartão — para você testar o MÉTODO, não para ficar preso em demo mutilada.'],
            ['🔁 Trocar de plano / cancelar', 'Upgrade imediato (pró-RATA no PSP real). Downgrade mantém acesso até o fim do período pago — "período de acesso" está no contrato do checkout.'],
            ['🏫 Escolas e estúdios', 'Academy: contas de alunos, painel do professor, turmas e relatórios. B2B com contrato, SSO e preços por instituição (fale com a gente).'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-white/[.07] bg-white/[.02] p-5">
              <div className="text-sm font-extrabold text-white">{t}</div>
              <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-[11px] text-zinc-600">Modo demonstração: nenhum valor é cobrado no sandbox. Integração Stripe / Mercado Pago / Asaas na Fase 6 (webhooks verificados; dados de cartão nunca tocam nossos servidores).</p>
      </div>
    </MarketingShell>
  )
}
