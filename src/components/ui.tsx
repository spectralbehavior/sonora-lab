import { useEffect, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Biblioteca de UI interna (sem framework) — mantém o visual premium coeso.

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'soft'; size?: 'sm' | 'md' | 'lg' }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3.5 text-base' }
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-600 shadow-glow',
    ghost: 'border border-white/10 bg-white/[.03] text-zinc-200 hover:bg-white/[.08]',
    soft: 'bg-brand-soft text-brand-300 hover:bg-brand/25',
    danger: 'bg-rose-600/80 text-white hover:bg-rose-600',
  }
  return <button className={cn(base, sizes[size], variants[variant], className)} {...props} />
}

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  return <div onClick={onClick} className={cn('card p-4 sm:p-5', onClick && 'cursor-pointer transition hover:border-white/20', className)}>{children}</div>
}

export function Badge({ children, tone = 'default', className }: { children: ReactNode; tone?: 'default' | 'brand' | 'success' | 'warn' | 'danger' | 'info'; className?: string }) {
  const tones = {
    default: 'bg-white/[.06] text-zinc-300 border-white/10',
    brand: 'bg-brand-soft text-brand-300 border-brand/30',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    warn: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    info: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  }
  return <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold', tones[tone], className)}>{children}</span>
}

export function ProgressBar({ value, className, tone = 'brand' }: { value: number; className?: string; tone?: 'brand' | 'lime' | 'cyan' }) {
  const bg = tone === 'lime' ? 'from-lime-400 to-emerald-400' : tone === 'cyan' ? 'from-cyan-400 to-sky-400' : 'from-brand to-neon-cyan'
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-white/[.06]', className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', bg)} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
    </div>
  )
}

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }) {
  return (
    <Card className="flex items-start gap-3">
      {icon && <div className="mt-0.5 text-brand-300">{icon}</div>}
      <div>
        <div className="text-xl font-extrabold text-white">{value}</div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-zinc-400">{hint}</div>}
      </div>
    </Card>
  )
}

export function Empty({ icon, title, hint, action }: { icon?: ReactNode; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[.02] px-6 py-12 text-center">
      <div className="text-3xl opacity-70">{icon ?? '🎛️'}</div>
      <div className="text-sm font-bold text-zinc-200">{title}</div>
      {hint && <div className="max-w-md text-xs leading-relaxed text-zinc-500">{hint}</div>}
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className={cn('card toast-in max-h-[92vh] w-full overflow-y-auto rounded-b-none p-5 sm:rounded-2xl', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}
        onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="text-base font-extrabold text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Fechar">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-zinc-500">{hint}</span>}
    </label>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="inline-flex items-center gap-2 text-sm text-zinc-300" aria-pressed={checked}>
      <span className={cn('relative h-6 w-11 rounded-full border transition', checked ? 'border-brand/60 bg-brand' : 'border-white/10 bg-white/[.07]')}>
        <span className={cn('absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition-all', checked ? 'left-[22px]' : 'left-0.5')} style={{ height: 18, width: 18 }} />
      </span>
      {label}
    </button>
  )
}

export function SectionTitle({ kicker, title, sub, center }: { kicker?: string; title: ReactNode; sub?: ReactNode; center?: boolean }) {
  return (
    <div className={cn('mb-8 max-w-2xl', center && 'mx-auto text-center')}>
      {kicker && <div className="mb-2 text-xs font-extrabold uppercase tracking-[.22em] text-brand-300">{kicker}</div>}
      <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">{title}</h2>
      {sub && <p className="mt-3 text-sm leading-relaxed text-zinc-400">{sub}</p>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-white/[.05]', className)} />
}

/** Markdown mini-renderer: headings ###, listas, negrito, linhas. */
export function Md({ text, className }: { text: string; className?: string }) {
  const lines = text.split('\n')
  const out: ReactNode[] = []
  let list: string[] = []
  let olist: string[] = []
  const flush = (key: string) => {
    if (list.length) { out.push(<ul key={`ul-${key}`}>{list.map((li, i) => <li key={i}>{renderInline(li)}</li>)}</ul>); list = [] }
    if (olist.length) { out.push(<ol key={`ol-${key}`}>{olist.map((li, i) => <li key={i}>{renderInline(li)}</li>)}</ol>); olist = [] }
  }
  lines.forEach((rawLine, idx) => {
    const line = rawLine.trimEnd()
    if (!line.trim()) { flush(`f${idx}`); return }
    if (line.startsWith('### ')) { flush(`f${idx}h`); out.push(<h3 key={idx}>{renderInline(line.slice(4))}</h3>); return }
    if (line.startsWith('## ')) { flush(`f${idx}h2`); out.push(<h3 key={idx}>{renderInline(line.slice(3))}</h3>); return }
    const mUl = line.match(/^[-•]\s+(.*)$/)
    if (mUl) { if (olist.length) flush(`fo${idx}`); list.push(mUl[1]); return }
    const mOl = line.match(/^\d+[.)]\s+(.*)$/)
    if (mOl) { if (list.length) flush(`fu${idx}`); olist.push(mOl[1]); return }
    if (line.startsWith('[ ] ') || line.startsWith('- [ ] ')) { list.push(line.replace(/^[-•\s]*\[\s?\]\s?/, '')); return }
    flush(`f${idx}`)
    out.push(<p key={idx}>{renderInline(line)}</p>)
  })
  flush('end')
  return <div className={cn('md', className)}>{out}</div>
}

function renderInline(s: string): ReactNode[] {
  const parts = s.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p))
}
