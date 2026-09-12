import type { GlossaryTerm } from '@/types'

// Glossário "Explique de forma simples" — usado no Modo Iniciante e nos chips
// de conceito das aulas. Toda entrada tem par simples ↔ técnico (revisão espaçada
// reusa as mesmas estruturas).

export const GLOSSARY: GlossaryTerm[] = [
  { term: 'DAW', simple: 'O programa onde você faz música: compõe, grava, mixa e salva.', technical: 'Digital Audio Workstation — software de produção com sequencer MIDI, multitrack de áudio e roteamento de plugins.' },
  { term: 'MIDI', simple: 'Recado de "tocou tal nota, com tal força". Não é som — é a partitura digital.', technical: 'Protocolo de mensagens de controle (note on/off, CC, velocity, pitch bend) que instrui instrumentos virtuais/hardware.' },
  { term: 'Sample rate', simple: 'Quantas fotos por segundo o som vira número. 44.1k = padrão.', technical: 'Frequência de amostragem; por Nyquist, representa fielmente frequências até metade do valor (≈22 kHz @ 44,1).' },
  { term: 'BPM', simple: 'Batidas por minuto — a velocidade da música.', technical: 'Andamento métrico; em eletrônica, correlaciona-se a gêneros (house ≈124, psy ≈145).' },
  { term: 'Compasso', simple: 'A "caixa" de 4 tempos que repete. 4 contagens = 1 compasso.', technical: 'Unidade métrica (4/4: quatro colcheias por barra); loops eletrônicos em potências de 2 barras.' },
  { term: 'Sidechain', simple: 'Quando um som "empurra" o volume do outro — o pump clássico.', technical: 'Compressão controlada por sinal externo (key input); ducking rítmico do bass pelo kick, tipicamente 6–10 dB.' },
  { term: 'Compressor', simple: 'Um "segurança de volume": o que passar do limite fica mais quieto.', technical: 'Redução de dinâmica com parâmetros threshold/ratio/attack/release + makeup.' },
  { term: 'Limiter', simple: 'Compressor radical: um teto que nada atravessa.', technical: 'Compressor com ratio ∞; último estágio de ganho antes do clipping digital.' },
  { term: 'EQ', simple: 'Controles de graves/médios/agudos — o "tom" de cada som.', technical: 'Filtros por banda (shelf/bell/notch); subtrativo para limpar, aditivo para realçar.' },
  { term: 'Reverb', simple: 'O "tamanho da sala" que o som foi gravado.', technical: 'Resposta impulsiva/estatística: pre-delay, decay, damping; define profundidade e "ar".' },
  { term: 'Delay', simple: 'Eco musical com tempo ligado ao BPM.', technical: 'Tap/feedback por fração rítmica (1/8, 3/8); "bounce" é parte do arranjo.' },
  { term: 'Saturação', simple: "Distorção 'gostosa': dá corpo e peso pro som.", technical: 'Distorção harmônica (tape/tube); realça harmônicos e suaviza picos.' },
  { term: 'Oscilador', simple: 'O motor do som do sintetizador — gera a onda básica.', technical: 'VCO/NCO: saw/square/sine/triangle; base da síntese subtrativa.' },
  { term: 'Filtro', simple: 'Peneira de frequências: o botão que fecha ou abre o timbre.', technical: 'LP/HP/BP com slope (12/24/48 dB/oct) + ressonância; cutoff automatizável = movimento.' },
  { term: 'Envelope (ADSR)', simple: 'Como o som nasce e morre: ataque, queda, sustém, solta.', technical: 'Attack/Decay/Sustain/Release aplicados a VCA/cutoff/pitch.' },
  { term: 'LFO', simple: 'Um "dedo invisível" que balança knobs no ritmo.', technical: 'Oscilador de baixa frequência roteado a parâmetros; sync temporal (1/8, 1/16).' },
  { term: 'Kick', simple: 'O tum-tum grave que marca o pulso da pista.', technical: 'Transiente grave (40–120 Hz + clique); tune e decay definem o gênero.' },
  { term: 'Clap', simple: 'A palma nos tempos 2 e 4.', technical: 'Backbeat sintético/real; 100–200 Hz "body" + 2–5k snappy.' },
  { term: 'Hi-hat', simple: 'O "ts-ts" que preenche entre as batidas.', technical: 'Curto (closed) no off-beat; longo (open) nos "e" de virada; velocity cíclica para groove.' },
  { term: 'Sub bass', simple: 'O grave que a pele sente, o fone mal mostra.', technical: '20–90 Hz, senoidal, mono contínuo; raiz do acorde.' },
  { term: 'Lead', simple: 'A "voz" da música — o som que você canta junto.', technical: 'Melodia principal do drop; sustain + presença + delay curto.' },
  { term: 'Pad', simple: 'O "colchão" de som que enche o fundo.', technical: 'Sustentação harmônica lenta, reverb longo, LP para não brigar.' },
  { term: 'Pluck', simple: 'Nota curtinha que faz "plim".', technical: 'Envelope com sustain 0 e release 150–300 ms; arpejos.' },
  { term: 'Arranjo', simple: 'O roteiro da música: quem entra, quando e quando sai.', technical: 'Sequência de blocos (intro/break/build/drop) e densidade por compasso.' },
  { term: 'Build-up', simple: 'A subida de tensão antes do drop.', technical: 'Riser + snare roll + filtro fechando; 4–8 compassos.' },
  { term: 'Breakdown', simple: 'A parte que "quebra" a energia pra respirar.', technical: 'Corte de groove, abre harmonia, tensão emocional.' },
  { term: 'Drop', simple: 'A hora que a pista explode.', technical: 'Retorno máximo de groove+bass+lead; impacto via contraste (silêncio pré-drop).' },
  { term: 'Gain staging', simple: 'Deixar cada volume no lugar certo pra nada distorcer sem querer.', technical: 'Níveis de operação (≈-18 dBFS RMS/canal) para headroom e consistência de plugins.' },
  { term: 'LUFS', simple: 'Como o ouvido mede volume — não o decibel do medidor.', technical: 'Loudness units (K-weighting, integrado/short-term); alvo por destino (streaming ≈ -14, club -8/-10).' },
  { term: 'True peak', simple: 'O pico REAL do som depois de virar mp3.', technical: 'Medição intersample (≥4x oversample); teto de segurança: -1 dBTP.' },
  { term: 'Stems', simple: 'Gravações dos grupos: bateria, bass, synths separados.', technical: 'Mixdowns contínuos por bus (não "tracks soltas com FX"); base de remix/ mastering externo.' },
  { term: 'VST', simple: 'Plugins: instrumentos e efeitos que tocam dentro da DAW.', technical: 'Formato de plugin (VST2/3, AU, AAX) para instruments e FX com automação.' },
  { term: 'Preset', simple: 'A "foto" salva de um som pronto pra usar.', technical: 'Snapshot de parâmetros de instrumento/FX; bancos nomeados facilitam identidade.' },
  { term: 'Wavetable', simple: 'O synth que "viaja" entre formas de onda — som em movimento.', technical: 'Tabela de ondas com position modulado (env/LFO); growls, cinematic leads.' },
  { term: 'FM', simple: 'Um som modula o outro e nascem metais e sinos.', technical: 'Frequency modulation: operadores carrier/modulator, ratios não-inteiros = inarmônicos.' },
]
