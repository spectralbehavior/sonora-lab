import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MarketingShell } from '@/components/shell'
import { Logo, WaveBars } from '@/components/visuals'
import { Field, Button, Badge } from '@/components/ui'
import * as auth from '@/services/auth'
import { track } from '@/services/analytics'
import { useApp } from '@/store/app'
import { isDemoMode } from '@/lib/supabase'

export default function AuthPages({ mode }: { mode: 'login' | 'register' | 'recover' }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { refresh, pushToast } = useApp()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accept, setAccept] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErr(null); setBusy(true)
    try {
      if (mode === 'register') {
        if (!accept) throw new Error('Para criar a conta você precisa aceitar os Termos de Uso e a Política de Privacidade (LGPD).')
        await auth.register(name, email, password)
        track('signup', { marketing })
        if (marketing) track('marketing_optin')
        pushToast('🎉 Conta criada! Vamos configurar seu roadmap.')
        navigate(`/onboarding?next=${encodeURIComponent(params.get('next') ?? '/app')}`)
      } else if (mode === 'login') {
        await auth.login(email, password)
        track('login')
        refresh()
        navigate(params.get('next') ?? '/app')
      } else {
        const msg = await auth.requestPasswordReset(email)
        setInfo(msg)
      }
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Erro inesperado.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <MarketingShell>
      <div className="mx-auto flex max-w-md flex-col px-4 py-14">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="glass overflow-hidden rounded-3xl p-6 sm:p-8">
          <WaveBars n={14} className="mb-5 !h-6" seed={mode === 'login' ? 3 : 9} />
          <h1 className="text-xl font-black text-white">
            {mode === 'register' ? 'Crie sua conta' : mode === 'login' ? 'Entrar na plataforma' : 'Recuperar acesso'}
          </h1>
          <p className="mt-1 text-[13px] text-zinc-400">
            {mode === 'register' ? 'Comece grátis — sem cartão. Seu roadmap é gerado em 2 minutos.' : mode === 'login' ? 'Bom te ver de novo. A sessão continua de onde parou.' : 'Informe seu e-mail para receber o link de redefinição.'}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <Field label="Como te chamamos?">
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome ou artístico" required minLength={2} />
              </Field>
            )}
            <Field label="E-mail">
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" required autoComplete="email" />
            </Field>
            {mode !== 'recover' && (
              <Field label="Senha" hint={mode === 'register' ? 'Mínimo de 8 caracteres.' : undefined}>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
              </Field>
            )}
            {mode === 'register' && (
              <div className="space-y-2 rounded-xl border border-white/10 bg-white/[.03] p-3.5 text-[12px] text-zinc-400">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input type="checkbox" checked={accept} onChange={e => setAccept(e.target.checked)} className="mt-0.5 accent-[#7C5CFF]" />
                  <span>Li e aceito os <Link to="/termos" className="link">Termos de Uso</Link> e a <Link to="/privacidade" className="link">Política de Privacidade</Link> (LGPD). Posso exportar ou excluir meus dados a qualquer momento.</span>
                </label>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} className="mt-0.5 accent-[#7C5CFF]" />
                  <span>Quero receber dicas de produção e novidades (opcional, revogável).</span>
                </label>
              </div>
            )}
            {err && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-200">{err}</div>}
            {info && <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2.5 text-[13px] text-cyan-100">{info}</div>}
            <Button className="w-full" type="submit" disabled={busy} size="lg">
              {busy ? 'Um instante…' : mode === 'register' ? 'Criar conta e gerar meu roadmap' : mode === 'login' ? 'Entrar' : 'Enviar instruções'}
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[13px]">
            {mode === 'login' && <>
              <Link className="link" to="/recuperar">Esqueci a senha</Link>
              <span className="text-zinc-500">Novo por aqui? <Link className="link" to="/criar-conta">Criar conta grátis</Link></span>
            </>}
            {mode === 'register' && <span className="text-zinc-500">Já tem conta? <Link className="link" to="/entrar">Entrar</Link></span>}
            {mode === 'recover' && <Link className="link" to="/entrar">← Voltar ao login</Link>}
          </div>
        </div>

        {isDemoMode() && mode === 'login' && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-[12px] leading-relaxed text-zinc-400">
            <Badge tone="info">contas de demonstração</Badge>
            <p className="mt-2">Aluno: <b className="text-zinc-200">rafa@demo.sonora.app / demo1234</b> (com progresso e portfólio).</p>
            <p>Admin: <b className="text-zinc-200">admin@sonora.app / sonora123</b> (CMS + planos + cupons).</p>
            <p className="mt-2 text-zinc-500">Modo local: as credenciais nunca saem do seu navegador.</p>
          </div>
        )}
      </div>
    </MarketingShell>
  )
}
