import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Globe, GlobeLock, Plus, Disc3, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Badge, Button, Field, Empty, Md } from '@/components/ui'
import { MarketingShell } from '@/components/shell'
import { useApp } from '@/store/app'
import { updateProfile } from '@/services/auth'
import { listTracks, createTrack, updateTrackStatus, addTrackFeedback, publicTracks } from '@/services/studio'
import { myCertificates } from '@/services/certificates'
import { getGenre, getDaw } from '@/services/content'
import { track as trackEvent } from '@/services/analytics'
import { formatDate, cn } from '@/lib/utils'
import { raw } from '@/lib/db'
import type { TrackRow } from '@/types'

const STATUS_LABEL: Record<TrackRow['status'], string> = { ideia: '💡 Ideia', producao: '🎛 Em produção', mix: '🎚 Na mix', master: '💿 No master', finalizada: '🏆 Finalizada' }

export default function PortfolioPage() {
  const { user, pushToast, refresh, stats } = useApp()
  if (!user) return null
  const tracks = listTracks(user.id)
  const certs = myCertificates(user.id)
  const [username, setUsername] = useState(user.profile.username ?? '')
  const [bio, setBio] = useState(user.profile.bio ?? '')
  const [artist, setArtist] = useState(user.profile.artistName ?? '')

  return (
    <div className="space-y-5">
      <PageHeader title="Meu portfólio" sub="Sua vitrine de produtor — preparada para virar rede profissional de músicos." actions={<Badge tone={user.profile.publicPortfolio ? 'success' : 'default'}>{user.profile.publicPortfolio ? <><Globe size={11} /> público</> : <><GlobeLock size={11} /> privado</>}</Badge>} />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Identidade do projeto</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Nome artístico"><input className="input" value={artist} onChange={e => setArtist(e.target.value)} placeholder="Ex.: KAUR, LUSA…" /></Field>
            <Field label="@username (URL /produtor/…)"><input className="input font-mono" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_.-]/gi, '').toLowerCase())} placeholder="seu-nome" /></Field>
          </div>
          <Field label="Biografia (2–4 linhas)">
            <textarea className="input min-h-24" value={bio} onChange={e => setBio(e.target.value)} placeholder="O que você produz, referências, o que procura (collabs, gigs, selos)…" />
          </Field>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => {
              try { updateProfile(user.id, { username, bio, artistName: artist, publicPortfolio: !user.profile.publicPortfolio }); trackEvent('portfolio_updated'); pushToast('Portfólio atualizado.', 'success'); refresh() } catch (e) { pushToast(e instanceof Error ? e.message : 'Erro.', 'error') }
            }}>Salvar & {user.profile.publicPortfolio ? 'manter' : 'publicar'}</Button>
            <span className="text-[11px] text-zinc-500">Visibilidade alterna a cada "Salvar" · {user.profile.publicPortfolio ? 'despublique se quiser' : 'salvar publica'}</span>
            {user.profile.username && user.profile.publicPortfolio && (
              <Link to={`/produtor/${user.profile.username}`} className="btn-ghost btn-sm ml-auto"><ExternalLink size={13} /> Ver página pública</Link>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Snapshot</div>
            <div className="mt-2 space-y-1.5 text-[13px] text-zinc-300">
              <div>DAW: <b className="text-white">{getDaw(user.profile.daw)?.name ?? '—'}</b></div>
              <div>Gênero: <b className="text-white">{getGenre(user.profile.genre)?.name ?? '—'}</b></div>
              <div>Nível: <b className="text-white">{stats?.levelName}</b> · {stats?.xp} XP</div>
              <div>Tracks: <b className="text-white">{tracks.filter(t => t.status === 'finalizada').length} finalizadas</b> / {tracks.length} registradas</div>
              <div>Certificados: <b className="text-white">{certs.length}</b></div>
            </div>
          </Card>
          <Card>
            <div className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Conquistas públicas</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {stats!.achievements.filter(a => a.earnedAt).length === 0 && <span className="text-[12px] text-zinc-500">Nenhuma ainda — a primeira chega rápido.</span>}
              {stats!.achievements.filter(a => a.earnedAt).slice(0, 8).map(a => <Badge key={a.def.id} tone="brand">{a.def.icon} {a.def.title}</Badge>)}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Catálogo de tracks</h2>
          <AddTrack />
        </div>
        <div className="mt-3 space-y-2.5">
          {tracks.length === 0 && <Empty title="Nenhuma track registrada" hint="Registre suas produções (nome, BPM, key, status). Ao concluir o Projeto 05, ela aparece aqui automaticamente." />}
          {tracks.map(t => <TrackCard key={t.id} t={t} editable />)}
        </div>
      </Card>

      {certs.length > 0 && (
        <Card>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Certificados exibidos</h2>
          <div className="mt-2 flex flex-wrap gap-2">{certs.map(c => <Link key={c.id} to={`/certificado/${c.id}`} className="chip hover:border-brand/50 hover:text-white">📜 {c.courseTitle}</Link>)}</div>
        </Card>
      )}
    </div>
  )
}

function AddTrack() {
  const { user, pushToast, refresh } = useApp()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const genres = raw().genres
  const [genre, setGenre] = useState(user?.profile.genre ?? 'techno')
  const [bpm, setBpm] = useState('')
  const [key, setKey] = useState('')
  return (
    <>
      <Button size="sm" variant="soft" onClick={() => setOpen(o => !o)}><Plus size={14} /> Nova track</Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <Card className="w-full max-w-md !p-5" onClick={() => undefined}>
            <div onClick={e => e.stopPropagation()}>
              <h3 className="text-base font-extrabold text-white">Registrar track</h3>
              <div className="mt-3 space-y-2.5">
                <input className="input" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                  <select className="input" value={genre} onChange={e => setGenre(e.target.value)}>{genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
                  <input className="input" placeholder="BPM" inputMode="numeric" value={bpm} onChange={e => setBpm(e.target.value.replace(/\D/g, ''))} />
                  <input className="input" placeholder="Key" value={key} onChange={e => setKey(e.target.value)} />
                </div>
                <Button className="w-full" onClick={() => {
                  createTrack(user!.id, { title, genreId: genre, bpm: bpm ? +bpm : undefined, musicalKey: key || undefined })
                  trackEvent('track_uploaded', { via: 'manual' })
                  pushToast('Track registrada no estúdio 🎛', 'success'); setTitle(''); setOpen(false); refresh()
                }}>Adicionar</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

export function TrackCard({ t, editable = false }: { t: TrackRow; editable?: boolean }) {
  const { user, pushToast, refresh } = useApp()
  const [fb, setFb] = useState('')
  const [kind, setKind] = useState<'tecnica' | 'musical'>('tecnica')
  const genre = getGenre(t.genreId)
  const flow: TrackRow['status'][] = ['ideia', 'producao', 'mix', 'master', 'finalizada']
  const next = flow[Math.min(flow.indexOf(t.status) + 1, flow.length - 1)]
  return (
    <div className="rounded-xl border border-white/[.07] bg-night-800 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Disc3 size={15} className="text-brand-300" />
        <span className="text-sm font-extrabold text-white">{t.title}</span>
        <Badge tone={t.status === 'finalizada' ? 'success' : 'warn'}>{STATUS_LABEL[t.status]}</Badge>
        <span className="ml-auto text-[10px] text-zinc-500">{genre?.name} · {t.bpm ?? '—'} BPM · {t.musicalKey ?? '—'} · v{t.versions.length}</span>
      </div>
      {t.feedback.length > 0 && (
        <div className="mt-2.5 space-y-1.5">
          {t.feedback.map((f, i) => {
            const name = raw().users.find(u => u.id === f.userId)?.name ?? f.userId
            return <div key={i} className="rounded-lg border border-white/[.06] bg-white/[.02] px-3 py-2 text-[12px] leading-relaxed text-zinc-400"><b className="text-zinc-200">{name}</b> <Badge tone={f.kind === 'tecnica' ? 'info' : 'brand'}>{f.kind}</Badge> · {f.text}</div>
          })}
        </div>
      )}
      {editable ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {t.status !== 'finalizada' && <Button size="sm" variant="soft" onClick={() => { updateTrackStatus(user!.id, t.id, next); trackEvent('track_status_changed', { status: next }); refresh() }}>Mover → {STATUS_LABEL[next]}</Button>}
          <input className="input !w-auto flex-1 !py-1.5 !text-[12px]" placeholder={kind === 'tecnica' ? 'Anotação técnica (grave, dinâmica, fase…)' : 'Anotação musical (groove, tensão, arranjo…)'} value={fb} onChange={e => setFb(e.target.value)} />
          <select className="input !w-auto !py-1.5 text-[11px]" value={kind} onChange={e => setKind(e.target.value as never)}><option value="tecnica">técnica</option><option value="musical">musical</option></select>
          <Button size="sm" variant="ghost" disabled={fb.trim().length < 10 || !user} onClick={() => {
            try { addTrackFeedback(t.id, user!.id, user!.name, kind, fb); pushToast('Anotação registrada.', 'success'); setFb(''); refresh() } catch (e) { pushToast(e instanceof Error ? e.message : 'Erro', 'error') }
          }}>Registrar</Button>
        </div>
      ) : user ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input className="input !w-auto flex-1 !py-1.5 !text-[12px]" placeholder="Deixe feedback construtivo a este artista…" value={fb} onChange={e => setFb(e.target.value)} />
          <Button size="sm" variant="ghost" disabled={fb.trim().length < 10} onClick={() => {
            try { addTrackFeedback(t.id, user.id, user.name, 'musical', fb); pushToast('Feedback enviado. 🎧', 'success'); setFb(''); refresh() } catch (e) { pushToast(e instanceof Error ? e.message : 'Erro', 'error') }
          }}>Enviar</Button>
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-zinc-500">Entre com sua conta para deixar feedback a este artista.</p>
      )}
    </div>
  )
}

// ── Página pública ───────────────────────────────────────────────────────────

export function ProducerPublicPage() {
  const { username = '' } = useParams()
  const data = publicTracks(username)
  if (!data) return (
    <MarketingShell>
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="text-5xl">🎚️</div>
        <h1 className="mt-4 text-xl font-black text-white">Portfólio não encontrado ou privado</h1>
        <p className="mt-2 text-sm text-zinc-400">O perfil <b className="font-mono text-zinc-200">@{username}</b> não existe ou mantém o portfólio privado.</p>
        <Link to="/criar-conta" className="btn-primary mt-6">Criar meu portfólio</Link>
      </div>
    </MarketingShell>
  )
  const { tracks, profile } = data
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-neon-cyan text-xl font-black text-white">{(profile.artistName ?? profile.name ?? 'P')[0]}</div>
            <div>
              <h1 className="text-xl font-black text-white">{profile.artistName ?? profile.name}</h1>
              <p className="text-[12px] text-zinc-500">@{profile.username} · {getDaw(profile.daw)?.name ?? '—'} · {getGenre(profile.genre)?.name ?? '—'}</p>
            </div>
            <Badge tone="success" className="ml-auto">portfólio Sonora</Badge>
          </div>
          {profile.bio && <p className="mt-4 text-[13px] leading-relaxed text-zinc-300">{profile.bio}</p>}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-zinc-500">
            {['finalizadas', 'certificados', 'gênero'].map((l, i) => (
              <div key={l} className="rounded-xl border border-white/[.06] bg-night-800 py-2">
                <div className="text-lg font-black text-white">{i === 0 ? tracks.filter(t => t.status === 'finalizada').length : i === 1 ? myCertificates(profile.userId).length : getGenre(profile.genre)?.name?.split(' ')[0]}</div>
                {l}
              </div>
            ))}
          </div>
        </div>

        <h2 className="mb-3 mt-8 text-sm font-extrabold uppercase tracking-wider text-zinc-400">Catálogo público</h2>
        <div className="space-y-2.5">
          {tracks.length === 0 && <Md className="!text-[13px] !text-zinc-500" text="O artista ainda não publicou faixas neste portfólio." />}
          {tracks.map(t => <TrackCard key={t.id} t={t} />)}
        </div>
        <div className={cn('mt-8 rounded-2xl border border-brand/25 bg-brand-soft p-5 text-center')}>
          <div className="text-sm font-extrabold text-white">Produza como {profile.artistName ?? 'este artista'}</div>
          <p className="mx-auto mt-1 max-w-md text-[12px] leading-relaxed text-zinc-400">Portfólios assim nascem do método: aulas, projetos e feedback até a música sair do seu head.</p>
          <Link to="/criar-conta" className="btn-primary btn-sm mt-3">Começar a produzir</Link>
        </div>
        <p className="mt-4 text-center text-[10px] text-zinc-600">Estrutura preparada para a rede profissional de produtores (Fase 5): perfis, releases e collabs.</p>
      </div>
    </MarketingShell>
  )
}
