// Preços padrão — NUNCA exibidos direto daqui; o app lê `plans` do banco,
// que é seedado com estes valores e editável em /admin → Planos & Cupons.
import type { PlanDef } from '@/types'

export const DEFAULT_PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceAnnual: 0,
    currency: 'BRL',
    badge: 'Para começar',
    features: [
      'Aulas introdutórias selecionadas',
      'Roadmap personalizado',
      'Desafios limitados',
      'Leitura da comunidade',
      'Registro de sessões (streak)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 49.9,
    priceAnnual: 479,
    currency: 'BRL',
    highlight: true,
    badge: 'Mais popular',
    features: [
      'Todos os cursos e trilhas',
      'Projetos práticos completos',
      'Biblioteca de materiais',
      'AI Music Mentor ilimitado',
      'Certificados verificáveis',
      'Comunidade completa',
    ],
  },
  {
    id: 'creator',
    name: 'Creator',
    priceMonthly: 99.9,
    priceAnnual: 949,
    currency: 'BRL',
    badge: 'Para artistas',
    features: [
      'Tudo do Pro',
      'Feedback de tracks na comunidade',
      'Portfólio público profissional',
      'Masterclasses avançadas',
      'Biblioteca premium (presets/templates)',
    ],
  },
  {
    id: 'academy',
    name: 'Academy',
    priceMonthly: 299.9,
    priceAnnual: 2999,
    currency: 'BRL',
    badge: 'Escolas e estúdios',
    features: [
      'Até 25 contas de alunos',
      'Painel do professor',
      'Turmas, tarefas e relatórios',
      'Certificados institucionais',
    ],
  },
]
