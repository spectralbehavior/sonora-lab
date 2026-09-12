import { describe, expect, it, beforeEach } from 'vitest'
import { register, login, changePassword, updateProfile, currentUser, logout } from '@/services/auth'
import { completeLesson, uncompleteLesson, courseProgress, isCourseComplete } from '@/services/progress'
import { listCourses, listLessons } from '@/services/content'
import { canAccessLesson, startCheckout, confirmCheckout } from '@/services/billing'
import { resetDb, raw } from '@/lib/db'

let uid = ''
let email = ''

beforeEach(async () => {
  resetDb()
  email = `u${Math.random().toString(36).slice(2, 8)}@t.io`
  const u = await register('Tester', email, 'senha1234')
  uid = u.id
  updateProfile(uid, { daw: 'fl-studio', genre: 'psytrance', level: 'iniciante', username: 'tester' + uid.slice(-4).replace(/[^a-z0-9]/gi, '') })
})

describe('auth', () => {
  it('registra com sessão ativa; e-mail duplicado e senha errada falham com mensagem', async () => {
    expect(currentUser()?.email).toBe(email)
    const back = await login(email, 'senha1234')
    expect(back.id).toBe(uid)
    await expect(login(email, 'senha-errada')).rejects.toThrow(/incorretos/i)
    await expect(register('Outro', email, 'outrasenha1')).rejects.toThrow(/já tem conta|em uso/i)
    logout()
    expect(currentUser()).toBeNull()
  })
  it('validação de cadastro (sem senhas frouxas)', async () => {
    await expect(register('SemEmail', 'nao-e-email', 'senha1234')).rejects.toThrow(/inv/i)
    await expect(register('X', `a${Math.random()}@b.c`, '123')).rejects.toThrow(/8 caracteres/)
  })
  it('changePassword confere a senha atual', async () => {
    await expect(changePassword(uid, 'errada123', 'novasenha1')).rejects.toThrow(/incorreta/i)
    await changePassword(uid, 'senha1234', 'novasenha1')
    expect((await login(email, 'novasenha1')).id).toBe(uid)
  })
})

describe('progresso de aulas', () => {
  it('concluir é idempotente; reabrir não duplica linhas; progresso numérico confere', () => {
    const course = listCourses()[0]
    const lessons = listLessons(course.id)
    expect(lessons.length).toBeGreaterThan(2)
    expect(completeLesson(uid, lessons[0])).toBe(true)
    expect(completeLesson(uid, lessons[0])).toBe(false) // já concluída — nada em dobro
    expect(courseProgress(uid, course.id)).toBe(Math.round((1 / lessons.length) * 100))
    expect(isCourseComplete(uid, course.id)).toBe(false)
    uncompleteLesson(uid, lessons[0].id)
    expect(raw().lesson_progress.filter(p => p.userId === uid && p.lessonId === lessons[0].id).length).toBe(1)
    expect(courseProgress(uid, course.id)).toBe(0)
  })
  it('100% das aulas → curso completo', () => {
    const course = listCourses()[0]
    for (const l of listLessons(course.id)) completeLesson(uid, l)
    expect(courseProgress(uid, course.id)).toBe(100)
    expect(isCourseComplete(uid, course.id)).toBe(true)
  })
  it('free só vê amostras; assinatura desbloqueia o resto (gate único do app)', async () => {
    const course = listCourses()[0]
    const blocked = listLessons(course.id).find(l => !l.isSample)
    const sample = listLessons(course.id).find(l => l.isSample)
    expect(sample).toBeTruthy()
    expect(canAccessLesson(uid, sample!.isSample)).toBe(true)
    if (blocked) expect(canAccessLesson(uid, blocked.isSample)).toBe(false)
    const session = startCheckout(uid, 'pro')
    confirmCheckout(session, uid)
    if (blocked) expect(canAccessLesson(uid, blocked.isSample)).toBe(true)
    expect(raw().payments.at(-1)?.provider).toBe('demo') // claro: compra sandbox, sem cartão
  })
})
