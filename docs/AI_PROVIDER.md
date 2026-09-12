# AI Provider — arquitetura do Mentor (anti-alucinação)

O AI Mentor **nunca** gera instruções de DAW livremente. Fluxo (implementado em `src/services/mentor.ts`):

1. **RAG local primeiro**: pergunta → normalização (sem acentos) → matching na `MENTOR_KB` (`src/data/mentorKb.ts`) + busca em aulas publicadas. Cada entrada carrega: resposta conceitual, `steps` **por DAW** com carimbo de versão verificada, exercício, erro comum, desafio e refs de aulas.
2. **Se não há fonte, não há resposta.** O Mentor devolve `matched: false` com explicação honesta e sugere registrar a dúvida (vira fila de conteúdo novo no admin — tabela futura `kb_gaps`).
3. **Provider configurável via `/admin` (settings `aiProvider`)**, sempre com a mesma guarda:
   - `kb-only` (default) — modelo nenhum; só a base curada.
   - `llm-grounded` — LLM externa (OpenAI/Anthropic) recebe **apenas** os trechos recuperados e tem ordem literal de não adicionar comandos/menus; resposta pós-validada (se contiver nome de plugin/menu ausente do contexto → rejeitada e logada).
   - `hybrid` — grounded para técnica; LLM livre permitida só para teoria/feedback musical (sem procedimento de software).

## Regras de conteúdo versionado (a mão do editor)

- Todo `dawSteps` exige `{daw, version, date}` preenchidos no admin (bloqueado no editor).
- `daw_versions` por DAW define a versão "atual verificada"; aula com `verified.version` ≠ atual ganha selo "⚠ revisar" no player e entra na fila do admin.
- Novos releases FL/Ableton/Cubase → admin abre a fila, revisa, bump `contentVersion` (r1→r2) — os alunos veem "conteúdo para FL Studio 21.x" etc. e podem reportar divergência direto da aula (`lesson_reports`).

## Segurança & LGPD

- **Chaves só server-side** (`OPENAI_API_KEY` etc. em env de Vercel; a Edge Function injeta; o front fala com `/api/mentor`).
- O prompt enviado à LLM contém a pergunta do aluno + trechos da base — nunca dados de terceiros; política contratual exige `zero retention`/no-training.
- Uso contabilizado por `mentor_usage` (settings) para rate-limit por plano (free 8/dia, pagos 200/dia) — checar em `/admin → Analytics`.
- Feedback 👍/👎 por resposta alimenta a curadoria (tabela `mentor_feedback`).

## Ao plugar um LLM real

1. Criar `api/mentor.ts` (Vercel): valida sessão → busca RAG via `supabase.rpc` → chama provider com system prompt fixo (incluir as três regras acima) → valida saída → grava `mentor_feedback`/`rate bucket`.
2. `settings.aiProvider = { mode:'llm-grounded', model:'…', temperature:0.2 }`.
3. Rodar o suite de avaliação anti-invenção: 50 perguntas canônicas; qualquer resposta com menu inexistente reprova o deploy.
