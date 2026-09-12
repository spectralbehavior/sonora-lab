import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Trash2, Languages, Bell } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Badge, Button, Field, Toggle } from '@/components/ui'
import { useApp } from '@/store/app'
import { updateProfile, changePassword } from '@/services/auth'
import { exportUserData, getConsent, saveConsent } from '@/services/lgpd'
import { raw } from '@/lib/db'
import { downloadText } from '@/lib/utils'
import { LOCALES, getLocale, setLocale, type Locale } from '@/i18n'
import { track } from '@/services/analytics'

export default function SettingsPage() {
  const { user, refresh, pushToast } = useApp()
  const navigate = useNavigate()
  if (!user) return null
  const consent = getConsent(user.id)
  const [p, setP] = useState({ username: user.profile.username ?? '', bio: user.profile.bio ?? '', artistName: user.profile.artistName ?? '', weeklyGoalMin: user.profile.weeklyGoalMin, mode: user.profile.mode, level: user.profile.level ?? 'iniciante', daw: user.profile.daw ?? 'none', genre: user.profile.genre ?? '', publicPortfolio: user.profile.publicPortfolio })
  const [cur, setCur] = useState(''); const [next, setNext] = useState('')
  const [delConfirm, setDelConfirm] = useState('')

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title="Configurações" sub="Perfil, preferências de estudo, LGPD e conta." />

      <Card className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Perfil</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Nome artístico"><input className="input" value={p.artistName} onChange={e => setP({ ...p, artistName: e.target.value })} /></Field>
          <Field label="@username"><input className="input font-mono" value={p.username} onChange={e => setP({ ...p, username: e.target.value.replace(/[^a-z0-9_.-]/gi, '').toLowerCase() })} /></Field>
          <Field label="Meta semanal (min)"><input className="input" inputMode="numeric" value={p.weeklyGoalMin} onChange={e => setP({ ...p, weeklyGoalMin: +e.target.value.replace(/\D/g, '') || 0 })} /></Field>
        </div>
        <Field label="Bio"><textarea className="input min-h-20" value={p.bio} onChange={e => setP({ ...p, bio: e.target.value })} /></Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Nível">
            <select className="input" value={p.level} onChange={e => setP({ ...p, level: e.target.value as never })}>
              <option value="iniciante">Iniciante</option><option value="intermediario">Intermediário</option><option value="avancado">Avançado</option>
            </select>
          </Field>
          <Field label="DAW">
            <select className="input" value={p.daw} onChange={e => setP({ ...p, daw: e.target.value as never })}>
              <option value="none">Ainda não escolhi</option>
              {raw().daw_software.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Gênero">
            <select className="input" value={p.genre} onChange={e => setP({ ...p, genre: e.target.value })}>
              <option value="">—</option>
              {raw().genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Toggle checked={p.mode === 'beginner'} onChange={v => setP({ ...p, mode: v ? 'beginner' : 'advanced' })} label={p.mode === 'beginner' ? '🌱 Modo Iniciante (simplificado)' : '🎛 Modo Avançado'} />
          <Toggle checked={p.publicPortfolio} onChange={v => setP({ ...p, publicPortfolio: v })} label="Portfólio público" />
          <Button size="sm" className="ml-auto" onClick={() => {
            try { updateProfile(user.id, p); pushToast('Perfil atualizado.', 'success'); refresh() } catch (e) { pushToast(e instanceof Error ? e.message : 'Erro', 'error') }
          }}>Salvar</Button>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-500">Modo Avançado libera a leitura densa (sem "explique de forma simples" padrão), conteúdo de síntese avançada, multibanda e workflow pro. Você nunca perde aulas — o modo muda <i>como</i> apresenta.</p>
      </Card>

      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400"><Languages size={14} /> Idioma</h2>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map(l => <button key={l.id} className={getLocale() === l.id ? 'chip border-brand/60 bg-brand-soft text-white' : 'chip'} onClick={() => { setLocale(l.id as Locale); track('locale_changed', { locale: l.id }); window.location.reload() }}>{l.label}</button>)}
        </div>
        <p className="text-[11px] text-zinc-500">Interface em pt-BR/en/es via dicionários i18n; conteúdo educacional tem coluna <code className="rounded bg-white/10 px-1">locale</code> no banco (arquitetura pronta para catálogo completo em cada idioma).</p>
      </Card>

      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400"><Bell size={14} /> Notificações & consentimento (LGPD)</h2>
        <Toggle checked={consent.analytics} onChange={v => { saveConsent(user.id, { analytics: v }); refresh() }} label="Métricas de uso/anônimas (melhorar o app)" />
        <Toggle checked={consent.marketing} onChange={v => { saveConsent(user.id, { marketing: v }); refresh() }} label="Novidades e ofertas por e-mail" />
        <Toggle checked={consent.cookies} onChange={v => { saveConsent(user.id, { cookies: v }); refresh() }} label="Cookies de analytics de terceiros (GA4/Pixel) — só ativam com aceite" />
        <p className="text-[11px] leading-relaxed text-zinc-500">Sem "dark pattern": deslizar qualquer toggle revoga imediatamente. Analytics do produto (eventos locais) funciona independente — eles ficam no seu dispositivo em modo demo.</p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Segurança da conta</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Senha atual"><input className="input" type="password" value={cur} onChange={e => setCur(e.target.value)} /></Field>
          <Field label="Nova senha (8+)"><input className="input" type="password" value={next} onChange={e => setNext(e.target.value)} /></Field>
        </div>
        <Button size="sm" variant="ghost" disabled={!next} onClick={() => {
          changePassword(user.id, cur, next).then(() => { pushToast('Senha alterada.', 'success'); setCur(''); setNext('') }).catch(e => pushToast(e.message, 'error'))
        }}>Alterar senha</Button>
      </Card>

      <Card className="space-y-3 border-rose-500/25">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-rose-300">Seus dados (LGPD · portabilidade & exclusão)</h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={() => { downloadText(`sonora-dados-${user.email}.json`, exportUserData(user.id), 'application/json'); track('data_export') }}><Download size={14} /> Exportar tudo (JSON)</Button>
          {!delConfirm
            ? <Button size="sm" variant="danger" onClick={() => setDelConfirm('confirm')}><Trash2 size={14} /> Excluir minha conta</Button>
            : (
              <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                <span className="text-[12px] text-rose-100">Digite <b>EXCLUIR</b> para confirmar — remove conta, progresso, publicações e dados (posts viram "usuário removido").</span>
                <input className="input !w-40 !py-1.5 !text-[12px]" value={delConfirm === 'confirm' ? '' : delConfirm.slice(8)} onChange={e => setDelConfirm('confirm:' + e.target.value.toUpperCase())} placeholder="EXCLUIR" />
                <Button size="sm" variant="danger" disabled={!delConfirm.endsWith(':EXCLUIR')} onClick={() => {
                  import('@/services/lgpd').then(m => { m.deleteAccount(user.id); localStorage.removeItem('sonora.session'); track('account_deleted'); window.location.href = '/' })
                }}>Confirmar exclusão</Button>
                <Button size="sm" variant="ghost" onClick={() => setDelConfirm('')}>Cancelar</Button>
              </div>
            )}
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-500">Retenção: progresso e logs anonimizados podem sobreviver à anonimização conforme a lei (obrigações fiscais para pagamentos: 5 anos). Em produção, exclusão roda em job server-side com trilha de auditoria.</p>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-zinc-500">Conta: {user.email} · perfil {user.role === 'admin' ? <Badge tone="danger">admin</Badge> : <Badge tone="info">aluno</Badge>}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => navigate('/app/portefolio')}>Ver portfólio</Button>
          {user.role === 'admin' && <Button size="sm" variant="soft" onClick={() => navigate('/admin')}>Painel admin</Button>}
        </div>
      </Card>
    </div>
  )
}
