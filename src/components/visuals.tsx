import { useMemo } from 'react'
import { brand } from '@/config/brand'
import { cn } from '@/lib/utils'

// Elementos visuais da marca (não fixam texto no código além do config).

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden>
        <defs>
          <linearGradient id="lg-brand" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={brand.colors.brand} /><stop offset="1" stopColor={brand.colors.accent} />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="#0B0E16" stroke="rgba(255,255,255,.12)" />
        <g fill="url(#lg-brand)">
          <rect x="10" y="26" width="5" height="12" rx="2.5" />
          <rect x="19" y="18" width="5" height="28" rx="2.5" />
          <rect x="28" y="10" width="5" height="44" rx="2.5" />
          <rect x="37" y="20" width="5" height="24" rx="2.5" />
          <rect x="46" y="27" width="5" height="10" rx="2.5" />
        </g>
      </svg>
      {!compact && <span className="text-lg font-black tracking-tight text-white">{brand.name}</span>}
    </span>
  )
}

/** Equalizador animado determinístico (seeded). */
export function WaveBars({ n = 24, className, seed = 7, active = true }: { n?: number; className?: string; seed?: number; active?: boolean }) {
  const bars = useMemo(() => {
    let s = seed
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
    return Array.from({ length: n }, () => 0.25 + rnd() * 0.75)
  }, [n, seed])
  return (
    <div className={cn('flex h-10 items-center gap-[3px]', className)} aria-hidden>
      {bars.map((h, i) => (
        <span key={i} className={cn('w-[3px] flex-1 max-w-[5px] rounded-full bg-gradient-to-t from-brand to-neon-cyan', active && 'eqbar')}
          style={{ height: `${h * 100}%`, animationDelay: `${(i % 7) * 0.13}s`, animationPlayState: active ? 'running' : 'paused', opacity: 0.5 + h * 0.5 }} />
      ))}
    </div>
  )
}

/** Pipeline hero: DAW → MIDI → SYNTH → DRUMS → BASS → ARRANJO → MIX → MASTER → TRACK. */
export function PipelineViz({ compact = false }: { compact?: boolean }) {
  const steps = ['DAW', 'MIDI', 'SYNTH', 'DRUMS', 'BASS', 'ARRANJO', 'MIX', 'MASTER', 'TRACK ✓']
  return (
    <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-3 lg:grid-cols-9', compact && 'gap-1.5')}>
      {steps.map((s, i) => (
        <div key={s}
          className={cn('glass flex items-center justify-center rounded-xl px-2 font-mono text-[10px] font-bold tracking-wider text-zinc-300 transition hover:border-brand/50 hover:text-white',
            i === steps.length - 1 && 'border-emerald-400/40 text-emerald-300', compact ? 'py-2' : 'py-3')}
          style={{ animation: `rise .6s cubic-bezier(.2,.7,.2,1) ${i * 0.08}s both` }}>
          {s}
        </div>
      ))}
    </div>
  )
}

/** Fader + knobs decorativos (estética de mixer) — SVG inline. */
export function ConsoleArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 120" className={cn('w-full', className)} aria-hidden>
      <defs>
        <linearGradient id="fad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={brand.colors.brand} /><stop offset="1" stopColor={brand.colors.accent} />
        </linearGradient>
      </defs>
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i} transform={`translate(${14 + i * 38} 0)`}>
          <rect x="8" y="46" width="8" height="60" rx="4" fill="rgba(255,255,255,.06)" />
          <rect x="5" y={46 + ((i * 13) % 34)} width="14" height="8" rx="2" fill="url(#fad)" />
          <circle cx="12" cy="20" r="12" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.14)" />
          <line x1="12" y1="20" x2={12 + 8 * Math.cos(i * 1.1)} y2={20 + 8 * Math.sin(i * 1.1)} stroke={brand.colors.accent} strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  )
}

export function Knob({ label = 'CUTOFF' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden>
        <circle cx="26" cy="26" r="20" fill="#0B0E16" stroke="rgba(255,255,255,.16)" strokeWidth="2" />
        <circle cx="26" cy="26" r="20" fill="none" stroke={brand.colors.brand} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="94" strokeDashoffset="34" transform="rotate(130 26 26)" />
        <line x1="26" y1="26" x2="26" y2="10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" transform="rotate(38 26 26)" />
      </svg>
      <span className="font-mono text-[9px] tracking-widest text-zinc-500">{label}</span>
    </div>
  )
}
