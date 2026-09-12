import { useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, GraduationCap, FolderKanban, Sparkles, User as UserIcon, Bell, Flame,
  BookOpen, Trophy, Award, Images, Settings, LogOut, Shield, Wand2, AudioLines, Menu, X, Repeat,
} from 'lucide-react'
import { brand } from '@/config/brand'
import { isDemoMode } from '@/lib/supabase'
import { Logo, WaveBars } from '@/components/visuals'
import { useApp } from '@/store/app'
import { cn } from '@/lib/utils'
import { ProgressBar, Badge } from '@/components/ui'

export function DemoBanner() {
  if (!isDemoMode()) return null
  return (
    <div className="border-b border-amber-500/20 bg-amber-500/[.07] px-4 py-1.5 text-center text-[11px] font-medium text-amber-200/90">
      Modo demonstração local — auth, pagamentos e IA rodam no dispositivo com dados de exemplo. Deploy com Supabase: docs/DEPLOY.md. <Link to="/planos" className="underline">Ver planos</Link>
    </div>
  )
}

export function MarketingShell({ children }: { children: ReactNode }) {
  const { user } = useApp()
  const nav = [
    { to: '/#como-funciona', label: 'Como funciona' },
    { to: '/daws', label: 'FL × Ableton × Cubase' },
    { to: '/#metodo', label: 'Método' },
    { to: '/planos', label: 'Planos' },
    { to: '/#comunidade', label: 'Comunidade' },
  ]
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-screen flex-col bg-night-900">
      <DemoBanner />
      <header className="sticky top-0 z-40 border-b border-white/[.06] bg-night-900/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" aria-label={brand.name}><Logo /></Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map(n => (
              <Link key={n.to} to={n.to} className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/[.05] hover:text-white">{n.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/app" className="btn-primary !px-4 !py-2 text-sm">Abrir o app</Link>
            ) : (
              <>
                <Link to="/entrar" className="btn-ghost !px-3.5 !py-2 text-sm hidden sm:inline-flex">Entrar</Link>
                <Link to="/criar-conta" className="btn-primary !px-4 !py-2 text-sm">Começar grátis</Link>
              </>
            )}
            <button className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 lg:hidden" onClick={() => setOpen(o => !o)} aria-label="Menu"><Menu size={20} /></button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-white/[.06] bg-night-850 px-4 py-3 lg:hidden">
            {nav.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5">{n.label}</Link>
            ))}
            <Link to="/entrar" className="block rounded-lg px-3 py-2.5 text-sm text-zinc-400">Entrar</Link>
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}

export function MarketingFooter() {
  const cols: { title: string; links: { to: string; label: string }[] }[] = [
    { title: 'Plataforma', links: [
      { to: '/#como-funciona', label: 'Como funciona' }, { to: '/planos', label: 'Planos' },
      { to: '/daws', label: 'Escolher DAW' }, { to: '/#mentor', label: 'AI Music Mentor' },
    ] },
    { title: 'Trilhas', links: [
      { to: '/fl-studio', label: 'FL Studio' }, { to: '/ableton-live', label: 'Ableton Live' },
      { to: '/cubase', label: 'Cubase' }, { to: '/psytrance', label: 'Psytrance' }, { to: '/techno', label: 'Techno' }, { to: '/house', label: 'House' },
    ] },
    { title: 'Aprender', links: [
      { to: '/producao-musical', label: 'Produção musical' }, { to: '/mixagem', label: 'Mixagem' },
      { to: '/masterizacao', label: 'Masterização' }, { to: '/sound-design', label: 'Sound design' },
      { to: '/como-produzir-musica', label: 'Como produzir música' },
    ] },
    { title: 'Legal', links: [
      { to: '/privacidade', label: 'Política de Privacidade' }, { to: '/termos', label: 'Termos de Uso' }, { to: '/cookies', label: 'Política de Cookies' },
    ] },
  ]
  return (
    <footer className="border-t border-white/[.06] bg-night-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">{brand.heroSub}</p>
          <div className="mt-4 flex gap-3 text-zinc-500">
            <a href={brand.social.instagram} aria-label="Instagram" className="transition hover:text-white"><Images size={18} /></a>
            <a href={brand.social.youtube} aria-label="YouTube" className="transition hover:text-white"><PlayDot /></a>
            <a href={brand.social.discord} aria-label="Discord" className="transition hover:text-white"><Menu size={18} /></a>
          </div>
        </div>
        {cols.map(c => (
          <div key={c.title}>
            <div className="mb-3 text-xs font-extrabold uppercase tracking-widest text-zinc-400">{c.title}</div>
            <ul className="space-y-2">
              {c.links.map(l => <li key={l.to}><Link to={l.to} className="text-sm text-zinc-500 transition hover:text-white">{l.label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[.05] px-4 py-5 text-center text-[11px] text-zinc-600">
        © {new Date().getFullYear()} {brand.legalName} · CNPJ 00.000.000/0001-00 · {brand.supportEmail} — {brand.name} não possui vínculo com Image-Line, Ableton ou Steinberg; marcas citadas pertencem aos seus detentores. Conteúdo DAW é versionado e pode mudar conforme releases.
      </div>
    </footer>
  )
}

const PlayDot = () => <span className="text-[18px] leading-none">▶</span>

// ── Shell do app (mobile-first) ──────────────────────────────────────────────

export function AppShell({ children }: { children: ReactNode }) {
  const { user, stats, plan, unread, notifications, markRead, doLogout } = useApp()
  const nav = useNavigate()
  const loc = useLocation()
  const [menu, setMenu] = useState(false)
  const [notifs, setNotifs] = useState(false)

  if (!user) return null
  const tabs = [
    { to: '/app', label: 'Home', icon: Home },
    { to: '/app/aprender', label: 'Aprender', icon: GraduationCap },
    { to: '/app/projetos', label: 'Projetos', icon: FolderKanban },
    { to: '/app/mentor', label: 'AI Mentor', icon: Sparkles },
    { to: '/app/me', label: 'Perfil', icon: UserIcon },
  ]
  const extra = [
    { to: '/app/roadmap', label: 'Roadmap', icon: BookOpen },
    { to: '/app/desafios', label: 'Desafios', icon: Trophy },
    { to: '/app/comunidade', label: 'Comunidade', icon: Images },
    { to: '/app/biblioteca', label: 'Biblioteca', icon: Repeat },
    { to: '/app/estudio', label: 'Meu Estúdio', icon: AudioLines },
    { to: '/app/finish', label: 'Finish a Track', icon: Wand2 },
    { to: '/app/analyzer', label: 'Track Analyzer', icon: AudioLines },
    { to: '/app/certificados', label: 'Certificados', icon: Award },
    { to: '/app/evolucao', label: 'Minha Evolução', icon: Flame },
    { to: '/app/portefolio', label: 'Meu Portfólio', icon: Images },
    { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
    ...(user.role === 'admin' ? [{ to: '/admin', label: 'Painel Admin', icon: Shield }] : []),
  ]
  const active = (to: string) => loc.pathname === to || (to !== '/app' && loc.pathname.startsWith(to))

  return (
    <div className="flex min-h-screen flex-col bg-night-950 pb-20 lg:pb-0">
      <DemoBanner />
      <header className="sticky top-0 z-40 border-b border-white/[.06] bg-night-900/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 lg:hidden" onClick={() => setMenu(m => !m)} aria-label="Menu"><Menu size={20} /></button>
            <Link to="/app"><Logo compact /></Link>
            <span className="hidden text-sm font-black tracking-tight text-white sm:block">{brand.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {stats && (
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 sm:flex" title={`Nível ${stats.levelName} · ${stats.xp} XP`}>
                <Flame size={14} className={cn(stats.streak.current > 0 ? 'text-amber-400' : 'text-zinc-500')} />
                <span className="text-xs font-bold text-zinc-200">{stats.streak.current}d</span>
                <span className="mx-1 h-4 w-px bg-white/10" />
                <span className="text-xs font-extrabold text-brand-300">{stats.xp} XP</span>
                <span className="text-[10px] font-semibold text-zinc-500">· {stats.levelName}</span>
              </div>
            )}
            {plan && plan.id !== 'free' && <Badge tone="brand" className="hidden sm:inline-flex">{plan.name}</Badge>}
            <div className="relative">
              <button className="relative rounded-lg p-2 text-zinc-300 hover:bg-white/10" onClick={() => { setNotifs(n => !n); }} aria-label="Notificações">
                <Bell size={18} />
                {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">{unread}</span>}
              </button>
              {notifs && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-white/10 bg-night-800 p-2 shadow-panel">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-xs font-bold uppercase tracking-wide text-zinc-400">Notificações</span>
                    <button className="text-[11px] text-brand-300 hover:underline" onClick={() => markRead()}>marcar lidas</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 && <div className="px-3 py-6 text-center text-xs text-zinc-500">Nada por aqui ainda. Produza algo! 🎛️</div>}
                    {notifications.map(n => (
                      <div key={n.id} className={cn('rounded-lg px-3 py-2 text-[13px] leading-snug', n.read ? 'text-zinc-500' : 'text-zinc-200')}>{n.text}<div className="mt-0.5 text-[10px] text-zinc-600">{new Date(n.ts).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => { doLogout(); nav('/') }} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-rose-300" aria-label="Sair"><LogOut size={18} /></button>
          </div>
        </div>
        {stats && (
          <div className="mx-auto max-w-6xl px-3 pb-2 sm:hidden">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
              <span className="text-amber-400">🔥 {stats.streak.current}d</span><span>{stats.xp} XP</span><span className="text-brand-300">{stats.levelName}</span>
            </div>
            <ProgressBar value={stats.levelPct} className="mt-1 !h-1" />
          </div>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-0 lg:px-4">
        {/* rail desktop */}
        <aside className="sticky top-[76px] hidden h-fit w-56 shrink-0 flex-col gap-1 py-4 lg:flex">
          {tabs.concat(extra).map(t => (
            <Link key={t.to} to={t.to} className={cn('flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition', active(t.to) ? 'bg-brand-soft text-white' : 'text-zinc-400 hover:bg-white/[.04] hover:text-white')}>
              <t.icon size={16} className={active(t.to) ? 'text-brand-300' : ''} /> {t.label}
            </Link>
          ))}
        </aside>
        <main className="min-w-0 flex-1 px-4 py-5 lg:py-6">{children}</main>
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={() => setMenu(false)}>
          <div className="toast-in h-full w-72 overflow-y-auto border-r border-white/10 bg-night-800 p-4" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><Logo /><button onClick={() => setMenu(false)} aria-label="Fechar"><X size={18} className="text-zinc-400" /></button></div>
            <div className="space-y-1">
              {extra.map(t => (
                <Link key={t.to} to={t.to} onClick={() => setMenu(false)} className={cn('flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium', active(t.to) ? 'bg-brand-soft text-white' : 'text-zinc-300 hover:bg-white/5')}>
                  <t.icon size={16} className="text-brand-300" /> {t.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* bottom nav mobile-first */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[.07] bg-night-900/95 backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto grid max-w-md grid-cols-5">
          {tabs.map(t => (
            <NavLink key={t.to} to={t.to} className={cn('flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition', active(t.to) ? 'text-brand-300' : 'text-zinc-500')}>
              <t.icon size={19} /> {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export function Toasts() {
  const { toasts } = useApp()
  if (!toasts.length) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={cn('toast-in pointer-events-auto max-w-sm rounded-xl border px-4 py-2.5 text-[13px] font-semibold shadow-panel backdrop-blur-xl',
          t.tone === 'error' ? 'border-rose-500/40 bg-rose-950/90 text-rose-100' : t.tone === 'info' ? 'border-cyan-500/40 bg-cyan-950/90 text-cyan-100' : 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100')}>
          {t.text}
        </div>
      ))}
    </div>
  )
}

export function PageHeader({ title, sub, actions }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">{title}</h1>
        {sub && <p className="mt-1 text-[13px] text-zinc-400">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
