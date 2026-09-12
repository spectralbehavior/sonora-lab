import type { CourseBuild } from './builder'
import { buildCourse, file } from './builder'

// Currículo fundamental — DAW-agnóstico por design (princípio: conceito + ferramenta).
// Conteúdo em pt-BR, locale 'pt-BR' no banco, versionável pelo CMS.

const zero = buildCourse({
  slug: 'producao-do-zero',
  title: 'Curso 01 — Produção Musical do Zero',
  subtitle: 'O que é produzir, o que é uma DAW e todas as peças do quebra-cabeça.',
  description:
    'Para quem nunca abriu uma DAW. Você vai entender áudio, MIDI, BPM, compasso, samples, plugins e sintetizadores — e sair produzindo o seu primeiro loop.',
  track: 'foundations',
  level: 'iniciante',
  order: 1,
  estHours: 6,
  objectives: [
    'Explicar com suas palavras o que acontece numa sessão de produção',
    'Abrir sua DAW com confiança e entender cada área da interface',
    'Criar o seu primeiro loop musical de 8 compassos',
  ],
  tags: ['fund'],
  modules: [
    {
      title: 'Fundamentos da produção',
      summary: 'O que é produção musical e o que é uma DAW.',
      lessons: [
        {
          title: 'O que é produção musical',
          objective: 'Entender o papel do produtor e o caminho ideia → música finalizada.',
          body: `Produção musical é **transformar uma ideia em um arquivo de áudio terminado** — da primeira batida até a música exportada, pronta para ser ouvida fora do seu fone.

O produtor é o "diretor" da música: decide o gênero, o andamento, os timbres, a estrutura, e garante que mixagem e masterização soem bem em qualquer sistema.

### As 6 etapas do fluxo
- **Composição**: melodia, harmonia, ritmo
- **Arranjo**: quem entra, quando entra e quando sai
- **Sound design**: escolher e esculpir os timbres
- **Gravação/programação**: registrar as notas e performances
- **Mixagem**: equilibrar tudo com clareza
- **Masterização**: preparar o som para o mundo

A plataforma inteira segue essa ordem — e no fim você termina uma música de verdade.`,
          durationMin: 8,
          tags: ['fund'],
          isSample: true,
          practice: [
            'Escolha uma track eletrônica que você ama e, em uma frase por etapa, escreva o que o produtor fez em cada uma das 6 etapas.',
          ],
          challenge: 'Escreva um "mapa" de 3 linhas: gênero que quero fazer, BPM médio que meu corpo aceita e uma música de referência.',
        },
        {
          title: 'O que é uma DAW',
          objective: 'Entender a DAW como estúdio completo em software e mapear as áreas comuns.',
          body: `DAW (Digital Audio Workstation) é o software onde você compõe, grava, edita, mixa e exporta. Toda DAW séria tem os mesmos 5 ambientes — muda o nome, nunca o conceito:

- **Sequencer de MIDI**: onde você desenha/registra notas (piano roll / editor key)
- **Timeline/Playlist**: onde a música ganha forma horizontal (arranjo)
- **Mixer**: volumes, panorama, efeitos por canal
- **Browser**: seus samples, presets e projetos
- **Pistas de áudio**: gravação e edição de som "real" (voz, sintetizadores hardware)

FL Studio, Ableton Live e Cubase são três formas de organizar esses ambientes. O conhecimento musical vale para as três — por isso nesta trilha você aprende o **conceito** e depois vê o **caminho na sua DAW**.`,
          durationMin: 10,
          tags: ['fund'],
          isSample: true,
          dawSteps: {
            fl: [
              'Abra o FL Studio: a janela inicial mostra Channel Rack, Playlist, Piano Roll e Mixer já acessíveis na barra de ferramentas superior.',
              'Navegue com F5 (Playlist), F6 (Piano Roll), F7 (Mixer).',
            ],
            ab: [
              'Abra o Ableton Live. Alterne entre Session e Arrangement com a tecla Tab.',
              'O Browser fica à esquerda; os Modos Session (lançar clips) e Arrangement (linha do tempo) cobrem os mesmos conceitos das outras DAWs.',
            ],
            cu: [
              'Abra o Cubase e crie um Novo Projeto vazio.',
              'A Project Window é a timeline; o MixConsole (tecla padrão F3) é a mesa; editores de MIDI abrem em duplo clique na região.',
            ],
          },
          practice: ['Abra sua DAW e identifique, sem tutorial, onde ficam os 5 ambientes listados acima.'],
        },
      ],
    },
    {
      title: 'Tempo: áudio, MIDI e ritmo',
      summary: 'Áudio digital, MIDI, BPM, compasso e ritmo.',
      lessons: [
        {
          title: 'Áudio digital sem mistério',
          objective: 'Entender taxa de amostragem, profundidade de bits, latência e buffer.',
          body: `Som analógico é contínuo; áudio digital é o som **fotografado** milhares de vezes por segundo.

- **Taxa de amostragem** (sample rate): quantas "fotos" por segundo. Padrão da indústria: **44.1 kHz** (CD/streaming). Grave em 44.1 ou 48 kHz; mais que isso quase nunca é necessário para música eletrônica de estúdio.
- **Profundidade** (bit depth): a resolução de cada foto. Use **24 bits** para gravação; exporte em 16 ou 24 bits conforme a plataforma.
- **Buffer/latência**: o tamanho do pedaço de áudio processado por vez. Buffer pequeno = resposta rápida para gravar, mas exige mais CPU. Buffer grande = ok para mixar.

### Regra prática
Ajuste o buffer **para baixo enquanto compõe/grava** e **para cima enquanto mistura**. Nada de gravar voz em 96 kHz "porque é melhor" — só gasta disco e CPU.`,
          durationMin: 9,
          tags: ['fund'],
          quiz: {
            title: 'Quiz — Áudio digital',
            questions: [
              ['Qual taxa de amostragem é o padrão de streaming/CD?', ['22.05 kHz', '44.1 kHz', '96 kHz', '192 kHz'], 1, '44.1 kHz cobre toda a faixa audível (teorema de Nyquist: o dobro da maior frequência).'],
              ['Para gravar, uma boa prática de profundidade é:', ['8 bits', '16 bits', '24 bits', '64 bits'], 2, '24 bits dá headroom de gravação com baixo ruído.'],
              ['Se sua linha de áudio "engasga" durante a mixagem, você deve:', ['Aumentar o buffer', 'Diminuir o volume master', 'Trocar de DAW', 'Reduzir o sample rate pela metade'], 0, 'Mais buffer = menos estalos em sessões pesadas.'],
            ],
          },
        },
        {
          title: 'MIDI: notas que viram som',
          objective: 'Entender MIDI como dados de performance e usá-lo para compor.',
          body: `MIDI **não é som** — é recado. Quando você aperta uma tecla do controlador, o MIDI diz: "nota C4, velocity 97, tecla pressionada" e depois "solte". Quem gera o som é o instrumento que recebe o recado (sintetizador, sampler, hardware).

Isso é um superpoder para produção eletrônica:

- Você pode **reescrever notas** depois de gravar (sem tocar de novo)
- **Velocity** define intensidade — é o segredo de grooves humanos
- Um mesmo trecho MIDI pode soar em **qualquer timbre**: troque o instrumento, a música continua
- Você **move melodias** para a oitava certa em um clique

### O mínimo para começar
Grave um trecho MIDI com teclado (físico ou o QWerty da sua DAW), abra no editor de notas e ajuste posição/duração/velocity. A partir daqui, você compõe sem precisar "tocar bem".`,
          durationMin: 10,
          tags: ['fund'],
          quiz: {
            title: 'Quiz — MIDI',
            questions: [
              ['MIDI armazena:', ['Ondas de áudio', 'Dados de performance (nota, duração, velocity)', 'Mixes', 'Projetos finalizados'], 1, 'MIDI descreve a performance; o som vem do instrumento que a recebe.'],
              ['Velocity controla:', ['Otimização da CPU', 'A intensidade de cada nota', 'O BPM do projeto', 'O volume do master'], 1, 'Velocity afeta dinâmica/timbre do instrumento que recebe as notas.'],
              ['Trocar o timbre de uma parte MIDI:', ['Exige regravar tudo', 'Basta trocar o instrumento na trilha', 'Só funciona em áudio', 'Só existe no FL Studio'], 1, 'Esse é um dos maiores ganhos de fluxo de trabalho do MIDI.'],
            ],
          },
        },
        {
          title: 'BPM e por que ele define sua música',
          objective: 'Escolher BPM consciente do gênero e entendê-lo como "esqueleto temporal".',
          body: `BPM (batidas por minuto) é o andamento. Na eletrônica, o BPM quase **escolhe o gênero por você**:

- House: 120–128
- Techno: 128–140
- Psytrance: 140–148
- Trance: 136–142
- Drum & Bass: 165–180
- Downtempo: 70–105

Defina o BPM **antes de compor**: ele muda a sensação de cada loop e a densidade do arranjo. 128 com half-time soa diferente de 174 com meio-tempo (DnB).

### Erro comum
Criar uma ideia a 120, descobrir que ela é um techno e dobrar para 240 sem reescrever os padrões. Prefira começar com o BPM de destino e corrigir o groove.`,
          durationMin: 7,
          tags: ['fund'],
        },
        {
          title: 'Compasso, beat e subdivisão',
          objective: 'Ler a grid 4/4 e subdividir em 16th — a língua materna da música eletrônica.',
          body: `A eletrônica vive no **4/4**: 4 tempos (beats) por compasso, e cada tempo dividido em 4 partes (semicolcheias). Um compasso = **16 passos**.

Contagem de um loop de 1 compasso:
1 e & a, 2 e & a, 3 e & a, 4 e & a

- Kick no **1** (e nos beats inteiros nos gêneros 4-on-the-floor)
- Clap/snare nos beats **2 e 4** (house/techno)
- Hi-hats fechados nas subdivisões **e/a** para movimento
- Abertos no **"e" do 4** como sinal de transição

Esses "1, 2, 3, 4" e os loops de 16 passos são como produtores conversam: "o hat entra no off-beat", "o clap marca 2 e 4". Se você internalizar isso, metade da teoria musical já está paga.`,
          durationMin: 9,
          tags: ['fund', 'ritmo'],
          quiz: {
            title: 'Quiz — Compasso',
            questions: [
              ['Quantos steps de 16th tem um compasso 4/4?', ['8', '12', '16', '32'], 2, '4 beats × 4 subdivisões = 16 passos.'],
              ['Na house music, o clap/snare costuma marcar:', ['Os beats 1 e 3', 'Os beats 2 e 4', 'Todas as semicolcheias', 'Apenas o beat 1'], 1, 'Backbeat nos beats 2 e 4.'],
              ['O "off-beat" do hi-hat fica:', ['Nos beats inteiros', 'Nas subdivisões "e" entre os beats', 'No fim da música', 'No kick'], 1, 'É o "ts" entre os "tsss" dos beats.'],
            ],
          },
        },
        {
          title: 'Ritmo: groove é decisão, não sorte',
          objective: 'Diferenciar pattern de groove e usar deslocamentos para criar corpo rítmico.',
          body: `**Pattern** é *onde* as notas caem. **Groove** é *como* elas caem.

Três ferramentas para criar corpo rítmico (todas funcionam nas três DAWs):

1. **Velocity**: notas alternando forte/fraco criam balança imediata. Ex.: nos hats de 16th, acentue os "e" e "a" em ciclos de 3.
2. **Swing/shuffle**: adia as subdivisões pares, criando o "arrastado". House pede 10–20%; techno, quase zero; psytrance tem swing próprio nos hats.
3. **Ghost notes**: notas muito baixas e discretas que preenchem o ar entre as acentuadas — o ouvinte não percebe, mas sente.

### Prática de elite
Pegue um pattern "morno" e grave só a velocity com a mão no teclado até o groove aparecer. Isso ensina mais que 10 horas lendo teoria.`,
          durationMin: 11,
          tags: ['fund', 'ritmo'],
        },
      ],
    },
    {
      title: 'Melodia e harmonia para produtores',
      summary: 'Notas que cantam e acordes que sustentam.',
      lessons: [
        {
          title: 'Melodia: poucas notas, muita intenção',
          objective: 'Criar melodias memoráveis com motivo, resposta e limites.',
          body: `Boa melodia eletrônica é **curta, repetida e evoluída**. Método do motivo A/B:

1. Toque 3–5 notas que você cantarolaria bêbado às 3h (motivo A)
2. Repita A terminando uma nota mais aguda = pergunta (A)
3. Toque A resolvido descendo = resposta (B)
4. Junte: A-pergunta + B-resposta, 2 compassos. Pronto: um tema.

### Limites que ajudam
- Use **uma escala** (menor natural funciona para quase tudo: 95% do psy/trance/techno)
- Mantenha a melodia numa **oitava** (salto maior = risco)
- Ritmo melódico importa mais que notas: melodias com notas **desalinhadas** dos hats grudam na memória

### Erro comum
16 notas por compasso. Menos notas + mais espaço = mais impacto e mais fácil de arranjar.`,
          durationMin: 10,
          tags: ['fund', 'melodia'],
          practice: ['Escreva o par pergunta/resposta acima no piano roll usando apenas as notas da escala de Ré menor.'],
        },
        {
          title: 'Harmonia: acordes sem trauma',
          objective: 'Usar as 6 famílias de acordes da escala menor para sustentar qualquer tema.',
          body: `Você não precisa de conservatório — precisa da **família da escala**. Na escala menor natural (ex.: Ré menor — notas D E F G A Bb C), os acordes por grau são:

- **i (Dm)** — casa, melancolia
- **III (F)** — esperança relativa
- **iv (Gm)** — profundidade
- **v (Am)** — tensão suave
- **VI (Bb)** — grandiosidade
- **VII (C)** — empurrão para resolver

Progressões eletrônicas que funcionam há 30 anos:
- i – VI – VII – VI (epic psy/trance)
- i – iv – VI – VII (house emotiva)
- i – III – VII – VI (techno melódico)

### Atalho do produtor
Escolha um acorde da lista como "centro" e faça a melodia só com as notas dele + uma passagem. Sua track soa profissional no teste do telefone: se o acorde some e a melodia vira entulho, refine a nota da discórdia.`,
          durationMin: 12,
          tags: ['fund', 'melodia'],
          quiz: {
            title: 'Quiz — Harmonia',
            questions: [
              ['Na escala menor natural, o grau VI em Ré menor é:', ['Bb maior', 'A menor', 'F maior', 'C maior'], 0, 'O VI grau é sempre um acorde maior um tom abaixo do VII.'],
              ['Uma progressão típica de psytrance/trance é:', ['i – VI – VII – VI', 'I – IV – V – I', 'ii – V – I', 'bII – bVI – III'], 0, 'Simples, cíclica e tensa na medida.'],
              ['Se sua melodia "quebra" quando o acorde sai:', ['Troque o synth', 'Use mais notas da escala', 'As notas da melodia precisam dialogar com o acorde', 'Desista da ideia'], 2, 'Melodia e harmonia compartilham a mesma escala — e as notas fortes devem bater com o acorde.'],
            ],
          },
        },
      ],
    },
    {
      title: 'Suas ferramentas: samples, plugins, synths e FX',
      summary: 'O arsenal de som e onde cada peça se encaixa.',
      lessons: [
        {
          title: 'Samples: matéria-prima com licenças',
          objective: 'Usar samples com critério musical — e nunca com problema legal.',
          body: `Sample é um trecho de áudio reaproveitado: um kick, uma voz, um ruído de metrô. Produzir eletrônico é, em parte, **colagem**.

### Camadas de um sample bem usado
1. **Som original** → escolha pela textura, não pela familiaridade
2. **Recorte** → corte o ataque/sustentação que importa
3. **Distorção/transformação** → pitch, reverso, slice, formant — "tornar seu"
4. **Processamento** → EQ/saturation para encaixar na mixagem

### Sobre direito autoral (regra inegociável aqui)
Use apenas samples **royalty-free/licenciados** ou criados por você. "Todo mundo faz" não protege: plataformas removem faixas por Content ID e processos reais existem. A biblioteca da Sonora só aceita material licenciado ou próprio.

### Erro comum
Empilhar 5 hi-hats "por engrossar" e matar o groove. Menos, processado com intenção, soa maior.`,
          durationMin: 9,
          tags: ['fund', 'drums'],
        },
        {
          title: 'Plugins: tipos e quando usar',
          objective: 'Mapear a família dos plugins (instruments x FX) e montar seu minimal kit.',
          body: `Plugins são softwares que vivem dentro da DAW. Famílias:

- **Instrumentos (VSTi/AU)**: geram som — sintetizadores, samplers, emuladores
- **Equalizadores**: moldam o conteúdo de frequência (cortar, realçar, limpar)
- **Dinâmica**: compressor (controla variações), gate (silencia), limiter (teto de segurança)
- **Modulação**: chorus, flanger, phaser (dão movimento)
- **Espaço**: reverb e delay (tamanho e distância)
- **Saturação/distorção**: harmônicos, calor, agressividade
- **Utilitários**: medidores de loudness/peak, analisadores de espectro, stereo image

Monte o **kit minimal**: 1 synth versátil, 1 sampler, 1 EQ analítico, 1 compressor, 1 reverb, 1 delay, 1 saturador, 1 medidor. Com esse time você faz 95% de qualquer gênero — o resto é desejo.`,
          durationMin: 8,
          tags: ['fund'],
          quiz: {
            title: 'Quiz — Plugins',
            questions: [
              ['Qual controla a VARIAÇÃO de volume ao longo do tempo?', ['EQ', 'Compressor', 'Delay', 'Phaser'], 1, 'Compressor = dinâmica.'],
              ['Limiter serve para:', ['Dar "ar" à música', 'Garantir que o sinal não passe de um teto', 'Tocar mais rápido', 'Stereo mais largo'], 1, 'É um compressor com razão extrema — rede de proteção.'],
              ['Reverb e delay criam:', ['Pitch', 'Espaço', 'Grave', 'Panorama'], 1, 'Ambos são a "sala" da sua música.'],
            ],
          },
        },
        {
          title: 'Sintetizadores: o motor de som',
          objective: 'Reconhecer a arquitetura comum (osc → filtro → amp) de qualquer synth.',
          body: `Todo sintetizador subtrativo (3x Osc, Serum, Vital, Subtractor, Retrologue — a lista não acaba) conta a mesma história:

**Osciladores → Filtro → Envelope de volume → Saída**

- **Osciladores**: geram a onda bruta (saw = agressiva, square = oca, sine = pura, triangle = suave)
- **Filtro**: corta frequências; a **cutoff** é o "botão da escuridão/brilho"
- **Envelope (ADSR)**: como o som nasce e morre — Attack (entrada), Decay/Sustain/Release
- **LFOs**: automação cíclica (vibrato, wobble, pulsos rítmicos)

Memorize essa cadeia e você lê qualquer synth novo em 5 minutos. Curso 05 explora cada módulo com profundidade — aqui você só precisa **reconhecer o mapa**.`,
          durationMin: 10,
          tags: ['fund', 'synth'],
        },
        {
          title: 'Efeitos: menos é mixagem',
          objective: 'Usar FX com função (limpar, equilibrar, criar espaço) e não como decoração.',
          body: `Efeitos resolvem problemas — não escondem ausência de ideia. As três funções:

1. **Correção**: EQ tira o que sobra, highpass limpa graves que competem com kick/bass
2. **Caráter**: saturação dá corpo; delay curto dá "cola"
3. **Espaço**: reverb/delay longos definem o "tamanho da sala"

### O teste dos 10 segundos
Bypass um FX e conte: se após 10 segundos você nem sente falta, o FX era decoração (remove!). Se a música fica "nua", ele é estrutural (mantém e refina).

Regra de bolso do iniciante: **toda trilha com graves passa por highpass** (menos kick/bass, que têm trabalho de grave próprio). E o reverb quase sempre precisa de EQ **depois** dele, cortando os graves — senão a mix vira lama.`,
          durationMin: 8,
          tags: ['fund', 'mix'],
          practice: ['Liste os efeitos abertos na sua sessão atual e marque: (C)orreção, (Ca)rater ou (E)spaço — ou "decoração".'],
        },
      ],
    },
    {
      title: 'Organização de projeto',
      summary: 'Hábitos que separam quem termina música de quem coleciona loops.',
      lessons: [
        {
          title: 'Organização de projeto',
          objective: 'Estruturar pastas, nomear clips e preparar o projeto para ser finalizado.',
          body: `Projetos bagunçados **matam a finalização**. Você abandona o que não entende. Setup padrão em 4 passos:

1. **Pasta do projeto única**: Samples, Presets, Bounces, Docs (o "salvar com arquivos" da sua DAW)
2. **Nomear tudo**: KICK_A, BASS_SUB, LEAD_MAIN, FX riser 01 — zero "audio_247.wav"
3. **Colorir e agrupar**: percussão em verde, graves vermelho, leads azul, FX amarelo — o cérebro lê cores em 0,2s
4. **Marker de estrutura**: Intro / Break / Build / Drop A / Drop B na linha do tempo (ou scene labels na Session)

### Template é disciplina
Depois do 3º projeto, monte um template: BPM 0? não — BPM do gênero, canais nomeados, buses (Drums/Bass/Synth/FX) com os FX de costume, e o padrão de arranjo com marcadores. Você vai economizar minutos preciosos **por decisão criativa**.`,
          durationMin: 10,
          tags: ['fund'],
          files: [
            file('checklist-nova-sessao.txt', 'checklist', 'Cole no bloco de notas ou imprima.', `SONORA — CHECKLIST DE NOVA SESSÃO
[ ] Pasta de projeto criada (Samples / Presets / Bounces / Docs)
[ ] BPM definido pelo gênero
[ ] Tonalidade anotada na primeira barra (ou no nome do projeto)
[ ] Canais nomeados e coloridos
[ ] Buses criados: Drums / Bass / Synths / FX / Send Reverb
[ ] Referências na pasta Docs
[ ] Meta da sessão escrita (ex.: "fechar 16 compassos do drop")`),
          ],
          challenge: 'Reorganize seu projeto mais antigo e bagunçado em 15 minutos. Registre antes/depois com print do arranjo.',
        },
      ],
    },
  ],
})

const eletr = buildCourse({
  slug: 'fundamentos-eletronica',
  title: 'Curso 02 — Fundamentos da Música Eletrônica',
  subtitle: 'Kick, clap, hats, bass, leads, pads, FX: os personagens de qualquer track.',
  description:
    'Cada elemento de uma track eletrônica é um personagem com função. Este curso ensina o que cada um faz, como se comportam e como montar um groove completo.',
  track: 'foundations',
  level: 'iniciante',
  order: 2,
  estHours: 5,
  objectives: ['Reconhecer a função de cada elemento em uma track de referência', 'Construir um groove de 16 compassos com bateria, baixo e textura', 'Preparar seus sons para mixagem desde a origem'],
  tags: ['fund', 'drums', 'bass'],
  modules: [
    {
      title: 'O motor rítmico',
      summary: 'Kick, snare/clap, hi-hats e percussão.',
      lessons: [
        {
          title: 'Kick: a espinha dorsal',
          objective: 'Escolher e esculpir kicks: ataque, sustain, decay e afinação.',
          body: `O kick define gênero, energia e corpo da pista. Anatomia em 4 camadas:

- **Clique/ataque** (0–2 kHz + transiente): define "tamanho" percebido; techno pede mais
- **Corpo** (60–120 Hz): a energia grave; psytrance curta, house redonda
- **Decay**: o fôlego do kick — decay longo embola com bassline rápida
- **Pitch tail**: o "pew" grave; afine o kick **na tonalidade** da track (nota fundamental comum: A ou D)

### Teste de 30 segundos
Solo no kick + headroom: soa "gordo" no celular (ligue a caixinha) e no sub? Se só soar ok nos dois, escolha esse.

Não empilhe 7 camadas: 1 sample bom + 1 ajuste de EQ + 1 toque de transient/saturação resolve 90% dos casos.`,
          durationMin: 11,
          tags: ['fund', 'drums'],
          dawSteps: {
            fl: [
              'No Channel Rack, clique no slot e carregue um kick (drag do Browser).',
              'Na trilha do Mixer, use Fruity Parametric EQ 2 para realçar 60–100 Hz e o clique em ~2.5 kHz.',
            ],
            ab: [
              'Arraste um kick para uma trilha de áudio (Session ou Arrangement).',
              'Abra o Simpler e use a seção Transpose para afinar o kick; EQ Eight corta o sub-lixo abaixo de 30 Hz.',
            ],
            cu: [
              'Crie uma trilha de áudio (ou use Groove Agent) e arraste o kick para a timeline.',
              'No Inspector, use Channel EQ; afinação via Processor "PitchShift" quando necessário.',
            ],
          },
        },
        {
          title: 'Snare & clap: o backbeat',
          objective: 'Posicionar clap/snare nos beats 2 e 4 e escolher textura certa.',
          body: `Nos gêneros 4-on-the-floor (house, techno, trance, psy), o clap/snare marca **beats 2 e 4** — é o que faz a plateia bater palma.

Escolha por gênero:
- **House**: clap "palmada", ataque rápido, cauda curta
- **Techno**: clap seco + layer de snare curto para agressão
- **Trance/psy**: clap + snare no lugar, com cauda levemente reverberada
- **EDM/festival**: big snare com saturação

### Layering sem virar sopa
Camada 1: o corpo (sample principal). Camada 2: o clique/snappy (2–5 kHz). Camada 3 (opcional): "cauda" (ruido curto). Ajuste ganhos: corpo 0 dB, snappy −8 dB, cauda −14 dB. Dê **leve atraso (3–10 ms)** nas camadas para naturalidade.

E highpass no clap! Abaixo de ~120 Hz ele só disputa com o bass.`,
          durationMin: 10,
          tags: ['fund', 'drums'],
        },
        {
          title: 'Hi-hats e percussão: o ar',
          objective: 'Programar hats em 16th com velocity variada e adicionar percussão de corpo.',
          body: `Hats preenchem o "respiro" entre kick e clap. Funções:

- **Closed hats**: movimento; 8th (house), 16th (psy/techno), com **velocity em padrão 3** (forte-fraco-fraco)
- **Open hat**: no off-beat (o "e" do beat) — sinal clássico de pista
- **Ride**: nas transições e drops longos (o "shhhh" contínuo = energia alta)
- **Percussão**: congas, rimshots, tambourines deslocados criam groove sem "encher"

### Humanização mínima viável
±10–15 ms de deslocamento + variação de 2–5 dB de velocity já soa "tocada". Pendure **shaker** em 16th contínuo e faça automação de volume: o drop respira com ele.

Regra de panning: hats em pares esterilizados L15°/R15°, percussão mais larga que clap — mas **nunca** grave no lado.`,
          durationMin: 11,
          tags: ['fund', 'drums', 'ritmo'],
          practice: ['Crie 2 compassos de hats em 16th: velocity alternando, um open hat no "e" do beat 4 e um shaker a −12 dB.'],
        },
      ],
    },
    {
      title: 'Corpos harmônicos',
      summary: 'Bass, lead, pluck, pad e os papéis de cada um.',
      lessons: [
        {
          title: 'Bass: o que o corpo escuta',
          objective: 'Diferenciar sub bass, mid bass e o papel de cada um no groove.',
          body: `Em eletrônica, **bass = grave + ritmo**. Dois planos:

- **Sub**: 20–100 Hz, senoidal ou quase, segue a raiz do acorde, sem pan, mono
- **Mid/Top bass**: 100–800 Hz, textura/sustentação (saturation, saw), pode "conversar" com kick e levar movimento

O groove do baixo **espelha o kick**: se o kick é 4-on-the-floor, notas longas soam como acorde colado; notas curtas no "e" do beat criam pumping rítmico (psy: off-beat clássico — kick no beat, bass no off-beat).

No Curso 04 você estuda a relação kick/bass a fundo (sidechain, EQ, envelope). Aqui, o dever: **grave o papel** — qual faixa o seu bass deve ocupar SEMPRE e qual ele deve ceder quando o kick toca.`,
          durationMin: 10,
          tags: ['fund', 'bass'],
        },
        {
          title: 'Lead, pluck, pad: melodia em três pesos',
          objective: 'Escolher a ferramenta certa para cada função melódica.',
          body: `- **Lead**: a voz cantada do drop — sustain médio/longo, filtro aberto, 1–2 kHz de presença, delay curto para "voar". É o elemento que a plateia assobia.
- **Pluck**: ataque rápido + release curto (o "plim") — arpejos e contramelodias. ADSR de sustain ~0 e release 150–300 ms é a receita.
- **Pad**: o "clima" — sustenta harmonia e espaço, frequências médias-altas, reverb longo com graves cortados. Pad é **cola emocional**, não conteúdo rítmico.

### Combinação que funciona
Pluck arpejado em 16th + pad nos acordes longos = tensão que pede lead no drop. Em breakdowns, swap: pad vira protagonista, pluck entra no build.

Não use os três ao mesmo tempo em 100% da track: contraste é o que separa "produção" de "wall of sound".`,
          durationMin: 9,
          tags: ['fund', 'melodia'],
        },
        {
          title: 'FX: risers, impacts, atms e transitions',
          objective: 'Construir tensão e liberação com efeitos de transição.',
          body: `Elementos de FX **narram a forma** da música:

- **Riser**: ruído/tom que sobe em 4 ou 8 compassos antes do drop (volume crescente + filtro ascendente + pitch). O "arrepio" é do automation do **filtro**, não só do volume.
- **Impact**: boom no primeiro beat do drop (white noise cauda + sub thud + reverso do próprio riser).
- **Downlifter/whirl**: riser invertido para sair do breakdown.
- **Atmos/texture**: field recordings, ruído de sala, fita — o "ar" da track, quase sempre a −20 dB.
- **Sweepers/transition FX**: whoosh curto que cola viradas.

### Regras de ouro
1. Impact e primeiro beat do drop: **alinhados no transiente do kick**, não 10 ms antes.
2. FX de transição têm **curta vida** (menos de 1 compasso), exceto risers de tensão.
3. Atmos vive em **stereo wide** e passa por highpass + lowpass — não compete.`,
          durationMin: 9,
          tags: ['fund', 'arranjo'],
          files: [
            file('anatomia-riser.txt', 'guide', 'Guia rápido de automação de riser.', `ANATOMIA DE UM RISER (8 compassos)
Barra 00-03: ruído filtrado em LP, cutoff ~200Hz, -24dB
Barra 03-06: cutoff sobe, +pitch do noise, entrada do snare roll (1/8 -> 1/16 -> 1/32)
Barra 07: volume sobe, LP vira BP, white noise abre total
Barra 08 beat 1: IMPACT + primeiro kick do drop
Barra 08 (pós): corte abrupto do riser -> silêncio de 1/8 = tensão máxima`),
          ],
        },
      ],
    },
    {
      title: 'Groove: o feeling que se sente',
      summary: 'Grooves, swing e o projeto final do curso.',
      lessons: [
        {
          title: 'Groove e swing na prática',
          objective: 'Aplicar swing, acentos e espaço para transformar patterns em grooves.',
          body: `Groove é a **matemática da sensação**. Três parafusos:

1. **Swing** (0–30%): quanto as subdivisões pares atrasam. House 12–18%, broken beat 25%+, techno 0–8%, psy usa 12–16% nos hats.
2. **Acentos cíclicos**: acento a cada 3 hats numa grid de 4 = polirritmia sutil que faz a cabeça balançar sem "explicação".
3. **Espaço**: o groove mora nos **silêncios**. Mute o 4º hat de cada par de compassos por 2 compassos, reintroduza — é o "respiro" mais barato da produção.

Projeto do curso: junte tudo em um groove de 16 compassos (kick, clap, hats, bass de uma nota e pad), **sem melodia** — só motor rítmico + sub. Se ele fizer balançar sozinho, você entendeu o Curso 02.`,
          durationMin: 12,
          tags: ['fund', 'ritmo'],
          challenge: 'Grave um vídeo/print do seu groove tocando 16 compassos e registre no Projeto 02. Meta: alguém balança a cabeça antes do drop.',
        },
      ],
    },
  ],
})

const beat = buildCourse({
  slug: 'beatmaking',
  title: 'Curso 03 — Beatmaking',
  subtitle: 'Bateria completa: patterns, humanização, layering e processamento.',
  description:
    'O aprofundamento em bateria eletrônica: do pattern ao kit final processado. Projeto: criar uma bateria completa com variações.',
  track: 'foundations',
  level: 'iniciante',
  order: 3,
  estHours: 4,
  objectives: ['Escrever patterns de bateria com intenção rítmica', 'Humanizar e criar variações', 'Processar e bus de bateria com critério'],
  tags: ['drums', 'ritmo'],
  modules: [
    {
      title: 'Patterns com função',
      summary: 'Padrões, grooves e variações.',
      lessons: [
        {
          title: 'Criação de padrões: da grid ao feel',
          objective: 'Construir padrões de kick+percussão estáveis com pontos de variação.',
          body: `Todo pattern de bateria tem **âncoras** (o que não muda) e **ornamentos** (o que varia).

Âncoras house: kick 1,2,3,4; clap 2 e 4; hat no "e" (off-beat). Ornamentos: kick extra no "a" do 4, clap ghost, rimshot deslocado.

Método:
1. Escreva só as âncoras (1 compasso) e ligue 4 loops
2. Adicione **1 variação** no beat 4 de cada 2 compassos (fill ou drop-out de hat)
3. Depois de 8 loops, faça o pattern "quebrar" o ciclo: remova um elemento por 1 compasso (tensão) e reintroduza no drop

Pattern repetitivo **não é defeito** — é função (hipnose de pista). A arte é onde e quando você quebra.`,
          durationMin: 10,
          tags: ['drums', 'ritmo'],
        },
        {
          title: 'Velocity e humanização',
          objective: 'Aplicar velocity dinâmica e micro-timing para baterias que respiram.',
          body: `Bateria "de mouse" tem velocity 100% e timing 0 ms. Bateria viva tem:

- **Variação de velocity**: kicks 100/97/99, hats 45–75 em ciclos, clap 108–118. Nada de picos aleatórios: **padrões** (3, 5, 7) soam musicais
- **Micro-timing**: ±5–15 ms de offset nas notas "fracas"
- **Roubo de oitava**: snare 1 semitone acima no fill = acento perceptivo
- **Corte de cauda**: encadear snares com -20 ms de sobreposição em vez de +20 ms = "empurra" a grid

Use o botão/roda de **humanize** da sua DAW apenas como partida; ajuste a mão nos transientes principais (kick e clap), que são os que mais definem o balanço.`,
          durationMin: 10,
          tags: ['drums', 'ritmo'],
          quiz: {
            title: 'Quiz — Humanização',
            questions: [
              ['Variações de velocity soam mais naturais quando:', ['São totalmente aleatórias', 'Seguem ciclos/padrões curtos', 'Ficam todas em 100', 'Só no hi-hat'], 1, 'Padrões de 3/5 criam repetição "viva" em vez de ruído.'],
              ['Micro-timing para baterias "arrastadas" adia:', ['Kick e clap sempre', 'As notas de subdivisão fracas', 'O reverb', 'O primeiro beat'], 1, 'O groove mora nos retardos leves das notas de passagem.'],
            ],
          },
        },
        {
          title: 'Swing, shuffle e straight',
          objective: 'Escolher feel rítmico por gênero e aplicar swing com moderação.',
          body: `Swing não é opcional — é **de decisão por gênero**:

- **Techno/minimal**: straight (0–5%) — a precisão mecânica é a estética
- **House**: 12–20% — o balanço é o DNA
- **Garage/UK/broken beat**: 25–35% — quase triplet
- **Drum & Bass**: swing leve no snare (5–10 ms atrasado) + hats straight
- **Psytrance**: hats straight com **ghost hats deslocados** (o "galope" vem de notes extras, não do swing)

Na dúvida, faça o A/B: renderize o loop com swing 0% e 15%. Gêneros de pista "dura" pedem grid; gêneros de corpo pedem atraso.

Ferramentas: slider de swing da DAW, ou **mover notas "e" manualmente** (controle fino que nenhum preset dá).`,
          durationMin: 9,
          tags: ['drums', 'ritmo'],
        },
      ],
    },
    {
      title: 'Cor e força da bateria',
      summary: 'Layering e processamento.',
      lessons: [
        {
          title: 'Layering de bateria sem virar lama',
          objective: 'Empilhar camadas com papéis definidos (corpo/ataque/cauda) e fase sob controle.',
          body: `Camadas têm **função única**:

- Layer 1: **corpo** — 60–150 Hz (o "tumbo" do kick)
- Layer 2: **ataque** — 2–6 kHz (o "tack" que o ouvido localiza)
- Layer 3: **cauda** — ruído curto/decay (a "sujeira")

Regras:
1. Solo L1, depois L1+L2, e **inverta a fase** do L2: se engrossa, certa; se some, invertida. Repita para cada par
2. Frequências de corte: L2 highpass em 800 Hz (não invade corpo), L3 highpass 3 kHz
3. Caudas **comprimidas** (ataque livre, cauda 4:1) para não competir com o pad

Um kick com 2 layers bem filtrados > 5 layers empilhados aleatoriamente.`,
          durationMin: 11,
          tags: ['drums'],
          dawSteps: {
            fl: [
              'No Channel Rack, use um slot por layer; roteie os 3 para o mesmo canal do Mixer.',
              'No mixer, aplique Fruity Parametric EQ 2 por layer (HP 30Hz / LP 6k etc) e Invert no plugin "Fruity Stereo Shaper" ou no próprio equalizador se necessário.',
            ],
            ab: [
              'Use um Drum Rack: cells "Kick Body" e "Kick Attack" na mesma cell (chain dentro do rack).',
              'Aplique Utility > Phase Invert na layer superior para o teste de fase; EQ Eight para os cortes.',
            ],
            cu: [
              'Crie uma trilha MIDI com o Drum Editor; use inserts "Layer" no kit do Groove Agent ou trilhas paralelas roteadas a um Group.',
              'No MixConsole, use In-Phase/Out-Phase no canal (botão direito no fader) e Channel EQ por camada.',
            ],
          },
        },
        {
          title: 'Processamento: bus de bateria e glue',
          objective: 'Criar o bus Drums e processar a bateria como unidade.',
          body: `Bateria é **um instrumento** — processa-se em grupo.

Bus Drums (todas as percussões roteadas):
1. **EQ**: highpass 20–30 Hz, corte cirúrgico se "tapa" em 300–500 Hz
2. **Compressão glue**: 2:1 a 4:1, attack lento (10–30 ms, deixa o transiente), release rápido (30–60 ms), gain reduction alvo 2–4 dB
3. **Saturação leve** (tape): cola e harmônicos
4. **Optional parallel**: mande a um bus comprimido 10:1 e misture a −18 dB — punch sem esmagar

### Ordem que soa bem
Transientes → dinâmica → cor (saturação) → espaço (se usar send de reverb da caixa). Reverb **por send**, short room, HP/LP, e só em snare/clap/fills — hats reverbados lambem o groove.`,
          durationMin: 12,
          tags: ['drums', 'mix'],
          challenge: 'Crie o bus Drums da sua sessão com EQ + comp glue e mande o print do medidor de GR para o seu diário de projeto.',
          practice: ['Bounce da bateria: 4 compassos sem o bus, 4 com. Compare no volume igualado (ganho do bus ajustado).'],
        },
      ],
    },
  ],
})

const bass = buildCourse({
  slug: 'bassline',
  title: 'Curso 04 — Bassline',
  subtitle: 'A relação kick/bass: sub, envelope, sidechain, EQ e saturação.',
  description:
    'O curso que resolve o "meu grave está embolado". Kick e bass como um sistema único — do desenho do sub ao sidechain musical.',
  track: 'foundations',
  level: 'intermediario',
  order: 4,
  estHours: 5,
  objectives: ['Projetar basslines com envelope e notas que respiram com o kick', 'Aplicar sidechain com ganho de intenção, não por medo', 'EQ e saturação para grave legível em qualquer sistema'],
  tags: ['bass'],
  modules: [
    {
      title: 'Sistema kick + bass',
      summary: 'Domínio de frequência, envelope e notas.',
      lessons: [
        {
          title: 'A relação kick/bass',
          objective: 'Mapear quem ocupa qual faixa e por onde o grave some.',
          body: `Kick e bass disputam 40–120 Hz. Decisões (nesta ordem):

1. **Tune the kick**: fundamental do kick (ex.: ~50 Hz) deve ser **nota vizinha** (1 ou 5) da raiz do bass na mesma região — senão batem e "rodam"
2. **Decay**: kick longo + bass denso = lama. Em gêneros densos (psy, techno), kick curto (150–250 ms) e bass com envelope curto ganha
3. **Distribuição**: kick fica com 40–100 Hz, bass com 80–200 (mid-bass) — ou o inverso, se o gênero pede o "wub" grave
4. **O "vazio" deliberado**: bass **fora** do beat 1 (off-beat) = espaço grátis e groove (é a técnica psy)

O teste final: celular no bolso (falante). Se você sente o bounce, está legível. Sub grave só se ouve em monitor bom — e o celular aprova o que funciona.`,
          durationMin: 11,
          tags: ['bass'],
        },
        {
          title: 'Sub x Mid Bass',
          objective: 'Separar funções: sub mono/contínuo e mid texturizado/direcional.',
          body: `Grave profissional é **híbrido**:

- **Sub**: senoidal (ou quase), 20–90 Hz, mono, sem stereo, envelope "redondo", segue só a raiz. É o chão
- **Mid bass**: 100–500 Hz, forma de onda com harmônicos (saw/square), saturação, filtro modulado, pode ter leve stereo **acima de ~200 Hz**. É o personagem

Truque do split: um único canal com **multiband** (ou dois canais da mesma MIDI clip): path 1 → HP 100 + senoidal sub; path 2 → saturação/distorção; soma com -6 dB de headroom.

**Regra do mono**: abaixo de ~120 Hz nada estéreo. "Stereo width" em graves = phase issues em club PA e em celulares.`,
          durationMin: 10,
          tags: ['bass'],
          practice: ['Desenhe em 2 compassos: nota raiz do sub em 4-on-the-floor + mid-bass rítmico no off-beat. Ouça no celular.'],
        },
        {
          title: 'Envelope e ADSR do bass',
          objective: 'Escolher attack/decay/sustain/release para cada função.',
          body: `O envelope é o "jeito de andar" do bass:

- **Attack 0–10 ms**: quase todo bass eletrônico. Attack longo = pad (errado aqui)
- **Decay**: controla o "pluck" — em psy/techno, decay curto (100–300 ms) mantém o grave magro e rápido
- **Sustain**: 60–90% para notas "sentadas", 20–40% para "bouncy"
- **Release**: curto se você quer silêncio entre notas (notas de 16th com release longo = borramento); use sustain baixa + release médio para o "wobble controlado"

**Modulação de pitch no ataque** (0.2–1 semitons subindo em 30–60 ms) adiciona "pop" perceptivo sem aumentar volume médio — truque de festival.

No piano roll, trabalhe **nota + comprimento + envelope** como uma frase de percussão: o bass é metade da bateria da música.`,
          durationMin: 10,
          tags: ['bass'],
          quiz: {
            title: 'Quiz — Envelope',
            questions: [
              ['Para um pluck bass rápido, o release deve ser:', ['Muito longo', 'Curto o bastante para limpar entre notas', 'Ignorado', 'O dobro do decay'], 1, 'Release limpo = grid limpa.'],
              ['Attack de 500 ms num bass soa como:', ['Punchy', 'Um pad lento (errado para groove)', 'Mais alto', 'Stereo'], 1, 'Ataque lento = ataque "de pad".'],
            ],
          },
        },
      ],
    },
    {
      title: 'Dinâmica e cor',
      summary: 'Sidechain, EQ, saturação e compressão no grave.',
      lessons: [
        {
          title: 'Sidechain: a arte de ceder',
          objective: 'Usar sidechain como ferramenta rítmica, com valores musicais.',
          body: `Sidechain não é "toda faixa com compressor ligado". É **coreografia**:

- **House**: ducking 4-on-the-floor, redução 6–10 dB, release curto-médio (60–120 ms) = o "pump" é o groove
- **Techno**: ducking leve (2–4 dB), release rápido, só para limpar 40–80 Hz
- **Psytrance**: ducking **extremo** (10–16 dB) com release curto = kick e bass conversam em off-beat
- **Breakdowns**: aumente o sidechain no build (mais pump = tensão), zerar no primeiro beat do drop

Parâmetros que importam: threshold (quando o kick empurra), ratio (quão fundo), attack (quase 0–3 ms), release (a "respiração").

### Sidechain de outro tipo
Rode um **gate** do compressor só em **mídios-altos** do pad/atmos (HP 2 kHz) e mantenha grave solto — o efeito "ar que some" é dramático e barato.`,
          durationMin: 12,
          tags: ['bass', 'mix'],
          dawSteps: {
            fl: [
              'No Mixer, selecione o canal do Kick > botão "Sidechain" (clique-direito) > "Create sidechain to...": escolha o canal do Bass.',
              'No Bass, insira o Fruity Limiter na aba COMP, selecione o sidechain no canto inferior, use Ratio ~8:1, ataque 0–1 ms, release 60–120 ms e ajuste o Threshold até a redução desejada.',
            ],
            ab: [
              'No canal do Bass, insira o Compressor; clique na seta "Side Chain" (topo) e ative Audio From, escolhendo a trilha do Kick.',
              'Ative o botão "EQ" do sidechain (HP em ~120 Hz) para o kick só "empurrar" o grave; ajuste attack ~0,1 ms e release musical.',
            ],
            cu: [
              'Na trilha do Kick, MixConsole > Send/Routing > "Sidechain" para o bus do Bass (ou use a saída do canal para o sidechain do insert).',
              'No Bass, insira o Compressor; habilite External Side Chain no plugin, ataque curto e release 50–150 ms.',
            ],
          },
          practice: ['Aplique sidechain no seu bass com 6 dB de redução e automatize o ratio a mais durante 1 build de 4 compassos.'],
        },
        {
          title: 'EQ de baixo: limpar sem matar',
          objective: 'Fazer um plano de EQ: sub contínuo, mid com "dente", cortes cirúrgicos.',
          body: `Plano em 4 movimentos:

1. **Highpass do "resto do mundo"**: tudo que não é kick/bass recebe HP (hats 200 Hz, pad 150 Hz, lead 200–300 Hz). O grave é clube fechado: 2 membros
2. **Corte de disputa**: no bass, procure 40–120 Hz e **solo** com o kick; onde "embola" (geralmente em 1 banda de 1/3 de oitava), corte 2–4 dB em **Q alto**, na frequência exata do conflito — não no chute
3. **Realce de legibilidade**: mid-bass ganha 1–2 dB em 250–500 Hz (presença em caixinhas)
4. **Sub seguro**: alta 0.5–1 dB em 50–70 Hz só se o sistema for grande; senão, deixe o natural

Ferramenta de decisão: **analisador com freeze** + escutar, não "ver". EQ de olhos primeiro no iniciante = 100% de mixagens "magra".`,
          durationMin: 10,
          tags: ['bass', 'mix'],
        },
        {
          title: 'Saturação, distorção e compressão no bass',
          objective: 'Adicionar harmônicos e controlar dinâmica de graves sem perder o sub.',
          body: `**Saturação** cria harmônicos que **fazem o cérebro ouvir o grave** mesmo sem sub pesado (psicoacústica). É como o mid-bass fica grande em celular.

- Tape leve: calor e "peso" (drive 10–25%)
- Bit/decimate: textura de psy acid
- Tube/harmonic: mid-bass de house
- Distorção agressiva (techno): **após** uma band de 200 Hz+, com pré-HP; nunca distorcer 0–120 Hz direto (vira "granulada" de sub)

**Compressão** no bass: ratio baixo (2:1), ataque lento (deixa a nota nascer) + release auto, alvo 2–4 dB — para **sustentar**, não amassar.

Regra do sub: se a saturação mexe no 20–90 Hz, você distorceu cedo demais. Distorção no mid → **depois** junte o sub limpo (paralelo ou split de banda).`,
          durationMin: 12,
          tags: ['bass', 'mix'],
          challenge: 'Projeto do curso: "Bassline profissional" — sub (seno, envelope curto), mid com saturation, sidechain de 6–10 dB e um filtro automatizado no último compasso do loop. Grave na seção Feedback.',
        },
      ],
    },
  ],
})

const synth = buildCourse({
  slug: 'sintese-sound-design',
  title: 'Curso 05 — Síntese e Sound Design',
  subtitle: 'Subtrativa, FM, wavetable, granular e resampling — para não depender de presets.',
  description:
    'Domine os motores de síntese e crie um banco de presets próprios: 3 basses, 2 leads, 1 pad, 1 pluck e 3 FX que ninguém mais tem.',
  track: 'foundations',
  level: 'intermediario',
  order: 5,
  estHours: 6,
  objectives: ['Programar síntese subtrativa de ponta a ponta', 'Reconhecer e usar FM, wavetable e granular', 'Criar e catalogar um banco próprio de presets'],
  tags: ['synth'],
  modules: [
    {
      title: 'Subtrativa: o tronco da árvore',
      summary: 'Osciladores, filtros, envelopes, LFOs e matriz de modulação.',
      lessons: [
        {
          title: 'Osciladores e waveforms',
          objective: 'Ler formas de onda e prever timbre.',
          body: `Formas básicas e o que "prometem":

- **Sine**: pura — sub, kick tail, pads suaves com detune
- **Saw**: agressiva, harmônicos ímpares e pares — leads e basses (o "padrão do trance")
- **Square/rectangle**: ocas (50%) — "video-game", leads de psy e plucks
- **Triangle**: macia, quase sine com dente — plucks redondos

**Unison/detune**: 3–7 vozes desafinadas (7–15 cents) = largura e "coro". Cuidado: unison 7x em mono bass = fase confusa — use unison só em leads/pads.

**Oitava e subosc**: saw + square uma oitava abaixo = bass com corpo sem EQ.`,
          durationMin: 10,
          tags: ['synth'],
        },
        {
          title: 'Filtros: luz e sombra',
          objective: 'Escolher tipo de filtro (LP/HP/BP), ressonância e drive.',
          body: `O filtro é o "gesto" do timbre:

- **Lowpass (LP)**: o clássico — abre no ataque, fecha no release (o "quack" e o "aaoo")
- **Highpass (HP)**: lead fino e "cortante"; bom para plucks de psy
- **Bandpass (BP)**: ressonância alta = "sirene" (o acido 303)
- **Types 12/24/48 dB**: mais dB = mais "fechado" o corte

**Ressonância (Q)**: 20–30% realça a nota do corte (perceptível); >40% autoscila (vira "piu") — ótimo para FX, péssimo para bass limpo.

**Drive/pré-filtro**: ganho antes do LP = saturação dos harmônicos + "mordida". É como os 303 soam "gordos".

No seu synth, automatize **cutoff** (nunca só volume) para criar movimento. O ouvido sente o filtro como "respiração".`,
          durationMin: 11,
          tags: ['synth'],
          quiz: {
            title: 'Quiz — Filtros',
            questions: [
              ['Ressonância alta demais:', ['Deixa o corte mais "musical"', 'Pode gerar autoss oscilação', 'Reduz o timbre', 'Dá stereo'], 1, 'Q alto empurra o pico e o filtro vira gerador.'],
              ['Drive antes do filtro serve para:', ['Mais saturação/harmônicos no ataque', 'Reduzir CPU', 'Mais volume no master', 'Remover reverb'], 0, 'É o "segredo do ácido".'],
            ],
          },
        },
        {
          title: 'Envelopes e LFO na matriz de modulação',
          objective: 'Roteiar envelopes/LFOs a pitch/cutoff/volume e criar movimento rítmico.',
          body: `Matriz de modulação = "o que controla o quê":

- **Amp env (ADSR)** → VCA: o "jeito de andar" (plucks: sustain 0, release 200 ms)
- **Env 2 invertido** → Cutoff: ataque abre, decai = "wah" natural de cada nota (essencial em bassline de psy)
- **LFO a 1/8, 1/16** (sincronizado!) → Cutoff = wobble rítmico; → Volume = tremolo; → Pitch = vibrato
- **Step LFO** → Cutoff ou Volume = "gates" (aquele "tch-tch" de festival)

Sincronize LFO ao tempo **sempre** (1/8 ou 1/16), senão o movimento "boia".

Projeto: crie um gate com volume a 1/16 + rampa, e um filtro "vocal" (BP com env2 e Q 30%). Estes dois FX viram assinaturas suas.`,
          durationMin: 12,
          tags: ['synth'],
        },
      ],
    },
    {
      title: 'Outros motores e método',
      summary: 'FM, wavetable, granular, resampling.',
      lessons: [
        {
          title: 'FM: metal, sino e mordida',
          objective: 'Usar FM de forma controlada: carrier/modulator, ratio e envelope de modulação.',
          body: `FM = **um oscilador modula o pitch de outro**. O operador modulador (M) entra no carrier (C).

- **Ratio 1:1, 2:1**: harmônicos metálicos
- **Ratios ímpares/não-inteiros (1.41, 3.16)**: sino, vidro, "alien"
- **Envelope do M** = a chave: ataque alto = "tink" de sino (leads FM de trance!)

FM não é intuitiva — trabalhe com **valores baixos** (índice 0.5–2) e suba até "cheirar". Plucks FM + reverb curto = o "festival sound".

Não precisa decorar matemática: 90% dos presets de "sino" são M com envelope rápido, ratio 2, índice ~1.`,
          durationMin: 10,
          tags: ['synth'],
        },
        {
          title: 'Wavetable: movimento esculpido',
          objective: 'Animar tabelas de onda com envelope/LFO e criar leads cinemáticos.',
          body: `Wavetable = **o oscilador viaja entre várias formas de onda**. O timbre vira um "vídeo de ondas".

Como esculpir:
1. Monte a tabela: seno → saw → quadrada → ruído (ou escolha as que vieram)
2. **Position** controla onde "você está" na tabela
3. **Envelope** na Position: abre e fecha o movimento em cada nota (o "growl" de dubstep é position + env invertido em 2 compassos)
4. **LFO lento** na Position = lead "respirando"

Serum/Vital (e os nativos equivalents das DAWs) dão **insert FX por frame** — coloque distorção na tabela de um lado do morph e o timbre "rasga" só no pico.

Wavetable sem **movimento** é saw chata. O valor está na animação (mínimo 2 automações: position + filter).`,
          durationMin: 10,
          tags: ['synth'],
        },
        {
          title: 'Granular e resampling: o laboratório',
          objective: 'Transformar áudio em textura granular e aprender o ciclo de resampling.',
          body: `**Granular**: fatia qualquer áudio em grãos de 10–100 ms e os reorganiza (nuvens). Uso de produção:

1. Grave/grab um áudio qualquer (um "ahh", um prato, um som da rua)
2. Distorça/efetua
3. Granular: grain 30 ms, spray +, freeze — em 5 minutos você tem **atmos** que ninguém tem

**Resampling** = o motor da criatividade em DAW:
1. Selecione um trecho da mix → render/bounce em novo áudio
2. Estique/pitch (±5 semitons) ou reverta
3. Reconstrua: camada que era "erro" vira textura de drop

Loop de resampling 3× transforma presets genéricos em som de estúdio próprio. Cada iteração, anote: o que virou melhor? Isso é treino de ouvido de verdade.`,
          durationMin: 12,
          tags: ['synth'],
          practice: ['Pegue 1 barulho doméstico (chave, água) → distorção leve → gate 1/16 → reverb longo com LP. Resultado: 1 FX de transição original.'],
        },
        {
          title: 'Projeto: banco próprio de presets',
          objective: 'Organizar e nomear presets de forma profissional.',
          body: `Entrega do curso: **9 presets** que definem seu som.

- 3 basses: sub curto, mid saturado, acid (303-ish com env no filter)
- 2 leads: saw com chorus + delay interno, pluck de "sino FM"
- 1 pad: filtro duplo LFO, sustain infinito
- 1 pluck arp: envelope "pingback"
- 3 FX: gate rítmico, "vocal sweep" (BP env), distorção granulada

Padrão de nome (vale ouro em 6 meses): **[COR] Bass Acid Short 44** → categoria, timbre, envelope, variação.

Salve como patch do instrumento **e** como preset da DAW. No final, faça uma demo de 8 compassos que usa só o seu banco. Grave a evolução para a seção Portfólio.`,
          durationMin: 25,
          tags: ['synth'],
          challenge: 'Publique sua demo de banco próprio na categoria Sound Design da comunidade e colha 3 feedbacks.',
        },
      ],
    },
  ],
})

const arranjo = buildCourse({
  slug: 'arranjo-musical',
  title: 'Curso 06 — Arranjo Musical',
  subtitle: 'Do loop de 8 compassos à música de 6 minutos que conta uma história.',
  description:
    'Arranjo é gestão de energia e expectativa. Estruturas, transições, tensão/release, automação e storytelling. Projeto: transformar um loop em música completa.',
  track: 'foundations',
  level: 'intermediario',
  order: 6,
  estHours: 6,
  objectives: ['Escolher e adaptar estrutura de acordo com o gênero', 'Gerar tensão e liberação com automação e densidade', 'Construir transições intencionais'],
  tags: ['arranjo'],
  modules: [
    {
      title: 'Arquitetura da tensão',
      summary: 'Estrutura, blocos e mapa de energia.',
      lessons: [
        {
          title: 'Anatomia de uma track',
          objective: 'Mapear intro/breakdown/build/drop e suas durações padrão em compassos.',
          body: `Blocos padrão (poderes de 4, sempre múltiplos de 8 ou 16 compassos):

- **Intro DJ** (16–32): só mixável — kicks/perc, sem tema
- **Breakdown** (16): energia cai, harmonia aparece
- **Build** (8–16): tensão sobe — riser + snare roll + filtro fechando
- **Drop A** (16–32): o clímax rítmico (groove + bass)
- **Break 2** (8–16) / **Drop B** (16): variação (mais melodia / mais perc)
- **Outro DJ** (16–32): desmontagem para mixagem do DJ

### Regra dos dois drops
Faça Drop B **diferente**: troca a lead por arp, dobra o hi-hat, muda a harmonia em 1 acorde. Mesma energia, novo conteúdo.

Para streaming (não-pista), 2:45–3:15: encurta intros/outros pela metade e entra no drop antes do primeiro refrão emocional.`,
          durationMin: 12,
          tags: ['arranjo'],
          quiz: {
            title: 'Quiz — Estrutura',
            questions: [
              ['Quantos compassos tem um bloco "padrão" típico de breakdown?', ['8', '16', '40', '3'], 1, 'Blocos em 16 (ou 8) mantêm as contagens de DJ.',],
              ['A intro "DJ" deve:', ['Apresentar a melodia principal', 'Ser mixável: minimal e rítmica', 'Ter o drop inteiro', 'Ter 4 compassos'], 1, 'Ela serve para o DJ encaixar a música na pista.'],
            ],
          },
        },
        {
          title: 'Densidade: o gráfico de energia',
          objective: 'Usar mapa de camadas por bloco para evitar o "drop que não cai".',
          body: `A energia de uma track é (quase literalmente) **o número de camadas tocando**. Faça o gráfico:

Eixo Y = elementos ativos; X = compassos.

Princípios:
1. **Drop máximo ≠ música máxima**: se tudo toca em 100% dos blocos, seu drop não "cai"
2. Cada bloco remove ou adiciona **pelo menos um** elemento — se você não consegue explicar o que mudou, o ouvinte também não vai sentir
3. **Contraste por subtração**: o melhor "drop 2" às vezes é drop 1 **sem o pad** — não adicionar camadas

Ferramenta rápida: crie markers 1 compasso antes do drop com **silêncio absoluto de 1/16**. Um "nada" antes do "tudo" é a queda mais barata e mais eficaz da produção.`,
          durationMin: 10,
          tags: ['arranjo'],
          practice: ['Crie seu gráfico de densidade em 6 blocos para a track que você mais quer terminar. Imprima/grude no monitor.'],
        },
        {
          title: 'Transições: cola do arranjo',
          objective: 'Usar filtros, cortes, FX e "beat switches" entre blocos.',
          body: `Transições boas **anunciam** ou **enganam**:

- **Anunciar**: riser + snare roll de 4/8 compassos → liberação clara no drop
- **Enganar**: break de 1 beat mudo → drop entra 1/8 antes do esperado (o "ear catcher")
- **Filtro-túnel**: highpass progressivo no fim do breakdown ("sugando para baixo"), com o sub voltando no beat 1
- **Switch rítmico**: 2 compassos antes do drop, a percussão muda de subdivision (1/8 → 1/16), já "puxando" o corpo para o groove novo
- **Elemento ponte**: uma voz FX (vox chop) que cruza o bloco e some no beat 3 = cola suave

Combine **duas** (nunca cinco). Riser + filter + roll + impact tudo junto vira "árvore de Natal de drop" — clichê que envelhece em 6 meses.`,
          durationMin: 11,
          tags: ['arranjo'],
        },
      ],
    },
    {
      title: 'Movimento: automação e variação',
      summary: 'Automação como narrativa.',
      lessons: [
        {
          title: 'Automação: a mão invisível',
          objective: 'Planejar 5 automações obrigatórias em cada bloco.',
          body: `Arranjo vivo = **mudança constante dentro do estável**. Automações essenciais:

1. **Volume de percussão** +1.5 dB no drop (o corpo sente antes de perceber)
2. **Cutoff do bass**: 4 compassos "fechados" no fim do breakdown (escurece = tensão)
3. **Reverb send** dos leads: maior no breakdown (solidão), menor no drop (foco)
4. **Filter HP no master/tout** 1 compasso antes da virada (respiro)
5. **Pan FX**: o riser "gira" de L→R no último compasso (ear candy)

Automação não precisa ser "ouvida" — precisa ser **sentida**. Se você a nota, está grande demais (exceto nos FX de transição, onde é o show).

### Método
Grave o loop de 8 compassos como 5 blocos do arranjo e **só automatize** — sem adicionar notas novas — até ouvir 5 "músicas" diferentes.`,
          durationMin: 12,
          tags: ['arranjo'],
          practice: ['Implemente as 5 automações obrigatórias no seu projeto atual.'],
        },
        {
          title: 'Variação e storytelling',
          objective: 'Aplicar micro-variações para loops longos nunca cansarem.',
          body: `Um loop de 32 compassos precisa de "novidades" a cada 4–8. Kit de variação (custo crescente):

1. **Remover um elemento** por 2 compassos (o mais forte, grátis)
2. **Trocar um sample** de tom/rimshot
3. **Inverter a oitava** da lead em 4 compassos
4. **Adicionar camada** (shaker/ride) só no Drop B
5. **Trocar o groove** (double-time hats no último bloco)
6. **Mudar o acorde** no penúltimo compasso de cada 8 (harmonic surprise)

Storytelling: a música "promete" (build), "falha" (breque), "entrega" (drop) e "reinventa" (drop B). Seu ouvinte é o herói da track.

Projeto final do curso: transforme um loop de 8 compassos em música com 6+ blocos usando só automação e variação. Registre no Projeto 04 — "Primeiro Arranjo".`,
          durationMin: 15,
          tags: ['arranjo'],
          challenge: 'Publique a versão 1 do seu arranjo na comunidade com a tag #arranjo e colete 3 respostas de "onde o energia caiu?".',
        },
      ],
    },
  ],
})

const mix = buildCourse({
  slug: 'mixagem',
  title: 'Curso 07 — Mixagem',
  subtitle: 'Gain staging, EQ, dinâmica, espaço, buses — a mix que respeita o som do seu gênero.',
  description:
    'Mixagem eletrônica como sistema: organização → balanceamento → moldagem → espaço. Projeto: mixar uma track completa (a sua do curso 06!).',
  track: 'foundations',
  level: 'intermediario',
  order: 7,
  estHours: 8,
  objectives: ['Rodar um pipeline de mixagem com ordem e método', 'Diagnosticar conflitos e resolvê-los com menos plugins', 'Construir profundidade e largura intencionais'],
  tags: ['mix'],
  modules: [
    {
      title: 'Fundação: ordem e level',
      summary: 'Gain staging, balance e panorama.',
      lessons: [
        {
          title: 'Gain staging: o segredo não sexy',
          objective: 'Setar ganhos de entrada/saída por canal e bus para -18 dBFS RMS de operação.',
          body: `Mixagens "sujas" nascem de **sinal quente demais na origem**. Pipeline:

1. Cada canal individual: RMS alvo em torno de **-18 dBFS**, pico ≤ -10
2. Trimming **antes** dos plugins (ganho do clip, trim do sample, fader — nunca "baixar o master")
3. Buses (Drums/Synths) ≤ -6 dB peak, com -3 dB de folga para FX
4. Master **sem limiter, pico ≤ -3** durante a mix (headroom para o master — o erro nº 1 de mixagem para master)

Por que funciona: plugins analógicos-modelados soam corretos em 0 VU de referência; compressores distorcem em sinais quentes.

Gain staging é 20 minutos que **somam 2 dB percebidos** na clareza final — o "plug-in caro" dos iniciantes.`,
          durationMin: 10,
          tags: ['mix'],
          quiz: {
            title: 'Quiz — Gain staging',
            questions: [
              ['Durante a mixagem, o master deve:', ['Estar batendo em 0 dB', 'Ter peak de pelo menos -3 dB', 'Ser o lugar do limiter', 'Ser ignorado'], 1, 'Headroom no master para o máster.'],
              ['Se o plugin comprime demais, o primeiro ajuste é:', ['Trocar plugin', 'Reduzir ganho de entrada do canal', 'Aumentar o threshold', 'Baixar o master'], 1, 'O sinal está quente na entrada.'],
            ],
          },
        },
        {
          title: 'Volume e panorama: o esqueleto',
          objective: 'Fazer o balanceamento por faders primeiro e panning com lógica de profundidade.',
          body: `A mixagem **começa e termina** em faders e panorama. 90% do resultado.

### Balance (20 min, só com faders)
1. Mute tudo → kick (réf. no volume do corpo) → bass (ouça a "mão") → clap → hats → synths → FX
2. Cada trilha entra **só** quando necessário; ajuste -0.5 dB por vez, 5 min com referência
3. Grave o "balance bruto" — sua referência do que é mixável

### Panorama: 3 zonas
- **Centro**: kick, bass, clap, lead principal (mono!)
- **Meio (L/R 15–45°)**: percussion, arp, camadas mid
- **Largo (>45°)**: pads, atmos, rides, FX estéreo — nunca nada abaixo de ~200 Hz no largo

Panning é profundidade barata: o que está **longe** vai largo e **suave**.`,
          durationMin: 11,
          tags: ['mix'],
        },
      ],
    },
    {
      title: 'Moldagem: EQ e dinâmica',
      summary: 'Correção, realce, compressão por tipo de fonte.',
      lessons: [
        {
          title: 'EQ: plano de 5 perguntas',
          objective: 'Aplicar método de decisão de EQ por canal.',
          body: `Para **cada canal**, 5 perguntas antes de tocar nos nodes:

1. É **grave demais para seu papel**? → highpass (hats/leads 150–250 Hz)
2. **Ressoa** contra alguém? → sweep fino (Q 4+) e -2 a -4 dB na frequência da disputa
3. Faltam **harmônicos**? → shelf 1–2 dB (presença 2–5 kHz) — mas só se a mixagem **não** já tem
4. O timbre está certo **no contexto**? (solo mente) — checar em contexto 3× antes de ajustar
5. **Só uma mão**: EQ de correção primeiro; realce só quando a mixagem já "respira"

### Anti-padronização
Não copie "kick boost em 60 e 3k, bass scoop em 400" — cada sample é um sample. Sweep, escute, e **zero se não precisar** (o melhor EQ é o que você não usou).`,
          durationMin: 11,
          tags: ['mix'],
          dawSteps: {
            fl: [
              'No canal do Mixer, insira Fruity Parametric EQ 2; use o botão "1" do analisador para ver o solo do canal.',
              'Clique duplo num ponto cria um band; botão direito no band > tipo Highpass/Band/lowshelf.',
            ],
            ab: [
              'Insira o EQ Eight na cadeia do canal; ative "View > Frequency Info" para análise em tempo real.',
              'Use os modos da band (HLP para highpass) segurando Shift e clicando na frequência.',
            ],
            cu: [
              'No MixConsole, insira Channel EQ; ative o analisador (chave no topo) e o modo Solo do equalizador.',
              'Clique no gráfico para criar nós; botão direito no nó muda o tipo do filtro.',
            ],
          },
        },
        {
          title: 'Compressão: por função, não por moda',
          objective: 'Escolher razão/tempo por objetivo (taming, glue, punch, pumping).',
          body: `Compressão não é "ficar mais alto". 4 jobs:

1. **Taming** (controle): 2:1, attack 10–30 ms, release auto, GR 2–4 dB — vocais/leads "indisciplinados"
2. **Punch** (ataque): attack lento (20–40 ms), release 60–100 ms, 3:1 — a transiente passa, corpo sobe
3. **Glue** (bus): 2:1, attack 10–30 ms, GR 1–3 dB — Drums/Synths bus
4. **Pumping** (efeito): 8:1+, GR 6–10 dB — sidechain criativo em pads (a "respiração")

Checklist de cada compressor: GR medido (1–6 dB), **makeup ganho igual à redução** (senão "soa melhor" por volume), bypass 5× A/B.

Regra do bus: **um** compressor por bus, não por canal individual. Menos compressores = mixagem maior.`,
          durationMin: 12,
          tags: ['mix'],
        },
      ],
    },
    {
      title: 'Espaço e largura',
      summary: 'Reverb, delay, stereo, buses e mix bus.',
      lessons: [
        {
          title: 'Reverb e delay: a sala da track',
          objective: 'Usar sends com pré-delay e EQ interno, e escolher tempos musicais.',
          body: `### 1 sala por mixagem
Crie 1–2 sends: **Room** (0.4–0.8s) para percussão/snare, **Hall** (1.5–2.5s) para leads/pads. Reverb em inserts = inchaço.

Sempre no reverb send:
1. **HP 250–500 + LP 8–12 kHz** no retorno (cauda "escura")
2. **Pré-delay 20–60 ms** (afasta o "rabo" da fonte)
3. Tempo musical: decay do delay em 3/8 (o "bounce" clássico), 1/4, 1/2
4. Ping-pong/100% stereo só em FX/leads **acima** de 250 Hz

Volume da cauda: ajuste até **não ouvir o reverb quando a fonte para** — isso significa que está alto demais (contraintuitivo, mas exato: reverb bom some e deixa saudade).`,
          durationMin: 11,
          tags: ['mix'],
        },
        {
          title: 'Stereo, mono e profundidade',
          objective: 'Garantir graves mono e criar profundidade real (níveis + EQ + espaço).',
          body: `### Profundidade = 3 camadas (a mixagem é um palco)
- **Frente**: kick, bass, clap, lead — seco ou com room curto, brighter
- **Meio**: synths de apoio — -1.5 a -3 dB, room 0.6s
- **Fundo**: pads/atmos — LP em 8 kHz, hall longo, largura máxima

Ferramentas: monoize sub (< 120 Hz) com utilitário; **correlômetro** (medidor de correlação): valores entre 0.2 e 0.7 saudáveis; perto de 0 = phase cancel (celular perde som!); negativo = **problema** (fixe o delay/phase antes de tudo).

Truque de profundidade "traseira" para snares/fills: **reverb antes do comp** (send → comp curto → mix) = sala que "empurra".`,
          durationMin: 11,
          tags: ['mix'],
          practice: ['Crie o bus Reverb com pré-delay 40 ms, HP 400/LP 10k e use-o em 3 trilhas com quantidades diferentes (100%, 40%, 15%).'],
        },
        {
          title: 'Buses, routing e mix bus',
          objective: 'Organizar grupos e aplicar a cadeia de mix bus com moderação.',
          body: `Roteamento padrão profissional:

- **Drums bus** → comp glue + saturação leve
- **Bass bus** → split sub/mid já feito no curso 04
- **Synths bus** → EQ subtrativo compartilhado (corte "morno" 300–600)
- **FX/Atmos bus** → stereo wide + LP
- **Sends**: Room e Hall (e um Delay de 3/8)
- **Mix bus**: só quando mixagem **quase pronta** → EQ leve (±1 dB), comp 1.5:1 (1–2 dB GR), opcional tape +1% — e **NUNCA** limiter aqui (destrói a decisão do máster)

### O que bus fazem de verdade
Decisões **globais** (energia da bateria, "colagem" dos synths) em vez de 14 canais iguais. Menos inserts por canal, mais consistência — é o pulo do gato intermediário → avançado.`,
          durationMin: 12,
          tags: ['mix'],
        },
      ],
    },
    {
      title: 'Finalização da mix',
      summary: 'Checklist e referência.',
      lessons: [
        {
          title: 'Checklist de mixagem e referência',
          objective: 'Auditar a mixagem com protocolo e música de referência.',
          body: `**Referência sempre**: 1 música profissional do gênero no mesmo canal "Ref" (level-matched com fader, sem normalizar). Compare a cada 30 min: grave, largura, "ar", loudness **percebido** (não só o medidor).

Checklist final (marque cada item com A/B):
- [ ] Mono check: grave intacto em mono
- [ ] Celular: kick, bass e lead audíveis no falante
- [ ] Pico do master ≤ -3 dB, sem distorção no bus
- [ ] Cada elemento "entra e sai" com função (audição do arranjo)
- [ ] Reverb/delay não mascaram o transiente do kick
- [ ] Correlação 0.2–0.7
- [ ] Loudness da mixagem **menor** que o da referência (o máster traz o resto)
- [ ] "Teste do fader": baixando a mixagem -6 dB, o que ainda importa é o que importa (kick+bass+lead)

Se falhou 2+: volte ao balance (faders) **antes** de mexer em qualquer plugin.`,
          durationMin: 13,
          tags: ['mix'],
          challenge: 'Projeto 06 — "Primeira Mixagem": entregue sua track do curso 06 mixada + a checklist preenchida. Na comunidade, peça audit de 2 produtores.',
          files: [
            file('checklist-mixagem.md', 'checklist', 'Use na revisão final da sua mixagem.', `# CHECKLIST MIXAGEM — SONORA
1. Gain staging: canais RMS ~-18, master peak <= -3 dB
2. Balance só com faders (gravado!)
3. HP em tudo que nao e kick/bass
4. Sweeps cirurgicos apenas nos conflitos audiveis
5. Compressores com GR medido e makeup
6. Reverbs: send, pre-delay, EQ no retorno
7. Correlacao 0.2-0.7 | grave mono ate 120 Hz
8. Referencia level-matched A/B (grave, ar, largura)
9. Testes: mono / celular / fader -6dB
10. Exportar 24-bit, sem limiter no master da mixagem`),
          ],
        },
      ],
    },
  ],
})

const master = buildCourse({
  slug: 'masterizacao',
  title: 'Curso 08 — Masterização',
  subtitle: 'Loudness, LUFS, true peak, limiter e exportação para plataformas.',
  description:
    'O que um máster de música eletrônica faz (e o que você não deve esperar dele). Alvos por plataforma, limiter com bom gosto e exportação correta.',
  track: 'foundations',
  level: 'avancado',
  order: 8,
  estHours: 3,
  objectives: ['Definir alvo de LUFS por plataforma e justificar o número', 'Montar cadeia de master enxuta e honesta', 'Exportar e validar o arquivo final'],
  tags: ['master'],
  modules: [
    {
      title: 'Alvos e ferramentas',
      summary: 'LUFS, peaks e true peaks.',
      lessons: [
        {
          title: 'Loudness: LUFS sem mitologia',
          objective: 'Entender loudness integrado/short-term e alvos por plataforma.',
          body: `LUFS medem **percepção** de volume, não amplitude. Plataformas **normalizam** o que você entrega (Spotify ~-14 LUFS integrado, YouTube ~-13 a -15, SoundCloud -14; netlabels de techno/psy entregam -8 a -10 para pista!).

### Como decidir o alvo
1. **Foco em streaming**: mixe/mastere mirando -9 a -10 LUFS integrados (normalização "abaixa" mas mantém punch percebido se você não esmagar)
2. **Foco em DJ/club**: siga a referência do selo (tipicamente -8 a -10 LUFS para o drop, não para a média)
3. **Picos**: true peak ≤ -1 dBTP para streaming (MP3/ogg ganha picos no decoder!)

### Erro que mata
"Masterizar para o número". Loudness alto sem dinâmica = fadiga. Meça **short-term** nos drops (a região-alvo) e mantenha o resto respirando.`,
          durationMin: 10,
          tags: ['master'],
          quiz: {
            title: 'Quiz — Loudness',
            questions: [
              ['Se a mixagem tem -8 LUFS no drop e a referência tem -16 no drop:', ['Sua mix está "maior"', 'Sua mix está esmagada e provavelmente pior', 'Você venceu', 'Troque o limiter'], 1, 'Dinâmica percebida vence número.'],
              ['True peak negativo (-1 dBTP) protege de:', ['Stereo issues', 'Clipping do codec (ex.: mp3)', 'Reverb demais', 'Fases'], 1, 'Codecs com perdas aumentam picos reais.'],
            ],
          },
        },
        {
          title: 'Cadeia de master: EQ, dinâmica e limiter',
          objective: 'Construir a cadeia mínima de master com intenção.',
          body: `Cadeia de master enxuta (na ordem):

1. **EQ corretivo fino** (±0.5–1 dB): só se a mixagem pede (ex.: -0.5 dB em 3 kHz se "nariz" geral)
2. **Dinâmica opcional**: multiband **rara** (só desequilíbrio real, ex.: mid "pula" no drop); clipper antes do limiter para segurar picos (menos "trabalho" pro limiter)
3. **Limiter** (último):
   - Ceiling -1 dBTP (streaming) / -0.3 (promo DJ)
   - Release auto/musical; se "gruda" no sub, aumentar release
   - Ganho até o medidor de **ganhos** (input gain) chegar no alvo; observe redução ≤ 3–4 dB no material mais quente (mais que isso = mixagem pronta para -6, não máster)
4. **Medição**: integrado, short-term, LRA, TP, mono, correlação, 3 sistemas (fones + celular + monitor)

### O que máster NÃO faz
Mixer (graves embolados ficam embolados, só mais altos), salvar mixagem ruim, dar loudness "grátis". O máster **confirma** decisões boas e entrega consistência.`,
          durationMin: 12,
          tags: ['master'],
          practice: ['Masterize a mixagem do projeto anterior para -10 LUFS integrados / -1 dBTP com apenas EQ + limiter (ou "Ref" do próprio app se não houver plugin dedicado).'],
        },
        {
          title: 'Referência, versões e entrega',
          objective: 'Montar o pacote de entrega da track.',
          body: `Entrega profissional de uma track:

1. **Master final** (24-bit WAV, 44.1 kHz, o nome com LUFS/TP: Artist_Track_Final_-9LUFS_-1TP.wav)
2. **Master "streaming safe"** (-14 LUFS integrado, se quiser evitar re-normalização surpresa)
3. **Instrumental + (se houver) limpa** para sync/DJ
4. **Stems da mixagem** (Drums/Bass/Synths/Master) para remix/retrabalho futuro
5. **Mixagem não masterizada** para o próximo máster profissional
6. Metadados: BPM, tonalidade (formato Camelot também), ISRC via distribuidor

Validação: 3 sistemas + "loudness meter snapshot" + mono + fones. Se algum sistema "quebra" (ex.: celular some com o bass), **corrija a mixagem**, não o master.`,
          durationMin: 9,
          tags: ['master'],
        },
      ],
    },
  ],
})

const primeira = buildCourse({
  slug: 'produza-sua-primeira-track',
  title: 'Curso 09 — Produza sua Primeira Track',
  subtitle: 'O projeto completo: 12 etapas guiadas até a música finalizada e publicada.',
  description:
    'Ideia → BPM → Key → Drums → Bass → Melodia → Sound Design → Arranjo → Automação → Mix → Master → Export. Cada aula é um passo executável; você termina uma música durante o curso.',
  track: 'foundations',
  level: 'iniciante',
  order: 9,
  estHours: 12,
  objectives: ['Executar o fluxo completo de produção', 'Tomar decisões com prazo, não perfeição', 'Publicar e receber feedback estruturado'],
  tags: ['final', 'fund'],
  modules: [
    {
      title: 'Semana 1: a semente',
      summary: 'Ideia, BPM, key e o motor rítmico.',
      lessons: [
        {
          title: 'Etapa 1 — Ideia, BPM e Key',
          objective: 'Fixar as 3 variáveis que ancoram o projeto: gênero, BPM e tonalidade.',
          body: `Antes de tocar qualquer nota, escreva no topo do projeto:

**Gênero**: ex. Progressive Psy (define BPM 138, padrão de kick off-bass)
**BPM**: do gênero (não "o que eu gosto")
**Key**: escolha com o mood — F#m (dark/épico), Am (padrão), Dm (triste/dançante), F (grandioso)

E uma frase de intenção: **"Isso é uma música de 6:10 que faz o corpo antes do segundo drop e chora no breakdown"**. Ela resolve 90% das decisões ("isso serve à frase? não → fora").

Registros: crie o template com markers de estrutura e uma pasta **Docs** com essa frase e suas referências (2 músicas).`,
          durationMin: 15,
          tags: ['final'],
          practice: ['Preencha o briefing do Projeto 01: 1 frase de intenção, 3 variáveis e 2 referências.'],
        },
        {
          title: 'Etapa 2 — Drums e groove',
          objective: 'Construir o loop de bateria âncora (kick, clap, hats, perc) com variações.',
          body: `Motor da track: 8 compassos de bateria com **1 variação obrigatória** (comp 7-8).

Checklist do motor:
- [ ] Kick 4-on-the-floor, tune na key (A/D)
- [ ] Clap/snare em 2 e 4 + layer de "snappy" opcional
- [ ] Hats: 8ths ou 16ths, velocity com ciclo de 3, offbeat hat no "e" do 4
- [ ] Perc de corpo (shaker 16ths -14 dB; rim/tom no "a" do 3)
- [ ] Fill de transição no último compasso (roll + tom + crash)

Renderize como **áudio da bateria** quando o loop estiver ótimo (freeze/resample) — libera MIDI para brincar depois e "trava" o groove que você gostou.`,
          durationMin: 25,
          tags: ['final', 'drums'],
        },
        {
          title: 'Etapa 3 — Bassline',
          objective: 'Escrever sub + mid com envelope e sidechain, espelhando o kick.',
          body: `Sistema bass+kick (aplicando o curso 04):

1. Notas: 8ths no off-beat (psy/techno groove) ou root longas (house)
2. Sub em senoidal, envelope curto, mono, ≤ 90 Hz
3. Mid bass com saw+saturation, notas em staccato (release ≤ 150 ms)
4. Sidechain kick→bass 6–10 dB
5. Teste: mude o pad do acorde — o bass precisa "sentar" em I, VI e VII sem briga (mude 1 nota quando necessário)

Entrega: 8 compassos de bass que fazem o loop balançar **só com o kick**. Se precisa dos hats, o bass está fraco.`,
          durationMin: 25,
          tags: ['final', 'bass'],
        },
        {
          title: 'Etapa 4 — Melodia e tema',
          objective: 'Escrever o par pergunta/resposta e o arp de apoio.',
          body: `Com a frase de intenção:

1. **Lead principal**: 2 compassos (pergunta) + 2 (resposta), notes ≤ 8, range de 1 oitava, gravado "cantado" no teclado
2. **Contramelodia**: 1 compasso de pluck arpejado 16ths (ou o pad apenas)
3. Harmonia do tema: **i – VI – VII – VI** (sua família segura)
4. Repita a melodia 2× **antes** de criar B — repetição é memória

Critério de tema: assobie agora; assobie de novo depois do banho (amanhã). Se "não pegou", troque 1 nota por vez (só 1 nota muda uma música).`,
          durationMin: 30,
          tags: ['final', 'melodia'],
        },
      ],
    },
    {
      title: 'Semana 2: da forma à finalização',
      summary: 'Sound design, arranjo, mix, master e release.',
      lessons: [
        {
          title: 'Etapa 5 — Sound design do drop',
          objective: 'Escolher/esculpir os 4 timbres protagonistas do drop.',
          body: `O drop tem 4 heróis — defina e processe:

1. **Kick** (já tem)
2. **Bass mid** (saturação + sidechain)
3. **Lead**: presenças + chorus fino + delay 1/8 (feedback 20%)
4. **Texture**: 1 acapella/atmos granular ou "vox chop" que marca

Sound design **durante a produção**: 1FX por canal no máximo (a mixagem não começa hoje). Se o synth pede 5 inserts para "ter graça", é o synth errado.`,
          durationMin: 30,
          tags: ['final', 'synth'],
        },
        {
          title: 'Etapa 6 — Arranjo completo',
          objective: 'Montar os blocos e preencher 6 minutos (ou 3 para streaming).',
          body: `Monte na playlist com markers e blocos (padrão pista 6:12 — números em compassos):

Intro 16 → Break A 16 → Build 8 → **Drop A 32** → Break B 16 → Build 8 → **Drop B 32** → Outro 16

Cada bloco: **1 diferença** explicável (densidade, lead/arp, variação harmônica, FX). Preencha com copy/paste **com variação**: mute 2 elementos nos blocos pares.

Prazo rígido: 90 minutos no arranjo. O que não ficou pronto, fica "versão 1" — a música nasce completa e melhora em v2.`,
          durationMin: 90,
          tags: ['final', 'arranjo'],
          challenge: 'Entrega: exportar a track no formato "arranjo bruto" e postar em Feedback de Tracks com a tag #v1.',
        },
        {
          title: 'Etapa 7 — Automação e mix',
          objective: 'Aplicar as 5 automações e rodar o pipeline de mixagem do curso 07.',
          body: `Passo de maturidade: **automação antes da mixagem** (ela muda o balanceamento!).

1. As 5 automações obrigatórias (volume de perc no drop, cutoff no breakdown, reverb send, filtro de transição, pan do FX)
2. Pipeline do curso 07: gain staging → balance → EQ → dinâmica → espaço → bus
3. Checklist final + mono/celular/referência

Tempo de mixagem: 4–6 horas máximas para a track v1. Se passar disso, marque "mixagem v1 fechada" e siga — seu máster treina o ouvido que faltou.`,
          durationMin: 60,
          tags: ['final', 'mix'],
        },
        {
          title: 'Etapa 8 — Master e exportação',
          objective: 'Mastere a track, valide em 3 sistemas e gere a versão final.',
          body: `Máster (curso 08 aplicado):

1. Cadeia: EQ fino → limiter (ceiling -1 dBTP)
2. Alvos: -9 a -10 LUFS integrados (streaming/club híbrido), short-term do drop ≤ -8
3. Validação: fones + celular + speaker; mono OK; sem distorção nos graves
4. Export: WAV 24-bit (final), MP3 320 (promo), stems 4 (Drums/Bass/Synths/Master mixdown)

Nomeie: **NomeArtista_NomeTrack_MASTER_v1.wav**. Registre BPM/key nos metadados da DAW.

Parabéns — do "nunca abri uma DAW" a uma música finalizada. Marque a última caixinha: "Projeto 05 — Primeira Track: concluída" e publique no Portfólio.`,
          durationMin: 45,
          tags: ['final', 'master'],
          practice: ['Publique no /produtor/:username e conte (nos comentários do post de release) qual foi a lição nº 1 da v1.'],
        },
      ],
    },
  ],
})

export const FOUNDATION_COURSES: CourseBuild[] = [zero, eletr, beat, bass, synth, arranjo, mix, master, primeira]
