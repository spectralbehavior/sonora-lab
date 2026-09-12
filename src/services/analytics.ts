import { insert } from '@/lib/db'
import { uid, nowISO } from '@/lib/utils'

// Camada única de eventos (spec: page_view, signup, lesson_complete, ...).
// Em produção: adaptadores enviam p/ GA4/gtag e Meta Pixel SOMENTE se o
// consentimento analytics for concedido (LGPD). Nunca chaves no frontend.

export type AnalyticsEvent =
  | 'page_view' | 'signup' | 'login' | 'logout' | 'onboarding_completed'
  | 'course_start' | 'lesson_complete' | 'exercise_complete' | 'quiz_completed'
  | 'project_start' | 'project_complete' | 'track_uploaded' | 'track_status_changed'
  | 'certificate_generated' | 'ai_mentor_used' | 'checkout_started' | 'purchase'
  | 'subscription_started' | 'subscription_cancelled' | 'achievement_unlocked'
  | 'weekly_challenge_completed' | 'finish_day_completed' | 'program_finished'
  | 'community_post_created' | 'community_comment_created' | 'analyzer_run'
  | string

export function track(event: AnalyticsEvent, props?: Record<string, unknown>) {
  try {
    insert('analytics_events', { id: uid('evt'), event, props, ts: nowISO() } as never)
    // cap de crescimento: mantém 500 mais recentes
    const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> }
    if (w.dataLayer?.push) {
      w.dataLayer.push({ event: `sonora:${event}`, ...props })
    }
  } catch { /* eventos nunca quebram a UI */ }
}
