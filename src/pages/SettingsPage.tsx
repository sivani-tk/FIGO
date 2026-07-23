import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, Moon, Sun, Globe, Bell, BellOff, Shield, MapPin,
  ChevronRight, CheckCircle2, Palette, Info, Star, Zap,
  Eye, EyeOff, Lock,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { CURRENCIES } from '@/services/currency.service'
import type { Currency, Language, TravelStyle } from '@/types'

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', label: 'العربية', flag: '🇦🇪' },
  { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
]

const TRAVEL_STYLES: { id: TravelStyle; label: string; icon: string; desc: string }[] = [
  { id: 'solo', label: 'Solo', icon: '🧍', desc: 'Independent exploration' },
  { id: 'couple', label: 'Couple', icon: '💑', desc: 'Romantic getaways' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧', desc: 'Family-friendly experiences' },
  { id: 'friends', label: 'Friends', icon: '👫', desc: 'Group adventures' },
  { id: 'luxury', label: 'Luxury', icon: '💎', desc: 'Premium experiences' },
  { id: 'backpacking', label: 'Backpacking', icon: '🎒', desc: 'Budget exploration' },
  { id: 'business', label: 'Business', icon: '💼', desc: 'Work + travel' },
]

function SettingRow({
  icon, label, description, right, id,
}: {
  icon: React.ReactNode
  label: string
  description?: string
  right: React.ReactNode
  id?: string
}) {
  return (
    <div id={id} className="flex items-center gap-4 py-4 border-b border-white/6 last:border-0">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(86,124,141,0.15)' }}
      >
        <span className="text-secondary">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-highlight text-sm font-semibold">{label}</p>
        {description && <p className="text-accent/50 text-xs mt-0.5 leading-snug">{description}</p>}
      </div>
      {right}
    </div>
  )
}

function Toggle({ value, onChange, id }: { value: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <motion.button
      id={id}
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0"
      aria-label="Toggle"
    >
      <motion.div
        className="w-12 h-6.5 rounded-full"
        animate={{ background: value ? '#567C8D' : 'rgba(200,217,230,0.15)' }}
        transition={{ duration: 0.2 }}
        style={{ height: 26, padding: 3 }}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ x: value ? 22 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      </motion.div>
    </motion.button>
  )
}

function SavedToast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl"
      style={{
        background: 'rgba(34,197,94,0.15)',
        border: '1px solid rgba(34,197,94,0.3)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <CheckCircle2 size={16} className="text-green-400" />
      <span className="text-green-300 text-sm font-semibold">Settings saved!</span>
    </motion.div>
  )
}

export default function SettingsPage() {
  const { settings, setTheme, setCurrency, setLanguage, updateSettings } = useUIStore()
  const { updateProfile, user } = useAuthStore()
  const [saved, setSaved] = useState(false)

  function showSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleTheme(dark: boolean) {
    setTheme(dark ? 'dark' : 'light')
    showSaved()
  }

  function handleCurrency(c: Currency) {
    setCurrency(c)
    updateProfile({ currency: c })
    showSaved()
  }

  function handleLanguage(l: Language) {
    setLanguage(l)
    updateProfile({ language: l })
    showSaved()
  }

  function handleToggle(key: keyof typeof settings) {
    updateSettings({ [key]: !settings[key as keyof typeof settings] })
    showSaved()
  }

  function handleTravelStyle(style: TravelStyle) {
    updateSettings({ travelStyle: style })
    updateProfile({ travelStyle: style })
    showSaved()
  }

  const isDark = settings.theme === 'dark'

  return (
    <div className="relative min-h-screen bg-primary-900 pb-28 md:pb-8">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(86,124,141,0.1) 0%, transparent 60%)',
        }}
      />

      <Navbar />

      <div className="relative z-10 pt-28 px-4 max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Settings size={22} className="text-secondary" />
            <h1 className="font-display font-black text-3xl text-highlight" style={{ letterSpacing: '-0.03em' }}>
              Settings
            </h1>
          </div>
          <p className="text-accent/60 text-sm">Customize your FIGO experience</p>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <h2 className="text-highlight font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            <Palette size={14} className="text-secondary" />
            Appearance
          </h2>
          <p className="text-accent/40 text-xs mb-4">Visual preferences</p>

          <SettingRow
            id="theme-toggle-row"
            icon={isDark ? <Moon size={16} /> : <Sun size={16} />}
            label="Dark Mode"
            description={isDark ? 'Currently using dark theme' : 'Currently using light theme'}
            right={
              <Toggle
                value={isDark}
                onChange={handleTheme}
                id="theme-toggle"
              />
            }
          />
        </motion.div>

        {/* Regional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5"
        >
          <h2 className="text-highlight font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            <Globe size={14} className="text-secondary" />
            Regional
          </h2>
          <p className="text-accent/40 text-xs mb-4">Language and currency settings</p>

          {/* Currency */}
          <SettingRow
            id="currency-row"
            icon={<span className="text-sm font-bold">₹</span>}
            label="Currency"
            description={`Prices shown in ${settings.currency}`}
            right={
              <select
                value={settings.currency}
                onChange={(e) => handleCurrency(e.target.value as Currency)}
                className="bg-white/5 border border-white/15 text-highlight rounded-xl px-3 py-2 text-sm outline-none focus:border-secondary/60 transition-all"
                id="currency-select-settings"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} className="bg-primary-800">{c}</option>
                ))}
              </select>
            }
          />

          {/* Language */}
          <SettingRow
            id="language-row"
            icon={<Globe size={16} />}
            label="Language"
            description={LANGUAGES.find((l) => l.code === settings.language)?.label ?? 'English'}
            right={
              <select
                value={settings.language}
                onChange={(e) => handleLanguage(e.target.value as Language)}
                className="bg-white/5 border border-white/15 text-highlight rounded-xl px-3 py-2 text-sm outline-none focus:border-secondary/60 transition-all"
                id="language-select-settings"
              >
                {LANGUAGES.map(({ code, label, flag }) => (
                  <option key={code} value={code} className="bg-primary-800">{flag} {label}</option>
                ))}
              </select>
            }
          />
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <h2 className="text-highlight font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            <Bell size={14} className="text-secondary" />
            Notifications
          </h2>
          <p className="text-accent/40 text-xs mb-4">Control your notification preferences</p>

          <SettingRow
            id="notifications-row"
            icon={settings.notifications ? <Bell size={16} /> : <BellOff size={16} />}
            label="Push Notifications"
            description="Trip reminders, weather alerts and travel tips"
            right={
              <Toggle
                value={settings.notifications}
                onChange={() => handleToggle('notifications')}
                id="notifications-toggle"
              />
            }
          />
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5"
        >
          <h2 className="text-highlight font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            <Shield size={14} className="text-secondary" />
            Privacy & Security
          </h2>
          <p className="text-accent/40 text-xs mb-4">Control your data and privacy</p>

          <SettingRow
            id="location-row"
            icon={<MapPin size={16} />}
            label="Location Sharing"
            description="Used for weather and safety features"
            right={
              <Toggle
                value={settings.locationSharing}
                onChange={() => handleToggle('locationSharing')}
                id="location-toggle"
              />
            }
          />
          <SettingRow
            id="privacy-row"
            icon={settings.privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
            label="Privacy Mode"
            description="Hides personal details from the screen"
            right={
              <Toggle
                value={settings.privacyMode}
                onChange={() => handleToggle('privacyMode')}
                id="privacy-toggle"
              />
            }
          />
        </motion.div>

        {/* Default Travel Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <h2 className="text-highlight font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            <Zap size={14} className="text-secondary" />
            Default Travel Style
          </h2>
          <p className="text-accent/40 text-xs mb-4">Pre-selects when planning a new trip</p>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {TRAVEL_STYLES.map(({ id, label, icon, desc }) => {
              const isSelected = settings.travelStyle === id
              return (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTravelStyle(id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center transition-all relative"
                  style={{
                    background: isSelected ? 'rgba(86,124,141,0.25)' : 'rgba(255,255,255,0.04)',
                    border: isSelected ? '1px solid rgba(86,124,141,0.5)' : '1px solid rgba(200,217,230,0.1)',
                  }}
                  id={`travel-style-${id}`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="styleIndicator"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: '#567C8D' }}
                    >
                      <CheckCircle2 size={12} className="text-white" />
                    </motion.div>
                  )}
                  <span className="text-2xl">{icon}</span>
                  <p className={`text-xs font-semibold ${isSelected ? 'text-highlight' : 'text-accent/70'}`}>{label}</p>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <h2 className="text-highlight font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            <Info size={14} className="text-secondary" />
            About FIGO
          </h2>
          <p className="text-accent/40 text-xs mb-4">App information</p>

          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Built with', value: 'React + Vite + TypeScript' },
            { label: 'AI Provider', value: 'OpenAI GPT-4 (mock)' },
            { label: 'Weather', value: 'Open-Meteo & OpenWeatherMap' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
              <span className="text-accent/60 text-sm">{label}</span>
              <span className="text-highlight text-sm font-medium">{value}</span>
            </div>
          ))}

          <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(86,124,141,0.1)', border: '1px solid rgba(86,124,141,0.2)' }}>
            <Star size={14} className="text-yellow-400" />
            <p className="text-accent/70 text-xs">
              Crafted with ❤️ for travellers worldwide. Every journey starts here.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Save Toast */}
      <AnimatePresence>
        {saved && <SavedToast />}
      </AnimatePresence>
    </div>
  )
}
