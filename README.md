# Sonora — plataforma de educação em produção de música eletrônica

> **Aprenda a produzir música eletrônica. Do primeiro beat à música finalizada.**

SaaS educacional completo: trilhas guiadas (aprender → entender → praticar → criar → produzir → arranjar → mixar → masterizar → finalizar → publicar → portfólio → monetizar), mentor IA didático com conteúdo **versionado por DAW**, projetos práticos com briefing/checklist/critérios, gamificação configurável, comunidade com audit de faixas, certificados verificáveis, painel admin com CMS e arquitetura de pagamentos/B2B pronta para pluggar PSP real.

## Stack

| Camada | Escolha |
|---|---|
| Frontend | React 18 + TypeScript + Vite, Tailwind (dark/glass, mobile-first) |
| Dados dev | `src/lib/db.ts` — repositório local **espelhando** o schema SQL (troca por env) |
| Produção | Supabase (Postgres + Auth + Storage + **RLS**) — `supabase/schema.sql` |
| Deploy | Vercel |
| Testes | Vitest (31 testes de domínio: XP, streak, auth, billing, mentor, LGPD, certificados…) |

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npx vitest run     # testes de domínio
npm run build      # produção
```

**Modo demo:** sem Supabase configurado, tudo roda sobre `localStorage` (login funciona, nada é fake; os fluxos são os mesmos services). O banner demo sinaliza isso. Para o modo real: `docs/DEPLOY.md`.

## Estrutura

```
src/
  pages/        # 27 rotas (landing, onboarding, app*, admin, legal, SEO público)
  components/   # ui/, learn/, shell, visuals (glass + microinterações)
  services/     # auth, content, progress, gamification, billing, mentor,
                # community, studio, certificates, lgpd, analytics, analyzer
  lib/          # db.ts (repositório), gamify.ts (XP/levels/streak puros),
                # utils, seo, supabase (adaptador de troca por env)
  data/seed/    # 9 cursos núcleo + 3 academias DAW + 14 gêneros + projetos 01–08
                # + biblioteca (só conteúdo licenciável) + glossário — ver builder.ts
  config/       # brand, gamification (XP/níveis default), pricing (defaults)
  i18n/         # pt/en/es (strings prontas; locale no perfil)
supabase/schema.sql  # tabelas + RLS + RPCs + storage + audit log
docs/               # DEPLOY.md · AI_PROVIDER.md
```

## Regras do produto (inegociáveis, já no código)

1. **Nunca inventar menus/atalhos de DAW.** Conteúdo específico de DAW carrega carimbo `{daw, version, date}`; o player mostra selo "⚠ revisar" quando diverge da versão registrada pelo admin (`daw_versions`). O Mentor responde **só** da KB curada + aulas, e admite quando não sabe.
2. **Preços/marca/XP/níveis não ficam no código** — settings editáveis no `/admin` (planos, valores de XP, nomes de níveis, cores/nome da marca, provider de IA).
3. **Nada é simulado sem aviso.** Checkout é marcado sandbox; analyzer é medição local real (Web Audio) com linguagem de *indício*, não veredito; o que é Fase 8 aparece como "planejado" (ex.: uploads no Estúdio).
4. **Sem conteúdo de terceiros sem licença.** Biblioteca distribui apenas arquivos gerados pela casa (MIDI/presets/samples .txt/.mid próprios, templates sem plugins proprietários).
5. **IA não substitui processo criativo** — ensina, orienta, acelera; prompts e resposta refletem isso.
6. **Conceito primeiro, DAW depois:** cada aula DAW-específica começa do conceito e mostra o caminho FL/Ableton/Cubase em abas.

## Rotas principais

Públicas: `/` `/planos` `/daws` `/comparar` `/produtor/:username` `/certificado/:id` `/producao-musical` `/fl-studio` `/ableton-live` `/cubase` `/psytrance` `/techno` `/house` `/mixagem` `/masterizacao` `/sound-design` `/como-produzir-musica` `/curso-producao-musical` `/producao-musical-eletronica` `/privacidade` `/termos` `/cookies`

App (auth): `/app` (dashboard) · `/app/aprender` · `/app/curso/:id` · `/app/aula/:id` · `/app/projetos` · `/app/desafios` · `/app/roadmap` · `/app/mentor` · `/app/comunidade` · `/app/biblioteca` · `/app/plugins` · `/app/portefolio` · `/app/certificados` · `/app/evolucao` · `/app/estudio` · `/app/finish` · `/app/analyzer` · `/app/checkout/:planId` · `/app/configuracoes` · `/app/me` — Admin: `/admin` (role `admin`).

## Teste de aceitação manual (checklist do spec)

- [x] Todas as rotas acima abrem sem crash (`npm run build` + navegação).
- [x] Criar conta → onboarding 4 passos → dashboard com streak/XP/continue.
- [x] Concluir aula → XP + desbloqueio + streak; quiz 100% dá bônus.
- [x] Free não abre aula Pro (cadeado funcional → leva a `/planos`); Pro libera.
- [x] Projeto 01→08 checklist salva; concluir dá XP+conquista.
- [x] Mentor: pergunta técnica → passos da SUA DAW com carimbo; pergunta fora da base → admite.
- [x] Community: post, comment, like, report → fila no `/admin` → moderação.
- [x] Analyzer: subir WAV/MP3 → métricas reais + avisos com ressalva.
- [x] Finish 7 dias: marca dias, pula dia → alerta, 7/7 → notificação.
- [x] Certificado: exige plano pago + curso 100% → código + QR + `/certificado/:id`.
- [x] LGPD: consentimentos, export JSON, exclusão anonimiza posts.
- [x] Admin: CRUD de cursos/aulas/módulos, gêneros, versões DAW, planos, cupons, XP, níveis, roles, denúncias, eventos.
- [x] Mobile: bottom nav 5 itens, nenhuma barra horizontal em 360px.
- [x] RLS: `supabase/schema.sql` cobre dono-dos-dados/admin; export anônimo bloqueado.

## Marketplace / receita futura (arquitetura, não UI enganosa)

Assinaturas ativas de ponta a ponta (demo) com providers plugáveis. Vendas de presets/samples, marketplace seller/buyer + comissão, B2B (contas Academy para escolas) e afiliados: **modelagem iniciada** em `services/billing.ts` + tabelas do schema; a UI é marcada explicitamente como planejada quando ainda não existe — nada de página fantasma.

## Licença & marca

Config de marca em `src/config/brand.ts` (nome, cores, domínio, e-mail de suporte trocáveis sem tocar em páginas). Este repositório não contém conteúdo de terceiros.
