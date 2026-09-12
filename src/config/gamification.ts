// Valores padrão de gamificação. No runtime, o app lê das settings do banco
// (editáveis em /admin → Gamificação). Este arquivo é apenas o seed inicial.

export const DEFAULT_XP = {
  lessonComplete: 50,
  exerciseComplete: 100,
  challengeComplete: 250,
  projectComplete: 500,
  firstTrackFinished: 1000,
  courseComplete: 2500,
  onboardingComplete: 100,
  quizPerfectBonus: 50,
  streakDayBonus: 10,
} as const

export type XpConfig = typeof DEFAULT_XP

// Níveis: nome alterável pelo admin. Threshold = XP acumulado necessário.
export const DEFAULT_LEVELS: { name: string; min: number }[] = [
  { name: 'Iniciante', min: 0 },
  { name: 'Beatmaker', min: 500 },
  { name: 'Producer', min: 1500 },
  { name: 'Sound Designer', min: 3000 },
  { name: 'Mix Engineer', min: 5500 },
  { name: 'Music Producer', min: 8500 },
  { name: 'Advanced Producer', min: 13000 },
  { name: 'Electronic Music Artist', min: 20000 },
]

export type LevelConfig = typeof DEFAULT_LEVELS
