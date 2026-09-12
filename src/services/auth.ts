import { getTable, insert, update, raw } from '@/lib/db'
import { hashPassword, uid, nowISO } from '@/lib/utils'
import type { UserRow, ProfileRow } from '@/types'

// Auth em MODO DEMO local. Produção: Supabase Auth (ver src/lib/supabase.ts).
// Nunca há chamadas de rede aqui; o hash local é apenas para simular sessão.

export interface PublicUser {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  profile: ProfileRow
}

const SESSION_KEY = 'sonora.session'

function toPublic(u: UserRow): PublicUser | null {
  const profile = raw().profiles.find(p => p.userId === u.id)
  if (!profile) return null
  return { id: u.id, name: u.name, email: u.email, role: u.role, profile }
}

export function currentUser(): PublicUser | null {
  try {
    const id = localStorage.getItem(SESSION_KEY)
    if (!id) return null
    const u = getTable('users').find(x => x.id === id)
    return u ? toPublic(u) : null
  } catch {
    return null
  }
}

export async function register(name: string, email: string, password: string): Promise<PublicUser> {
  const normalized = email.trim().toLowerCase()
  if (!name.trim()) throw new Error('Informe seu nome.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('E-mail inválido.')
  if (password.length < 8) throw new Error('A senha precisa de pelo menos 8 caracteres.')
  if (raw().users.some(u => u.email === normalized)) throw new Error('Este e-mail já tem conta. Tente entrar.')
  const user = insert('users', {
    id: uid('usr'), name: name.trim(), email: normalized, passHash: hashPassword(password), role: 'user', createdAt: nowISO(),
  } as UserRow)
  insert('profiles', {
    id: uid('prf'), userId: user.id, name: name.trim(), mode: 'beginner', publicPortfolio: false, locale: 'pt-BR', weeklyGoalMin: 120,
  } as ProfileRow)
  insert('notifications', { id: uid('ntf'), userId: user.id, text: '👋 Bem-vindo(a)! Complete o onboarding para gerar seu roadmap.', ts: nowISO(), read: false })
  localStorage.setItem(SESSION_KEY, user.id)
  return toPublic(user)!
}

export async function login(email: string, password: string): Promise<PublicUser> {
  const normalized = email.trim().toLowerCase()
  const u = raw().users.find(x => x.email === normalized)
  if (!u || u.passHash !== hashPassword(password)) throw new Error('E-mail ou senha incorretos.')
  localStorage.setItem(SESSION_KEY, u.id)
  return toPublic(u)!
}

export function logout() {
  try { localStorage.removeItem(SESSION_KEY) } catch { /* noop */ }
}

/** Demo: sem e-mail de verdade — retorna a senha atual se a pessoa esquecer (só no modo local!). */
export async function requestPasswordReset(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase()
  const exists = raw().users.some(u => u.email === normalized)
  if (!exists) throw new Error('Não há conta com esse e-mail.')
  return 'No modo demonstração local, a redefinição de senha é feita pelo painel Admin. Em produção, este fluxo usa Supabase Auth (e-mail seguro).'
}

export async function changePassword(userId: string, current: string, next: string) {
  const u = raw().users.find(x => x.id === userId)
  if (!u) throw new Error('Usuário não encontrado.')
  if (u.passHash !== hashPassword(current)) throw new Error('Senha atual incorreta.')
  if (next.length < 8) throw new Error('A nova senha precisa de pelo menos 8 caracteres.')
  update('users', userId, { passHash: hashPassword(next) })
}

export function updateProfile(userId: string, patch: Partial<ProfileRow>) {
  const p = raw().profiles.find(x => x.userId === userId)
  if (!p) throw new Error('Perfil não encontrado.')
  if (patch.username) {
    const uname = patch.username.trim().toLowerCase()
    if (!/^[a-z0-9_.-]{3,24}$/.test(uname)) throw new Error('Usuário: 3–24 caracteres, letras minúsculas, números, _ ou -.')
    const taken = raw().profiles.some(x => x.username === uname && x.userId !== userId)
    if (taken) throw new Error('Este @username já está em uso.')
    patch = { ...patch, username: uname }
  }
  update('profiles', p.id, patch)
}
