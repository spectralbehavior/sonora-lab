import { Link } from 'react-router-dom'
import { MarketingShell } from '@/components/shell'

export default function NotFound() {
  return (
    <MarketingShell>
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
        <div className="font-mono text-6xl font-black text-white/[.12]">404</div>
        <h1 className="mt-2 text-xl font-black text-white">Trilha sem saída neste ponto</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">A rota <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">esta</code> não existe (ainda?). Se você caiu aqui por um link nosso, mande nos comentários do post mais recente da comunidade.</p>
        <div className="mt-6 flex gap-2">
          <Link to="/" className="btn-primary">Voltar ao início</Link>
          <Link to="/app" className="btn-ghost">Ir ao app</Link>
        </div>
      </div>
    </MarketingShell>
  )
}
