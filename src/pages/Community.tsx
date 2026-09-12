import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Heart, MessageCircle, Star, Flag, Shield, CornerDownLeft } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Badge, Button, Modal, Empty } from '@/components/ui'
import { COMMUNITY_CATEGORIES, listPosts, getPost, listComments, createPost, createComment, toggleLike, toggleFavorite, reportPost } from '@/services/community'
import { useApp } from '@/store/app'
import { track } from '@/services/analytics'
import { cn, formatDate } from '@/lib/utils'

export default function CommunityPage({ thread = false }: { thread?: boolean }) {
  return thread ? <Thread /> : <Feed />
}

function Feed() {
  const { user } = useApp()
  const navigate = useNavigate()
  const [cat, setCat] = useState<string>('')
  const [q, setQ] = useState('')
  const [compose, setCompose] = useState(false)
  const posts = useMemo(() => listPosts(cat || undefined, q || undefined), [cat, q])

  return (
    <div>
      <PageHeader title="Comunidade" sub="Dúvidas, presets, workflow e feedback — organizado por DAW, gênero e tema." actions={<Button size="sm" onClick={() => (user ? setCompose(true) : navigate('/entrar'))}>✏️ Novo post</Button>} />
      <input className="input mb-3" placeholder="Buscar na comunidade…" value={q} onChange={e => setQ(e.target.value)} />
      <div className="hide-scroll mb-4 flex gap-1.5 overflow-x-auto pb-1">
        <button className={cn('chip whitespace-nowrap', !cat && 'border-brand/60 bg-brand-soft text-white')} onClick={() => setCat('')}>Tudo</button>
        {COMMUNITY_CATEGORIES.map(c => (
          <button key={c} className={cn('chip whitespace-nowrap transition', cat === c && 'border-brand/60 bg-brand-soft text-white')} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {posts.length === 0 ? (
        <Empty title="Nenhum post aqui ainda" hint="Seja a primeira pessoa a abrir um tópico nesta categoria — a comunidade é feita de quem pergunta e de quem responde." action={<Button size="sm" onClick={() => setCompose(true)}>Escrever primeiro post</Button>} />
      ) : (
        <div className="space-y-3">
          {posts.map(p => (
            <Card key={p.id} className="transition hover:border-brand/30" onClick={() => navigate(`/app/comunidade/${p.id}`)}>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <Badge tone="brand">#{p.category}</Badge>
                <span className="font-bold text-zinc-300">{p.authorName}</span>
                <span className="text-zinc-600">· {formatDate(p.createdAt.slice(0, 10))}</span>
                <span className="ml-auto flex items-center gap-3 text-zinc-500">
                  <span className="flex items-center gap-1"><Heart size={12} className={p.likes.includes(user?.id ?? '') ? 'fill-rose-400 text-rose-400' : ''} /> {p.likes.length}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> {listComments(p.id).length}</span>
                  {p.reports.some(r => !r.resolved) && <Badge tone="warn">em moderação</Badge>}
                </span>
              </div>
              <h3 className="mt-2 text-[15px] font-extrabold text-white">{p.title}</h3>
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-zinc-400">{p.body}</p>
              {p.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{p.tags.map(t => <span key={t} className="rounded-full bg-white/[.05] px-2 py-0.5 text-[10px] text-zinc-500">#{t}</span>)}</div>}
            </Card>
          ))}
        </div>
      )}
      <p className="mt-5 text-center text-[11px] leading-relaxed text-zinc-600">
        Conduta: feedback ataca a música, não a pessoa. Sem conteúdo protegido — samples/presets compartilhados precisam de licença. Denúncias caem na fila do painel (admin). <Link to="/app/feedback-tracks" className="hidden">-</Link>
      </p>
      <Modal open={compose} onClose={() => setCompose(false)} title="Novo post na comunidade" wide>
        <Composer onDone={id => { setCompose(false); navigate(`/app/comunidade/${id}`) }} />
      </Modal>
    </div>
  )
}

function Composer({ onDone }: { onDone: (id: string) => void }) {
  const { user, pushToast } = useApp()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [cat, setCat] = useState<string>('Produção')
  const [tags, setTags] = useState('')
  const [err, setErr] = useState<string | null>(null)
  return (
    <div className="space-y-3">
      <select className="input" value={cat} onChange={e => setCat(e.target.value)}>{COMMUNITY_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
      <input className="input" placeholder="Título específico (ex.: sidechain embolando em 145 BPM)" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea className="input min-h-36" placeholder="Contexto, o que você tentou, o que espera de feedback… Quanto mais específico, melhor a resposta." value={body} onChange={e => setBody(e.target.value)} />
      <input className="input" placeholder="tags separadas por vírgula (psy, sidechain)" value={tags} onChange={e => setTags(e.target.value)} />
      {err && <p className="text-[12px] text-rose-300">{err}</p>}
      <Button className="w-full" onClick={() => {
        try {
          const p = createPost(user!.id, { category: cat, title, body, tags: tags.split(',').map(t => t.trim()) })
          track('community_post_created', { category: cat })
          pushToast('Post publicado na comunidade 🎧')
          onDone(p.id)
        } catch (e) { setErr(e instanceof Error ? e.message : 'Erro.') }
      }}>Publicar</Button>
    </div>
  )
}

function Thread() {
  const { postId = '' } = useParams()
  const { user, pushToast, refresh } = useApp()
  const post = getPost(postId)
  const [reply, setReply] = useState('')
  const [report, setReport] = useState(false)
  const [reportText, setReportText] = useState('')
  const comments = useMemo(() => (post ? listComments(post.id) : []), [post])
  if (!post) return <Empty title="Post não encontrado" action={<Link to="/app/comunidade" className="link">← Comunidade</Link>} />
  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/app/comunidade" className="text-[13px] text-zinc-400 hover:text-white">← Comunidade</Link>
      <Card>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <Badge tone="brand">#{post.category}</Badge>
          <span className="font-bold text-zinc-300">{post.authorName}</span>
          <span className="text-zinc-600">· {formatDate(post.createdAt.slice(0, 10))}</span>
          <div className="ml-auto flex gap-1">
            <button title="Reportar" onClick={() => setReport(true)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white"><Flag size={14} /></button>
            <button title={post.favorites.includes(user.id) ? 'Remover dos favoritos' : 'Favoritar'} onClick={() => { toggleFavorite(user.id, post.id); refresh() }} className={cn('rounded-lg p-1.5 hover:bg-white/10', post.favorites.includes(user.id) ? 'text-amber-300' : 'text-zinc-500 hover:text-white')}><Star size={14} className={post.favorites.includes(user.id) ? 'fill-amber-300' : ''} /></button>
          </div>
        </div>
        <h1 className="mt-2 text-lg font-black text-white">{post.title}</h1>
        <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-zinc-300">{post.body}</p>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={() => { toggleLike(user.id, post.id); refresh() }} className={cn('chip transition', post.likes.includes(user.id) && 'border-rose-400/40 text-rose-300')}>
            <Heart size={12} className={post.likes.includes(user.id) ? 'fill-rose-400 text-rose-400' : ''} /> {post.likes.length}
          </button>
          {post.tags.map(t => <span key={t} className="rounded-full bg-white/[.05] px-2 py-0.5 text-[10px] text-zinc-500">#{t}</span>)}
        </div>
      </Card>

      <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">{comments.length} resposta(s)</h2>
      <div className="space-y-3">
        {comments.map(c => (
          <Card key={c.id} className="!p-4">
            <div className="flex items-center gap-2 text-[11px]"><CornerDownLeft size={12} className="text-zinc-600" /><span className="font-bold text-zinc-300">{c.authorName}</span><span className="text-zinc-600">· {formatDate(c.createdAt.slice(0, 10))}</span></div>
            <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-zinc-300">{c.body}</p>
          </Card>
        ))}
        <Card className="!p-3">
          <textarea className="input min-h-20 !border-0 !bg-transparent focus:!ring-0" placeholder={user ? 'Responda com contexto: o que tentou, o que ouviu, prints ajudam.' : 'Entre para responder.'} value={reply} onChange={e => setReply(e.target.value)} disabled={!user} />
          {user && <div className="flex justify-end"><Button size="sm" disabled={reply.trim().length < 4} onClick={() => {
            createComment(user.id, post.id, reply)
            track('community_comment_created', {})
            setReply(''); pushToast('Resposta publicada.', 'success'); refresh()
          }}>Responder</Button></div>}
        </Card>
      </div>

      <Modal open={report} onClose={() => setReport(false)} title="Denunciar post">
        <p className="text-[13px] text-zinc-400">Descreva o motivo (conteúdo protegido, assédio, spam). A fila aparece no painel de moderação com o selo <Shield size={12} className="inline" />.</p>
        <textarea className="input mt-3 min-h-24" value={reportText} onChange={e => setReportText(e.target.value)} placeholder="Motivo…" />
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setReport(false)}>Cancelar</Button>
          <Button variant="danger" disabled={reportText.trim().length < 5} onClick={() => { reportPost(user!.id, post.id, reportText); setReport(false); pushToast('Denúncia enviada para moderação.', 'info') }}>Enviar</Button>
        </div>
      </Modal>
    </div>
  )
}
