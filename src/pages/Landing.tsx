import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Check, Brain, Users, Gamepad2, FolderGit2, Wallet, ShieldCheck, Sparkles } from 'lucide-react'
import { MarketingShell } from '@/components/shell'
import { PipelineViz, WaveBars, ConsoleArt, Knob } from '@/components/visuals'
import { SectionTitle, Badge, Card, Md } from '@/components/ui'
import { brand } from '@/config/brand'
import { useSeo } from '@/lib/seo'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'
import { listPlans } from '@/services/billing'
import { formatBRL } from '@/lib/utils'

const PIPELINE = 'DAW → MIDI → SYNTH → DRUMS → BASS → ARRANJO → MIX → MASTER → TRACK FINALIZADA'

const STEPS = [
  ['01', 'Escolha sua DAW', 'FL Studio, Ableton Live, Cubase — ou descubra qual combina com você.'],
  ['02', 'Escolha seu nível', 'Do "nunca abri uma DAW" ao aperfeiçoamento avançado.'],
  ['03', 'Escolha seu gênero', 'Psytrance, techno, house e mais 11 trilhas com DNA próprio.'],
  ['04', 'Siga seu roadmap', 'Um mapa semanal, da fundamentação à primeira track.'],
  ['05', 'Faça os exercícios', '20% teoria, 80% prática — aula termina com sua DAW aberta.'],
  ['06', 'Produza os projetos', 'Loops, grooves, drops, arranjos — entregas reais, não resumo.'],
  ['07', 'Receba feedback', 'Comunidade e mentor para destravar pontos cegos.'],
  ['08', 'Finalize sua música', 'Mix, master, export — a track existe fora da sua cabeça.'],
]

const PILLARS = [
  { icon: '🎓', title: 'Educação', text: 'Cursos estruturados e progressivos, com conceitos DAW-agnósticos que valem para sempre.' },
  { icon: '🎚️', title: 'Prática', text: 'Exercícios dirigidos, desafios com restrição e checklists de conclusão. Nada de "assistir curso".' },
  { icon: '💿', title: 'Projetos', text: 'Você produz músicas completas enquanto aprende — beat, bass, drop, arranjo, track, mix, master, EP.' },
  { icon: '🧠', title: 'AI Music Mentor', text: 'Tutor que conhece SUA DAW e sua versão do software. Nunca inventa menu nem atalho.' },
  { icon: '👥', title: 'Comunidade', text: 'Produtores trocando presets, dúvidas e feedback de tracks por categoria e gênero.' },
  { icon: '🏆', title: 'Gamificação', text: 'XP, níveis, streak, conquistas e desafios semanais que transformam consistência em hábito.' },
  { icon: '🖼️', title: 'Portfólio', text: 'Sua evolução documentada: primeiro beat → primeiro master, com página pública de artista.' },
  { icon: '🚀', title: 'Monetização', text: 'Trilha de carreira: releases, identidade artística e caminho profissional — sem promessa de fama.' },
]

const TRILHAS = ['Psytrance', 'Progressive Psy', 'Full-On', 'Techno', 'House', 'Progressive House', 'Melodic Techno', 'Minimal', 'Trance', 'Progressive Trance', 'EDM', 'Drum & Bass', 'Downtempo', 'Ambient']

export default function Landing() {
  useSeo({ path: '/', title: undefined })
  const t = useT()
  const plans = listPlans().slice(0, 3)
  const [faq, setFaq] = useState<number | null>(0)

  return (
    <MarketingShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="absolute -top-40 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl" style={{ background: `radial-gradient(circle, ${brand.colors.brand} 0%, transparent 60%)` }} aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-zinc-300 animate-rise">
              <span className="relative flex h-2 w-2"><span className="ping-slow absolute h-2 w-2 rounded-full" style={{ background: brand.colors.accent }} /><span className="h-2 w-2 rounded-full" style={{ background: brand.colors.accent }} /></span>
              FL Studio · Ableton Live · Cubase
            </div>
            <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
              Do primeiro <span className="bg-gradient-to-r from-brand-300 via-white to-neon-cyan bg-clip-text text-transparent">beat</span> à sua primeira música <span className="bg-gradient-to-r from-neon-cyan to-brand-300 bg-clip-text text-transparent">completa</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-zinc-400 sm:text-lg">
              Aprenda Produção Musical Eletrônica na prática usando a DAW que você escolher — com projetos que terminam em música, mentor de IA versionado e uma comunidade que fecha tracks.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/criar-conta" className="btn-primary !px-7 !py-3.5 !text-base shadow-glow">{t('cta.start')} <span aria-hidden>→</span></Link>
              <Link to="/#como-funciona" className="btn-ghost !px-7 !py-3.5 !text-base">{t('cta.platform')}</Link>
            </div>
            <p className="mt-3 text-[11px] text-zinc-600">Sem promessa de "produtor em 7 dias". Prometemos método, prática e acompanhamento.</p>
          </div>

          {/* pipeline viz */}
          <div className="relative mx-auto mt-14 max-w-5xl animate-rise" style={{ animationDelay: '.15s' }}>
            <div className="glass relative overflow-hidden rounded-3xl p-5 sm:p-8">
              <div className="mb-1 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[.25em] text-zinc-500">Journey · {brand.name}</div>
                <WaveBars n={18} className="!h-6" />
              </div>
              <div className="sr-only">{PIPELINE}</div>
              <div aria-hidden className="mt-4"><PipelineViz /></div>
              <div className="mt-6 grid items-center gap-6 sm:grid-cols-[1fr_auto]">
                <ConsoleArt className="opacity-80" />
                <div className="flex gap-5">
                  <Knob label="CUTOFF" /><Knob label="RESO" /><Knob label="DRIVE" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-20">
        <SectionTitle center kicker="O método" title="8 passos entre a curiosidade e a música finalizada" sub="Aula → exercício → desafio → projeto. Cada ciclo termina com SOM saindo da sua DAW — não com mais uma aba de vídeo aberta." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([n, title, text], i) => (
            <div key={n} className="card group relative overflow-hidden p-5 transition hover:border-brand/40" style={{ animation: `rise .5s ease ${i * 0.05}s both` }}>
              <div className="font-mono text-3xl font-black text-white/[.07] transition group-hover:text-brand/30">{n}</div>
              <div className="mt-2 text-[15px] font-extrabold text-white">{title}</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section id="metodo" className="border-y border-white/[.06] bg-night-850/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionTitle kicker="Por que não é só mais curso em vídeo" title="Uma plataforma de evolução do produtor" sub="Educação + prática + projetos + DAWs + IA + comunidade + gamificação + portfólio + carreira. O objetivo não é você assistir. É você terminar música." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map(p => (
              <Card key={p.title} className="p-5 transition hover:-translate-y-0.5 hover:border-brand/40">
                <div className="text-2xl">{p.icon}</div>
                <div className="mt-3 text-[15px] font-extrabold text-white">{p.title}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">{p.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CONCEITO + FERRAMENTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle kicker="Princípio central" title={<>Aprenda o <span className="text-brand-300">conceito</span>.<br />Veja o <span className="text-neon-cyan">caminho na sua DAW</span>.</>} />
            <Md text={`Cada conceito musical é ensinado **independente de software** — "como criar uma linha de baixo" vale para sempre. Logo abaixo, a aula mostra o procedimento no **FL Studio**, no **Ableton** e no **Cubase**.

Se você trocar de DAW amanhã, o conhecimento vem junto.

Cada passo de DAW carimba **versão verificada** do software. Quando a Image-Line, a Ableton ou a Steinberg atualizarem menus, o time editorial atualiza o conteúdo pelo CMS — você nunca aprende botão que não existe.`} className="!text-sm" />
            <div className="mt-6 flex flex-wrap gap-2">
              {['FL Studio 21 ✓', 'Ableton Live 11 ✓', 'Cubase 13 ✓', 'conteúdo versionado', 'atalhos conferidos'].map(x => <Badge key={x} tone="brand">{x}</Badge>)}
            </div>
          </div>
          <div className="glass overflow-hidden rounded-3xl p-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="font-mono text-[10px] uppercase tracking-[.2em] text-zinc-500">Conceito: bassline off-beat</span>
              <WaveBars n={10} className="!h-5" />
            </div>
            <div className="grid gap-2">
              {[['FL Studio', 'Channel Rack: nota no "e" de cada beat · Fruity Limiter COMP com sidechain do kick'],
                ['Ableton Live', 'Simpler/Synth no grid 1/8 · Compressor com Side Chain (Audio From: Kick) e EQ em 120 Hz'],
                ['Cubase', 'Drum Editor + notas offbeat no Key Editor · Compressor com external side chain no MixConsole'],
              ].map(([k, v], i) => (
                <div key={k} className="rounded-xl border border-white/[.07] bg-night-800 p-3.5" style={{ animation: `rise .5s ease ${i * 0.12}s both` }}>
                  <div className="text-xs font-extrabold text-brand-300">{k}</div>
                  <div className="mt-1 text-[12px] leading-relaxed text-zinc-400">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRILHAS DE GÊNERO */}
      <section className="border-y border-white/[.06] bg-night-850/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionTitle kicker="Trilhas de gênero" title="Comece pelo som que te faz querer produzir" sub="Cada gênero tem BPM, estrutura, padrões de baixo/melodia, sound design e mixagem característicos — e a arquitetura está pronta para receber novos." />
          <div className="flex flex-wrap gap-2">
            {TRILHAS.map((g, i) => (
              <Link key={g} to={g === 'Psytrance' ? '/psytrance' : g === 'Techno' ? '/techno' : g === 'House' ? '/house' : '/criar-conta'}
                className="glass rounded-xl px-4 py-2.5 text-[13px] font-bold text-zinc-300 transition hover:border-brand/50 hover:text-white"
                style={{ animation: `rise .4s ease ${i * 0.03}s both` }}>{g}</Link>
            ))}
            <span className="rounded-xl border border-dashed border-white/10 px-4 py-2.5 text-[13px] font-bold text-zinc-600">+ novos via CMS</span>
          </div>
        </div>
      </section>

      {/* AI MENTOR */}
      <section id="mentor" className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="order-2 lg:order-1">
            <div className="glass rounded-3xl p-5">
              <div className="mb-4 flex items-center gap-2"><Sparkles size={16} className="text-brand-300" /><span className="text-sm font-extrabold text-white">AI Music Mentor</span><Badge tone="info" className="ml-auto">exemplo</Badge></div>
              <div className="space-y-3 text-[13px]">
                <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-brand/90 px-3.5 py-2.5 text-white">Como faço sidechain no FL Studio?</div>
                <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-white/10 bg-night-800 px-3.5 py-3 leading-relaxed text-zinc-300">
                  <b className="text-white">Explicação:</b> sidechain faz o compressor do bass "ouvir" o kick.<br /><br />
                  <b className="text-white">Passo a passo (FL Studio 21, verificado):</b>
                  <ol className="mt-1.5 list-inside list-decimal space-y-1">
                    <li>Roteie o Kick para um canal do Mixer (Track Number).</li>
                    <li>No canal do Bass, insira o Fruity Limiter → aba COMP.</li>
                    <li>No campo Sidechain, selecione o canal do Kick; Ratio 4–8, Attack ~0, Release 60–120 ms.</li>
                  </ol>
                  <div className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/[.06] p-2 text-[12px]">⚠️ <b>Erro comum:</b> ducking de 12 dB sem EQ no sidechain — some o mid e vira lama pulsando.</div>
                </div>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">O mentor só responde com material curado e versionado da plataforma. Sem provedor de IA configurado, ele NÃO inventa menus, atalhos ou recursos.</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionTitle kicker="Fase 4 premium" title={<>Um professor de produção<br />dentro do seu bolso</>} sub="Pergunte em linguagem natural, receba explicação + passo a passo da sua DAW + exercício + erro comum + desafio. O contexto de versão do seu software muda as respostas." />
            <ul className="space-y-2.5 text-sm text-zinc-300">
              {['Reconhece sua DAW e nunca mistura instruções', 'Explica por que, não só como (compressor ≠ limiter)', 'Gera exercícios e revisões espaçadas dos seus pontos fracos', 'Sugere o próximo passo do seu roadmap'].map(x => (
                <li key={x} className="flex gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-emerald-400" />{x}</li>
              ))}
            </ul>
            <Link to="/criar-conta" className="btn-primary mt-6 inline-flex">Experimentar o mentor</Link>
          </div>
        </div>
      </section>

      {/* CURRÍCULO */}
      <section className="border-y border-white/[.06] bg-night-850/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionTitle center kicker="Academia" title="9 cursos fundamentais + 3 academias de DAW" sub="Da interface ao master. Todo curso tem projeto — e projeto, aqui, significa arquivo aberto na sua DAW." />
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {['Produção Musical do Zero', 'Fundamentos da Música Eletrônica', 'Beatmaking', 'Bassline', 'Síntese e Sound Design', 'Arranjo Musical', 'Mixagem', 'Masterização', 'Produza sua Primeira Track', 'FL Studio Academy', 'Ableton Live Academy', 'Cubase Academy'].map((c, i) => (
              <div key={c} className={cn('card flex items-center gap-3 p-4', i === 8 && 'ring-1 ring-brand/50')}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft font-mono text-xs font-black text-brand-300">{String(i + 1).padStart(2, '0')}</div>
                <div><div className="text-sm font-extrabold text-white">{c}</div><div className="text-[11px] text-zinc-500">{i === 8 ? 'projeto-capstone · você termina uma música' : i >= 9 ? 'iniciante → avançado' : 'aulas + exercícios + desafios'}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GAMIFICAÇÃO / RETENÇÃO */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle kicker="Evolução visível" title="XP, níveis, streak e portfólio — disciplina que vira identidade" />
            <p className="text-sm leading-relaxed text-zinc-400">Cada aula, exercício, desafio e projeto soma XP. Os níveis contam sua história: <span className="text-zinc-200">Iniciante → Beatmaker → Producer → Sound Designer → Mix Engineer → Music Producer → Advanced Producer → Electronic Music Artist</span>. Conquistas registram marcos ("primeiro master", "10 tracks"). A linha do tempo "Minha Evolução" mostra onde você era no primeiro beat.</p>
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              {[Gamepad2, FolderGit2, Brain, Users, Wallet, ShieldCheck].map((I, i) => (
                <span key={i} className="glass flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold text-zinc-300"><I size={14} className="text-brand-300" />{['Desafios semanais', 'Projetos guiados', 'Mentor IA', 'Feedback de tracks', 'Trilha de carreira', 'LGPD-first'][i]}</span>
              ))}
            </div>
          </div>
          <div className="card space-y-4 p-6">
            <div className="flex items-center justify-between"><span className="text-sm font-extrabold text-white">Seu progresso</span><Badge tone="brand">Producer · 1.840 XP</Badge></div>
            <div><div className="mb-1.5 flex justify-between text-[11px] text-zinc-500"><span>Curso 06 — Arranjo</span><span>75%</span></div><div className="h-2 rounded-full bg-white/[.06]"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-brand to-neon-cyan" /></div></div>
            <div><div className="mb-1.5 flex justify-between text-[11px] text-zinc-500"><span>Meta da semana</span><span>180 / 240 min</span></div><div className="h-2 rounded-full bg-white/[.06]"><div className="h-full w-3/5 rounded-full bg-gradient-to-r from-amber-400 to-lime-400" /></div></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['🔥', '6 dias', 'streak'], ['🎬', '34', 'aulas'], ['💿', '2', 'tracks']].map(([e, v, l]) => (
                <div key={l as string} className="rounded-xl border border-white/[.07] bg-night-800 p-2.5"><div>{e}</div><div className="text-base font-black text-white">{v}</div><div className="text-[10px] uppercase tracking-wider text-zinc-500">{l}</div></div>
              ))}
            </div>
            <p className="rounded-xl border border-brand/25 bg-brand-soft p-3 text-[12px] leading-relaxed text-zinc-300">💬 "Você está a <b className="text-white">2 aulas</b> de terminar o módulo Bass. Seu próximo desafio: um bassline de 16 compassos."</p>
          </div>
        </div>
      </section>

      {/* COMUNIDADE */}
      <section id="comunidade" className="border-y border-white/[.06] bg-night-850/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionTitle center kicker="Comunidade" title="Ninguém termina uma carreira sozinho" sub="Fóruns por DAW, por gênero e por tema — com feedback de tracks estruturado: técnica vs musicalidade, histórico de versões, timestamp." />
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { tag: 'Feedback de Tracks', title: 'Full-On v2 — tirei o mid do bass e abriu MUITO', body: 'Depois do feedback da v1, refiz o sidechain e cortei 3 dB em 250Hz do mid bass. O que acham do impacto no 4º compasso do drop?' },
              { tag: 'Mixagem', title: 'Rumbling bass: a chain que funcionou no meu techno', body: 'Send do kick p/ reverb curto (LP 300 Hz) → compressor 4:1. O "rabo" vira o corredor grave. Alguém com phase issue aqui?' },
              { tag: 'FL Studio', title: 'Channel Rack × Playlist: quando o loop vira música?', body: 'Fiz 8 compassos no rack e tô com medo de jogar na playlist. Como vocês decidem?' },
            ].map(p => (
              <Card key={p.title} className="flex flex-col gap-2">
                <Badge tone="brand" className="w-fit">#{p.tag}</Badge>
                <div className="text-sm font-bold text-white">{p.title}</div>
                <p className="line-clamp-3 text-[12px] leading-relaxed text-zinc-400">{p.body}</p>
                <div className="mt-auto text-[11px] text-zinc-600">conteúdo ilustrativo · a comunidade abre no lançamento</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionTitle center kicker="Comece grátis, evolua quando fizer sentido" title="Preços claros, sem truque de urgência" sub="O plano Free já tem roadmap, aulas introdutórias e streak. Sem cartão para começar." />
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map(p => (
            <Card key={p.id} className={cn('relative flex flex-col gap-4 p-6', p.highlight && 'border-brand/60 ring-1 ring-brand/40')}>
              {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">Recomendado</span>}
              <div>
                <div className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">{p.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{p.priceMonthly === 0 ? 'R$ 0' : formatBRL(p.priceMonthly)}</span>
                  {p.priceMonthly > 0 && <span className="text-xs text-zinc-500">/mês</span>}
                </div>
                {p.priceMonthly > 0 && <div className="mt-0.5 text-[11px] text-zinc-500">ou {formatBRL(p.priceAnnual)}/ano</div>}
              </div>
              <ul className="space-y-2 text-[13px] text-zinc-300">
                {p.features.map(f => <li key={f} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />{f}</li>)}
              </ul>
              <Link to={p.id === 'free' ? '/criar-conta' : '/planos'} className={cn('mt-auto text-center', p.highlight ? 'btn-primary' : 'btn-ghost')}>
                {p.id === 'free' ? 'Começar gratuitamente' : 'Ver este plano'}
              </Link>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-zinc-600">Preços administráveis pelo painel (podem variar por promoções/país). Planos Academy (escolas e estúdios): <Link to="/planos" className="link">ver detalhes</Link>.</p>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/[.06] bg-night-850/60">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <SectionTitle center kicker="FAQ" title="O que costumam perguntar" />
          <div className="space-y-2.5">
            {[
              ['Preciso comprar a DAW para estudar?', 'As aulas de conceito funcionam em qualquer software; as academias de DAW assumem o programa instalado (há trilhas gratuitas de avaliação em alguns planos — teste o demo das próprias DAWs). A Sonora não vende nem distribui softwares de terceiros.'],
              ['Já produzo, mas nunca termino nada. Serve pra mim?', 'É exatamente o público-alvo do programa Finish a Track e do ciclo aula→exercício→desafio→projeto. O método existe para fechar música, não para acumular teoria.'],
              ['A IA "resolve" minha mixagem por mim?', 'Não. O mentor ensina, orienta e acelera — e o Track Analyzer (beta) mede métricas REAIS do seu áudio localmente (pico, loudness estimado, espectro, correlação), sempre com linguagem educativa, nunca como veredito. O processo criativo continua sendo seu.'],
              ['E se o tutorial mostrar um menu que não existe na minha versão?', 'Todo passo de DAW carimba versão verificada e data. A plataforma mantém registro de versões por software e o conteúdo é atualizado via CMS — se divergir, você reporta pela própria aula.'],
              ['Posso usar os samples e presets?', 'Somente material licenciado ou produzido pela comunidade com permissão explícita. Não hospedamos nada protegido — e cada arquivo mostra a licença.'],
              ['Serve para celular?', 'Mobile first. Assistir aula, quiz, roadmap, mentor e registrar sessão de estúdio: tudo de polegar. A produção acontece na sua DAW (computador ou iPad/Android compatível).'],
            ].map(([q, a], i) => (
              <div key={q} className={cn('card overflow-hidden', faq === i && 'border-brand/40')}>
                <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i}>
                  <span className="text-sm font-bold text-white">{q}</span>
                  <ChevronDown size={17} className={cn('shrink-0 text-zinc-500 transition', faq === i && 'rotate-180 text-brand-300')} />
                </button>
                {faq === i && <div className="px-5 pb-4 text-[13px] leading-relaxed text-zinc-400">{a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 blur-2xl" style={{ background: `radial-gradient(60% 80% at 50% 100%, ${brand.colors.brand}, transparent)` }} aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Pare de criar apenas loops.<br />Aprenda a terminar músicas.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">Sua DAW não é o problema. As ferramentas já estão na sua frente — falta método, cobrança e alguém te dizendo "agora faça isso". Escolha sua DAW, escolha seu estilo, comece a produzir.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/criar-conta" className="btn-primary !px-8 !py-4 !text-base shadow-glow">Começar agora →</Link>
            <Link to="/daws" className="btn-ghost !px-8 !py-4 !text-base">Escolher minha DAW</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
