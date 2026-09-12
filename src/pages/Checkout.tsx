import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CreditCard, ShieldCheck, Tag } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Badge, Button, Field } from '@/components/ui'
import { useApp } from '@/store/app'
import { getPlan, startCheckout, confirmCheckout, validateCoupon } from '@/services/billing'
import { formatBRL } from '@/lib/utils'
import { track } from '@/services/analytics'

// CHECKOUT DEMO — rotula explicitamente: nenhum PSP real é chamado.
// Integração Stripe/Mercado Pago/Asaas (Fase 6): sessão server-side + webhook.

export default function CheckoutPage() {
  const { planId = 'pro' } = useParams()
  const { user, refresh, pushToast } = useApp()
  const navigate = useNavigate()
  const plan = getPlan(planId) ?? getPlan('pro')!
  const [coupon, setCoupon] = useState('')
  const [applied, setApplied] = useState<{ valid: boolean; percent: number; message: string } | null>(null)
  const [busy, setBusy] = useState(false)

  if (!user) return null
  const price = plan.priceMonthly
  const total = applied?.valid ? Math.round(price * (1 - applied.percent / 100) * 100) / 100 : price

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <PageHeader title="Assinar" sub={<>Você está assinando <b className="text-white">{plan.name}</b>.</>} />

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/[.08] px-4 py-3 text-[12px] leading-relaxed text-amber-100">
        🧪 <b>Ambiente de demonstração/sandbox:</b> nenhum pagamento real é processado e nenhum dado de cartão é solicitado. A produção usa provedores PSP (Stripe / Mercado Pago / Asaas) com checkout server-side + webhook assinado.
      </div>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-black text-white">{plan.name} · mensal</div>
            <div className="mt-1 text-2xl font-black text-white">{formatBRL(price)}<span className="text-xs font-bold text-zinc-500">/mês</span></div>
            <div className="text-[11px] text-zinc-500">ou {formatBRL(plan.priceAnnual)}/ano (2 meses grátis) — cancelável quando quiser</div>
          </div>
          <Badge tone="brand">upgrade de {user.profile.level ? 'aluno ativo' : 'conta'}</Badge>
        </div>
        <ul className="mt-3 space-y-1.5 border-t border-white/[.07] pt-3 text-[12px] text-zinc-300">
          {plan.features.map(f => <li key={f} className="flex gap-2"><ShieldCheck size={13} className="mt-0.5 shrink-0 text-emerald-400" />{f}</li>)}
        </ul>
      </Card>

      <Card className="space-y-3">
        <Field label="Cupom (ex.: SONORA10, FIRSTTRACK)">
          <div className="flex gap-2">
            <input className="input font-mono uppercase" placeholder="primeirobeat20" value={coupon} onChange={e => setCoupon(e.target.value)} />
            <Button variant="ghost" onClick={() => { const r = validateCoupon(coupon); setApplied(r); if (!r.valid && coupon) pushToast(r.message, 'error') }}><Tag size={14} /> Aplicar</Button>
          </div>
        </Field>
        {applied?.valid && <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/[.06] px-3 py-2 text-[12px] text-emerald-200">{applied.message}</p>}
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Total do primeiro período</span>
          <span className="text-lg font-black text-white">{formatBRL(total)}</span>
        </div>
        <Button className="w-full" size="lg" disabled={busy} onClick={() => {
          setBusy(true)
          track('checkout_started', { planId: plan.id })
          try {
            const session = startCheckout(user.id, plan.id, coupon || undefined)
            confirmCheckout(session, user.id)
            track('purchase', { planId: plan.id, amount: session.amount })
            track('subscription_started', { planId: plan.id })
            pushToast(`🎉 ${plan.name} ativo (demo). Acesse tudo — cursos, mentor, certificados.`, 'success')
            refresh()
            navigate('/app')
          } catch (e) {
            pushToast(e instanceof Error ? e.message : 'Erro no checkout.', 'error')
          } finally { setBusy(false) }
        }}><CreditCard size={16} /> {busy ? 'Processando…' : `Assinar ${plan.name} (demo)`}</Button>
        <p className="text-center text-[10px] leading-relaxed text-zinc-500">
          Ao assinar (produção), você autoriza renovação recorrente; cancelamento, downgrade e recuperação de pagamento seguem o fluxo de webhooks documentado em docs/BILLING.md. Nada aqui cobra.
        </p>
      </Card>
    </div>
  )
}
