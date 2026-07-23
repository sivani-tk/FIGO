import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import 'leaflet/dist/leaflet.css'
import './index.css'

import SplashPage from '@/pages/SplashPage'
import HomePage from '@/pages/HomePage'
import LoadingPage from '@/pages/LoadingPage'
import ResultPage from '@/pages/ResultPage'
import WishlistPage from '@/pages/WishlistPage'
import SafetyPage from '@/pages/SafetyPage'
import SettingsPage from '@/pages/SettingsPage'
import ProfilePage from '@/pages/ProfilePage'
import { useAuthStore } from '@/store/useAuthStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      {...pageTransition}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  )
}

function App() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <PageWrapper><SplashPage /></PageWrapper>}
        />
        <Route
          path="/home"
          element={<ProtectedRoute><PageWrapper><HomePage /></PageWrapper></ProtectedRoute>}
        />
        <Route
          path="/loading"
          element={<ProtectedRoute><PageWrapper><LoadingPage /></PageWrapper></ProtectedRoute>}
        />
        <Route
          path="/result"
          element={<ProtectedRoute><PageWrapper><ResultPage /></PageWrapper></ProtectedRoute>}
        />
        <Route
          path="/wishlist"
          element={<ProtectedRoute><PageWrapper><WishlistPage /></PageWrapper></ProtectedRoute>}
        />
        <Route
          path="/safety"
          element={<ProtectedRoute><PageWrapper><SafetyPage /></PageWrapper></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><PageWrapper><SettingsPage /></PageWrapper></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><PageWrapper><ProfilePage /></PageWrapper></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
