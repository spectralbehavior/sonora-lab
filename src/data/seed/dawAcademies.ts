import type { CourseBuild } from './builder'
import { buildCourse } from './builder'

// ACADEMIAS DE DAW — conteúdo VERSIONADO.
// Regra do produto: só afirmar comportamento padrão público e estável da versão
// carimbada em `verified`. Atalhos personalizados e mudanças de menu por
// release devem ser atualizados pelo CMS (/admin), nunca "adivinhados".

const fl = buildCourse({
  slug: 'fl-studio-academy',
  title: 'FL Studio Academy',
  subtitle: 'Da interface ao bounce final — verificado em FL Studio 21.',
  description:
    'Trilha específica do FL Studio: Channel Rack, Piano Roll, Playlist, Mixer, patterns, automação, routing, gravação, arranjo e exportação.',
  track: 'daw',
  dawId: 'fl-studio',
  level: 'iniciante',
  order: 10,
  estHours: 5,
  verified: { version: 'FL Studio 21.x', date: '2025-08-01' },
  objectives: [
    'Dominar os painéis centrais do FL Studio',
    'Criar, encadear e variar patterns na Playlist',
    'Rotear, automatizar e exportar com qualidade',
  ],
  tags: ['daw'],
  modules: [
    {
      title: 'Iniciante: os painéis',
      summary: 'Interface, Channel Rack, Piano Roll, Playlist.',
      lessons: [
        {
          title: 'Interface e fluxo de janelas',
          objective: 'Navegar entre Channel Rack, Piano Roll, Playlist e Mixer com fluência.',
          body: `O FL Studio organiza a produção em janelas-chave, acessíveis pela barra de ferramentas superior (os atalhos podem ser vistos e personalizados em Settings > Keyboard settings — não dependa de atalhos de tutorial):

- **Channel Rack**: onde vivem os canais de som (drums e synths) e os steps dos patterns
- **Playlist**: a linha do tempo — você pinta blocos de **patterns** e clips de áudio
- **Piano Roll**: editor de MIDI do canal selecionado (notas, velocity, slides)
- **Mixer**: canais de áudio com cadeias de FX, sends e medidores

**A gramática do FL**: compor no Channel Rack em patterns, montar o arranjo pintando patterns na Playlist, e processar no Mixer. Entender esse triângulo é 80% da curva de aprendizado.

O **Browser** (à esquerda) lista samples, presets e packs; canais podem ser salvos como preset próprio pelo menu de botão direito do canal.`,
          durationMin: 12,
          tags: ['daw', 'fl'],
          practice: ['Alterne Channel Rack ↔ Piano Roll ↔ Playlist ↔ Mixer 10× usando apenas os botões da toolbar, cronometrando a fluência.'],
        },
        {
          title: 'Channel Rack e patterns',
          objective: 'Criar canais, desenhar patterns de 16 steps e navegar entre patterns.',
          body: `O Channel Rack é o sequencer de steps da bateria:

1. Botão **+** do rack adiciona canal (3xOsc, Sampler, ou "Add one >" para outros)
2. Os **16 steps = 1 compasso**; clique para ativar/desativar
3. Botão direito em qualquer step abre o menu do pattern (Fill, Wipe, Random)
4. O **seletor de pattern** (topo da tela, setas ou Page Up/Down) troca entre 01, 02, 03...
5. O slider de **shuffle/swing** do rack afeta as subdivisões do pattern

Para carregar um sample: arraste do Browser para um slot de canal, ou use o botão direito > "Replace".

Ferramenta essencial: o **Track number** (menu de botão direito do canal / "Routing") envia o canal para uma trilha do Mixer — sem isso, tudo cai no Master.`,
          durationMin: 14,
          tags: ['daw', 'fl'],
        },
        {
          title: 'Piano Roll: notas e lanes',
          objective: 'Editar MIDI com precisão: snap, velocity lane e geradores.',
          body: `Abra o Piano Roll do canal selecionado (botão no canto do canal ou na toolbar):

- Clique para desenhar notas; apague com clique direito; selecione em bloco e copie/cole
- Ajuste o **snap** no menu próprio do editor (linha/compasso) antes de mover notas
- Abaixo do piano, ative as **lanes**: Velocity (groove!), Pitch e Mod — velocity em colunas verticais é o caminho para "baterias vivas"
- No canto inferior, os **Geradores**: Arpeggiator, Randomize velocity, Sculpt — usados com seleção ativa
- **Slide notes** (nota com "ponto" de slide) controlam pitch contínuo em plugins compatíveis — o "acid" de lead

Exercício padrão: escreva 8 compassos de arp em 16ths, aplique velocity em ciclo de 3 na lane, e deixe o último compasso com uma rampa de slide ascendente.`,
          durationMin: 15,
          tags: ['daw', 'fl'],
        },
        {
          title: 'Playlist: pintar patterns e marcar estrutura',
          objective: 'Montar o arranjo por pattern blocks com variações e markers.',
          body: `Arranjo no FL = pincel de patterns na Playlist:

1. Selecione o pattern no seletor e **pinte blocos** na régua (cada clique = um pattern block de 1 compasso, ajuste a duração no menu de snap)
2. Duplique o pattern pelo menu do seletor (Patterns > Duplicate) para criar variações — pattern 02 sem o hat, pattern 03 com fill
3. Nomeie os patterns por função (IntroKit, DropA, Break...) — no seletor há a opção de renomear
4. Use a régua de tempo (botão direito) para criar **Markers** de estrutura: Intro / Break / Drop
5. Áudio: arraste wav para a Playlist; estique pela borda (time stretch) e edite recortes com o menu do clip

Fluxo de variação sem reescrever nada: mute canais (botão M) durante a reprodução da Playlist para "ligar/desligar" camadas por bloco.`,
          durationMin: 14,
          tags: ['daw', 'fl', 'arranjo'],
        },
      ],
    },
    {
      title: 'Intermediário: mixer e automação',
      summary: 'Mixer, routing, sends e automation clips.',
      lessons: [
        {
          title: 'Mixer: canais, FX e sends',
          objective: 'Montar cadeias por canal e buses com sends.',
          body: `Canais do Mixer e organização:

- Cada **Track Number** do Channel Rack cai numa trilha do Mixer (rename e color pelo menu de botão direito da trilha)
- **Slots de FX** (10 por canal): a ordem define o som — a cadeia padrão do curso 07 é EQ → comp → saturação
- **Sends** (fileira de knobs no topo da trilha): envie para canais de Reverb/Delay compartilhados
- Medidores por canal com leitura de mono/stereo no topo — use no teste do Curso 07
- Ganho de pré-FX no início da cadeia e o fader no fim: mantenha os dois "olhos" no pico (≤ -10 no canal)

Buses: crie uma trilha "DrumBus" no Mixer, e envie os canais de bateria a ela via sends (ou remapeando o Track Number dos canais); o processamento de glue acontece no DrumBus.`,
          durationMin: 14,
          tags: ['daw', 'fl', 'mix'],
        },
        {
          title: 'Automation Clips',
          objective: 'Criar e editar automação do Playlist e de parâmetros.',
          body: `Automação no FL = **Automation Clip**:

1. Botão direito em qualquer knob (do Mixer ou do plugin) > **Create automation clip**
2. O clip entra na Playlist como faixa: edite pontos (clique duplo remove), crie curvas arrastando as alças dos segmentos
3. Para automatizar **volume de canal**: o fader da trilha do mixer é automatizável; use "Link to controller" para superfícies MIDI
4. Dois clips no mesmo parâmetro = o superior manda; organize com cores/nomes
5. No Piano Roll, lanes de **Pitch/Vol/Pan/Mod** automatizam a nota individual (sem criar clip)

Casos obrigatórios (Curso 06): cutoff do bass no breakdown, volume de perc +1.5 dB no drop, pan no riser do fim do build.`,
          durationMin: 13,
          tags: ['daw', 'fl'],
        },
      ],
    },
    {
      title: 'Avançado: gravação e bounce',
      summary: 'Gravação de áudio/MIDI e exportação.',
      lessons: [
        {
          title: 'Gravação de áudio e MIDI',
          objective: 'Arm, gravar takes e editar clips de áudio.',
          body: `### MIDI
Selecione o pattern/playlist, arme o modo de gravação na barra superior (o menu do botão record oferece "Automatic" e gravar **no playlist** — "MIDI from song channels" para gravar em cima do que toca). Toque com o metronome (toggle no transporte).

### Áudio
1. Trilha do Mixer com input selecionado (campo "In") + botão de record-arm da trilha
2. Gravação cria um **audio clip** na Playlist
3. Edite pelo menu do clip: "Trim", "Crop" e fade nas bordas (arrastar a alça do clip)
4. Duplicou um audio clip e quer editar **só a cópia**? Use "Make unique" no menu do clip (senão a edição propaga para o original)

### Export
File > Export WAV/FLAC/MP3 — marque **"Enable maximum rendering quality"**; "Split mixer tracks" gera os stems por canal do mixer (seu pacote do Curso 08); deixe o Master sem limiter e com headroom (pico ≤ -3 dB) na "mixdown".`,
          durationMin: 14,
          tags: ['daw', 'fl'],
        },
      ],
    },
  ],
})

const ableton = buildCourse({
  slug: 'ableton-academy',
  title: 'Ableton Live Academy',
  subtitle: 'Session, Arrangement, racks e fluxo de performance — verificado em Live 11.',
  description:
    'A filosofia Live: clips e scenes como instrumento. Session vs Arrangement, warp, racks, automação, routing e export.',
  track: 'daw',
  dawId: 'ableton',
  level: 'iniciante',
  order: 11,
  estHours: 5,
  verified: { version: 'Ableton Live 11.x', date: '2025-08-01' },
  objectives: ['Pensar em clips/scenes na Session', 'Gravar, warp e editar áudio', 'Construir cadeias com racks e extrair para Arrangement'],
  tags: ['daw'],
  modules: [
    {
      title: 'Iniciante: dois modos, uma música',
      summary: 'Interface, Session View, Arrangement View, Browser.',
      lessons: [
        {
          title: 'Interface e o Tab',
          objective: 'Entender Session vs Arrangement e quando usar cada.',
          body: `Live tem duas visões — a tecla **Tab** alterna entre elas:

- **Session View**: grade de **clips** (loops de MIDI/áudio) por trilha e **scenes** (linhas horizontais) — o laboratório de ideias
- **Arrangement View**: a timeline horizontal — o montador, onde a música ganha forma final

Fluxo típico do Live: criar loops na Session, encadear scenes virando a música "ao vivo", gravar a performance em **Arrangement Record**; refinar na Arrangement; mixar no mixer (que é o mesmo nas duas visões).

**Browser** (à esquerda): samples, drums, presets e Max for Live. Ao lado, a **Info View** traz a documentação embutida de qualquer dispositivo selecionado — leia ali antes de googlar.`,
          durationMin: 10,
          tags: ['daw', 'ableton'],
          practice: ['Crie 4 clips de bateria cumulativos (kick → +clap → +hats → +perc) numa só trilha? Não — em trilhas distintas, e navegue pelas setas + Enter lançando sem tocar na grade.'],
        },
        {
          title: 'Clips e Scenes',
          objective: 'Gravar, duplicar, nomear e lançar clips/cenas com quantização.',
          body: `Manipulação essencial na Session:

1. **Nova trilha**: MIDI track, Audio track e Return track pelo menu Create
2. Clique no clip slot vazio + botão de gravação da tela (ou "Record" do transporte) para gravar um clip
3. Duplicar e renomear clips pelo menu de botão direito (renomeie: "KICK 4x4", "BASS OFFBEAT")
4. **Launch modes** (canto inferior esquerdo do clip): Pad / 1/4 global / etc — define como o clip responde ao clique
5. **Global quantize** (menu do Launch Quantize na barra superior) — gride o lançamento para 1 bar / 1/2 beat; Sessions limpas dependem disso

Scenes nomeadas viram o mapa da música: Intro, Break, Build, Drop A, Break 2, Drop B, Outro. Teste a estrutura inteira **lançando scenes** antes de montar o Arrangement — é o "arranjo ao vivo" do Live.`,
          durationMin: 13,
          tags: ['daw', 'ableton'],
        },
        {
          title: 'Warp e áudio',
          objective: 'Alinhar áudio ao grid com a engine Warp.',
          body: `Todo áudio gravado/importado no Live pode ser **warpado** (sincronizado ao grid):

- Abra o clip (duplo clique) > aba **Clip** > ative "Warp"
- **Markers**: duplo clique no waveform cria um ponto de warp; arraste o marcador (e o conteúdo) para o transiente do kick/clap
- Modos: **Beats** (percussão e loops), **Tones** (melódico), **Complex/Complex Pro** (gravações completas), **Fixed** (fatia por marcador, ótimo para acapella)
- "Recover" no menu do clip restaura; delete markers com botão direito
- Loop: ative o brace de loop do clip e ajuste a duração — o clip se repete sozinho

Regra: gravou com click? Confirme que o downbeat está no marcador **1.1** do clip (o número da barra aparece no topo do editor). Se o take está 20 ms fora do tempo médio, a correção é regravando ou com "Warp > Set to Clip Start".`,
          durationMin: 12,
          tags: ['daw', 'ableton'],
        },
      ],
    },
    {
      title: 'Intermediário: racks e automação',
      summary: 'Chains, Instrument/Audio/MIDI racks e envelopes.',
      lessons: [
        {
          title: 'Racks e Macros',
          objective: 'Empacotar cadeias e criar controles macro.',
          body: `**Racks** (Instrument, Audio Effect, MIDI Effect, Drum, Chain) agrupam dispositivos/chains e expõem até **8 Macros**:

1. Selecione um dispositivo no device view e agrupe em rack (menu de botão direito > "Grouping")
2. Ative o **Map** mode: clique num parâmetro interno e depois numa Macro para mapear (um knob → vários parâmetros com faixas diferentes)
3. Cadeia comum no bass: MIDI Effect (Scale, para nunca errar nota) → Instrument → EQ → Saturator → Utility (mono do sub)
4. **Chains** com zona de atividade por frequência (Chain list, coluna à esquerda): chain 1 só no sub, chain 2 só no mid — split-band nativo, sem plugin extra
5. Salve o rack no Browser (Menu > Save...): vira seu preset com macro — o banco do Curso 05 vive aqui

O botão de "Chain Activator" + Macros de faixa = performance sem mouse.`,
          durationMin: 14,
          tags: ['daw', 'ableton', 'synth'],
        },
        {
          title: 'Automação e clip envelopes',
          objective: 'Automar no Arrangement e dentro do clip.',
          body: `Dois planos de movimento:

- **Arrangement**: botão "A" (Automation Mode) no canto superior direito; selecione trilha > dispositivo > parâmetro (a linha aparece acima da timeline) e desenhe pontos (duplo clique) ou apague pontos (clique no ponto + apagar)
- **Clip Envelope** (aba Envelope do clip): automação que **viaja com o loop** — cutoff oscilando em cada nota, volume respirando; ideal para Session/live

Dicas: **Draw Mode** (tecla B no arranjo) para curvas de volume rápidas; "Constant" vs "Linear" nos segmentos (botão direito no ponto); automatize **sends** (reverb) com a linha do return — o breakdown "inundado" é send automation.

Fluxo do curso 06: clip envelopes no loop para o "motor", Arrangement para as transições e blocos.`,
          durationMin: 11,
          tags: ['daw', 'ableton'],
        },
      ],
    },
    {
      title: 'Avançado: mix e export',
      summary: 'Returns, sidechain, groups e render.',
      lessons: [
        {
          title: 'Returns, sidechain e commit',
          objective: 'Centralizar FX, usar sidechain nativo e "imprimir" som.',
          body: `**Return tracks** (Create > Return Track): Reverb e Delay globais — cada canal manda para o "espaço" via Send; a mix ganha sala única (curso 07).

**Sidechain** no Compressor nativo:
1. No canal do Bass, insira Compressor
2. Abra a aba "Side Chain" (seta no topo do dispositivo) > Audio From = trilha do Kick
3. Ative o **EQ do sidechain** (botão "Q" do SC) e corte graves (HP ~120 Hz) para o kick "empurrar" só o corpo
4. Attack ~0.1 ms, release musical (a "respiração"), ratio 4–8:1

**Commit/consolidar**: na Arrangement, selecção + menu Edit > **Consolidate** gera um trecho fixo (útil para "imprimir" a textura de um synth e liberar CPU / editar como áudio). Para stems: File > **Export Audio/Video**, seção "Export Tracks" = um arquivo por trilha. Alvos do curso 08 no master: sem limiter na mixdown, pico ≤ -3 dB.`,
          durationMin: 15,
          tags: ['daw', 'ableton', 'mix'],
        },
      ],
    },
  ],
})

const cubase = buildCourse({
  slug: 'cubase-academy',
  title: 'Cubase Academy',
  subtitle: 'O estúdio "linear" completo: Project Window, editores, MixConsole — verificado em Cubase 13.',
  description:
    'Para quem vem do mundo "gravadora + mesa": o modelo de trilhas e eventos do Cubase, Key/Drum Editors, VST, routing e mix/export.',
  track: 'daw',
  dawId: 'cubase',
  level: 'iniciante',
  order: 12,
  estHours: 5,
  verified: { version: 'Cubase 13.x', date: '2025-08-01' },
  objectives: ['Trabalhar com Project Window e eventos', 'Usar Key e Drum Editors com eficiência', 'Rotear no MixConsole e exportar stems'],
  tags: ['daw'],
  modules: [
    {
      title: 'Iniciante: Project Window',
      summary: 'Trilhas, eventos, transporte e snap.',
      lessons: [
        {
          title: 'Interface e trilhas',
          objective: 'Criar e nomear trilhas MIDI/Instrument/Áudio.',
          body: `O Cubase é linear como uma mesa de estúdio:

- **Project Window**: trilhas empilhadas, tempo à esquerda→direita
- Tipos principais: **MIDI Track** (controla instrumento externo/interno), **Instrument Track** (VSTi embutido), **Audio Track**, **Folder Track** (agrupar), **Group Track** (buses com Faders e FX) e **FX Channel** (sends)
- Adicione tudo pelo menu **Project > Add Track**
- **MediaBay**: a biblioteca de mídia do projeto (arraste wav/samples)
- Transporte: Play/Stop (barra de espaço por padrão); o **Cycle** (botão amarelo no transporte) + locators marcam a região de loop para overdubs

No **Inspector** (esquerda) cada trilha mostra: input, output, nome, cor e a seção de Inserts — é o "canal" que viaja junto da trilha.

Duplo clique num evento MIDI abre o **Key Editor**; num evento de bateria, o **Drum Editor**.`,
          durationMin: 10,
          tags: ['daw', 'cubase'],
          practice: ['Crie 6 trilhas: Kick+Perc (Instrument com Groove Agent), Bass (Instrument), Lead (Instrument), Vox (Audio), Group "Drums", FX "Hall". Nomeie e colore todas.'],
        },
        {
          title: 'Key Editor e Drum Editor',
          objective: 'Editar MIDI com quantize humano, lanes e drum map.',
          body: `**Key Editor** (melodias/baixo):
- Q = Quantize (escolha o grid; para groove, "Quantize Panel" com swing em vez de Q seco)
- Menu **MIDI > Humanizers** para posição/velocity em lote
- Ajuste **Velocity** e CC (Mod/Wheel) nas lanes inferiores
- Menu Edit > Length para normalizar durações (staccato do bass)

**Drum Editor** (patterns):
- Linhas = pads, definidos pelo **Drum Map** da trilha (crie/atualize pelo menu do editor; cada pad = nota + instrumento + nome + ganho)
- Desenhe com a ferramenta lápis; copie compassos inteiros e cole deslocando (vira "fill")
- "Velocity per stroke" manual é o segredo das baterias vivas no Cubase

Layering no Cubase é 2 MIDI tracks no mesmo Instrument (body + click): escreva a mesma nota no mesmo grid, cada trilha com velocity diferente.`,
          durationMin: 14,
          tags: ['daw', 'cubase'],
        },
      ],
    },
    {
      title: 'Intermediário: VST, mixer e automação',
      summary: 'Inserts, Instrument tracks, MixConsole e automation lanes.',
      lessons: [
        {
          title: 'VST Instruments e FX chains',
          objective: 'Carregar instrumentos, ordenar inserts e salvar channel settings.',
          body: `No **Inspector** da trilha:
- **Instrument**: VSTi (Retrologue 2 para synth, Groove Agent para bateria, Sampler/MIDI Instrument)
- **Inserts**: FX na ordem do sinal; "e" = bypass, o preset menu salva o rack como "Channel Settings Preset"
- **Sends** (botão direito no fader do MixConsole também abre routing): mande Reverb/Delay para FX Channels

**MixConsole (F3)** é a mesa completa: ganho, pan, EQ dinâmico opcional, sends, e os **Device Quick Controls** no Inspector (até 8 knobs mapeados no VSTi = "macros" do Cubase).

Cadeia padrão do curso 07 por canal: EQ (subtrativo) → Compressor → saturação/character → fader de ganho. E a regra de routing: tudo que é bateria sai por um **Group Track "Drums"** — é aí que mora o comp de glue.`,
          durationMin: 13,
          tags: ['daw', 'cubase', 'mix'],
        },
        {
          title: 'Automação no Cubase',
          objective: 'Escrever e ler automação nos modos Read/Touch/Write.',
          body: `Modelo clássico de automação de console:

1. Trilha (ou parâmetro no MixConsole) > **Enable Automation** (linha do parâmetro aparece na trilha)
2. Modos por parâmetro: **Read** (só toca), **Write** (grava tudo), **Touch** (grava enquanto você mexe — o mais usado), **Latch** (grava até o fim da região)
3. Com Write/Touch, ligue o transporte e gire o fader/knob — a curva entra na lane
4. Na lane, edite pontos (duplo clique cria/remove; arraste o segmento vira "Hold/Linear/Curve" no menu)
5. Menu **MIDI > Merge Tempo/Track Automation** e "Apply Track Automation" convertem automação de parâmetros MIDI em dados do evento (confirme no menu da sua versão)

Automação de Volume/Pan em eventos **de áudio** (fade no próprio evento) resolve 90% dos cortes e transições sem lane nenhuma.`,
          durationMin: 12,
          tags: ['daw', 'cubase'],
        },
      ],
    },
    {
      title: 'Avançado: comping, pitch e export',
      summary: 'Comping, VariAudio e render de stems.',
      lessons: [
        {
          title: 'Gravação: takes, comping e VariAudio',
          objective: 'Gravar em lanes, montar comps e afinar vocal nativamente.',
          body: `### Takes e Lanes
1. Ative o **Cycle** sobre a região e grave repetidamente na mesma trilha — cada take vira uma **lane** (modo "Recording > Take Lane"/"Replace", no transporte)
2. Abaixo da timeline, o painel **History/Comping** lista os takes; selecione partes e crie o composite ("Create Comp")

### VariAudio (afinação/correção nativa)
Duplo clique no evento de áudio > **VariAudio**: notas aparecem como blocos — ajuste pitch, formants e "tighten"; use com moderação (-60 a +40 cents) e o "Growl" para R&B/eletro-vocal.

Render de **stems**: File > Export > Audio Mixdown — marque a opção de **stems/separação por canais** (o nome exato varia por release; procure "Selection: Mixdown selected" e "Channels: Separate Files"). Exporte 24-bit com os alvos do curso 08.`,
          durationMin: 15,
          tags: ['daw', 'cubase'],
        },
      ],
    },
  ],
})

export const DAW_COURSES: CourseBuild[] = [fl, ableton, cubase]
