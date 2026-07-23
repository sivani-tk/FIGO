import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Globe, MapPin, Plane, Heart, LogOut, Edit2, Save, X,
  Camera, Star, Calendar, CheckCircle2, Wallet,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/useAuthStore'
import { useWishlistStore } from '@/store/useWishlistStore'
import { useTripStore } from '@/store/useTripStore'
import { getInitials, timeAgo } from '@/utils'
import { CURRENCIES } from '@/services/currency.service'
import type { Currency, Language, TravelStyle } from '@/types'

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: '🇬🇧 English' }, { code: 'fr', label: '🇫🇷 Français' },
  { code: 'de', label: '🇩🇪 Deutsch' }, { code: 'es', label: '🇪🇸 Español' },
  { code: 'it', label: '🇮🇹 Italiano' }, { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'zh', label: '🇨🇳 中文' }, { code: 'hi', label: '🇮🇳 हिन्दी' },
  { code: 'ar', label: '🇦🇪 العربية' }, { code: 'ml', label: '🇮🇳 മലയാളം' },
]

const TRAVEL_STYLES: { id: TravelStyle; label: string; icon: string }[] = [
  { id: 'solo', label: 'Solo', icon: '🧍' },
  { id: 'couple', label: 'Couple', icon: '💑' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  { id: 'friends', label: 'Friends', icon: '👫' },
  { id: 'luxury', label: 'Luxury', icon: '💎' },
  { id: 'backpacking', label: 'Backpacking', icon: '🎒' },
  { id: 'business', label: 'Business', icon: '💼' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, updateProfile } = useAuthStore()
  const { items: wishlistItems } = useWishlistStore()
  const { savedTrips } = useTripStore()

  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  // Editable fields
  const [name, setName] = useState(user?.name ?? '')
  const [country, setCountry] = useState(user?.country ?? '')
  const [currency, setCurrency] = useState<Currency>((user?.currency as Currency) ?? 'INR')
  const [language, setLanguage] = useState<Language>((user?.language as Language) ?? 'en')
  const [travelStyle, setTravelStyle] = useState<TravelStyle>((user?.travelStyle as TravelStyle) ?? 'solo')

  function handleSave() {
    updateProfile({ name, country, currency, language, travelStyle })
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleCancel() {
    setName(user?.name ?? '')
    setCountry(user?.country ?? '')
    setCurrency((user?.currency as Currency) ?? 'INR')
    setLanguage((user?.language as Language) ?? 'en')
    setTravelStyle((user?.travelStyle as TravelStyle) ?? 'solo')
    setEditing(false)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const initials = getInitials(user?.name ?? 'User')
  const selectedStyle = TRAVEL_STYLES.find((s) => s.id === travelStyle)

  const stats = [
    { icon: <Plane size={18} />, label: 'Saved Trips', value: savedTrips.length, color: '#93c5fd' },
    { icon: <Heart size={18} />, label: 'Wishlist', value: wishlistItems.length, color: '#fda4af' },
    { icon: <Star size={18} />, label: 'Travel Style', value: selectedStyle?.icon ?? '✈️', color: '#fde68a' },
  ]

  const fieldClass = "w-full bg-white/5 border border-white/15 text-highlight placeholder-white/30 rounded-2xl px-4 py-3 text-sm outline-none focus:border-secondary/60 focus:bg-white/10 transition-all"

  return (
    <div className="relative min-h-screen bg-primary-900 pb-28 md:pb-8">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(86,124,141,0.12) 0%, transparent 60%)',
        }}
      />

      <Navbar />

      <div className="relative z-10 pt-28 px-4 max-w-2xl mx-auto space-y-5">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative">
                <motion.div
                  className="w-20 h-20 rounded-3xl overflow-hidden flex items-center justify-center text-2xl font-black"
                  style={{ background: 'linear-gradient(135deg, #567C8D, #2F4156)', color: '#C8D9E6' }}
                  whileHover={{ scale: 1.05 }}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </motion.div>
                {editing && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: '#567C8D', border: '2px solid #2F4156' }}
                    id="change-avatar-btn"
                  >
                    <Camera size={12} className="text-white" />
                  </motion.button>
                )}
              </div>

              <div>
                <h1 className="font-display font-black text-2xl text-highlight" style={{ letterSpacing: '-0.02em' }}>
                  {user?.name ?? 'Traveller'}
                </h1>
                <p className="text-accent/60 text-sm mt-0.5">{user?.email ?? ''}</p>
                {user?.createdAt && (
                  <p className="text-accent/40 text-xs mt-1.5 flex items-center gap-1.5">
                    <Calendar size={10} />
                    Member since {new Date(user.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            {/* Edit / Save / Cancel */}
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleCancel}
                    className="p-2.5 rounded-xl text-accent/60 hover:text-accent hover:bg-white/10 transition-all"
                    id="cancel-edit-btn"
                  >
                    <X size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #567C8D, #2F4156)' }}
                    id="save-profile-btn"
                  >
                    <Save size={14} />
                    Save
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-accent hover:text-highlight hover:bg-white/10 transition-all border border-white/10"
                  id="edit-profile-btn"
                >
                  <Edit2 size={14} />
                  Edit
                </motion.button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ icon, label, value, color }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,217,230,0.08)' }}
              >
                <span style={{ color }}>{icon}</span>
                <p className="text-highlight font-black text-xl">{value}</p>
                <p className="text-accent/50 text-xs text-center leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Profile Details / Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <h2 className="text-highlight font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <User size={14} className="text-secondary" />
            Personal Information
          </h2>

          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Name */}
                <div>
                  <label className="text-accent/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className={fieldClass + ' pl-10'}
                      id="profile-name-input"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="text-accent/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none" />
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Your home country"
                      className={fieldClass + ' pl-10'}
                      id="profile-country-input"
                    />
                  </div>
                </div>

                {/* Currency + Language */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-accent/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className={fieldClass}
                      id="profile-currency-select"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c} className="bg-primary-800">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-accent/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className={fieldClass}
                      id="profile-language-select"
                    >
                      {LANGUAGES.map(({ code, label }) => (
                        <option key={code} value={code} className="bg-primary-800">{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Travel Style */}
                <div>
                  <label className="text-accent/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                    Travel Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_STYLES.map(({ id, label, icon }) => (
                      <motion.button
                        key={id}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setTravelStyle(id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          travelStyle === id
                            ? 'bg-secondary/30 text-highlight border-secondary/50'
                            : 'bg-white/5 text-accent/60 border-white/10 hover:bg-white/10'
                        }`}
                        id={`travel-style-btn-${id}`}
                      >
                        <span>{icon}</span> {label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-0"
              >
                {[
                  { icon: <User size={14} />, label: 'Name', value: user?.name ?? '—' },
                  { icon: <Mail size={14} />, label: 'Email', value: user?.email ?? '—' },
                  { icon: <MapPin size={14} />, label: 'Country', value: user?.country ?? '—' },
                  { icon: <Wallet size={14} />, label: 'Currency', value: user?.currency ?? 'INR' },
                  { icon: <Globe size={14} />, label: 'Language', value: LANGUAGES.find((l) => l.code === user?.language)?.label ?? 'English' },
                  {
                    icon: <Plane size={14} />, label: 'Travel Style',
                    value: TRAVEL_STYLES.find((s) => s.id === user?.travelStyle)
                      ? `${TRAVEL_STYLES.find((s) => s.id === user?.travelStyle)!.icon} ${TRAVEL_STYLES.find((s) => s.id === user?.travelStyle)!.label}`
                      : '—',
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 py-3.5 border-b border-white/6 last:border-0">
                    <span className="text-secondary flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-accent/50 text-xs">{label}</p>
                      <p className="text-highlight text-sm font-semibold mt-0.5 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Saved Trips preview */}
        {savedTrips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-highlight font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Plane size={14} className="text-secondary" />
                Saved Trips
              </h2>
              <button
                onClick={() => navigate('/wishlist')}
                className="text-secondary text-xs font-semibold hover:text-accent transition-colors"
              >
                View all →
              </button>
            </div>
            <div className="space-y-3">
              {savedTrips.slice(0, 3).map((trip) => (
                <motion.div
                  key={trip.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-all"
                  onClick={() => {
                    useTripStore.getState().setCurrentTrip(trip)
                    navigate('/result')
                  }}
                >
                  {trip.heroImage && (
                    <img src={trip.heroImage} alt={trip.destination} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-highlight font-semibold text-sm truncate">{trip.destination}</p>
                    <p className="text-accent/50 text-xs mt-0.5">{trip.params?.days} days · {trip.currency}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-accent/40 text-xs">{timeAgo(trip.createdAt)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Danger zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <h2 className="text-highlight font-bold text-sm uppercase tracking-wider mb-4">
            Account
          </h2>
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all border border-red-500/15 text-sm font-semibold"
            id="logout-btn"
          >
            <LogOut size={16} />
            Sign Out
          </motion.button>
        </motion.div>

        <div className="h-4" />
      </div>

      {/* Saved toast */}
      <AnimatePresence>
        {saved && (
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
            <span className="text-green-300 text-sm font-semibold">Profile updated!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
