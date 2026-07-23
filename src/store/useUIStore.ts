import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings, Currency, Language, ThemeMode } from '@/types'

interface UIStore {
  settings: AppSettings
  assistantOpen: boolean
  mapOpen: boolean
  profileOpen: boolean
  setTheme: (t: ThemeMode) => void
  setCurrency: (c: Currency) => void
  setLanguage: (l: Language) => void
  toggleAssistant: () => void
  setAssistantOpen: (v: boolean) => void
  toggleMap: () => void
  toggleProfile: () => void
  setProfileOpen: (v: boolean) => void
  updateSettings: (s: Partial<AppSettings>) => void
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  currency: 'INR',
  language: 'en',
  notifications: true,
  privacyMode: false,
  locationSharing: true,
  travelStyle: 'solo',
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      assistantOpen: false,
      mapOpen: false,
      profileOpen: false,
      setTheme: (t) =>
        set((s) => {
          document.documentElement.classList.toggle('dark', t === 'dark')
          document.documentElement.classList.toggle('light', t === 'light')
          return { settings: { ...s.settings, theme: t } }
        }),
      setCurrency: (c) =>
        set((s) => ({ settings: { ...s.settings, currency: c } })),
      setLanguage: (l) =>
        set((s) => ({ settings: { ...s.settings, language: l } })),
      toggleAssistant: () => set((s) => ({ assistantOpen: !s.assistantOpen })),
      setAssistantOpen: (v) => set({ assistantOpen: v }),
      toggleMap: () => set((s) => ({ mapOpen: !s.mapOpen })),
      toggleProfile: () => set((s) => ({ profileOpen: !s.profileOpen })),
      setProfileOpen: (v) => set({ profileOpen: v }),
      updateSettings: (data) =>
        set((s) => ({ settings: { ...s.settings, ...data } })),
    }),
    { name: 'figo-ui' }
  )
)
