import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toasts, AppShell } from '@/components/shell'
import { useApp } from '@/store/app'
import { track } from '@/services/analytics'

// Pages
import Landing from '@/pages/Landing'
import Pricing from '@/pages/Pricing'
import DawCompare from '@/pages/DawCompare'
import AuthPages from '@/pages/Auth'
import Onboarding from '@/pages/Onboarding'
import Dashboard from '@/pages/Dashboard'
import Learn from '@/pages/Learn'
import CourseDetail from '@/pages/CourseDetail'
import LessonPage from '@/pages/Lesson'
import ProjectsPage from '@/pages/Projects'
import ChallengesPage from '@/pages/Challenges'
import RoadmapPage from '@/pages/Roadmap'
import MentorPage from '@/pages/Mentor'
import CommunityPage from '@/pages/Community'
import LibraryPage from '@/pages/Library'
import PortfolioPage, { ProducerPublicPage } from '@/pages/Portfolio'
import CertificatesPage, { CertificatePublicPage } from '@/pages/Certificates'
import EvolutionPage from '@/pages/Evolution'
import StudioPage from '@/pages/Studio'
import FinishTrackPage from '@/pages/FinishTrack'
import AnalyzerPage from '@/pages/Analyzer'
import CheckoutPage from '@/pages/Checkout'
import SettingsPage from '@/pages/Settings'
import AdminPage from '@/pages/Admin'
import SeoPages from '@/pages/SeoPages'
import LegalPages from '@/pages/Legal'
import NotFound from '@/pages/NotFound'
import MePage from '@/pages/Me'
import { MarketingShell } from '@/components/shell'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
    track('page_view', { path: pathname })
  }, [pathname])
  return null
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useApp()
  const loc = useLocation()
  if (!user) return <Navigate to={`/entrar?next=${encodeURIComponent(loc.pathname)}`} replace />
  if (!user.profile.level) {
    const onboardingOk = loc.pathname.startsWith('/onboarding')
    if (!onboardingOk) return <Navigate to="/onboarding" replace />
  }
  return children
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/entrar?next=/admin" replace />
  if (user.role !== 'admin') return (
    <MarketingShell><div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="text-5xl">🔒</div>
      <h1 className="mt-4 text-xl font-extrabold text-white">Área administrativa</h1>
      <p className="mt-2 text-sm text-zinc-400">Esta rota exige perfil <code>admin</code>. No modo demo local, entre com <b>admin@sonora.app / sonora123</b> (troque a senha em produção).</p>
    </div></MarketingShell>
  )
  return children
}

function AppLayout({ children }: { children: JSX.Element }) {
  return <AppShell>{children}</AppShell>
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Toasts />
      <Routes>
        {/* Público */}
        <Route path="/" element={<Landing />} />
        <Route path="/planos" element={<Pricing />} />
        <Route path="/daws" element={<DawCompare />} />
        <Route path="/entrar" element={<AuthPages mode="login" />} />
        <Route path="/criar-conta" element={<AuthPages mode="register" />} />
        <Route path="/recuperar" element={<AuthPages mode="recover" />} />
        <Route path="/produtor/:username" element={<ProducerPublicPage />} />
        <Route path="/certificado/:id" element={<CertificatePublicPage />} />
        <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />

        {/* SEO */}
        <Route path="/producao-musical" element={<SeoPages topic="producao-musical" />} />
        <Route path="/curso-producao-musical" element={<SeoPages topic="curso" />} />
        <Route path="/producao-musical-eletronica" element={<SeoPages topic="eletronica" />} />
        <Route path="/fl-studio" element={<SeoPages daw="fl-studio" />} />
        <Route path="/ableton-live" element={<SeoPages daw="ableton" />} />
        <Route path="/cubase" element={<SeoPages daw="cubase" />} />
        <Route path="/mixagem" element={<SeoPages topic="mixagem" />} />
        <Route path="/masterizacao" element={<SeoPages topic="masterizacao" />} />
        <Route path="/sound-design" element={<SeoPages topic="sound-design" />} />
        <Route path="/como-produzir-musica" element={<SeoPages topic="como-produzir" />} />
        <Route path="/psytrance" element={<SeoPages genre="psytrance" />} />
        <Route path="/techno" element={<SeoPages genre="techno" />} />
        <Route path="/house" element={<SeoPages genre="house" />} />
        <Route path="/privacidade" element={<LegalPages page="privacidade" />} />
        <Route path="/termos" element={<LegalPages page="termos" />} />
        <Route path="/cookies" element={<LegalPages page="cookies" />} />

        {/* App autenticado */}
        <Route path="/app" element={<RequireAuth><AppLayout><Dashboard /></AppLayout></RequireAuth>} />
        <Route path="/app/aprender" element={<RequireAuth><AppLayout><Learn /></AppLayout></RequireAuth>} />
        <Route path="/app/curso/:courseId" element={<RequireAuth><AppLayout><CourseDetail /></AppLayout></RequireAuth>} />
        <Route path="/app/aula/:lessonId" element={<RequireAuth><AppLayout><LessonPage /></AppLayout></RequireAuth>} />
        <Route path="/app/projetos" element={<RequireAuth><AppLayout><ProjectsPage /></AppLayout></RequireAuth>} />
        <Route path="/app/projeto/:projectId" element={<RequireAuth><AppLayout><ProjectsPage detail /></AppLayout></RequireAuth>} />
        <Route path="/app/desafios" element={<RequireAuth><AppLayout><ChallengesPage /></AppLayout></RequireAuth>} />
        <Route path="/app/roadmap" element={<RequireAuth><AppLayout><RoadmapPage /></AppLayout></RequireAuth>} />
        <Route path="/app/mentor" element={<RequireAuth><AppLayout><MentorPage /></AppLayout></RequireAuth>} />
        <Route path="/app/comunidade" element={<RequireAuth><AppLayout><CommunityPage /></AppLayout></RequireAuth>} />
        <Route path="/app/comunidade/:postId" element={<RequireAuth><AppLayout><CommunityPage thread /></AppLayout></RequireAuth>} />
        <Route path="/app/biblioteca" element={<RequireAuth><AppLayout><LibraryPage /></AppLayout></RequireAuth>} />
        <Route path="/app/plugins" element={<RequireAuth><AppLayout><LibraryPage tab="plugins" /></AppLayout></RequireAuth>} />
        <Route path="/app/portefolio" element={<RequireAuth><AppLayout><PortfolioPage /></AppLayout></RequireAuth>} />
        <Route path="/app/certificados" element={<RequireAuth><AppLayout><CertificatesPage /></AppLayout></RequireAuth>} />
        <Route path="/app/evolucao" element={<RequireAuth><AppLayout><EvolutionPage /></AppLayout></RequireAuth>} />
        <Route path="/app/estudio" element={<RequireAuth><AppLayout><StudioPage /></AppLayout></RequireAuth>} />
        <Route path="/app/finish" element={<RequireAuth><AppLayout><FinishTrackPage /></AppLayout></RequireAuth>} />
        <Route path="/app/analyzer" element={<RequireAuth><AppLayout><AnalyzerPage /></AppLayout></RequireAuth>} />
        <Route path="/app/checkout/:planId" element={<RequireAuth><AppLayout><CheckoutPage /></AppLayout></RequireAuth>} />
        <Route path="/app/configuracoes" element={<RequireAuth><AppLayout><SettingsPage /></AppLayout></RequireAuth>} />
        <Route path="/app/me" element={<RequireAuth><AppLayout><MePage /></AppLayout></RequireAuth>} />

        {/* Admin */}
        <Route path="/admin/*" element={<RequireAdmin><AdminPage /></RequireAdmin>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}


