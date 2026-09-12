# Deploy — Vercel + Supabase (Sonora)

## 1. Supabase

1. Crie o projeto (região sul-americana p/ latência BR: `gru1` se disponível, senão `us-east`).
2. No SQL Editor, rode `supabase/schema.sql` inteiro.
3. Auth → Providers: e-mail habilitado; Site URL = `https://SEU-VERCEL.app` (e domínio final); Redirect URLs: `https://SEU-DOMINIO/app/**`.
4. Storage → crie os buckets: `library` (public read), `track-audio` (private, máx 80 MB, `audio/*`), `avatars` (public read, 2 MB, `image/*`). Aplique as policies de upload do rodapé do schema.
5. (Opcional) Edge Function `analyzer` para loudness no servidor quando quiser LUFS real; o cliente atual já mede local.

## 2. Vercel

```bash
vercel link && vercel env add
```

| Variável | Valor |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto |
| `VITE_SUPABASE_ANON_KEY` | anon key (segura p/ front — RLS protege) |
| `VITE_DATA_MODE` | `supabase` (sem ela o app roda em modo demo local) |
| `VITE_BRAND_URL` | domínio público (SEO/sitemap) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | só serverless (`api/`), **nunca** `VITE_` |
| `MP_ACCESS_TOKEN`, `ASAAS_API_KEY` | idem — servidores apenas |

Build settings: `npm run build`, output `dist`. Adicione `/api/*` rewrites se usar funções Stripe/Mercado Pago/Asaas (webhooks de `checkout.session.completed`/`subscription.*` ativam `subscriptions` + emitem `payments`; o card data nunca toca seu backend).

## 3. Trocar o modo de dados

`src/lib/supabase.ts` re-exporta o mesmo contrato dos services sobre PostgREST quando `VITE_DATA_MODE=supabase` (o `db.ts` local vira fallback p/ testes). As páginas não mudam: os services (auth/content/progress/…) é que falam com o adaptador.

## 4. Webhooks de pagamento (esboço pronto em `api/`)

- Stripe: `checkout.session.completed` → `confirmCheckout` server-side; `invoice.payment_failed` → marca risco de churn + notificação.
- Mercado Pago: `payment` webhook com validação de assinatura x-secret.
- Asaas: `PAYMENT_CONFIRMED` / `SUBSCRIPTION_CYCLE`.

## 5. Checklist pós-deploy (gate do spec)

- [ ] Cadastro → e-mail de confirmação; login magic-link ok
- [ ] Progresso persiste entre dispositivos (banco, não localStorage)
- [ ] RLS: usuário A não lê `lesson_progress` de B (teste no SQL editor + na API REST com JWT)
- [ ] Uploads de áudio: content-type + tamanho impostos
- [ ] Rate limiting mentor ativo (Edge Function; free 8/dia)
- [ ] `/admin` acessível só com `role=admin`; audit_log gravando
- [ ] Exportação LGPD e delete-account respondem < 15 dias via app
- [ ] SEO: sitemap/robots servindo, `canonical` com domínio final
- [ ] Lighthouse mobile ≥ 90 (públicas)
