import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  rememberMe: boolean
  setUser: (user: User, token: string) => void
  logout: () => void
  setRememberMe: (v: boolean) => void
  updateProfile: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      rememberMe: false,
      setUser: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setRememberMe: (v) => set({ rememberMe: v }),
      updateProfile: (data) =>
        set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),
    }),
    {
      name: 'figo-auth',
      partialize: (s) => (s.rememberMe ? s : { user: null, token: null, isAuthenticated: false, rememberMe: false }),
    }
  )
)
