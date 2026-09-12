import { getTable, raw, insert, update, getSetting } from '@/lib/db'
import { nowISO, uid } from '@/lib/utils'
import type { PlanDef, SubscriptionRow } from '@/types'

// ── Assinaturas em MODO DEMO ─────────────────────────────────────────────────
// Nenhum pagamento real. Produção (Fase 6): Stripe/Mercado Pago/Asaas via
// backend próprio/Edge Functions: criar sessão de checkout server-side,
// confirmar por WEBHOOK (nunca "pagar" no client). Nunca armazenar dados de
// cartão. Contrato deste service (startCheckout/confirm/cancel) foi desenhado
// para espelhar exatamente os eventos: checkout_started → purchase →
// subscription_started → subscription_cancelled.

export function listPlans(): PlanDef[] {
  return getSetting<PlanDef[]>('plans', getTable('plans'))
}

export function getPlan(id: string): PlanDef | undefined {
  return listPlans().find(p => p.id === id)
}

export function subscriptionFor(userId: string): SubscriptionRow | undefined {
  return raw().subscriptions
    .filter(s => s.userId === userId && s.status === 'active' && new Date(s.renewsAt) > new Date())
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0]
}

export function effectivePlan(userId: string): PlanDef {
  const sub = subscriptionFor(userId)
  return getPlan(sub?.planId ?? 'free') ?? listPlans()[0]
}

export function validateCoupon(code: string): { valid: boolean; percent: number; message: string } {
  const c = raw().coupons.find(x => x.code.toUpperCase() === code.trim().toUpperCase() && x.active)
  if (!code.trim()) return { valid: false, percent: 0, message: '' }
  if (!c) return { valid: false, percent: 0, message: 'Cupom inválido ou expirado.' }
  return { valid: true, percent: c.percent, message: `Cupom aplicado: ${c.percent}% off o primeiro período.` }
}

/** Cria "sessão" local (demo). Em produção isto seria uma session id do PSP. */
export function startCheckout(userId: string, planId: string, coupon?: string) {
  const plan = getPlan(planId)
  if (!plan || plan.id === 'free') throw new Error('Plano inválido.')
  const price = plan.priceMonthly
  const cpn = coupon ? validateCoupon(coupon) : null
  if (coupon && cpn && !cpn.valid) throw new Error(cpn.message)
  const amount = cpn?.valid ? Math.round(price * (1 - cpn.percent / 100) * 100) / 100 : price
  return { sessionId: uid('cs'), planId, price, amount, coupon: coupon && cpn?.valid ? coupon.toUpperCase() : undefined }
}

export function confirmCheckout(session: { sessionId: string; planId: string; amount: number; coupon?: string }, userId: string) {
  const id = uid('sub')
  insert('subscriptions', {
    id, userId, planId: session.planId, status: 'active',
    startedAt: nowISO(),
    renewsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  } as SubscriptionRow)
  insert('payments', {
    id: uid('pay'), userId, planId: session.planId, amount: session.amount, couponCode: session.coupon,
    ts: nowISO(), provider: 'demo', status: 'succeeded',
  })
  return { subscriptionId: id }
}

export function cancelSubscription(userId: string) {
  const sub = subscriptionFor(userId)
  if (!sub) return
  update('subscriptions', sub.id, { status: 'canceled' })
}

export function switchPlan(userId: string, planId: string) {
  cancelSubscription(userId)
  if (planId !== 'free') {
    const session = startCheckout(userId, planId)
    confirmCheckout(session, userId)
  }
}

export function canAccessLesson(userId: string, isSample: boolean | undefined): boolean {
  const plan = effectivePlan(userId)
  if (isSample) return true
  return plan.id !== 'free'
}

export function revenueSnapshot() {
  const subs = raw().subscriptions.filter(s => s.status === 'active' && new Date(s.renewsAt) > new Date())
  const mrr = subs.reduce((acc, s) => acc + (getPlan(s.planId)?.priceMonthly ?? 0), 0)
  const payments = raw().payments
  const canceled = raw().subscriptions.filter(s => s.status === 'canceled').length
  const users = raw().users.length
  const activeLearners = new Set(raw().lesson_progress.filter(p => p.completedAt).map(p => p.userId)).size
  return {
    subscribers: subs.length, mrr, canceled,
    arpu: users ? Math.round((mrr / Math.max(1, users)) * 100) / 100 : 0,
    conversion: users ? Math.round((subs.length / users) * 100) : 0,
    retention: users ? Math.round((activeLearners / users) * 100) : 0,
    payments: payments.length,
  }
}
