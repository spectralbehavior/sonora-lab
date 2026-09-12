import { insert, raw, getTable } from '@/lib/db'
import { nowISO, uid } from '@/lib/utils'
import type { CertificateRow } from '@/types'
import { isCourseComplete } from './progress'
import { effectivePlan } from './billing'

// Certificados digitais: ID único + código de verificação + URL pública
// /certificado/[id]. A verificação consulta o banco (sem segredo no front).

function certCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 12; i++) out += i === 4 || i === 8 ? '-' : chars[Math.floor(Math.random() * chars.length)]
  return `SNR-${out}`
}

export function issueCertificate(userId: string, courseId: string): CertificateRow {
  const course = raw().courses.find(c => c.id === courseId)
  if (!course) throw new Error('Curso não encontrado.')
  if (!isCourseComplete(userId, courseId)) throw new Error('Complete 100% das aulas do curso para emitir o certificado.')
  const plan = effectivePlan(userId)
  if (plan.id === 'free') throw new Error('Certificados são um recurso dos planos pagos. Faça upgrade para emitir o seu.')
  const existing = raw().certificates.find(c => c.userId === userId && c.courseId === courseId)
  if (existing) return existing
  const user = raw().users.find(u => u.id === userId)!
  const cert = insert('certificates', {
    id: uid('crt'), code: certCode(), userId, userName: user.name, courseId,
    courseTitle: course.title, hours: course.estHours, issuedAt: nowISO(),
  } as CertificateRow)
  insert('notifications', { id: uid('ntf'), userId, text: `📜 Certificado emitido: ${course.title}. Confira em Certificados.`, ts: nowISO(), read: false })
  return cert
}

export function myCertificates(userId: string): CertificateRow[] {
  return getTable('certificates').filter(c => c.userId === userId).sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1))
}

export function verifyCertificate(idOrCode: string): { ok: boolean; cert?: CertificateRow } {
  const cert = raw().certificates.find(c => c.id === idOrCode || c.code === idOrCode.toUpperCase())
  if (!cert) return { ok: false }
  return { ok: true, cert }
}
