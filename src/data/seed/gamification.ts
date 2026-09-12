import type { AchievementDef, Project, Lesson } from '@/types'
import { file } from './builder'

// ── Projetos práticos (sistema "Aprender Fazendo") ──────────────────────────

const P = (
  n: number, slug: string, title: string, tagline: string, briefing: string,
  objectives: string[], checklist: string[], criteria: string[], days: number, xp: number,
  level: Project['level'], tags: string[], files: Project['files'] = [],
): Project => ({
  id: `proj-${slug}`, slug, title: `Projeto ${String(n).padStart(2, '0')} — ${title}`, tagline,
  briefing, objectives, checklist, criteria, files, suggestedDays: days, xp, level, tags,
})

export const PROJECTS: Project[] = [
  P(1, 'primeiro-beat', 'Primeiro Beat', 'Oito compassos que fazem a cabeça balançar.',
    `Use o que você aprendeu nos cursos 01–03: crie um loop de 8 compassos com kick, clap/snare, hats em 16ths e um sub simples. Nada de melodia ainda — o assunto é GROOVE.`,
    ['Construir âncoras rítmicas (kick 4x4, clap 2/4)', 'Aplicar variação de velocity com ciclo', 'Aprender a ouvir o próprio loop por 8 compassos sem enjoo'],
    ['Kick na tonalidade da track', 'Clap/snare em 2 e 4 com layer opcional', 'Hats com velocity variada e offbeat no "e" do 4', 'Sub bass de uma nota, mono, ≤ 90 Hz', 'Swing entre 8–18% no contexto (house) ou straight (techno)', 'Projeto salvo com canais nomeados'],
    ['O loop faz balançar sem melodia? (prova real)', 'Kick e sub não embolam no celular?', 'A velocity está "cantando" ou metronômica?'],
    3, 500, 'iniciante', ['drums', 'ritmo'],
    [file('template-estrutura.txt', 'checklist', 'Estrutura do loop', `8 compassos:
Bars 1-4: kick+clap+hats
Bars 5-8: +sub (offbeat)
Bar 8: fill de tom + openhat
BPM: 124-140 | Key: Am ou Dm`)])
  ,
  P(2, 'primeiro-bass', 'Primeiro Bass', 'Um sistema kick/bass que conversa.',
    'Aprofunde o Projeto 01: reescreva o bassline com sub + mid, envelope trabalhado e sidechain real. Entrega: 8 compassos com o bass "embutido" no kick.',
    ['Desenhar sub senoidal e mid saturado', 'Aplicar envelope (decay/release curto)', 'Sidechain kick→bass com redução medida', 'EQ: highpass no mundo, corte cirúrgico na disputa'],
    ['Sub ≤ 90 Hz mono e sem stereo width', 'Mid bass com saturação leve', 'Sidechain 6–10 dB com release musical', 'Corte cirúrgico documentado (print do EQ)', 'Teste no celular: grave legível'],
    ['Kick e bass soam como UM instrumento?', 'O sidechain respira em 4 compassos ou "engole" tudo?'],
    4, 500, 'iniciante', ['bass'],
  ),
  P(3, 'primeiro-drop', 'Primeiro Drop', 'A queda que sustenta 16 compassos.',
    'Construa o "momento": 16 compassos de Drop A com kick, bass, lead e 1 FX de transição para dentro dele. O tema pode ser o par pergunta/resposta do curso 01.',
    ['Criar o par pergunta/resposta como tema', 'Montar bloco de drop com densidade máxima consciente', 'Desenhar a "queda" (silêncio pré-drop + impact)'],
    ['Tema de 2+2 compassos memorável', 'Lead com processamento mínimo (1 FX)', 'Silêncio de 1/8 antes do beat 1', 'Impact no downbeat do drop', '16 compassos sem cansar (variação de perc)'],
    ['Você cantaria o tema amanhã?', 'O drop tem espaço ou virou parede?'],
    5, 700, 'iniciante', ['melodia', 'arranjo'],
  ),
  P(4, 'primeiro-arranjo', 'Primeiro Arranjo', 'Do loop à música: 6 blocos.',
    'Pegue seu drop (ou crie novo) e monte o mapa completo: Intro 16 → Break 16 → Build 8 → Drop A 32 → Break/Variação 16 → Outro 16. Cada bloco com UMA diferença explicável.',
    ['Aplicar densidade como gráfico', 'Transições com 2 recursos (não 5)', 'Automação das 5 obrigatórias'],
    ['6 blocos com markers', 'Cada bloco explicado em 1 linha', '5 automações implementadas', 'Duração total ≥ 4:30 (pista) ou 2:45–3:15 (streaming)'],
    ['Um ouvinte novo consegue apontar as viradas?', 'O drop 2 é DIFERENTE do drop 1 (não só mais alto)?'],
    7, 800, 'intermediario', ['arranjo'],
  ),
  P(5, 'primeira-track', 'Primeira Track', 'A música completa, finalizada e exportada.',
    'O evento da plataforma: terminar uma track v1.0 — produção, arranjo, mix e máster — seguindo o Curso 09. Prazo sugerido: 3 semanas, com checkpoints.',
    ['Executar o fluxo completo das 12 etapas', 'Fechar v1 com prazo em vez de loop eterno', 'Exportar máster + stems + versões'],
    ['Todas as etapas do Curso 09 concluídas', 'Master com alvo definido e medido (LUFS/TP)', 'Export final 24-bit + stems + promo mp3', 'Metadados (BPM/key) preenchidos', 'Publicada no Portfólio'],
    ['A música toca do início ao fim sem vergonha (autocrítica) e com 3 feedbacks reais', 'Você sabe dizer o que faria diferente na v2'],
    21, 1000, 'intermediario', ['final'],
  ),
  P(6, 'primeira-mixagem', 'Primeira Mixagem', 'A mixagem auditada pela comunidade.',
    'Mixe a track do Projeto 05 com o pipeline do Curso 07 (gain staging → balance → EQ → dinâmica → espaço → bus) e entregue para auditoria com a checklist preenchida.',
    ['Rodar o pipeline com método', 'Documentar cada decisão em 1 linha', 'Receber e responder a uma auditoria'],
    ['Checklist final 100% marcada', 'Gravação da sessão de decisões (print/áudio)', 'Mono/celular/referência testados', 'Pico ≤ -3 e sem limiter no master da mixagem'],
    ['A referência escolhida tem grave e "ar" equivalentes?', 'O que mudou quando você bypassou os plugins (o bom é pouco)?'],
    7, 800, 'intermediario', ['mix'],
  ),
  P(7, 'primeiro-master', 'Primeiro Master', 'O último polimento antes do mundo.',
    'Mastere a mix do Projeto 06 para -9/-10 LUFS integrados (ou o alvo do seu gênero/label), com cadeia de máster mínima e validação em 3 sistemas.',
    ['Montar cadeia EQ fino → limiter', 'Atingir alvo medido de LUFS/TP', 'Gerar máster + streaming-safe + stems'],
    ['Alvo integrado documentado', 'TP ≤ -1 dBTP', '3 sistemas validados (fones/celular/monitor)', 'Pacote nomeado corretamente'],
    ['O máster "engoliu" a dinâmica da referência?', 'Se a mixagem tivesse melhor, o máster teria sido mais leve?'],
    3, 700, 'avancado', ['master'],
  ),
  P(8, 'ep-tres-musicas', 'EP de 3 músicas', 'A prova de consistência.',
    'Produza, mixe e masterize um EP coeso: 3 tracks do mesmo gênero, com narrativa de tracklist (abertura, pico, fechamento). Inclui artwork (placeholder permitido) e release plan de 1 página.',
    ['Manter identidade sonora em 3 faixas', 'Sequenciar tracklist com energia', 'Finalizar em lote com templates'],
    ['3 masters finalizados e validados', 'Tracklist justificada em 3 linhas', 'Capa/placeholder definida', 'Release plan de 1 página (datas, canais, promo)'],
    ['Uma pessoa que gosta do gênero 1 reconhece "o som" nas 3 faixas?', 'As faixas soam do mesmo "lugar" (loudness/tonal)?'],
    45, 1500, 'avancado', ['final', 'arranjo', 'mix'],
  ),
]

// ── Conquistas (avaliadas por métricas no service de gamificação) ───────────

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ach-first-lesson', title: 'Primeiro Click', description: 'Conclua a primeira aula da plataforma.', icon: '🎬', xp: 50, criteria: { metric: 'lessons', value: 1 } },
  { id: 'ach-first-beat', title: 'Primeiro Beat', description: 'Conclua o Projeto 01 — Primeiro Beat.', icon: '🥁', xp: 250, criteria: { metric: 'projects', value: 1 } },
  { id: 'ach-first-drop', title: 'O Drop Caiu', description: 'Conclua o Projeto 03 — Primeiro Drop.', icon: '💥', xp: 250, criteria: { metric: 'challenges', value: 1 } },
  { id: 'ach-ten-lessons', title: 'Dez Aulas no Saco', description: '10 aulas concluídas.', icon: '🎓', xp: 150, criteria: { metric: 'lessons', value: 10 } },
  { id: 'ach-first-track', title: 'Primeira Track Finalizada', description: 'Conclua o Projeto 05.', icon: '💿', xp: 1000, criteria: { metric: 'tracks', value: 1 } },
  { id: 'ach-first-mix', title: 'Mix Closed', description: 'Conclua a Primeira Mixagem (P06).', icon: '🎚️', xp: 400, criteria: { metric: 'mixdone', value: 1 } },
  { id: 'ach-first-master', title: 'Master Certified', description: 'Conclua o Primeiro Master (P07).', icon: '🏆', xp: 400, criteria: { metric: 'masterdone', value: 1 } },
  { id: 'ach-three-tracks', title: 'Trio de Aço', description: 'Registre 3 tracks finalizadas.', icon: '🎛️', xp: 750, criteria: { metric: 'tracks', value: 3 } },
  { id: 'ach-ten-tracks', title: 'Catálogo Vivo', description: '10 tracks finalizadas.', icon: '💽', xp: 1500, criteria: { metric: 'tracks', value: 10 } },
  { id: 'ach-course-done', title: 'Formado no Zero', description: 'Conclua um curso completo.', icon: '📜', xp: 300, criteria: { metric: 'courses', value: 1 } },
  { id: 'ach-streak-7', title: 'Sete Dias Produzindo', description: 'Streak de 7 dias de estudo/produção.', icon: '🔥', xp: 350, criteria: { metric: 'streak', value: 7 } },
  { id: 'ach-streak-30', title: 'Disciplina de Estúdio', description: 'Streak de 30 dias.', icon: '🌋', xp: 1200, criteria: { metric: 'streak', value: 30 } },
]

// ── Weekly Producer Challenge (rotação por semana do ano) ───────────────────

export interface WeeklyChallenge { id: string; title: string; brief: string; constraint: string; xp: number }

export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  { id: 'wk-01', title: 'Beat em 30 minutos', brief: 'Cronômetro ligado: um loop de 8 compassos com kick, clap, hats e sub. Sem referência externa, sem pack novo.', constraint: 'Tempo máximo: 30 min. Só os sons do template.', xp: 250 },
  { id: 'wk-02', title: 'Bass de um synth', brief: 'Um único instrumento gera sub + mid do projeto inteiro. Sem samples externos.', constraint: 'Apenas 1 canal de instrumento.', xp: 250 },
  { id: 'wk-03', title: 'Drop de 16 compassos', brief: 'Entregue só o drop: 16 compassos com kick, bass, lead e uma virada.', constraint: 'Sem breakdown, sem intro — só a queda.', xp: 250 },
  { id: 'wk-04', title: 'Intro de 32 compassos', brief: 'Uma intro mixável para DJ: 32 compassos que "abrem" a pista sem revelar o tema.', constraint: 'Só bateria, perc e um FX. Zero melodia.', xp: 250 },
  { id: 'wk-05', title: 'Mix com 5 plugins', brief: 'Mixe a track do mês usando no máximo 5 instâncias de plugin na sessão inteira.', constraint: 'Contagem total de inserts ≤ 5.', xp: 300 },
  { id: 'wk-06', title: 'Groove só de hats', brief: 'Faça 16 compassos em que os hats carregam o groove sozinhos (com sidechain do kick).', constraint: 'Sem claps, sem percussão extra.', xp: 250 },
  { id: 'wk-07', title: 'Regra do silêncio', brief: 'Compor 8 compassos onde o silêncio é um elemento: 2 compassos sem nenhum elemento contínuo.', constraint: 'Mínimo 8 beats de silêncio total.', xp: 250 },
  { id: 'wk-08', title: 'Um sample, três vidas', brief: 'Escolha 1 sample e produza 3 trechos distintos a partir dele (pitch, reverse, resample).', constraint: 'Apenas o sample escolhido como origem.', xp: 300 },
]

/** Desafio rotativo da semana (determinístico por semana do ano). */
export function challengeOfWeek(weekIdx: number): WeeklyChallenge {
  return WEEKLY_CHALLENGES[weekIdx % WEEKLY_CHALLENGES.length]
}

export const LESSON_INDEX_TAG = (l: Lesson) => l.tags
