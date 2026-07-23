import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, Users, Calendar, Wallet, Compass, Plane, Utensils, Mountain, Landmark, ShoppingBag,
  Moon, Camera, BookOpen, History, Waves, Footprints, Car, Train, Bus, Globe, Clock, Sparkles,
} from 'lucide-react'
import { useTripStore } from '@/store/useTripStore'
import { useUIStore } from '@/store/useUIStore'
import { useWeather } from '@/hooks/useWeather'
import { useGPS } from '@/hooks/useGPS'
import { WeatherWidget } from '@/components/weather/WeatherWidget'
import { DestinationBackground } from '@/components/home/DestinationBackground'
import { Navbar } from '@/components/layout/Navbar'
import { generateTrip } from '@/services/ai.service'
import { formatINR, getBudgetCategory } from '@/services/currency.service'
import { CURRENCIES } from '@/services/currency.service'
import type { TripSearchParams, TravelStyle, Interest, TransportMode, Currency, Language } from '@/types'

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: '🇬🇧 English' }, { code: 'fr', label: '🇫🇷 Français' },
  { code: 'de', label: '🇩🇪 Deutsch' }, { code: 'es', label: '🇪🇸 Español' },
  { code: 'it', label: '🇮🇹 Italiano' }, { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'zh', label: '🇨🇳 中文' }, { code: 'hi', label: '🇮🇳 हिन्दी' },
  { code: 'ar', label: '🇦🇪 العربية' }, { code: 'ml', label: '🇮🇳 മലയാളം' },
]

const TRAVEL_STYLES: { id: TravelStyle; label: string; icon: string }[] = [
  { id: 'solo', label: 'Solo', icon: '🧍' }, { id: 'couple', label: 'Couple', icon: '💑' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧' }, { id: 'friends', label: 'Friends', icon: '👫' },
  { id: 'luxury', label: 'Luxury', icon: '💎' }, { id: 'backpacking', label: 'Backpacking', icon: '🎒' },
  { id: 'business', label: 'Business', icon: '💼' },
]

const INTERESTS: { id: Interest; label: string; icon: React.ReactNode }[] = [
  { id: 'food', label: 'Food', icon: <Utensils size={14} /> },
  { id: 'adventure', label: 'Adventure', icon: <Mountain size={14} /> },
  { id: 'nature', label: 'Nature', icon: <Waves size={14} /> },
  { id: 'culture', label: 'Culture', icon: <Landmark size={14} /> },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingBag size={14} /> },
  { id: 'nightlife', label: 'Nightlife', icon: <Moon size={14} /> },
  { id: 'photography', label: 'Photography', icon: <Camera size={14} /> },
  { id: 'museums', label: 'Museums', icon: <BookOpen size={14} /> },
  { id: 'history', label: 'History', icon: <History size={14} /> },
  { id: 'beaches', label: 'Beaches', icon: <Waves size={14} /> },
]

const TRANSPORT: { id: TransportMode; label: string; icon: React.ReactNode }[] = [
  { id: 'walking', label: 'Walking', icon: <Footprints size={14} /> },
  { id: 'taxi', label: 'Taxi', icon: <Car size={14} /> },
  { id: 'rental', label: 'Rental Car', icon: <Car size={14} /> },
  { id: 'metro', label: 'Metro', icon: <Train size={14} /> },
  { id: 'public', label: 'Public', icon: <Bus size={14} /> },
]

const POPULAR_DESTINATIONS = ['Paris', 'Tokyo', 'Dubai', 'London', 'Rome', 'New York', 'Bali', 'Singapore']

const MIN_BUDGET = 1000
const MAX_BUDGET = 2500000

export default function HomePage() {
  const navigate = useNavigate()
  const { setSearchParams, setCurrentTrip, setGenerating } = useTripStore()
  const { settings } = useUIStore()
  const { location } = useGPS()

  const [destination, setDestination] = useState('')
  const [budgetMin, setBudgetMin] = useState(5000)
  const [budgetMax, setBudgetMax] = useState(50000)
  const [travellers, setTravellers] = useState(1)
  const [days, setDays] = useState(1)
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('solo')
  const [interests, setInterests] = useState<Interest[]>(['food', 'culture'])
  const [transportation, setTransportation] = useState<TransportMode[]>(['walking', 'metro'])
  const [currency, setCurrency] = useState<Currency>(settings.currency)
  const [language, setLanguage] = useState<Language>(settings.language)
  const [startTime, setStartTime] = useState('08:00')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { weather } = useWeather(destination.length >= 3 ? destination : undefined)

  const budgetCategory = getBudgetCategory(budgetMax)

  const toggleInterest = useCallback((id: Interest) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  const toggleTransport = useCallback((id: TransportMode) => {
    setTransportation((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  async function handleGenerate() {
    if (!destination.trim()) return

    const params: TripSearchParams = {
      destination: destination.trim(),
      budgetMin, budgetMax, travellers, days,
      travelStyle, interests, transportation,
      currency, language, startTime,
    }

    setSearchParams(params)
    setGenerating(true)
    navigate('/loading')

    try {
      const trip = await generateTrip(params)
      setCurrentTrip(trip)
      navigate('/result')
    } catch {
      navigate('/home')
    } finally {
      setGenerating(false)
    }
  }

  const suggestions = POPULAR_DESTINATIONS.filter((d) =>
    destination.length > 0 && d.toLowerCase().includes(destination.toLowerCase()) && d.toLowerCase() !== destination.toLowerCase()
  )

  return (
    <div className="relative min-h-screen pb-24 md:pb-8">
      {/* Animated destination background */}
      <DestinationBackground destination={destination} className="fixed inset-0" />

      {/* Dark base overlay */}
      <div className="fixed inset-0 bg-primary-900/60" />

      <Navbar />

      <div className="relative z-10 pt-28 px-4 max-w-2xl mx-auto">
        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8"
        >
          {location?.city && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 badge mb-4"
            >
              <Globe size={12} />
              <span>Detected: {location.city}, {location.country}</span>
            </motion.div>
          )}
          <h1 className="font-display font-black text-4xl md:text-5xl text-highlight mb-3" style={{ letterSpacing: '-0.03em' }}>
            Every Journey<br />
            <span className="text-gradient">Starts Here</span>
          </h1>
          <p className="text-accent/70 text-base leading-relaxed max-w-sm mx-auto">
            Let AI craft the perfect itinerary based on your travel style, budget and preferences.
          </p>
        </motion.div>

        {/* Live weather (if destination typed) */}
        {weather && destination.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <WeatherWidget weather={weather} compact />
          </motion.div>
        )}

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(47, 65, 86, 0.8)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(200, 217, 230, 0.15)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          }}
        >
          {/* Destination input */}
          <div className="p-5 pb-0">
            <label className="text-accent/60 text-xs font-semibold uppercase tracking-wider mb-2 block">Where to?</label>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/50" />
              <input
                type="text"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Paris, Tokyo, Dubai..."
                className="w-full bg-white/5 border border-white/15 text-highlight placeholder-white/30 rounded-2xl px-4 py-4 pl-11 text-lg font-medium outline-none focus:border-secondary/60 focus:bg-white/10 transition-all"
                id="destination-input"
                aria-label="Destination"
              />
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
                  style={{ background: 'rgba(47, 65, 86, 0.97)', border: '1px solid rgba(200,217,230,0.15)', backdropFilter: 'blur(20px)' }}
                >
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onMouseDown={() => { setDestination(s); setShowSuggestions(false) }}
                      className="w-full px-4 py-3 text-left text-highlight/80 hover:bg-white/10 flex items-center gap-3 text-sm transition-colors"
                    >
                      <Plane size={14} className="text-accent/50" />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Popular destinations */}
            {destination.length === 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {POPULAR_DESTINATIONS.slice(0, 6).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDestination(d)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-accent/70 hover:text-highlight transition-all hover:bg-white/10"
                    style={{ border: '1px solid rgba(200,217,230,0.15)' }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 space-y-5">
            {/* Budget slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-accent/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet size={12} /> Budget Range
                </label>
                <div className="flex items-center gap-2">
                  <span className={`badge text-xs`} style={{ background: budgetCategory.color + '20', color: budgetCategory.color, border: `1px solid ${budgetCategory.color}40` }}>
                    {budgetCategory.emoji} {budgetCategory.label}
                  </span>
                </div>
              </div>
              <div className="px-2">
                <div className="flex justify-between text-xs text-accent/60 mb-1">
                  <span>{formatINR(budgetMin)}</span>
                  <span>{formatINR(budgetMax)}</span>
                </div>
                <div className="relative">
                  <div className="h-1.5 rounded-full relative" style={{ background: 'rgba(200,217,230,0.15)' }}>
                    <div className="absolute h-full rounded-full"
                      style={{
                        left: `${((budgetMin - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100}%`,
                        right: `${100 - ((budgetMax - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100}%`,
                        background: 'linear-gradient(90deg, #567C8D, #C8D9E6)',
                      }} />
                  </div>
                  <input type="range" min={MIN_BUDGET} max={budgetMax - 1000} value={budgetMin}
                    onChange={(e) => setBudgetMin(Math.min(+e.target.value, budgetMax - 1000))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer" id="budget-min-slider" aria-label="Minimum budget" />
                  <input type="range" min={budgetMin + 1000} max={MAX_BUDGET} value={budgetMax}
                    onChange={(e) => setBudgetMax(Math.max(+e.target.value, budgetMin + 1000))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer" id="budget-max-slider" aria-label="Maximum budget" />
                </div>
                <div className="flex justify-between text-xs text-accent/40 mt-1">
                  <span>₹1K</span>
                  <span>₹25L</span>
                </div>
              </div>
            </div>

            {/* Travellers, Days, Start Time */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Travellers', icon: <Users size={14} />, value: travellers, min: 1, max: 20, set: setTravellers, id: 'travellers-input' },
                { label: 'Days', icon: <Calendar size={14} />, value: days, min: 1, max: 30, set: setDays, id: 'days-input' },
              ].map(({ label, icon, value, min, max, set, id }) => (
                <div key={label} className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <div className="flex items-center gap-1.5 text-accent/60 text-xs mb-2">{icon} {label}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => set(Math.max(min, value - 1))} className="w-7 h-7 rounded-xl bg-white/10 text-highlight flex items-center justify-center hover:bg-white/20 transition-colors font-bold">−</button>
                    <span className="flex-1 text-center text-highlight font-bold text-lg">{value}</span>
                    <button onClick={() => set(Math.min(max, value + 1))} className="w-7 h-7 rounded-xl bg-white/10 text-highlight flex items-center justify-center hover:bg-white/20 transition-colors font-bold">+</button>
                  </div>
                </div>
              ))}
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="flex items-center gap-1.5 text-accent/60 text-xs mb-2"><Clock size={14} /> Start Time</div>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-transparent text-highlight font-bold text-sm outline-none" id="start-time-input" aria-label="Start time" />
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <label className="text-accent/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Compass size={12} /> Travel Style
              </label>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_STYLES.map(({ id, label, icon }) => (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTravelStyle(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      travelStyle === id ? 'bg-secondary/40 text-highlight border-secondary/60' : 'bg-white/5 text-accent/60 border-white/10 hover:bg-white/10'
                    } border`}
                  >
                    <span>{icon}</span> {label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="text-accent/60 text-xs font-semibold uppercase tracking-wider mb-2 block">Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(({ id, label, icon }) => (
                  <motion.button key={id} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInterest(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      interests.includes(id) ? 'bg-secondary/40 text-highlight border-secondary/60' : 'bg-white/5 text-accent/60 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {icon} {label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Transportation */}
            <div>
              <label className="text-accent/60 text-xs font-semibold uppercase tracking-wider mb-2 block">Transportation</label>
              <div className="flex flex-wrap gap-2">
                {TRANSPORT.map(({ id, label, icon }) => (
                  <motion.button key={id} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTransport(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      transportation.includes(id) ? 'bg-secondary/40 text-highlight border-secondary/60' : 'bg-white/5 text-accent/60 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {icon} {label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Currency + Language */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-accent/60 text-xs font-semibold uppercase tracking-wider mb-2 block">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full bg-white/5 border border-white/15 text-highlight rounded-2xl px-4 py-3 text-sm outline-none focus:border-secondary/60 transition-all"
                  id="currency-select"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c} className="bg-primary-800">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-accent/60 text-xs font-semibold uppercase tracking-wider mb-2 block">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full bg-white/5 border border-white/15 text-highlight rounded-2xl px-4 py-3 text-sm outline-none focus:border-secondary/60 transition-all"
                  id="language-select"
                >
                  {LANGUAGES.map(({ code, label }) => (
                    <option key={code} value={code} className="bg-primary-800">{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={!destination.trim()}
              id="generate-trip-button"
              className="w-full py-4 rounded-2xl font-display font-bold text-lg text-highlight transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
              style={{
                background: destination.trim()
                  ? 'linear-gradient(135deg, #567C8D 0%, #2F4156 50%, #567C8D 100%)'
                  : 'rgba(86,124,141,0.3)',
                backgroundSize: '200% 100%',
                boxShadow: destination.trim() ? '0 8px 32px rgba(86,124,141,0.5), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
              }}
            >
              <motion.div
                className="absolute inset-0 bg-shimmer-gradient"
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <Sparkles size={20} />
                Generate My Trip ✨
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
