import { useCallback } from 'react'

// i18n leve, arquitetura pronta para pt-BR / en / es.
// Decisão: strings de UI (nav, botões, marketing) passam por t();
// conteúdo educacional vive no banco com coluna `locale` (já versionável).

export type Locale = 'pt-BR' | 'en' | 'es'
export const LOCALES: { id: Locale; label: string }[] = [
  { id: 'pt-BR', label: 'Português (BR)' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
]

type Dict = Record<string, string>

const ptBR: Dict = {
  'nav.home': 'Home',
  'nav.learn': 'Aprender',
  'nav.projects': 'Projetos',
  'nav.mentor': 'AI Mentor',
  'nav.profile': 'Perfil',
  'cta.start': 'Começar a aprender',
  'cta.startFree': 'Começar gratuitamente',
  'cta.platform': 'Conhecer a plataforma',
  'cta.chooseDaw': 'Escolher minha DAW',
  'cta.buildTrack': 'Construir minha primeira track',
  'cta.method': 'Conhecer o método',
  'cta.mentor': 'Falar com o AI Music Mentor',
  'cta.login': 'Entrar',
  'cta.signup': 'Criar conta grátis',
  'cta.continue': 'Continuar aprendendo',
  'app.progress': 'Seu progresso',
  'app.nextLesson': 'Próxima aula',
  'app.dashboard': 'Dashboard',
  'label.level': 'Nível',
  'label.daw': 'Sua DAW',
  'label.genre': 'Seu gênero',
  'label.xp': 'XP',
}

const en: Dict = {
  'nav.home': 'Home',
  'nav.learn': 'Learn',
  'nav.projects': 'Projects',
  'nav.mentor': 'AI Mentor',
  'nav.profile': 'Profile',
  'cta.start': 'Start learning',
  'cta.startFree': 'Start for free',
  'cta.platform': 'See the platform',
  'cta.chooseDaw': 'Choose my DAW',
  'cta.buildTrack': 'Build my first track',
  'cta.method': 'See the method',
  'cta.mentor': 'Talk to the AI Music Mentor',
  'cta.login': 'Log in',
  'cta.signup': 'Create free account',
  'cta.continue': 'Continue learning',
  'app.progress': 'Your progress',
  'app.nextLesson': 'Next lesson',
  'app.dashboard': 'Dashboard',
  'label.level': 'Level',
  'label.daw': 'Your DAW',
  'label.genre': 'Your genre',
  'label.xp': 'XP',
}

const es: Dict = {
  'nav.home': 'Inicio',
  'nav.learn': 'Aprender',
  'nav.projects': 'Proyectos',
  'nav.mentor': 'Mentor IA',
  'nav.profile': 'Perfil',
  'cta.start': 'Empezar a aprender',
  'cta.startFree': 'Empezar gratis',
  'cta.platform': 'Conocer la plataforma',
  'cta.chooseDaw': 'Elegir mi DAW',
  'cta.buildTrack': 'Crear mi primera track',
  'cta.method': 'Conocer el método',
  'cta.mentor': 'Hablar con el Mentor IA',
  'cta.login': 'Entrar',
  'cta.signup': 'Crear cuenta gratis',
  'cta.continue': 'Seguir aprendiendo',
  'app.progress': 'Tu progreso',
  'app.nextLesson': 'Siguiente clase',
  'app.dashboard': 'Panel',
  'label.level': 'Nivel',
  'label.daw': 'Tu DAW',
  'label.genre': 'Tu género',
  'label.xp': 'XP',
}

const dicts: Record<Locale, Dict> = { 'pt-BR': ptBR, en, es }

const KEY = 'sonora.locale'

export function getLocale(): Locale {
  try {
    const q = new URLSearchParams(window.location.search).get('lang') as Locale | null
    if (q && q in dicts) return q
    const s = localStorage.getItem(KEY) as Locale | null
    if (s && s in dicts) return s
  } catch { /* SSR/legacy */ }
  return 'pt-BR'
}

export function setLocale(l: Locale) {
  try { localStorage.setItem(KEY, l) } catch { /* noop */ }
}

export function translate(key: string, locale: Locale = getLocale()): string {
  return dicts[locale]?.[key] ?? dicts['pt-BR'][key] ?? key
}

export function useT() {
  const locale = getLocale()
  return useCallback((key: string) => translate(key, locale), [locale])
}
