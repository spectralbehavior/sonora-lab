import { raw, insert, update, remove, getTable } from '@/lib/db'
import { nowISO, uid } from '@/lib/utils'
import type { CommunityPost, CommunityComment } from '@/types'

export const COMMUNITY_CATEGORIES = [
  'FL Studio', 'Ableton', 'Cubase', 'Psytrance', 'Techno', 'House',
  'Sound Design', 'Mixagem', 'Masterização', 'Produção', 'Equipamentos', 'Plugins', 'Feedback de Tracks',
] as const

export function listPosts(category?: string, q?: string): CommunityPost[] {
  let posts = getTable('community_posts')
  if (category) posts = posts.filter(p => p.category === category)
  if (q) {
    const s = q.trim().toLowerCase()
    posts = posts.filter(p => (p.title + p.body + p.tags.join(' ')).toLowerCase().includes(s))
  }
  return posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function getPost(id: string): CommunityPost | undefined {
  return raw().community_posts.find(p => p.id === id)
}

export function listComments(postId: string): CommunityComment[] {
  return raw().community_comments.filter(c => c.postId === postId).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
}

export function createPost(userId: string, data: { category: string; title: string; body: string; tags: string[] }): CommunityPost {
  const author = raw().users.find(u => u.id === userId)
  if (!author) throw new Error('Faça login para postar.')
  if (!data.title.trim() || data.title.trim().length < 8) throw new Error('Título muito curto (mín. 8 caracteres).')
  if (!data.body.trim() || data.body.trim().length < 20) throw new Error('Escreva pelo menos 20 caracteres.')
  const post = insert('community_posts', {
    id: uid('cp'), userId, authorName: author.name, category: data.category,
    title: data.title.trim(), body: data.body.trim(), tags: data.tags.filter(Boolean).map(t => t.toLowerCase().replace(/[^a-z0-9-]/g, '')).slice(0, 6),
    createdAt: nowISO(), likes: [], favorites: [], reports: [],
  } as CommunityPost)
  return post
}

export function createComment(userId: string, postId: string, body: string) {
  const author = raw().users.find(u => u.id === userId)
  if (!author) throw new Error('Faça login para comentar.')
  if (!body.trim() || body.trim().length < 4) throw new Error('Comentário muito curto.')
  return insert('community_comments', {
    id: uid('cc'), postId, userId, authorName: author.name, body: body.trim(), createdAt: nowISO(), likes: [],
  } as CommunityComment)
}

export function toggleLike(userId: string, postId: string) {
  const p = raw().community_posts.find(x => x.id === postId)
  if (!p) return
  const likes = p.likes.includes(userId) ? p.likes.filter(x => x !== userId) : [...p.likes, userId]
  update('community_posts', postId, { likes })
}

export function toggleFavorite(userId: string, postId: string) {
  const p = raw().community_posts.find(x => x.id === postId)
  if (!p) return
  const favorites = p.favorites.includes(userId) ? p.favorites.filter(x => x !== userId) : [...p.favorites, userId]
  update('community_posts', postId, { favorites })
}

export function reportPost(userId: string, postId: string, reason: string) {
  const p = raw().community_posts.find(x => x.id === postId)
  if (!p) return
  update('community_posts', postId, { reports: [...p.reports, { by: userId, reason, resolved: false }] })
}

export function deletePost(postId: string) {
  remove('community_comments', c => c.postId === postId)
  remove('community_posts', p => p.id === postId)
}

export function pendingReports(): { post: CommunityPost; unresolved: number }[] {
  return raw().community_posts
    .map(p => ({ post: p, unresolved: p.reports.filter(r => !r.resolved).length }))
    .filter(x => x.unresolved > 0)
}

export function resolveReports(postId: string) {
  const p = raw().community_posts.find(x => x.id === postId)
  if (!p) return
  update('community_posts', postId, { reports: p.reports.map(r => ({ ...r, resolved: true })) })
}

/** Ranking opcional (demo): ordena por XP derivado dos usuários com progresso. */
export function leaderboard(limit = 10) {
  // import dinâmico circular-safe: usa userStats via progress derivado
  const users = raw().users.filter(u => u.role !== 'admin')
  const rows = users.map(u => {
    const done = raw().lesson_progress.filter(p => p.userId === u.id && p.completedAt).length
    const profile = raw().profiles.find(pr => pr.userId === u.id)
    return { userId: u.id, name: u.name, username: profile?.username, lessons: done, xp: done * 50 + (profile?.level ? 100 : 0) }
  }).sort((a, b) => b.xp - a.xp)
  return rows.slice(0, limit)
}
