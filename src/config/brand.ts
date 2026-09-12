// Identidade da marca — centralizada. Para rebrand, altere este arquivo
// e as variáveis CSS em src/index.css (:root). Nada de marca deve ser
// hardcoded em componentes; use useBrand().

export interface BrandConfig {
  name: string
  legalName: string
  tagline: string
  heroHeadline: string
  heroSub: string
  description: string
  domain: string
  url: string
  supportEmail: string
  logoUrl: string
  colors: { brand: string; accent: string }
  social: { instagram: string; youtube: string; tiktok: string; discord: string }
}

export const brand: BrandConfig = {
  name: 'Sonora',
  legalName: 'Sonora Educação Musical Ltda.',
  tagline: 'Do primeiro beat à sua primeira música completa.',
  heroHeadline: 'Do primeiro beat à sua primeira música completa.',
  heroSub: 'Aprenda Produção Musical Eletrônica na prática usando FL Studio, Ableton Live ou Cubase.',
  description:
    'Plataforma de educação em produção musical eletrônica: cursos progressivos, projetos práticos, gamificação, comunidade e um mentor de IA que respeita a sua DAW.',
  domain: 'sonora.app',
  url: 'https://sonora.app',
  supportEmail: 'contato@sonora.app',
  logoUrl: '/logo.svg',
  colors: { brand: '#7C5CFF', accent: '#22D3EE' },
  social: {
    instagram: 'https://instagram.com/sonora.app',
    youtube: 'https://youtube.com/@sonora.app',
    tiktok: 'https://tiktok.com/@sonora.app',
    discord: 'https://discord.gg/sonora',
  },
}
