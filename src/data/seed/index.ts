import type { Tables } from '@/types'
import { FOUNDATION_COURSES } from './curriculum'
import { DAW_COURSES } from './dawAcademies'
import { DAWS, DAW_VERSIONS, GENRES } from './genres'
import { PROJECTS, ACHIEVEMENTS } from './gamification'
import { RESOURCES, PLUGIN_CATALOG } from './library'
import { DEMO_USERS, DEMO_POSTS, DEMO_COMMENTS, demoProgress } from './demo'
import { DEFAULT_XP } from '@/config/gamification'
import { DEFAULT_LEVELS } from '@/config/gamification'
import { DEFAULT_PLANS } from '@/config/pricing'

// Seed completo do banco local. Espelha as tabelas de supabase/schema.sql.
// Determinístico (ids estáveis) — importante p/ RLS demo e p/ testes.

export function buildSeed(): Tables {
  const courses = [...FOUNDATION_COURSES, ...DAW_COURSES]

  return {
    __v: 1,
    users: DEMO_USERS.map(u => u.user),
    profiles: DEMO_USERS.map(u => u.profile),
    daw_software: DAWS,
    daw_versions: DAW_VERSIONS,
    genres: GENRES,
    courses: courses.map(c => c.course),
    modules: courses.flatMap(c => c.modules),
    lessons: courses.flatMap(c => c.lessons),
    quizzes: courses.flatMap(c => c.quizzes),
    lesson_progress: demoProgress(),
    projects: PROJECTS,
    project_progress: [],
    tracks: [
      {
        id: 'trk-demo-1', userId: 'u-demo-lu', title: 'Solar Wind', genreId: 'fullon', bpm: 146, musicalKey: 'F#m',
        status: 'finalizada', createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        versions: [
          { n: 1, date: new Date(Date.now() - 12 * 86400000).toISOString(), note: 'Loop bruto 8 c.' },
          { n: 2, date: new Date(Date.now() - 6 * 86400000).toISOString(), note: 'Arranjo completo' },
          { n: 3, date: new Date(Date.now() - 2 * 86400000).toISOString(), note: 'Master v1 -9 LUFS' },
        ],
        feedback: [
          { userId: 'u-demo-rafa', ts: new Date(Date.now() - 5 * 86400000).toISOString(), kind: 'tecnica', text: 'Lead 200Hz acima no drop; delay do pluck engolindo off-bass. Corta 1.5dB no bus.' },
          { userId: 'u-admin', ts: new Date(Date.now() - 4 * 86400000).toISOString(), kind: 'musical', text: 'Breakdown lindo; build de 8 poderia ser 4. A track acelera quando a expectativa encurta.' },
        ],
      },
      {
        id: 'trk-demo-2', userId: 'u-demo-rafa', title: 'Corredor (Rumble Edit)', genreId: 'techno', bpm: 132, musicalKey: 'Am',
        status: 'mix', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        versions: [{ n: 1, date: new Date(Date.now() - 3 * 86400000).toISOString(), note: 'Mix v1 — pendente low-mid' }],
        feedback: [],
      },
    ],
    achievements: ACHIEVEMENTS,
    user_achievements: [],
    certificates: [],
    community_posts: DEMO_POSTS,
    community_comments: DEMO_COMMENTS,
    notifications: [],
    plans: DEFAULT_PLANS,
    coupons: [
      { id: 'cp-1', code: 'SONORA10', percent: 10, active: true },
      { id: 'cp-2', code: 'FIRSTTRACK', percent: 20, active: true },
    ],
    subscriptions: [
      { id: 'sub-1', userId: 'u-demo-rafa', planId: 'pro', status: 'active', startedAt: new Date(Date.now() - 40 * 86400000).toISOString(), renewsAt: new Date(Date.now() + 320 * 86400000).toISOString() },
      { id: 'sub-2', userId: 'u-demo-lu', planId: 'creator', status: 'active', startedAt: new Date(Date.now() - 80 * 86400000).toISOString(), renewsAt: new Date(Date.now() + 280 * 86400000).toISOString() },
    ],
    payments: [],
    studio_sessions: [],
    ideas: [],
    finish_track: [],
    challenge_claims: [],
    resources: RESOURCES,
    plugins: PLUGIN_CATALOG,
    settings: [
      { key: 'xp', value: DEFAULT_XP },
      { key: 'levels', value: DEFAULT_LEVELS },
      { key: 'plans', value: DEFAULT_PLANS },
      { key: 'aiProvider', value: { mode: 'kb-only', note: 'Provedor externo configurável via Edge Function (docs/AI_PROVIDER.md). Sem chave, o mentor usa SOMENTE a base curada da plataforma.' } },
      { key: 'analytics', value: { ga: false, gsc: false, metaPixel: false } },
      { key: 'brand', value: null },
    ],
    analytics_events: [],
    consent: [],
  }
}
