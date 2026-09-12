import { Link } from 'react-router-dom'
import { MarketingShell } from '@/components/shell'
import { useSeo } from '@/lib/seo'
import { brand } from '@/config/brand'

const S = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <div><h2 className="mt-8 text-base font-extrabold text-white">{t}</h2><div className="mt-2 space-y-2 text-[13px] leading-relaxed text-zinc-400">{children}</div></div>
)

export default function LegalPages({ page }: { page: 'privacidade' | 'termos' | 'cookies' }) {
  const titles = {
    privacidade: 'Política de Privacidade (LGPD)',
    termos: 'Termos de Uso',
    cookies: 'Política de Cookies',
  } as const
  useSeo({ title: titles[page], description: `${titles[page]} da ${brand.name}.`, path: `/${page}` })

  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="mb-6 flex items-center gap-2">
          {(['privacidade', 'termos', 'cookies'] as const).map(p => (
            <Link key={p} to={`/${p}`} className={p === page ? 'chip border-brand/60 bg-brand-soft !text-white' : 'chip'}>{p[0].toUpperCase() + p.slice(1)}</Link>
          ))}
        </div>
        <h1 className="text-2xl font-black text-white">{titles[page]}</h1>
        <p className="mt-1 text-[11px] text-zinc-600">Última atualização: {new Date().toISOString().slice(0, 10)} · {brand.legalName} · contato: {brand.supportEmail}</p>

        {page === 'privacidade' && (
          <article>
            <S t="1. Quem somos e o que fazemos com seus dados">
              <p>A {brand.legalName} opera a plataforma educacional {brand.name} para ensino de produção musical. Tratamos dados para: criar sua conta e sessão, registrar seu progresso educacional, emitir certificados, permitir interação na comunidade, processar assinaturas (via provedores de pagamento — nunca armazenamos dados de cartão) e melhorar o produto com métricas de uso.</p>
              <p>Coletamos: nome/e-mail, conteúdo que você publica (posts, tracks, ideias), progresso (aulas, XP, sessões), preferências (DAW, gênero, nível) e, se consentido, métricas de analytics e marketing.</p>
            </S>
            <S t="2. Bases legais (LGPD art. 7º)">
              <p>Execução de contrato (conta e acesso ao serviço), consentimento (comunicações de marketing, analytics de terceiros, cookies), legítimo interesse (segurança, prevenção a fraude e melhoria do app — com opção de oposição) e obrigação legal (retenção fiscal de registros de pagamento: 5 anos).</p>
            </S>
            <S t="3. Compartilhamento">
              <p>Provedores essenciais: hospedagem (Vercel), banco/armazenamento (Supabase), e-mail transacional, processamento de pagamento (Stripe/Mercado Pago/Asaas quando ativos), analytics somente mediante seu consentimento. Não vendemos dados pessoais. Provedores de IA (quando o mentor externo for habilitado) recebem apenas o contexto da pergunta; contratos incluem cláusulas de não-treino com seus dados.</p>
            </S>
            <S t="4. Direitos do titular — exercitáveis no app">
              <p>Confirmação e acesso, correção, portabilidade (exportação JSON completa em Configurações → Seus dados), anonimização/exclusão (excluir conta remove seus dados; posts publicados são anonimizados para preservar conversas), informação sobre compartilhamentos e revogação de consentimento a qualquer momento. Responderemos em até 15 dias; canal: {brand.supportEmail}.</p>
            </S>
            <S t="5. Retenção e segurança">
              <p>Progresso educacional: enquanto a conta existir; logs de segurança: até 12 meses; pagamentos: 5 anos (fiscal). Adotamos criptografia em trânsito, secrets fora do frontend, Row Level Security no banco, rate limiting e trilha de auditoria administrativa.</p>
            </S>
            <S t="6. Menores de idade">
              <p>O serviço é voltado a maiores de 16 anos. Menores (16–18) apenas com consentimento do responsável; menores de 16 não devem criar contas.</p>
            </S>
            <S t="7. Conteúdo dos usuários e direitos autorais">
              <p>Você mantém a titularidade do que criar. Ao publicar tracks/posts, concede licença não-exclusiva de exibição na plataforma. Não hospedamos material protegido de terceiros sem autorização; denúncias de violação geram remoção e podem suspender contas reincidentes.</p>
            </S>
            <S t="8. Alterações desta política">
              <p>Mudanças relevantes serão comunicadas com 15 dias de antecedência por e-mail/app. Versões anteriores arquivadas no repositório público do produto.</p>
            </S>
          </article>
        )}

        {page === 'termos' && (
          <article>
            <S t="1. Objeto">
              <p>A {brand.name} oferece conteúdo educacional, ferramentas de prática, comunidade e mentoria sobre produção musical. NÃO é serviço de distribuição musical, venda de software de terceiros ou garantia de resultados comerciais.</p>
            </S>
            <S t="2. Planos, cobrança e cancelamento">
              <p>Assinaturas renovam automaticamente até cancelamento. Upgrade tem efeito imediato; downgrade mantém o acesso até o fim do período pago (política de "período de acesso"). Cupons valem no primeiro período, conforme regras vigentes. Preços em BRL, ajustáveis com aviso para assinantes durante ciclos ativos.</p>
            </S>
            <S t="3. Reembolso">
              <p>7 dias corridos para assinatura anual sem progresso substancial; mensal não reembolsável após renovação (CDC art. 49 aplica a compra online, exercido dentro do prazo). Falha técnica comprovada de mais de 48h sem workaround: crédito proporcional.</p>
            </S>
            <S t="4. Conduta na comunidade">
              <p>Proibido: assédio, discriminação, conteúdo protegido sem licença, spam, engenharia-social de tutores para respostas de terceiros ("cola"), upload de malware. Sanções: remoção → suspensão (7–30d) → banimento. Respostas do mentor são educativas e não substituem laudo técnico/legal.</p>
            </S>
            <S t="5. Conteúdo DAW e versionamento">
              <p>As instruções de FL Studio/Ableton/Cubase refletem versões carimbadas na própria aula. Interfaces mudam por release; divergência encontrada pode ser reportada e não configura, por si só, falha do serviço. A {brand.name} não tem vínculo com Image-Line, Ableton ou Steinberg.</p>
            </S>
            <S t="6. Propriedade intelectual da plataforma">
              <p>Aulas, textos, estruturas de projeto, presets da casa e identidade visual pertencem à {brand.legalName}. Uso pessoal/educacional permitido; revenda, redistribuição e scraping não.</p>
            </S>
            <S t="7. Limitação de responsabilidade">
              <p>Não prometemos fama, charts ou receita. Garantimos o método e o acompanhamento. O resultado depende de prática — que a plataforma organiza para você fazer (e a streak prova se você fez).</p>
            </S>
            <S t="8. Foro e lei">
              <p>Legislação brasileira; foro da comarca de Florianópolis/SC (sede). Contatos de suporte respondidos em até 2 dias úteis.</p>
            </S>
          </article>
        )}

        {page === 'cookies' && (
          <article>
            <S t="O que usamos e por quê">
              <p><b className="text-zinc-300">Estritamente necessários:</b> sessão/autenticação e preferências locais (sem eles o login não funciona).</p>
              <p><b className="text-zinc-300">Analytics (opcionais):</b> Google Analytics 4 e eventos de produto — medem funil (onboarding, conclusão de aulas, churn) para priorizar conteúdo. Só carregam COM consentimento.</p>
              <p><b className="text-zinc-300">Marketing (opcionais):</b> Meta Pixel etc., para mensurar aquisição. Nunca sem aceite.</p>
            </S>
            <S t="Como gerenciar">
              <p>No app: Configurações → Notificações & consentimento. No navegador: bloqueio nativo/extensões (pode degradar funcionalidades sociais). No site: banner de aceite na primeira visita, "gerenciar" revoga a qualquer momento — nenhuma funcionalidade essencial depende de consentimento.</p>
            </S>
            <S t="Prazos">
              <p>Cookies de sessão: expiram com o navegador. Persistência de preferências: 12 meses. Identificadores de analytics: conforme configuração do provedor (típico 2–14 meses).</p>
            </S>
            <p className="mt-8 text-[12px] text-zinc-500">Estado atual (modo demonstração local): nenhum cookie de terceiros é plantado — a análise do Track Analyzer e o armazenamento de dados acontecem no SEU dispositivo. Ao fazer deploy com Supabase/GA, esta política passa a valer integralmente.</p>
          </article>
        )}
      </div>
    </MarketingShell>
  )
}
