import { describe, expect, it, beforeEach } from 'vitest'
import { resetDb, raw, insert, setSetting } from '@/lib/db'
import { register, updateProfile } from '@/services/auth'
import { listPlans, startCheckout, confirmCheckout, cancelSubscription, subscriptionFor, validateCoupon, effectivePlan, revenueSnapshot } from '@/services/billing'
import { mentorAnswer, rateLimitCheck, rateLimitBump } from '@/services/mentor'
import { issueCertificate, verifyCertificate, myCertificates } from '@/services/certificates'
import { createPost, toggleLike, getPost, reportPost, pendingReports, resolveReports } from '@/services/community'
import { toggleFinishDay, finishState, finishComplete } from '@/services/studio'
import { recordSession, weeklyMinutes, evaluateAchievements, userStats } from '@/services/gamification'
import { saveConsent, getConsent, exportUserData, deleteAccount } from '@/services/lgpd'
import { completeLesson } from '@/services/progress'
import { listCourses, listLessons } from '@/services/content'

let uid = ''
beforeEach(async () => {
  resetDb()
  uid = (await register('X', `x${Math.random().toString(36).slice(2, 8)}@t.io`, 'senha1234')).id
  updateProfile(uid, { username: 'x' + uid.slice(-4).replace(/[^a-z0-9]/gi, ''), daw: 'ableton' })
})

describe('billing (preços vindos de settings, nunca do código)', () => {
  it('listPlans reflete override do admin (settings > seed)', () => {
    const pro = listPlans().find(p => p.id === 'pro')!
    expect(pro.priceMonthly).toBeGreaterThan(0)
    setSetting('plans', listPlans().map(p => p.id === 'pro' ? { ...p, priceMonthly: 123.45 } : p))
    expect(listPlans().find(p => p.id === 'pro')!.priceMonthly).toBe(123.45)
  })
  it('checkout demo: sessão → assinatura ativa → pagamento registrado', () => {
    const session = startCheckout(uid, 'creator', undefined)
    expect(session.planId).toBe('creator')
    const { subscriptionId } = confirmCheckout(session, uid)
    const sub = subscriptionFor(uid)!
    expect(sub.id).toBe(subscriptionId)
    expect(sub.status).toBe('active')
    expect(effectivePlan(uid).id).toBe('creator')
    expect(raw().payments.at(-1)?.provider).toBe('demo')
  })
  it('cupom aplicado ao valor; cupom inválido bloqueia checkout', () => {
    insert('coupons', { id: 'c1', code: 'TESTE10', percent: 10, active: true } as never)
    expect(validateCoupon('teste10').valid).toBe(true)
    expect(validateCoupon('NAOEXISTE').valid).toBe(false)
    const pro = listPlans().find(p => p.id === 'pro')!
    const s = startCheckout(uid, 'pro', 'TESTE10')
    expect(s.amount).toBeCloseTo(Math.round(pro.priceMonthly * 0.9 * 100) / 100)
    expect(() => startCheckout(uid, 'pro', 'FAKE')).toThrow(/inv/i)
    expect(() => startCheckout(uid, 'free')).toThrow(/inv/i)
  })
  it('cancelamento tira acesso ao vencer e some do MRR', () => {
    confirmCheckout(startCheckout(uid, 'pro'), uid)
    cancelSubscription(uid)
    expect(subscriptionFor(uid)).toBeUndefined()
    expect(effectivePlan(uid).id).toBe('free')
    expect(raw().subscriptions.filter(s => s.userId === uid && s.status === 'active')).toHaveLength(0)
    expect(raw().subscriptions.filter(s => s.userId === uid && s.status === 'canceled')).toHaveLength(1)
    expect(revenueSnapshot().canceled).toBeGreaterThanOrEqual(1)
  })
})

describe('mentor IA — regra anti-invenção', () => {
  it('acerta a KB com fonte versionada e provider explícito', () => {
    const r = mentorAnswer('como faço sidechain?', 'ableton', uid)
    expect(r.matched).toBe(true)
    expect(r.source).toBe('kb')
    expect(r.provider).toBe('kb-only')
    expect(r.note).toContain('curado')
    expect(r.text.length).toBeGreaterThan(20)
  })
  it('sem correspondência: admite e encaminha — nunca inventa procedimento', () => {
    const r = mentorAnswer('zzzblorp zzzgrimb zzzfnord', 'cubase', uid)
    expect(r.matched).toBe(false)
    expect(r.source).toBe('none')
    expect(r.text).toContain('inventar')
  })
  it('plano free limita 8 perguntas/dia; pago tem folga', () => {
    expect(rateLimitCheck(uid, 'free').remaining).toBe(8)
    for (let i = 0; i < 8; i++) rateLimitBump(uid)
    expect(rateLimitCheck(uid, 'free').allowed).toBe(false)
    expect(rateLimitCheck(uid, 'pro').allowed).toBe(true)
  })
})

describe('certificados', () => {
  const finishCourse = () => {
    const course = listCourses()[0]
    for (const l of listLessons(course.id)) completeLesson(uid, l)
    return course
  }
  it('exige curso 100% E plano pago; ID único e verificação pública', () => {
    const course = listCourses()[0]
    expect(() => issueCertificate(uid, course.id)).toThrow(/100%|complete/i)
    finishCourse()
    expect(() => issueCertificate(uid, course.id)).toThrow(/pagos?/i) // curso ok, mas free
    confirmCheckout(startCheckout(uid, 'pro'), uid)
    const cert = issueCertificate(uid, course.id)
    expect(cert.code).toMatch(/^SNR-/)
    expect(cert.courseTitle).toBeTruthy()
    expect(() => issueCertificate(uid, course.id)).not.toThrow()
    expect(myCertificates(uid)).toHaveLength(1) // idempotente (devolve o mesmo)
    expect(verifyCertificate(cert.id).ok).toBe(true)
    expect(verifyCertificate(cert.code).ok).toBe(true)
    expect(verifyCertificate('SNR-XXXX-XXXX-XXXX').ok).toBe(false)
  })
})

describe('comunidade', () => {
  it('like alterna por usuário; denúncia entra e sai da fila de moderação', () => {
    const p = createPost(uid, { category: 'feedback-tracks', title: 'Meu primeiro full-on', body: 'Críticas construtivas, por favor.', tags: ['psy'] })
    expect(getPost(p.id)?.likes).toEqual([])
    toggleLike(uid, p.id)
    expect(getPost(p.id)?.likes).toEqual([uid])
    toggleLike(uid, p.id)
    expect(getPost(p.id)?.likes).toEqual([])
    toggleLike('de outro', p.id)
    toggleLike(uid, p.id)
    expect(getPost(p.id)?.likes).toHaveLength(2)
    reportPost('denunciante', p.id, 'spamm')
    expect(pendingReports()).toHaveLength(1)
    resolveReports(p.id)
    expect(pendingReports()).toHaveLength(0)
  })
})

describe('finish a track · streak · conquistas', () => {
  it('7 dias persistem por dia e completam a trilha', () => {
    expect(finishState(uid)).toHaveLength(7)
    expect(finishComplete(uid)).toBe(false)
    for (const d of [1, 2, 3, 4, 5, 6, 7]) toggleFinishDay(uid, d, true)
    expect(finishState(uid).every(x => x.done)).toBe(true)
    expect(finishComplete(uid)).toBe(true)
    toggleFinishDay(uid, 4, false)
    expect(finishComplete(uid)).toBe(false)
  })
  it('sessões de estudo alimentam minutos semanais', () => {
    recordSession(uid, 40)
    recordSession(uid, 20)
    expect(weeklyMinutes(uid)).toBeGreaterThanOrEqual(60)
  })
  it('conquistas detonam 1x a partir de métricas reais', () => {
    const before = evaluateAchievements(uid)
    expect(Array.isArray(before)).toBe(true)
    expect(evaluateAchievements(uid)).toHaveLength(0) // nada novo — sem farm de XP
    confirmCheckout(startCheckout(uid, 'pro'), uid)
    const course = listCourses()[0]
    for (const l of listLessons(course.id)) completeLesson(uid, l)
    const now = evaluateAchievements(uid)
    expect(now.every(a => !!a.title && !!a.icon)).toBe(true)
    expect(userStats(uid).lessons).toBe(listLessons(course.id).length)
  })
})

describe('LGPD — direitos que funcionam de verdade', () => {
  it('consentimento persiste; exportação traz os dados; exclusão anonimiza posts', () => {
    const p = createPost(uid, { category: 'duvidas', title: 'Dúvida sobre sidechain', body: 'Meu bass fica embolado quando aplico sidechain no drop.', tags: [] })
    saveConsent(uid, { analytics: true, marketing: false })
    expect(getConsent(uid).analytics).toBe(true)
    expect(getConsent(uid).marketing).toBe(false)
    const dump = exportUserData(uid)
    expect(typeof dump).toBe('string')
    expect(dump).toContain('X')
    deleteAccount(uid)
    expect(raw().users.some(u => u.id === uid)).toBe(false)
    expect(raw().profiles.some(pr => pr.userId === uid)).toBe(false)
    expect(getPost(p.id)?.authorName).toBe('Usuário removido')
    expect(getPost(p.id)?.userId).toBe('deleted')
    expect(() => exportUserData('nao-existe')).toThrow()
  })
})
