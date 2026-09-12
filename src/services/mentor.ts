import { MENTOR_KB } from '@/data/mentorKb'
import { raw, getSetting, setSetting, insert } from '@/lib/db'
import { nowISO, uid } from '@/lib/utils'
import type { DawId, Lesson, MentorKbEntry } from '@/types'

// ─── AIProvider: camada de IA com fallback honesto ──────────────────────────
// Modo atual (sem backend): busca na BASE CURADA da plataforma (conteúdo
// versionado por DAW). NUNCA gera passos de menu "de cabeça".
// Modo produção (Fase 4): Edge Function server-side recebe { question, daw,
// contentVersion } + contexto RAG (aulas) — ver docs/AI_PROVIDER.md. A chave
// do provedor jamais existe no frontend (variável server-side).

export interface MentorAnswer {
  id: string
  matched: boolean
  source: 'kb' | 'lessons' | 'none'
  entry?: MentorKbEntry
  lessonRefs: Lesson[]
  daw: DawId | null
  text: string
  steps?: string[]
  exercise?: string
  commonMistake?: string
  challenge?: string
  provider: string
  note: string
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function scoreEntry(entry: MentorKbEntry, q: string): number {
  const nq = normalize(q)
  let score = 0
  for (const t of entry.topics) {
    if (nq.includes(normalize(t))) score += t.length > 6 ? 3 : 2
  }
  const words = nq.split(/\s+/).filter(w => w.length > 3)
  for (const w of words) if (normalize(entry.question).includes(w)) score += 0.5
  return score
}

export function mentorAnswer(question: string, daw: DawId | null, userId?: string): MentorAnswer {
  const kb = MENTOR_KB.map(e => ({ e, s: scoreEntry(e, question) })).filter(x => x.s >= 2).sort((a, b) => b.s - a.s)
  const provider = getSetting<{ mode: string }>('aiProvider', { mode: 'kb-only' }).mode
  const note = 'Respostas vêm exclusivamente do material curado e versionado da Sonora. Se a resposta não cobre sua dúvida, nada será "inventado".'

  // também busca em aulas (RAG local)
  const nq = normalize(question)
  const lessonHits = raw().lessons
    .filter(l => {
      if (daw && l.dawId && l.dawId !== daw) return false
      const hay = normalize(`${l.title} ${l.objective} ${l.body}`)
      return nq.split(/\s+/).filter(w => w.length > 4).some(w => hay.includes(w))
    })
    .slice(0, 3)

  if (!kb.length) {
    if (lessonHits.length) {
      insert('notifications', { id: uid('ntf'), userId: userId ?? 'anon', text: '💡 O Mentor respondeu com aulas relacionadas à sua busca.', ts: nowISO(), read: false })
      return {
        id: uid('ans'), matched: true, source: 'lessons', lessonRefs: lessonHits, daw,
        text: 'Não tenho um procedimento passo a passo curado exatamente para essa pergunta — então em vez de chutar, vou te levar ao material da plataforma que cobre o assunto. Cada aula tem versão de DAW carimbada.',
        provider: 'curated-kb', note,
      }
    }
    return {
      id: uid('ans'), matched: false, source: 'none', lessonRefs: [], daw,
      text: 'Não tenho na base curada uma resposta verificada para essa pergunta na sua DAW. Regra do Mentor: nunca inventar menus, atalhos ou recursos. Reescreva com termos mais específicos (ex.: "sidechain", "clipping", "LUFS") ou registre a dúvida — a equipe adiciona à base via CMS.',
      provider: 'curated-kb', note,
    }
  }

  const entry = kb[0].e
  const steps = entry.dawSpecific
    ? (daw ? entry.steps?.[daw] : undefined)
    : undefined
  const needsDaw = entry.dawSpecific && !steps
  const refs = lessonHits.length ? lessonHits : entry.refs.map(id => raw().lessons.find(l => l.id === id)).filter(Boolean) as Lesson[]

  return {
    id: uid('ans'), matched: true, source: 'kb', entry, daw, lessonRefs: refs.slice(0, 2),
    text: entry.answer,
    steps: needsDaw ? ['Escolha sua DAW no Perfil para eu mostrar o passo a passo específico (eu nunca misturo instruções de DAWs diferentes).'] : steps,
    exercise: entry.exercise, commonMistake: entry.commonMistake, challenge: entry.challenge,
    provider, note,
  }
}

export function mentorSuggestions(): string[] {
  return [
    'Como faço sidechain?',
    'Por que meu kick está brigando com o bass?',
    'Minha mix está muito fechada. O que devo verificar?',
    'Qual LUFS devo mirar?',
    'Como automatizar um filtro?',
    'Só faço loops e não termino músicas. Por quê?',
  ]
}

export interface ChatTurn { role: 'user' | 'mentor'; text: string; ts: string; answer?: MentorAnswer }

export function rateLimitCheck(userId: string, planId: string | null): { allowed: boolean; remaining: number } {
  const limit = planId === 'free' || !planId ? 8 : 200
  const today = nowISO().slice(0, 10)
  const used = (getSetting<Record<string, Record<string, number>>>('mentor_usage', {}))[userId]?.[today] ?? 0
  return { allowed: used < limit, remaining: Math.max(0, limit - used) }
}

export function rateLimitBump(userId: string) {
  const today = nowISO().slice(0, 10)
  const all = getSetting<Record<string, Record<string, number>>>('mentor_usage', {})
  const mine = all[userId] ?? {}
  all[userId] = { ...mine, [today]: (mine[today] ?? 0) + 1 }
  insert('analytics_events', { id: uid('an'), event: 'ai_mentor_used', ts: nowISO(), userId })
  setSetting('mentor_usage', all)
}
