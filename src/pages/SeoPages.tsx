import { Link } from 'react-router-dom'
import { MarketingShell } from '@/components/shell'
import { SectionTitle, Card, Badge, Md } from '@/components/ui'
import { getDaw, getGenre, listCourses, listLessons, getDaws } from '@/services/content'
import { useSeo } from '@/lib/seo'
import { brand } from '@/config/brand'
import type { DawId } from '@/types'

// Páginas SEO geradas a partir dos DADOS reais da plataforma (nada inventado,
// nada vazio). Se o CMS publicar mais conteúdo, essas páginas crescem sozinhas.

export interface SeoProps { topic?: string; daw?: DawId; genre?: string }

const TOPICS: Record<string, { title: string; desc: string; courseId: string; extra: string }> = {
  'producao-musical': {
    title: 'Produção musical do zero — o caminho completo', desc: 'O que é produzir música eletrônica, o que você precisa e o passo a passo real do primeiro beat à track finalizada.', courseId: 'producao-do-zero',
    extra: 'Produção musical é decisão em camadas: escolher o gênero e o BPM, definir tonalidade, programar o groove, escrever o tema, arranjar a forma, mixar com método e finalizar com alvos medidos. Quem "não tem criatividade" quase sempre tem é ausência de método — e método se aprende com prática deliberada, feedback e prazo.',
  },
  'curso': {
    title: 'Curso de produção musical eletrônica (online, na prática)', desc: 'Curso progressivo com exercícios, projetos e certificação — FL Studio, Ableton Live e Cubase.', courseId: 'producao-do-zero',
    extra: 'Um curso de produção só funciona se terminar em música: a Sonora organiza 9 cursos fundamentais + 3 academias de DAW com ciclo "aula → exercício → desafio → projeto", XP configurável, certificados verificáveis e comunidade. Não é maratonar vídeo: é produzir com cobrança saudável.',
  },
  'eletronica': {
    title: 'Produção de música eletrônica — método, não mágica', desc: 'Aprenda eletrônica: 4-on-the-floor, sidechain, synth, mix e master num fluxo que termina em track.', courseId: 'fundamentos-eletronica',
    extra: 'A música eletrônica tem um "dialeto": grid 16th, kick 4x4 como gravidade, sub-bass como corpo, sidechain como respiração, arranjo por densidade. Domine o dialeto numa DAW e você fala "produção" em qualquer uma. As trilhas de gênero (psytrance, techno, house, trance…) aprofundam sotaques.',
  },
  'mixagem': {
    title: 'Mixagem de música eletrônica — checklist e método', desc: 'Gain staging, EQ, compressão, space e bus: o pipeline de mixagem da plataforma, aula por aula.', courseId: 'mixagem',
    extra: 'Mixar é organizar o espaço: níveis antes de plugins (gain staging ~-18 RMS), EQ que remove antes de adicionar, dinâmica medida (GR + makeup), e um reverbo só para a "sala" da track. Buses de família (Drums/Synths) colam a mixagem; o teste final é o fader a -6 e o speaker do celular.',
  },
  'masterizacao': {
    title: 'Masterização para streaming e pista — LUFS sem lenda', desc: 'Alvos por destino, cadeia mínima (EQ fino + limiter), true peak, versões e stems.', courseId: 'masterizacao',
    extra: 'LUFS medem percepção; plataformas normalizam; então o máster "para o número" perde punch. Para streaming, mire o DROP (~-8 short-term, integrado -9/-10) e true peak -1 dBTP. Para DJ/netlabel, siga a referência do selo. E nunca limite a mixagem com limiter no master bus.',
  },
  'sound-design': {
    title: 'Sound design e síntese — saia dos presets', desc: 'Subtrativa, FM, wavetable, granular e resampling com exercícios na sua DAW.', courseId: 'sintese-sound-design',
    extra: 'Todo synth conta a mesma história: osciladores → filtro → envelope, com LFOs e macro modulação. Wavetable anima essa tabela; FM esculpe metal e sinos; granular + resampling transformam qualquer áudio em material próprio. O objetivo prático: um banco de 9 presets que definem sua assinatura sônica.',
  },
  'como-produzir': {
    title: 'Como produzir música eletrônica (12 etapas)', desc: 'Da curiosidade à track: 12 etapas guiadas — a mesma ordem do roadmap da plataforma.', courseId: 'produza-sua-primeira-track',
    extra: 'O roteiro: ideia com prazo → BPM do gênero → key e mood → motor rítmico → sistema kick/bass → tema pergunta/resposta → 4 timbres do drop → forma em blocos → 5 automações → mix com método → master medido → publicar. Cada etapa tem aula, exercício e entrega. Repetir o ciclo 3× = você produz.',
  },
}

export default function SeoPages(props: SeoProps) {
  let title = '', desc = '', courseId: string | undefined, extra = '', badge = 'guia'
  const genre = props.genre ? getGenre(props.genre) : undefined
  const daw = props.daw ? getDaw(props.daw) : undefined

  if (genre) {
    title = `Produção de ${genre.name}: BPM, estrutura, som e mixagem`
    desc = `Tudo sobre produzir ${genre.name}: BPM ${genre.bpm[0]}–${genre.bpm[1]}, padrões de bateria/baixo, sound design, arranjo e referências — nas 3 DAWs.`
    extra = `O ${genre.name} respira assim: ${genre.drums} No grave: ${genre.bass} Em melodia/harmonia: ${genre.melodic} Sound design característico: ${genre.soundDesign} Arranjo: ${genre.arrangement} Na mixagem: ${genre.mixing}`
    courseId = 'fundamentos-eletronica'
    badge = `trilha ${genre.name}`
  } else if (daw) {
    const courses = listCourses({ track: 'daw', dawId: daw.id })
    title = `${daw.name}: curso e academia de produção musical`
    desc = `Academia ${daw.name} na Sonora: trilha iniciante → avançado com aulas versionadas (menus, atalhos e recursos verificados por release). ${daw.blurb}`
    extra = `${daw.name} é forte para: ${daw.bestFor.join('; ')}. Trade-offs honestos: ${daw.caveats.join(' ')}. O método da plataforma ensina o conceito e mostra o caminho ${daw.name} — sem "uma DAW serve para todos".`
    courseId = courses[0]?.id
    badge = 'academia de DAW'
  } else if (props.topic) {
    const t = TOPICS[props.topic]
    title = t.title; desc = t.desc; courseId = t.courseId; extra = t.extra
    badge = 'guia da plataforma'
  }

  useSeo({ title, description: desc, path: '/' + (props.genre ?? props.daw ?? props.topic ?? ''), jsonLd: {
    '@context': 'https://schema.org', '@type': 'Course', name: title, description: desc, provider: { '@type': 'EducationalOrganization', name: brand.name, url: brand.url }, inLanguage: 'pt-BR', offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL', category: 'aula introdutória gratuita' },
  } })

  const course = courseId ? listCourses().find(c => c.id === courseId) : undefined
  const preview = course ? listLessons(course.id).slice(0, 6) : []
  const daws = getDaws()

  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-14">
        <Badge tone="brand">{badge}</Badge>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-zinc-300">{desc}</p>
        {genre && (
          <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
            <Badge tone="warn">BPM {genre.bpm[0]}–{genre.bpm[1]}</Badge>
            {genre.references.map((r: string) => <Badge key={r}>{r}</Badge>)}
          </div>
        )}

        <Card className="mt-8"><Md text={extra} className="!text-[14px]" /></Card>

        {daw && (
          <Card className="mt-4">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500">Conteúdo versionado por release</div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">As aulas citam menus/atalhos verificados na versão registrada no CMS (ex.: {daw.id === 'fl-studio' ? 'FL Studio 21.x' : daw.id === 'ableton' ? 'Ableton Live 11.x' : 'Cubase 13.x'}). Quando sai um release novo, o time editorial revisa e publica — você nunca aprende botão morto.</p>
          </Card>
        )}

        {course && (
          <Card className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-brand-300">Curso associado na plataforma</div>
                <h2 className="mt-1 text-lg font-black text-white">{course.title}</h2>
                <p className="mt-1 text-[12px] text-zinc-400">{course.subtitle}</p>
              </div>
              <Link to="/criar-conta" className="btn-primary btn-sm shrink-0">Aprender agora</Link>
            </div>
            <div className="mt-4 divide-y divide-white/[.05]">
              {preview.map(l => (
                <div key={l.id} className="flex items-center gap-3 py-2.5">
                  <span className="font-mono text-[10px] text-zinc-600">{String(l.order).padStart(2, '0')}</span>
                  <span className="text-[13px] font-semibold text-zinc-200">{l.title}</span>
                  {l.isSample ? <Badge tone="success" className="ml-auto">grátis no Free</Badge> : <span className="ml-auto text-[10px] text-zinc-600">{l.durationMin} min</span>}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="mt-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Continue pela escolha certa de DAW</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {daws.map(d => <Link key={d.id} to={`/criar-conta?daw=${d.id}`} className="rounded-xl border border-white/[.07] bg-white/[.02] px-3.5 py-3 text-[13px] font-bold text-zinc-200 transition hover:border-brand/50 hover:text-white">{d.name} →</Link>)}
          </div>
          <p className="mt-3 text-[11px] text-zinc-500">Ainda indeciso? <Link to="/daws" className="link">Comparativo FL × Ableton × Cubase</Link> — e o Free não pede cartão.</p>
        </Card>
      </article>
    </MarketingShell>
  )
}
