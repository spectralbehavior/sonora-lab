import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { UploadCloud, Loader2, Info } from 'lucide-react'
import { PageHeader } from '@/components/shell'
import { Card, Badge, Empty, Button } from '@/components/ui'
import { analyzeAudioFile, analyzeSupported, type MetricReport } from '@/services/analyzer'
import { useApp } from '@/store/app'
import { track } from '@/services/analytics'
import { cn } from '@/lib/utils'

// AI TRACK ANALYZER (beta) — métricas REAIS calculadas no navegador via Web Audio.
// Nada sobe para servidor; nenhuma "IA de áudio" é simulada. Relatórios com
// linguagem educativa condicionada (nunca diagnóstico absoluto).

export default function AnalyzerPage() {
  const { user, pushToast } = useApp()
  const [busy, setBusy] = useState(false)
  const [report, setReport] = useState<MetricReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function onFile(f?: File | null) {
    if (!f) return
    if (f.size > 60 * 1024 * 1024) { setError('Arquivo acima de 60 MB — faça um bounce menor (a análise é local e o decoder tem limites).'); return }
    if (!/\.(wav|mp3|ogg|m4a|aac|flac)$/i.test(f.name)) { setError('Formatos aceitos: WAV, MP3, OGG, M4A, FLAC (decodificáveis pelo seu navegador).'); return }
    setError(null); setBusy(true); setReport(null)
    try {
      const r = await analyzeAudioFile(f)
      setReport(r)
      track('analyzer_run', { duration: Math.round(r.durationSec) })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao decodificar o arquivo — tente um bounce WAV 24-bit.')
    } finally { setBusy(false) }
  }

  if (!analyzeSupported) {
    return <Empty title="Sem Web Audio neste ambiente" hint="O navegador atual não expõe AudioContext. Use um navegador moderno (Chrome, Firefox, Edge, Safari) no modo desktop ou mobile padrão." />
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader title={<span className="flex items-center gap-2">🛰️ AI Track Analyzer <Badge tone="info">beta local</Badge></span>} sub="Envie o bounce da sua track: medimos pico, true peak estimado, loudness aproximado, eventos de clipping, energia por banda, correlação estéreo e waveform — TUDO no seu dispositivo." actions={user ? <Badge tone="success">✓ análise 100% local</Badge> : null} />

      <Card>
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]) }}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[.02] px-6 py-10 text-center transition hover:border-brand/40"
        >
          {busy ? <Loader2 className="animate-spin text-brand-300" size={28} /> : <UploadCloud size={30} className="text-zinc-500" />}
          <div>
            <div className="text-sm font-extrabold text-white">{busy ? 'Decodificando e medindo (não enviamos nada a lugar nenhum)…' : 'Solte seu WAV/MP3 aqui'}</div>
            <div className="mt-1 text-[12px] text-zinc-500">Máx. 60 MB · processamento via Web Audio API · seu arquivo não sai deste navegador</div>
          </div>
          <input ref={inputRef} type="file" accept=".wav,.mp3,.ogg,.m4a,.flac,audio/*" className="hidden" onChange={e => onFile(e.target.files?.[0])} />
          <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>Escolher arquivo</Button>
        </div>
        {error && <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-200">{error}</p>}
      </Card>

      {report && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Duração / SR / canais" value={`${report.durationSec.toFixed(1)}s`} sub={`${(report.sampleRate / 1000).toFixed(1)} kHz · ${report.channels === 1 ? 'mono' : `${report.channels} ch`}`} />
            <MetricCard label="Pico amostral" value={`${report.peakDb.toFixed(1)} dB`} sub={`eventos de clip: ${report.clippingEvents}`} tone={report.clippingEvents > 0 ? 'bad' : 'good'} />
            <MetricCard label="True peak (estimado)" value={`${report.truePeakEstDb.toFixed(1)} dBTP`} sub="interpolação 2× aproximada — não é medidor certificado" tone={report.truePeakEstDb > -0.5 ? 'warn' : 'good'} />
            <MetricCard label="Loudness estimado*" value={`${report.loudnessEstimate.toFixed(1)} dB`} sub="RMS com ponderação simples — NÃO é LUFS EBU R128" tone="info" />
            <MetricCard label="Correlação estéreo" value={report.stereoCorrelation.toFixed(2)} sub="saudável ~0.2–0.9" tone={report.stereoCorrelation < 0.1 ? 'bad' : 'good'} />
            <MetricCard label="DC offset" value={(report.dcOffset * 100).toFixed(2)} sub="acima de 0.5 ≈ verifique highpass" tone={report.dcOffset > 0.005 ? 'warn' : 'good'} />
          </div>

          <Card>
            <div className="mb-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400">Waveform medido</div>
            <div className="flex h-24 items-center gap-px overflow-hidden rounded-xl border border-white/[.06] bg-night-900 p-2">
              {report.waveform.map((v, i) => <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-brand/60 to-neon-cyan/60" style={{ height: `${Math.max(4, v * 100)}%` }} />)}
            </div>
            <div className="mt-4 text-sm font-extrabold uppercase tracking-wider text-zinc-400">Energia por banda (FFT média)</div>
            <div className="mt-2 space-y-1.5">
              {report.bandEnergy.map(b => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-right font-mono text-[10px] text-zinc-500">{b.label}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/[.05]">
                    <div className={cn('h-full rounded-full', b.db > -30 ? 'bg-gradient-to-r from-brand to-neon-cyan' : 'bg-zinc-600')} style={{ width: `${Math.max(2, Math.min(100, (b.db + 90) / 90 * 100))}%` }} />
                  </div>
                  <span className="w-16 font-mono text-[10px] text-zinc-500">{b.db.toFixed(1)} dB</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">Relatório educativo</div>
            <ul className="mt-3 space-y-2">
              {report.hints.map((h, i) => (
                <li key={i} className={cn('flex gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] leading-relaxed',
                  h.tone === 'warn' ? 'border-amber-500/25 bg-amber-500/[.05] text-amber-100' : h.tone === 'ok' ? 'border-emerald-500/20 bg-emerald-500/[.04] text-emerald-100' : 'border-white/[.07] bg-white/[.02] text-zinc-300')}>
                  <span className="mt-0.5">{h.tone === 'warn' ? '⚠️' : h.tone === 'ok' ? '✅' : <Info size={14} className="text-zinc-500" />}</span>{h.text}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/app/aula/mixagem-l08" className="btn-ghost btn-sm">🎚 Revisar checklist de mixagem</Link>
              <Link to="/app/aula/masterizacao-l01" className="btn-ghost btn-sm">💿 Curso de Loudness/LUFS</Link>
              <Link to="/app/mentor" className="btn-ghost btn-sm">🧠 Perguntar ao Mentor sobre este relatório</Link>
              <Button size="sm" variant="soft" onClick={() => pushToast('Copie os números acima no seu post de feedback — estrutura: v1 → feedback → v2.', 'info')}>Como usar isto no feedback</Button>
            </div>
          </Card>

          <p className="text-center text-[10px] leading-relaxed text-zinc-600">* Métricas aproximadas calculadas localmente (pico, RMS, banda). Não substituem medidor R128 certificado nem auditoria humana. O Analyzer <b>não é</b> um veredito: é um ponto de partida — a verdade final é o seu ouvido + referência + ambiente.</p>
        </>
      )}

      {!report && !busy && (
        <Card className="border-brand/25 bg-brand-soft">
          <div className="text-sm font-extrabold text-white">O que vem a seguir (roadmap Fase 8 — Audio Intelligence)</div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-300">Este beta mede o "clima" da mix (pico, loudness, espectro, fase). As próximas camadas com processamento server-side: <b>AI Mix Coach</b> (lista de pontos para verificar, ex.: low-end, kick×bass, headroom, stereo, reverb excessivo, comparação de referência) e <b>AI Master Coach</b>. <b>Honestidade:</b> nada disso existe ainda — nada aqui finge análise que não é feita.</p>
        </Card>
      )}
    </div>
  )
}

function MetricCard({ label, value, sub, tone = 'default' }: { label: string; value: string; sub?: string; tone?: 'default' | 'good' | 'warn' | 'bad' | 'info' }) {
  return (
    <Card className={cn(tone === 'bad' && 'border-rose-500/30', tone === 'warn' && 'border-amber-500/25', tone === 'good' && 'border-emerald-500/20')}>
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-black text-white">{value}</div>
      {sub && <div className="mt-0.5 text-[10px] leading-snug text-zinc-500">{sub}</div>}
    </Card>
  )
}
