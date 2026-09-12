import type { CommunityPost, CommunityComment, UserRow, ProfileRow, LessonProgress } from '@/types'
import { hashPassword } from '@/lib/utils'

// DADOS DE DEMONSTRAÇÃO (comunidade + contas de exemplo + ranking opcional).
// Tudo marcado como demo na UI para não fingir comunidade real vazia.

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

export const DEMO_USERS: { user: UserRow; profile: ProfileRow }[] = [
  {
    user: { id: 'u-admin', name: 'Equipe Sonora', email: 'admin@sonora.app', passHash: hashPassword('sonora123'), role: 'admin', createdAt: daysAgo(240) },
    profile: { id: 'p-admin', userId: 'u-admin', username: 'sonora', name: 'Equipe Sonora', bio: 'Conta oficial da plataforma.', level: 'avancado', daw: 'ableton', genre: 'techno', mode: 'advanced', publicPortfolio: true, locale: 'pt-BR', weeklyGoalMin: 300, artistName: 'Sonora Team' },
  },
  {
    user: { id: 'u-demo-rafa', name: 'Rafa Kauer', email: 'rafa@demo.sonora.app', passHash: hashPassword('demo1234'), role: 'user', createdAt: daysAgo(120) },
    profile: { id: 'p-demo-rafa', userId: 'u-demo-rafa', username: 'rafakauer', name: 'Rafa Kauer', bio: 'Techno rumble de Floripa. Cubase + Analog Force.', level: 'intermediario', daw: 'cubase', genre: 'techno', mode: 'advanced', publicPortfolio: true, locale: 'pt-BR', weeklyGoalMin: 420, artistName: 'KAU/R' },
  },
  {
    user: { id: 'u-demo-lu', name: 'Lu Sena', email: 'lu@demo.sonora.app', passHash: hashPassword('demo1234'), role: 'user', createdAt: daysAgo(90) },
    profile: { id: 'p-demo-lu', userId: 'u-demo-lu', username: 'lusena', name: 'Lu Sena', bio: 'Full-on. Ex-DJ, hoje produzindo os próprios edits.', level: 'intermediario', daw: 'fl-studio', genre: 'fullon', mode: 'advanced', publicPortfolio: true, locale: 'pt-BR', weeklyGoalMin: 600, artistName: 'LUSA' },
  },
  {
    user: { id: 'u-demo-bia', name: 'Bia Mont', email: 'bia@demo.sonora.app', passHash: hashPassword('demo1234'), role: 'user', createdAt: daysAgo(60) },
    profile: { id: 'p-demo-bia', userId: 'u-demo-bia', username: 'biamont', name: 'Bia Mont', bio: 'House com groove. Ableton + MPC live.', level: 'iniciante', daw: 'ableton', genre: 'house', mode: 'beginner', publicPortfolio: false, locale: 'pt-BR', weeklyGoalMin: 240 },
  },
  {
    user: { id: 'u-demo-tiago', name: 'Tiago 808', email: 'tiago@demo.sonora.app', passHash: hashPassword('demo1234'), role: 'user', createdAt: daysAgo(30) },
    profile: { id: 'p-demo-tiago', userId: 'u-demo-tiago', username: 'tiago808', name: 'Tiago 808', bio: 'Começando do zero. FL Studio + um fone qualquer.', level: 'iniciante', daw: 'fl-studio', genre: 'edm', mode: 'beginner', publicPortfolio: false, locale: 'pt-BR', weeklyGoalMin: 150 },
  },
]

// Progresso sintético p/ ranking demo (referencia as 12 primeiras aulas do curso 01)
export function demoProgress(): LessonProgress[] {
  const map: Record<string, number> = { 'u-demo-rafa': 34, 'u-demo-lu': 48, 'u-demo-bia': 16, 'u-demo-tiago': 4 }
  const out: LessonProgress[] = []
  for (const [uid, count] of Object.entries(map)) {
    for (let i = 1; i <= count; i++) {
      const courseId = i <= 14 ? 'producao-do-zero' : i <= 21 ? 'fundamentos-eletronica' : 'beatmaking'
      const local = i <= 14 ? i : i <= 21 ? i - 14 : i - 21
      const maxLocal = i <= 14 ? 14 : i <= 21 ? 7 : 5
      if (local > maxLocal) continue
      out.push({
        id: `sp-${uid}-${i}`,
        userId: uid,
        lessonId: `${courseId}-l${String(local).padStart(2, '0')}`,
        courseId,
        moduleId: `${courseId}-m${courseId === 'producao-do-zero' ? Math.ceil(local / 3) : 1}`,
        completedAt: daysAgo(count - i),
      })
    }
  }
  return out
}

export const DEMO_POSTS: CommunityPost[] = [
  {
    id: 'cp-1', userId: 'u-demo-lu', authorName: 'Lu Sena', category: 'Feedback de Tracks',
    title: 'Full-On v2 — tirei o mid do bass e abriu MUITO',
    body: 'Depois do feedback da v1, refiz o sidechain (ratio 10:1, release 70ms) e cortei 3 dB em 250Hz do mid bass. Agora o kick respira. Subi os stems na mix pra comparar. O que acham do impacto no 4º compasso do drop?',
    tags: ['psytrance', 'sidechain', 'feedback'], createdAt: daysAgo(2), likes: ['u-demo-rafa', 'u-demo-tiago'], favorites: ['u-demo-tiago'], reports: [],
  },
  {
    id: 'cp-2', userId: 'u-demo-rafa', authorName: 'Rafa Kauer', category: 'Mixagem',
    title: 'Rumbling bass no Cubase: chain que funcionou pra mim',
    body: 'Send do kick p/ um Reverb curto (0.4s, LP em 300Hz), de volta p/ um Comp esmagando (8:1). O "rabo" do vira o corredor grave do techno. Testei mono e sumiu menos do que eu temia. Alguém com problema de phase aqui? O meu só funciona com o LP antes do comp.',
    tags: ['techno', 'reverb', 'low-end'], createdAt: daysAgo(4), likes: ['u-demo-lu'], favorites: [], reports: [],
  },
  {
    id: 'cp-3', userId: 'u-demo-tiago', authorName: 'Tiago 808', category: 'FL Studio',
    title: 'Channel rack x Playlist: quando eu devo mudar de janela?',
    body: 'Comecei agora. Fiz um loop de 8 compassos no rack e tô com medo de jogar na Playlist e "acabar a mágica". Como vocês decidem que o loop virou música?',
    tags: ['iniciante', 'workflow'], createdAt: daysAgo(1), likes: [], favorites: [], reports: [],
  },
  {
    id: 'cp-4', userId: 'u-demo-bia', authorName: 'Bia Mont', category: 'Ableton',
    title: 'Scenes como estrutura: antes do arranjo',
    body: 'Montei 6 scenes (groove, break, build, drop A/B, outro) e lancei ao vivo por 20 min sem gravar. É a primeira vez que "senti" a música existir fora do loop. Dica: quantize launch 1 bar — salvou minha sanidade.',
    tags: ['workflow', 'session-view'], createdAt: daysAgo(5), likes: ['u-demo-rafa', 'u-demo-lu', 'u-demo-tiago'], favorites: ['u-demo-rafa'], reports: [],
  },
  {
    id: 'cp-5', userId: 'u-admin', authorName: 'Equipe Sonora', category: 'Produção',
    title: '🏆 Weekly Producer Challenge: "Beat em 30 minutos" começa agora',
    body: 'Cronômetro, 8 compassos, só o template. Postem o print da sessão com a tag #weeklychallenge. Os 3 mais criativos (não os mais "finalizados") ganham destaque no perfil.',
    tags: ['desafio', 'weekly'], createdAt: daysAgo(1), likes: ['u-demo-lu', 'u-demo-bia'], favorites: [], reports: [],
  },
  {
    id: 'cp-6', userId: 'u-demo-rafa', authorName: 'Rafa Kauer', category: 'Plugins',
    title: 'TDR Nova vs EQ do canal pra ressonância de mid-bass',
    body: 'Testei os dois na mesma frequência de briga (180Hz). O dinâmico segurou sem tirar sustain. Vale o teste em cada mix — não vire refém de "sempre o mesmo EQ".',
    tags: ['eq', 'bass'], createdAt: daysAgo(7), likes: ['u-demo-tiago'], favorites: [], reports: [],
  },
]

export const DEMO_COMMENTS: CommunityComment[] = [
  { id: 'cc-1', postId: 'cp-3', userId: 'u-demo-lu', authorName: 'Lu Sena', body: 'Regra prática: quando você consegue TROCAR de groove sem parar o som (fill no comp 8), está pronto pra Playlist. O "acabar a mágica" é mito: o rack continua vivo como pattern, é só pintá-lo.', createdAt: daysAgo(1), likes: ['u-demo-tiago'] },
  { id: 'cc-2', postId: 'cp-3', userId: 'u-admin', authorName: 'Equipe Sonora', body: 'E tem a aula "Playlist: pintar patterns" na FL Academy — mostra a duplicação de pattern pra criar a variação sem perder o original.', createdAt: daysAgo(1), likes: [] },
  { id: 'cc-3', postId: 'cp-1', userId: 'u-demo-rafa', authorName: 'Rafa Kauer', body: 'O impacto abre bem, mas o delay do lead está 3/8 com 45% feedback — começa a "engolir" o offbeat do bass. Tenta 28% e vê.', createdAt: daysAgo(1), likes: ['u-demo-lu'] },
  { id: 'cc-4', postId: 'cp-2', userId: 'u-demo-bia', authorName: 'Bia Mont', body: 'LP ANTES do comp é obrigatório, senão o comp reage ao corpo todo do reverb e "pulsa" estranho. Você acertou na ordem — documenta isso no projeto!', createdAt: daysAgo(3), likes: [] },
]
