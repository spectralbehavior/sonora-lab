import { Link } from 'react-router-dom'
import { Award, Trophy, Image as ImageIcon, Flame, Settings, FolderHeart, Wand2, Radio, UserCircle2, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui'
import { WaveBars } from '@/components/visuals'
import { useApp } from '@/store/app'
import { DAW_LABEL, LEVEL_LABEL } from '@/components/learn'
import type { DawId, Level } from '@/types'
import { getGenre } from '@/services/content'
import { raw } from '@/lib/db'
import { isDemoMode } from '@/lib/supabase'
import { resetDb } from '@/lib/db'

export default function MePage() {
  const { user, stats, plan } = useApp()
  if (!user || !stats) return null
  const username = user.profile.username ?? user.id.slice(0, 8)
  const links = [
    { to: '/app/portefolio', icon: ImageIcon, label: 'Meu Portfólio', hint: 'página pública de artista' },
    { to: '/app/certificados', icon: Award, label: 'Certificados', hint: 'emitir / verificar' },
    { to: '/app/desafios', icon: Trophy, label: 'Desafios & conquistas', hint: `${stats.achievements.filter(a => a.earnedAt).length} obtidas` },
    { to: '/app/evolucao', icon: Flame, label: 'Minha Evolução', hint: 'linha do tempo' },
    { to: '/app/estudio', icon: FolderHeart, label: 'Meu Estúdio', hint: 'ideias, sessões, metas' },
    { to: '/app/finish', icon: Wand2, label: 'Finish a Track', hint: 'o programa de 7 dias' },
    { to: '/app/comunidade', icon: Radio, label: 'Comunidade', hint: 'posts e feedback' },
    { to: '/app/configuracoes', icon: Settings, label: 'Configurações', hint: 'LGPD, senha, DAW' },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="glass overflow-hidden rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-neon-cyan text-2xl font-black text-white">{user.name[0]?.toUpperCase()}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-black text-white">{user.profile.artistName || user.name}</h1>
              <Badge tone="brand">{stats.levelName}</Badge>
              {user.role === 'admin' && <Badge tone="danger"><ShieldCheck size={11} /> admin</Badge>}
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-zinc-500">@{username} · /produtor/{username}</p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
              <Badge tone={user.profile.publicPortfolio ? 'success' : 'default'}>{user.profile.publicPortfolio ? 'portfólio público' : 'portfólio privado'}</Badge>
              {user.profile.daw && user.profile.daw !== 'none' && <Badge tone="info">🎛 {DAW_LABEL[user.profile.daw as DawId]}</Badge>}
              {user.profile.genre && <Badge tone="info">🎧 {getGenre(user.profile.genre)?.name}</Badge>}
              <Badge>{LEVEL_LABEL[user.profile.level as Level] ?? 'Iniciante'}</Badge>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2 text-center">
          {[[stats.xp, 'XP'], [stats.lessons, 'aulas'], [stats.projects, 'projetos'], [stats.streak.current, 'dias 🔥']].map(([v, l]) => (
            <div key={l as string} className="rounded-xl border border-white/[.07] bg-night-800 py-2.5">
              <div className="text-lg font-black text-white">{v as number}</div>
              <div className="text-[9px] uppercase tracking-wider text-zinc-500">{l as string}</div>
            </div>
          ))}
        </div>
        <WaveBars n={24} className="mt-4 !h-6" seed={user.id.length * 13 + stats.xp} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/app/portefolio" className="btn-primary btn-sm flex-1"><UserCircle2 size={14} /> Editar identidade pública</Link>
          {plan?.id === 'free' && <Link to="/app/checkout/pro" className="btn-ghost btn-sm flex-1">⚡ Assinar Pro</Link>}
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {links.map(l => (
          <Link key={l.to} to={l.to} className="card flex items-center gap-3 p-3.5 transition hover:border-brand/40">
            <l.icon size={17} className="shrink-0 text-brand-300" />
            <span className="flex-1 text-[13px] font-bold text-zinc-200">{l.label}</span>
            <span className="text-[10px] text-zinc-500">{l.hint}</span>
          </Link>
        ))}
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-2 p-4 text-[11px] text-zinc-500">
        <span>Conta criada {new Date(raw().users.find(u => u.id === user.id)?.createdAt ?? '').toLocaleDateString('pt-BR')} · plano {plan?.name}</span>
        {isDemoMode() && (
          <button className="link" onClick={() => { resetDb(); window.location.reload() }}>♻ resetar dados demo deste navegador</button>
        )}
      </div>
    </div>
  )
}
