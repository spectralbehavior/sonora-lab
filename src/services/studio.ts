import { raw, insert, update, remove, getTable } from '@/lib/db'
import { nowISO, uid } from '@/lib/utils'
import type { IdeaRow, TrackRow, FinishTrackDay } from '@/types'

// MY STUDIO: projetos do aluno (tracks), ideias rápidas e o programa
// "Finish a Track" (7 dias). Sessões/streak ficam em gamification.ts.

export function listIdeas(userId: string): IdeaRow[] {
  return raw().ideas.filter(i => i.userId === userId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function addIdea(userId: string, idea: Omit<IdeaRow, 'id' | 'userId' | 'createdAt'>): IdeaRow {
  if (!idea.name.trim()) throw new Error('Dê um nome para a ideia.')
  return insert('ideas', { ...idea, name: idea.name.trim(), id: uid('idea'), userId, createdAt: nowISO() } as IdeaRow)
}

export function removeIdea(id: string) { remove('ideas', i => i.id === id) }

export function listTracks(userId: string): TrackRow[] {
  return raw().tracks.filter(t => t.userId === userId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function createTrack(userId: string, data: { title: string; genreId?: string; bpm?: number; musicalKey?: string }): TrackRow {
  if (!data.title.trim()) throw new Error('Dê um título à track.')
  return insert('tracks', {
    id: uid('trk'), userId, title: data.title.trim(), genreId: data.genreId, bpm: data.bpm, musicalKey: data.musicalKey,
    status: 'ideia', createdAt: nowISO(), versions: [{ n: 1, date: nowISO(), note: 'Registro inicial' }], feedback: [],
  } as TrackRow)
}

export function updateTrackStatus(userId: string, trackId: string, status: TrackRow['status']) {
  const t = raw().tracks.find(x => x.id === trackId)
  if (!t || t.userId !== userId) throw new Error('Track não encontrada.')
  update('tracks', trackId, {
    status,
    versions: [...t.versions, { n: t.versions.length + 1, date: nowISO(), note: `Status → ${status}` }],
  })
}

export function addTrackFeedback(trackId: string, userId: string, authorName: string, kind: 'tecnica' | 'musical', text: string) {
  const t = raw().tracks.find(x => x.id === trackId)
  if (!t) throw new Error('Track não encontrada.')
  if (text.trim().length < 10) throw new Error('Escreva ao menos 10 caracteres de feedback.')
  update('tracks', trackId, { feedback: [...t.feedback, { userId, ts: nowISO(), kind, text: text.trim() }] })
}

export function publicTracks(username: string): { tracks: TrackRow[]; profile: NonNullable<ReturnType<typeof findProfile>> } | null {
  const profile = findProfile(username)
  if (!profile || !profile.publicPortfolio) return null
  const tracks = raw().tracks.filter(t => t.userId === profile.userId)
  return { tracks, profile }
}

function findProfile(username: string) {
  return raw().profiles.find(p => p.username === username.toLowerCase())
}

export function myTracksCountFinalized(userId: string): number {
  return raw().tracks.filter(t => t.userId === userId && t.status === 'finalizada').length
}

// ── Finish a Track (programa 7 dias) ─────────────────────────────────────────

export const FINISH_DAYS: { day: number; title: string; brief: string }[] = [
  { day: 1, title: 'Ideia', brief: 'Gênero + BPM + key + frase de intenção. Nada de som ainda.' },
  { day: 2, title: 'Drums', brief: 'Motor rítmico de 8 compassos: kick, clap, hats, 1 percussão.' },
  { day: 3, title: 'Bass', brief: 'Sub + off-beat/mid: sistema kick/bass fechado.' },
  { day: 4, title: 'Melodia', brief: 'Tema pergunta/resposta (2+2 compassos) e acorde de apoio.' },
  { day: 5, title: 'Arranjo', brief: 'Pinte 6 blocos. Cada bloco com 1 diferença explicável.' },
  { day: 6, title: 'Mix', brief: 'Pipeline do curso 07. Prazo: 4h. Marque a checklist.' },
  { day: 7, title: 'Master', brief: 'Alvo medido, export final + promo. Publique a v1.' },
]

export function finishState(userId: string): FinishTrackDay[] {
  const mine = raw().finish_track.filter(f => f.userId === userId)
  return FINISH_DAYS.map(d => mine.find(m => m.day === d.day) ?? { id: `fake-${d.day}`, userId, day: d.day, done: false })
}

export function toggleFinishDay(userId: string, day: number, done: boolean) {
  const row = raw().finish_track.find(f => f.userId === userId && f.day === day)
  if (row) update('finish_track', row.id, { done })
  else insert('finish_track', { id: uid('ft'), userId, day, done, note: undefined } as FinishTrackDay)
}

export function finishComplete(userId: string): boolean {
  const state = finishState(userId)
  return state.every(s => s.done)
}

export function listSessions(userId: string) {
  return getTable('studio_sessions').filter(s => s.userId === userId).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 60)
}
