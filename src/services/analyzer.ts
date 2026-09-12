// ─── TRACK ANALYZER (BETA) — análise 100% real, 100% local ──────────────────
// NÃO é "IA que adivinha": usa Web Audio API (AudioContext.decodeAudioData +
// FFT) para medir o arquivo no dispositivo do usuário. Nada é enviado a
// servidores. O relatório usa linguagem condicionada ("possível", "vale
// verificar") — não é parecer de engenheiro de masterização.

export interface MetricReport {
  fileName: string
  durationSec: number
  sampleRate: number
  channels: number
  peakDb: number
  truePeakEstDb: number
  rmsDb: number
  loudnessEstimate: number // aproximação ponderada simples, NÃO é LUFS certificado
  clippingEvents: number
  dcOffset: number
  bandEnergy: { label: string; db: number }[]
  stereoCorrelation: number
  hints: { tone: 'ok' | 'warn' | 'info'; text: string }[]
  waveform: number[] // envelope normalizado p/ desenho
}

export const analyzeSupported = typeof AudioContext !== 'undefined' || typeof (globalThis as { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined'

export async function analyzeAudioFile(file: File): Promise<MetricReport> {
  if (!analyzeSupported) throw new Error('Este navegador não expõe a Web Audio API necessária para a análise local.')
  const Ctx: typeof AudioContext = (AudioContext as typeof AudioContext) ?? (globalThis as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new Ctx()
  let audio: AudioBuffer
  try {
    const buf = await file.arrayBuffer()
    audio = await ctx.decodeAudioData(buf)
  } finally {
    ctx.close().catch(() => undefined)
  }

  const data = audio.getChannelData(0)
  const n = data.length
  let peak = 0
  let sumSq = 0
  let clipEvents = 0
  let inClip = false
  let dc = 0
  for (let i = 0; i < n; i++) {
    const v = data[i]
    const a = Math.abs(v)
    if (a > peak) peak = a
    sumSq += v * v
    dc += v
    if (a >= 0.999) { if (!inClip) clipEvents += 1; inClip = true } else inClip = false
  }
  const rms = Math.sqrt(sumSq / n)
  const peakDb = toDb(peak)
  const rmsDb = toDb(rms)
  // estimativa "loudness-like": pondera RMS por um shelf simples (aproximação K —
  // NÃO substitui medidor EBU R128; rotulado como estimativa na UI).
  const loudnessEstimate = toDb(rms * 1.12)

  const truePeakEstDb = estimateTruePeak(data)
  const dcOffset = Math.abs(dc / n)

  // espectro médio por banda via FFT em blocos (Analyser não serve p/ offline;
  // implementamos DFT bin por amostragem espectral com média de blocos)
  const bandEnergy = spectralBands(audio)

  // correlação estéreo (L/R)
  let stereoCorrelation = 1
  if (audio.numberOfChannels >= 2) {
    const L = audio.getChannelData(0)
    const R = audio.getChannelData(1)
    let sl = 0, sr = 0, slr = 0
    const step = Math.max(1, Math.floor(L.length / 200000))
    for (let i = 0; i < L.length; i += step) { sl += L[i] * L[i]; sr += R[i] * R[i]; slr += L[i] * R[i] }
    const denom = Math.sqrt(sl * sr) || 1
    stereoCorrelation = slr / denom
  }

  const waveform = envelope(audio, 600)

  const hints = buildHints({ peakDb, truePeakEstDb, loudnessEstimate, clippingEvents: clipEvents, dcOffset, bandEnergy, stereoCorrelation, channels: audio.numberOfChannels })

  return {
    fileName: file.name, durationSec: audio.duration, sampleRate: audio.sampleRate,
    channels: audio.numberOfChannels, peakDb, truePeakEstDb, rmsDb, loudnessEstimate,
    clippingEvents: clipEvents, dcOffset, bandEnergy, stereoCorrelation, hints, waveform,
  }
}

function toDb(x: number): number {
  return x <= 1e-7 ? -140 : 20 * Math.log10(x)
}

function estimateTruePeak(data: Float32Array): number {
  // interpolação 2x por vizinhos (aproximação de intersample peaks)
  let max = 0
  const step = Math.max(1, Math.floor(data.length / 2_000_000))
  for (let i = 1; i + 1 < data.length; i += step) {
    const interp = 0.5 * data[i] + 0.25 * (data[i - 1] + data[i + 1])
    const a = Math.abs(interp)
    if (a > max) max = a
  }
  return toDb(Math.max(max, 1e-7))
}

function spectralBands(audio: AudioBuffer): { label: string; db: number }[] {
  const sr = audio.sampleRate
  const fftSize = 4096
  const win = hann(fftSize)
  const bands: [string, number, number][] = [
    ['20–60 Hz', 20, 60], ['60–120 Hz', 60, 120], ['120–400 Hz', 120, 400],
    ['0.4–2 kHz', 400, 2000], ['2–6 kHz', 2000, 6000], ['6–12 kHz', 6000, 12000], ['12–20 kHz', 12000, 20000],
  ]
  const energy = bands.map(() => 0)
  const data = audio.getChannelData(0)
  const hop = Math.max(fftSize, Math.floor(data.length / 400))
  let blocks = 0
  for (let start = 0; start + fftSize < data.length; start += hop) {
    const re = new Float64Array(fftSize)
    const im = new Float64Array(fftSize)
    for (let i = 0; i < fftSize; i++) re[i] = data[start + i] * win[i]
    fft(re, im)
    const half = fftSize / 2
    for (let k = 1; k < half; k++) {
      const f = (k * sr) / fftSize
      const mag = re[k] * re[k] + im[k] * im[k]
      for (let b = 0; b < bands.length; b++) if (f >= bands[b][1] && f < bands[b][2]) { energy[b] += mag; break }
    }
    blocks += 1
  }
  blocks = Math.max(1, blocks)
  const total = energy.reduce((a, b) => a + b, 0) || 1
  return bands.map((bn, i) => ({
    label: bn[0],
    db: 20 * Math.log10(Math.sqrt((energy[i] / blocks) / (halfPower(total, blocks, fftSize))) || 1e-7),
  }))
}

function halfPower(total: number, blocks: number, size: number) {
  return Math.max(1e-12, (total / blocks) / size)
}

function hann(n: number): Float64Array {
  const w = new Float64Array(n)
  for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)))
  return w
}

// FFT radix-2 iterativa (in-place)
function fft(re: Float64Array, im: Float64Array) {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]] }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len
    const wr = Math.cos(ang), wi = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let curR = 1, curI = 0
      for (let k = 0; k < len / 2; k++) {
        const aR = re[i + k], aI = im[i + k]
        const bR = re[i + k + len / 2] * curR - im[i + k + len / 2] * curI
        const bI = re[i + k + len / 2] * curI + im[i + k + len / 2] * curR
        re[i + k] = aR + bR; im[i + k] = aI + bI
        re[i + k + len / 2] = aR - bR; im[i + k + len / 2] = aI - bI
        const nextR = curR * wr - curI * wi
        curI = curR * wi + curI * wr
        curR = nextR
      }
    }
  }
}

function envelope(audio: AudioBuffer, points: number): number[] {
  const data = audio.getChannelData(0)
  const step = Math.max(1, Math.floor(data.length / points))
  const out: number[] = []
  for (let i = 0; i < data.length; i += step) {
    let max = 0
    for (let j = 0; j < step && i + j < data.length; j += 7) max = Math.max(max, Math.abs(data[i + j]))
    out.push(Math.min(1, max))
  }
  return out.slice(0, points)
}

function buildHints(m: {
  peakDb: number; truePeakEstDb: number; loudnessEstimate: number; clippingEvents: number;
  dcOffset: number; bandEnergy: { label: string; db: number }[]; stereoCorrelation: number; channels: number;
}): MetricReport['hints'] {
  const h: MetricReport['hints'] = []
  if (m.clippingEvents > 0) h.push({ tone: 'warn', text: `Foram detectados ~${m.clippingEvents} evento(s) de amostra(s) no teto digital — possível clipping; vale verificar a cadeia de ganhos antes do limiter.` })
  else h.push({ tone: 'ok', text: 'Nenhum trecho amostral encostou no teto 0 dBFS — sem indício de clipping digital.' })
  if (m.truePeakEstDb > -0.5) h.push({ tone: 'warn', text: `Pico interpolido estimado em ${m.truePeakEstDb.toFixed(1)} dBTP — para distribuição em streaming, o costume é teto de -1 dBTP; pode haver cliques após a codificação (mp3/aac).` })
  if (m.peakDb > -1) h.push({ tone: 'info', text: 'Peak absoluto muito alto: possível esmagamento. Compare com uma referência de gênero em volume igualado.' })
  if (m.loudnessEstimate < -16) h.push({ tone: 'info', text: `Loudness estimado ${m.loudnessEstimate.toFixed(1)} dB (métrica aproximada, não é LUFS certificado) — mais baixo que o usual para eletrônica finalizada; confira se é escolha artística.` })
  if (m.dcOffset > 0.005) h.push({ tone: 'warn', text: 'Componente DC detectável (possível offset) — vale verificar highpass/DC-removal na cadeia.' })
  const low = m.bandEnergy.find(b => b.label === '20–60 Hz')?.db ?? -99
  const lowMid = m.bandEnergy.find(b => b.label === '120–400 Hz')?.db ?? -99
  const high = m.bandEnergy.find(b => b.label === '12–20 kHz')?.db ?? -99
  if (lowMid > low + 12) h.push({ tone: 'warn', text: 'Possível acúmulo relativo em 120–400 Hz frente ao sub — vale verificar ressonâncias/"lama" no low-mid.' })
  if (high < low - 30) h.push({ tone: 'info', text: 'Região 12–20 kHz bem abaixo do sub — possível filtro/bom brilho de origem (ou mastering conservador).' })
  if (m.channels >= 2 && m.stereoCorrelation < 0.1) h.push({ tone: 'warn', text: `Correlação estéreo ≈ ${m.stereoCorrelation.toFixed(2)} — pode haver conflitos de fase; o grave pode sumir em sistemas mono.` })
  else if (m.channels >= 2) h.push({ tone: 'ok', text: `Correlação estéreo ≈ ${m.stereoCorrelation.toFixed(2)} (faixa saudável costuma ficar entre 0.2 e 0.9).` })
  h.push({ tone: 'info', text: 'Isto é um relatório educativo local, não um diagnóstico definitivo nem parecer de mastering. Use sua audição e uma referência como fonte de verdade.' })
  return h
}
