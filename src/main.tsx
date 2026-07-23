import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <SplashPage />}
      />
      <Route
        path="/home"
        element={<ProtectedRoute><HomePage /></ProtectedRoute>}
      />
      <Route
        path="/loading"
        element={<ProtectedRoute><LoadingPage /></ProtectedRoute>}
      />
      <Route
        path="/result"
        element={<ProtectedRoute><ResultPage /></ProtectedRoute>}
      />
      <Route
        path="/wishlist"
        element={<ProtectedRoute><WishlistPage /></ProtectedRoute>}
      />
      <Route
        path="/safety"
        element={<ProtectedRoute><SafetyPage /></ProtectedRoute>}
      />
      <Route
        path="/settings"
        element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
