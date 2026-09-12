import { Link } from 'react-router-dom'
import { Rocket, Check } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Badge, ProgressBar, Button } from '@/components/ui'
import { useApp } from '@/store/app'
import { FINISH_DAYS, finishState, toggleFinishDay, finishComplete } from '@/services/studio'
import { track } from '@/services/analytics'
import { insert } from '@/lib/db'
import { uid, nowISO, cn } from '@/lib/utils'

export default function FinishTrackPage() {
  const { user, pushToast, afterProgress } = useApp()
  if (!user) return null
  const state = finishState(user.id)
  const done = state.filter(s => s.done).length
  const pct = Math.round((done / 7) * 100)
  const complete = finishComplete(user.id)
  const firstUnfinished = state.find(s => !s.done)

  function toggle(day: number, v: boolean) {
    toggleFinishDay(user!.id, day, v)
    if (v) track('finish_day_completed', { day })
    if (v && FINISH_DAYS.every(d => d.day === day || finishState(user!.id).find(s => s.day === d.day)?.done)) {
      pushToast(`🎉 DIA ${day} concluído!`, 'success')
    }
    const allDone = FINISH_DAYS.every(d => d.day === day ? v : (finishState(user!.id).find(s => s.day === d.day)?.done ?? false))
    if (allDone) {
      track('program_finished')
      insert('notifications', { id: uid('ntf'), userId: user!.id, text: '🏁 Programa Finish a Track concluído — +1000 XP e sua track v1 está pronta para o Portfólio!', ts: nowISO(), read: false })
    }
    afterProgress()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title={<span className="flex items-center gap-2"><Rocket size={20} className="text-brand-300" /> FINISH A TRACK</span>} sub="7 dias. Uma música. Cada dia UMA tarefa — sem polimento preventivo, sem 'só mais um preset'. O método anti-loop da plataforma." actions={<Badge tone="brand">programa-chave</Badge>} />

      <Card>
        <div className="flex items-center justify-between text-sm">
          <span className="font-extrabold text-white">{done}/7 dias</span>
          <span className="text-zinc-500">{pct}% · recompensa final: +1000 XP + publicação guiada</span>
        </div>
        <ProgressBar value={pct} tone={complete ? 'lime' : 'brand'} className="mt-2" />
      </Card>

      <div className="space-y-2.5">
        {FINISH_DAYS.map((d, i) => {
          const s = state.find(x => x.day === d.day)
          const isNext = firstUnfinished?.day === d.day
          return (
            <div key={d.day} className={cn('card flex items-start gap-4 p-4 transition', s?.done && 'border-emerald-500/25', isNext && 'border-brand/50 ring-1 ring-brand/30')}>
              <button onClick={() => toggle(d.day, !s?.done)} className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 font-black transition', s?.done ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300' : 'border-white/15 text-zinc-500 hover:border-brand hover:text-white')} aria-pressed={!!s?.done}>
                {s?.done ? <Check size={16} /> : d.day}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={cn('text-[15px] font-extrabold', s?.done ? 'text-zinc-500 line-through' : 'text-white')}>Dia {d.day} — {d.title}</h3>
                  {isNext && !s?.done && <Badge tone="brand">seu dia de hoje</Badge>}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">{d.brief}</p>
                {isNext && d.day === 7 && <Link to="/app/projeto/proj-primeira-track" className="btn-primary btn-sm mt-2 inline-flex">Entregar no Projeto 05</Link>}
                {isNext && d.day === 1 && <Link to="/app/projeto/proj-primeiro-beat" className="btn-primary btn-sm mt-2 inline-flex">Abrir briefing do beat</Link>}
              </div>
            </div>
          )
        })}
      </div>

      {complete && (
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/[.07] to-transparent p-6 text-center">
          <div className="text-4xl">🏁</div>
          <h3 className="mt-2 text-lg font-black text-white">TRACK FINALIZADA</h3>
          <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-zinc-400">Você atravessou o pipeline completo em 7 passos. Agora: registre a track no Portfólio, publique no Feed de tracks e comece a ouvir a v1 com 48h de distância (a próxima decisão de mix nasce daí).</p>
          <div className="mt-4 flex justify-center gap-2">
            <Link to="/app/portefolio" className="btn-primary btn-sm">Publicar no Portfólio</Link>
            <Link to="/app/comunidade" className="btn-ghost btn-sm">Pedir feedback</Link>
          </div>
        </Card>
      )}

      <Card className="text-[12px] leading-relaxed text-zinc-500">
        <b className="text-zinc-300">Regras do programa:</b> 1 tarefa por dia; tempo sugerido 60–120 min (marque a sessão no <Link to="/app/estudio" className="link">Estúdio</Link> para streak); proibido adicionar plugins/samples novos nos dias 2–5; se um dia falhar, siga — dias não se alinham, a música se fecha. <Button size="sm" variant="ghost" className="ml-1" onClick={() => { afterProgress(); pushToast('Status sincronizado.', 'info') }}>↺ resync</Button>
      </Card>
    </div>
  )
}
