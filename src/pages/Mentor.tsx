import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Send, Sparkles, Dumbbell, AlertTriangle, Trophy, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Badge, Button, Md } from '@/components/ui'
import { useApp } from '@/store/app'
import { mentorAnswer, mentorSuggestions, rateLimitCheck, rateLimitBump, type MentorAnswer } from '@/services/mentor'
import { DAW_LABEL } from '@/components/learn'
import { track } from '@/services/analytics'
import type { DawId } from '@/types'

interface Turn { role: 'user' | 'mentor'; text: string; answer?: MentorAnswer; ts: string }

export default function MentorPage() {
  const { user, plan, pushToast } = useApp()
  const [q, setQ] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [turns, thinking])
  if (!user) return null

  const limit = rateLimitCheck(user.id, plan?.id ?? 'free')

  async function ask(text?: string) {
    if (!user) return
    const question = (text ?? q).trim()
    if (!question || thinking) return
    if (!limit.allowed) {
      pushToast(`Limite diário do plano ${plan?.name} atingido (${question.slice(0, 20)}…). O mentor volta amanhã — ou faça upgrade para ilimitado.`, 'info')
      return
    }
    setQ('')
    setTurns(t => [...t, { role: 'user', text: question, ts: new Date().toISOString() }])
    setThinking(true)
    await new Promise(r => setTimeout(r, 450 + Math.random() * 500)) // latência simulada da busca local
    const daw = user.profile.daw && user.profile.daw !== 'none' ? (user.profile.daw as DawId) : null
    const answer = mentorAnswer(question, daw, user.id)
    rateLimitBump(user.id)
    track('ai_mentor_used', { matched: answer.matched, source: answer.source })
    setThinking(false)
    setTurns(t => [...t, { role: 'mentor', text: answer.text, answer, ts: new Date().toISOString() }])
  }

  return (
    <div className="flex h-[calc(100dvh-150px)] min-h-[520px] flex-col lg:h-[calc(100dvh-120px)]">
      <PageHeader
        title={<span className="flex items-center gap-2"><Sparkles size={20} className="text-brand-300" /> AI Music Mentor</span>}
        sub={<span>Contexto: <b className="text-zinc-200">{user.profile.daw === 'none' || !user.profile.daw ? 'sem DAW definida' : DAW_LABEL[user.profile.daw as DawId]}</b> · {limit.remaining} perguntas restantes hoje ({plan?.name ?? 'Free'}) · <Link to="/app/configuracoes" className="link">ajustar perfil</Link></span>}
        actions={<Badge tone="info">base curada · versionada</Badge>}
      />

      <Card className="flex min-h-0 flex-1 flex-col !p-0">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {turns.length === 0 && (
            <div className="mx-auto max-w-xl py-6 text-center">
              <div className="text-4xl">🎧</div>
              <h3 className="mt-3 text-base font-extrabold text-white">Pergunte o que está travando sua música</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
                O mentor responde com o material <b>curado pela equipe editorial</b> — explicação, passo a passo da SUA DAW, exercício, erro comum e desafio.
                Se ele não tem a resposta verificada, ele diz isso em vez de inventar menus.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {mentorSuggestions().map(s => (
                  <button key={s} onClick={() => ask(s)} className="chip transition hover:border-brand/50 hover:text-white">{s}</button>
                ))}
              </div>
            </div>
          )}
          {turns.map((t, i) => (
            <div key={i} className={t.role === 'user' ? 'flex justify-end' : 'flex'}>
              <div className={t.role === 'user' ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-brand/90 px-4 py-2.5 text-[13px] font-medium text-white' : 'max-w-[95%]'}>
                {t.role === 'mentor' && t.answer ? (
                  <div className="space-y-3 rounded-2xl rounded-bl-sm border border-white/10 bg-night-800 p-4">
                    <Md text={t.answer.text} className="!text-[13px]" />
                    {t.answer.steps && (
                      <div>
                        <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-300">Passo a passo{t.answer.daw ? ` · ${DAW_LABEL[t.answer.daw]}` : ''}</div>
                        <ol className="ml-1 space-y-1.5">{t.answer.steps.map((s, si) => <li key={si} className="flex gap-2 text-[13px] text-zinc-200"><span className="font-mono text-[11px] font-black text-brand-300">{String(si + 1).padStart(2, '0')}</span>{s}</li>)}</ol>
                      </div>
                    )}
                    <div className="grid gap-2 sm:grid-cols-3">
                      {t.answer.exercise && <InfoBlock icon={<Dumbbell size={13} />} title="Exercício" text={t.answer.exercise} />}
                      {t.answer.commonMistake && <InfoBlock icon={<AlertTriangle size={13} />} title="Erro comum" text={t.answer.commonMistake} tone="warn" />}
                      {t.answer.challenge && <InfoBlock icon={<Trophy size={13} />} title="Desafio" text={t.answer.challenge} tone="brand" />}
                    </div>
                    {t.answer.lessonRefs.length > 0 && (
                      <div className="flex flex-wrap gap-2 border-t border-white/[.07] pt-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Fontes internas:</span>
                        {t.answer.lessonRefs.map(l => (
                          <Link key={l.id} to={`/app/aula/${l.id}`} className="chip hover:border-brand/50 hover:text-white">{l.title} <ArrowRight size={11} /></Link>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] leading-relaxed text-zinc-600">{t.answer.note}</p>
                  </div>
                ) : (
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-white/10 bg-night-800 px-4 py-2.5 text-[13px] leading-relaxed text-zinc-300">{t.text}</div>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex items-center gap-2 text-[12px] text-zinc-500"><span className="h-2 w-2 animate-ping rounded-full bg-brand" /> Consultando a base curada da plataforma (contexto da sua DAW)…</div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={(e: FormEvent) => { e.preventDefault(); ask() }} className="flex gap-2 border-t border-white/[.07] p-3">
          <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder={limit.allowed ? 'Ex.: por que meu sub some no celular?' : 'Limite de hoje atingido — faça upgrade ou volte amanhã.'} disabled={!limit.allowed} />
          <Button type="submit" disabled={!q.trim() || thinking || !limit.allowed} className="!px-4"><Send size={16} /></Button>
        </form>
      </Card>

      <p className="mt-2 text-center text-[10px] leading-relaxed text-zinc-600">
        Arquitetura AIProvider pronta para provedores externos (OpenAI/Anthropic/Gemini/Ollama) via <b>Edge Function no servidor</b> — chaves jamais no frontend, respostas restritas ao contexto RAG da plataforma. Ver docs/AI_PROVIDER.md.
        {plan?.id === 'free' && <> · No Free: {limit.remaining}/8 por dia. <Link to="/planos" className="link">Upgrade libera uso contínuo</Link>.</>}
      </p>
    </div>
  )
}

function InfoBlock({ icon, title, text, tone = 'default' }: { icon: React.ReactNode; title: string; text: string; tone?: 'default' | 'warn' | 'brand' }) {
  return (
    <div className={
      tone === 'warn' ? 'rounded-lg border border-amber-500/25 bg-amber-500/[.05] p-2.5'
      : tone === 'brand' ? 'rounded-lg border border-brand/30 bg-brand-soft p-2.5'
      : 'rounded-lg border border-white/[.07] bg-white/[.02] p-2.5'
    }>
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">{icon} {title}</div>
      <p className="text-[12px] leading-relaxed text-zinc-300">{text}</p>
    </div>
  )
}
