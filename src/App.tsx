import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './lib/auth'
import MarketingPage from './pages/MarketingPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import CanvasEditor from './editors/CanvasEditor'
import DocEditor from './editors/DocEditor'

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="app-loading">Loading…</div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function Landing() {
  const { session, loading } = useAuth()
  if (loading) return <div className="app-loading">Loading…</div>
  if (session) return <Navigate to="/home" replace />
  return <MarketingPage />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/home/:view" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/project/:projectId" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/board/:id" element={<RequireAuth><CanvasEditor /></RequireAuth>} />
          <Route path="/doc/:id" element={<RequireAuth><DocEditor /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
