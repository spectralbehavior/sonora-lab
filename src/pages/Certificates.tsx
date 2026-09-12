import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Award, QrCode, ShieldCheck } from 'lucide-react'
import { PageHeader, MarketingShell } from '@/components/shell'
import { Card, Badge, Button, Empty } from '@/components/ui'
import { useApp } from '@/store/app'
import { listCourses } from '@/services/content'
import { courseProgress, isCourseComplete } from '@/services/progress'
import { issueCertificate, myCertificates, verifyCertificate } from '@/services/certificates'
import { formatDate } from '@/lib/utils'
import { brand } from '@/config/brand'
import { track } from '@/services/analytics'
import type { CertificateRow } from '@/types'

export default function CertificatesPage() {
  const { user, pushToast } = useApp()
  const [busy, setBusy] = useState<string | null>(null)
  const [qrData, setQrData] = useState<Record<string, string>>({})
  if (!user) return null
  const certs = myCertificates(user.id)
  const courses = listCourses()

  // QR gerado localmente (lib qrcode) — aponta para a URL pública de validação.
  useEffect(() => {
    let cancel = false
    ;(async () => {
      for (const c of certs) {
        if (qrData[c.id]) continue
        try {
          const QRCode = (await import('qrcode')).default
          const url = `${window.location.origin}/certificado/${c.id}`
          const data = await QRCode.toDataURL(url, { margin: 1, width: 160, color: { dark: '#0B0E16', light: '#FFFFFF' } })
          if (!cancel) setQrData(q => ({ ...q, [c.id]: data }))
        } catch { /* preview sem canvas — exibe o código textual */ }
      }
    })()
    return () => { cancel = true }
  }, [certs.length]) // eslint-disable-line react-hooks/exhaustive-deps

  async function issue(courseId: string) {
    setBusy(courseId)
    try {
      const cert = issueCertificate(user!.id, courseId)
      track('certificate_generated', { courseId })
      pushToast('📜 Certificado emitido com ID único e URL de validação.', 'success')
      const QRCode = (await import('qrcode')).default
      const data = await QRCode.toDataURL(`${window.location.origin}/certificado/${cert.id}`, { margin: 1, width: 160 })
      setQrData(q => ({ ...q, [cert.id]: data }))
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Erro ao emitir.', 'error')
    } finally { setBusy(null) }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Certificados" sub="Emitidos ao completar 100% de um curso — verificação pública, sem print de PDF falsificável." actions={<Badge tone="brand">recurso Pro+</Badge>} />

      {certs.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {certs.map(c => (
            <Card key={c.id} className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ background: `radial-gradient(60% 90% at 90% 0%, ${brand.colors.brand}, transparent)` }} />
              <div className="flex items-start gap-4">
                <div>
                  <Badge tone="success"><ShieldCheck size={11} /> válido</Badge>
                  <h3 className="mt-2 text-[15px] font-black text-white">{c.courseTitle}</h3>
                  <p className="mt-1 text-[12px] text-zinc-400">Emitido para <b className="text-zinc-200">{c.userName}</b> · carga horária {c.hours}h · {formatDate(c.issuedAt.slice(0, 10))}</p>
                  <p className="mt-1 font-mono text-[10px] text-zinc-500">ID {c.id} · verificação: {c.code}</p>
                  <div className="mt-2 flex gap-2">
                    <Link to={`/certificado/${c.id}`} className="btn-ghost btn-sm"><QrCode size={13} /> Ver / imprimir</Link>
                  </div>
                </div>
                <div className="ml-auto hidden shrink-0 rounded-xl bg-white p-1.5 sm:block">
                  {qrData[c.id] ? <img src={qrData[c.id]} width={92} height={92} alt="QR de validação" /> : <div className="flex h-[92px] w-[92px] items-center justify-center text-center font-mono text-[9px] text-zinc-400">{c.code}</div>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Emissão disponível</h2>
        <div className="mt-3 space-y-2">
          {courses.map(c => {
            const pct = courseProgress(user.id, c.id)
            const complete = isCourseComplete(user.id, c.id)
            const has = certs.some(x => x.courseId === c.id)
            if (has || !complete) return null
            return (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[.05] px-4 py-3">
                <div><div className="text-sm font-extrabold text-white">{c.title}</div><div className="text-[11px] text-emerald-300">100% concluído — pronto para emissão</div></div>
                <Button size="sm" disabled={busy === c.id} onClick={() => issue(c.id)}>{busy === c.id ? 'Emitindo…' : 'Emitir 📜'}</Button>
              </div>
            )
          })}
          {courses.every(c => !isCourseComplete(user.id, c.id)) && (
            <Empty title="Nenhum curso 100% ainda" hint={`Complete um curso (faltam % variáveis: ${courses.slice(0, 3).map(c => `${c.title.split('—')[1]?.trim() ?? c.title} ${courseProgress(user.id, c.id)}%`).join(' · ')}) e o botão de emissão aparece aqui automaticamente.`} action={<Link to="/app/aprender" className="btn-primary btn-sm mt-2">Ir à academia</Link>} />
          )}
        </div>
      </Card>
    </div>
  )
}

// ── Página pública de verificação ───────────────────────────────────────────

export function CertificatePublicPage() {
  const { id = '' } = useParams()
  const [cert, setCert] = useState<{ ok: boolean; cert?: CertificateRow } | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  useEffect(() => {
    const res = verifyCertificate(id)
    setCert(res)
    if (res.ok && res.cert) {
      import('qrcode').then(m => m.default.toDataURL(window.location.href, { margin: 1, width: 180 })).then(setQr).catch(() => undefined)
    }
  }, [id])

  return (
    <MarketingShell>
      <div className="mx-auto max-w-2xl px-4 py-12">
        {!cert && <p className="text-center text-sm text-zinc-500">Verificando…</p>}
        {cert && !cert.ok && (
          <div className="text-center">
            <div className="text-4xl">🚫</div>
            <h1 className="mt-3 text-lg font-black text-white">Certificado não encontrado</h1>
            <p className="mt-2 text-sm text-zinc-400">Este ID/código não consta na base da {brand.name}. Se foi emitido aqui, cheque o link exato na URL impressa.</p>
          </div>
        )}
        {cert?.ok && cert.cert && (
          <div className="glass overflow-hidden rounded-3xl p-2">
            <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-night-800 via-night-850 to-night-900 p-8 text-center sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-neon-cyan text-2xl">🎓</div>
              <div className="mt-4 text-[10px] font-black uppercase tracking-[.4em] text-brand-300">Certificado de conclusão</div>
              <h1 className="mt-4 text-2xl font-black text-white sm:text-3xl">{cert.cert.userName}</h1>
              <p className="mt-2 text-sm text-zinc-400">completou <b className="text-zinc-200">{cert.cert.courseTitle}</b> — carga horária de <b className="text-zinc-200">{cert.cert.hours}h</b> com projetos práticos</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-zinc-500">
                <span>{brand.name} · {brand.domain}</span>
                <span>Emitido em {formatDate(cert.cert.issuedAt.slice(0, 10))}</span>
                <span className="font-mono">ID {cert.cert.code}</span>
              </div>
              <div className="mt-6 flex justify-center gap-3">
                {qr && <img src={qr} width={84} height={84} className="rounded-lg bg-white p-1" alt="QR de verificação" />}
                <div className="flex flex-col justify-center text-left text-[10px] leading-relaxed text-zinc-500">
                  <span className="inline-flex items-center gap-1 text-emerald-400"><ShieldCheck size={12} /> Verificação válida nesta URL</span>
                  <span>Revogável/expirável pela instituição emissora.</span>
                  <span>Conteúdo do curso versionado em {new Date(cert.cert.issuedAt).getFullYear()}.</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <span className="text-[11px] text-zinc-500">Página pública · sem dados pessoais além do nome e curso.</span>
              <Link to="/criar-conta" className="btn-primary btn-sm">Conquistar o meu</Link>
            </div>
          </div>
        )}
      </div>
    </MarketingShell>
  )
}
