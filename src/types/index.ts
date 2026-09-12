// Tipos centrais do domínio. Espelham o schema SQL (supabase/schema.sql).

export type DawId = 'fl-studio' | 'ableton' | 'cubase'
export type DawChoice = DawId | 'none'
export type Level = 'iniciante' | 'intermediario' | 'avancado'
export type TrackKind = 'foundations' | 'daw' | 'genre' | 'career'

export interface UserRow {
  id: string
  name: string
  email: string
  passHash: string
  role: 'user' | 'admin'
  createdAt: string
}

export interface ProfileRow {
  id: string
  userId: string
  username?: string
  name?: string
  bio?: string
  level?: Level | null
  daw?: DawChoice | null
  genre?: string | null
  goal?: string | null
  mode: 'beginner' | 'advanced'
  publicPortfolio: boolean
  locale: string
  weeklyGoalMin: number
  artistName?: string
}

export interface DawSoftware {
  id: DawId
  name: string
  vendor: string
  color: string
  blurb: string
  strengths: string[]
  caveats: string[]
  bestFor: string[]
  workflow: string
}

export interface DawVersionRec {
  id: string
  dawId: string
  version: string
  os: string
  updatedAt: string
  contentVersion: string
  notes: string
}

export interface Genre {
  id: string
  name: string
  bpm: [number, number]
  structure: string
  drums: string
  bass: string
  melodic: string
  soundDesign: string
  arrangement: string
  mixing: string
  references: string[]
  color: string
}

export interface Course {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  track: TrackKind
  dawId?: DawId
  level: Level
  order: number
  estHours: number
  published: boolean
  objectives: string[]
  tags: string[]
}

export interface ModuleRow {
  id: string
  courseId: string
  title: string
  summary: string
  order: number
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  correct: number
  explain: string
}

export interface Quiz {
  id: string
  title: string
  lessonId: string
  questions: QuizQuestion[]
}

export interface AssetRef {
  name: string
  kind: 'midi' | 'preset' | 'project' | 'text' | 'checklist' | 'stems' | 'guide'
  note: string
  content?: string
  licensed: boolean
}

export interface DawSteps { fl?: string[]; ab?: string[]; cu?: string[] }

export interface LessonVerified { daw: DawId; version: string; date: string }

export interface Lesson {
  id: string
  courseId: string
  moduleId: string
  title: string
  order: number
  durationMin: number
  level: Level
  tags: string[]
  objective: string
  body: string
  demo?: string
  practice?: string[]
  challenge?: string
  checklist: string[]
  files: AssetRef[]
  quiz?: Quiz
  videoUrl?: string
  dawId?: DawId
  dawSteps?: DawSteps
  isSample?: boolean
  verified?: LessonVerified
}

export interface Project {
  id: string
  slug: string
  title: string
  tagline: string
  briefing: string
  objectives: string[]
  checklist: string[]
  criteria: string[]
  files: AssetRef[]
  suggestedDays: number
  xp: number
  level: Level
  tags: string[]
}

export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string
  xp: number
  criteria: { metric: 'lessons' | 'projects' | 'tracks' | 'courses' | 'streak' | 'challenges' | 'mixdone' | 'masterdone'; value: number }
}

export interface TrackRow {
  id: string
  userId: string
  title: string
  genreId?: string
  bpm?: number
  musicalKey?: string
  status: 'ideia' | 'producao' | 'mix' | 'master' | 'finalizada'
  createdAt: string
  versions: { n: number; date: string; note: string }[]
  feedback: { userId: string; ts: string; kind: 'tecnica' | 'musical'; text: string }[]
}

export interface LessonProgress {
  id: string
  userId: string
  lessonId: string
  courseId: string
  moduleId: string
  completedAt: string
  quizScore?: number
  checks?: string[]
}

export interface ProjectProgress {
  id: string
  userId: string
  projectId: string
  status: 'nao_iniciado' | 'em_andamento' | 'concluido'
  checked: string[]
  startedAt?: string
  completedAt?: string
}

export interface UserAchievement { id: string; userId: string; achievementId: string; earnedAt: string }

export interface CertificateRow {
  id: string
  code: string
  userId: string
  userName: string
  courseId: string
  courseTitle: string
  hours: number
  issuedAt: string
}

export interface CommunityPost {
  id: string
  userId: string
  authorName: string
  category: string
  title: string
  body: string
  tags: string[]
  createdAt: string
  likes: string[]
  favorites: string[]
  reports: { by: string; reason: string; resolved: boolean }[]
}

export interface CommunityComment {
  id: string
  postId: string
  userId: string
  authorName: string
  body: string
  createdAt: string
  likes: string[]
}

export interface NotificationRow { id: string; userId: string; text: string; ts: string; read: boolean }

export interface PlanDef {
  id: string
  name: string
  priceMonthly: number
  priceAnnual: number
  currency: string
  features: string[]
  highlight?: boolean
  badge?: string
}

export interface CouponRow { id: string; code: string; percent: number; active: boolean }

export interface SubscriptionRow {
  id: string
  userId: string
  planId: string
  status: 'active' | 'canceled' | 'expired'
  startedAt: string
  renewsAt: string
}

export interface PaymentRow {
  id: string
  userId: string
  planId: string
  amount: number
  couponCode?: string
  ts: string
  provider: 'demo'
  status: 'succeeded'
}

export interface StudioSession { id: string; userId: string; date: string; minutes: number; note?: string }

export interface IdeaRow {
  id: string
  userId: string
  name: string
  bpm?: number
  musicalKey?: string
  genreId?: string
  reference?: string
  notes?: string
  createdAt: string
}

export interface FinishTrackDay { id: string; userId: string; day: number; done: boolean; note?: string }

export interface ResourceRow {
  id: string
  category: 'samples' | 'midi' | 'presets' | 'templates' | 'projects' | 'stems' | 'checklists' | 'ebooks' | 'guides'
  title: string
  description: string
  license: string
  level: Level
  dawIds: DawChoice[]
  content?: string
}

export interface PluginEntry {
  id: string
  name: string
  vendor: string
  category: 'synth' | 'sampler' | 'eq' | 'compressor' | 'reverb' | 'delay' | 'saturation' | 'distortion' | 'limiter' | 'metering' | 'utility'
  kind: 'stock' | 'free' | 'comercial'
  price: string
  level: Level
  dawIds: DawId[]
  role: string
  tips: string[]
}

export interface GlossaryTerm { term: string; simple: string; technical: string }

export interface MentorKbEntry {
  id: string
  topics: string[]
  question: string
  dawSpecific: boolean
  answer: string
  steps?: Record<DawId, string[]>
  exercise: string
  commonMistake: string
  challenge: string
  refs: string[]
}

export interface ChallengeClaimRow { id: string; userId: string; weekKey: string; done: boolean }

export interface AnalyticsEventRow { id: string; event: string; props?: Record<string, unknown>; ts: string; userId?: string }

export interface ConsentRow { userId: string; analytics: boolean; marketing: boolean; cookies: boolean; ts: string }

export interface Tables {
  __v: number
  users: UserRow[]
  profiles: ProfileRow[]
  daw_software: DawSoftware[]
  daw_versions: DawVersionRec[]
  genres: Genre[]
  courses: Course[]
  modules: ModuleRow[]
  lessons: Lesson[]
  quizzes: Quiz[]
  lesson_progress: LessonProgress[]
  projects: Project[]
  project_progress: ProjectProgress[]
  tracks: TrackRow[]
  achievements: AchievementDef[]
  user_achievements: UserAchievement[]
  certificates: CertificateRow[]
  community_posts: CommunityPost[]
  community_comments: CommunityComment[]
  notifications: NotificationRow[]
  plans: PlanDef[]
  coupons: CouponRow[]
  subscriptions: SubscriptionRow[]
  payments: PaymentRow[]
  studio_sessions: StudioSession[]
  ideas: IdeaRow[]
  finish_track: FinishTrackDay[]
  challenge_claims: ChallengeClaimRow[]
  resources: ResourceRow[]
  plugins: PluginEntry[]
  settings: { key: string; value: unknown }[]
  analytics_events: AnalyticsEventRow[]
  consent: ConsentRow[]
}

export type TableName = keyof Omit<Tables, '__v'>

export interface RoadmapStage {
  code: string
  title: string
  description: string
  tag?: string
  special?: 'track' | 'portfolio' | 'career'
  done?: number
  total?: number
  nextLessonId?: string
}
