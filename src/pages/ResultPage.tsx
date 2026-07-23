import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, RefreshCw, Heart, Share2, Download, MapPin, Clock, DollarSign,
  ChevronDown, ChevronUp, Star, Navigation, Lightbulb, Shield, Package, Users,
  Utensils, Car, Zap
} from 'lucide-react'
import { useTripStore } from '@/store/useTripStore'
import { useWishlistStore } from '@/store/useWishlistStore'
import { useUIStore } from '@/store/useUIStore'
import { Navbar } from '@/components/layout/Navbar'
import { WeatherWidget } from '@/components/weather/WeatherWidget'
import { FloatingAssistant } from '@/components/assistant/FloatingAssistant'
import { formatINR } from '@/services/currency.service'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { Activity } from '@/types'

const PERIOD_COLORS = {
  morning: { bg: 'rgba(253,230,138,0.15)', border: 'rgba(253,230,138,0.3)', dot: '#fde68a', label: '🌅' },
  afternoon: { bg: 'rgba(134,239,172,0.15)', border: 'rgba(134,239,172,0.3)', dot: '#86efac', label: '☀️' },
  evening: { bg: 'rgba(196,181,253,0.15)', border: 'rgba(196,181,253,0.3)', dot: '#c4b5fd', label: '🌆' },
  night: { bg: 'rgba(147,197,253,0.15)', border: 'rgba(147,197,253,0.3)', dot: '#93c5fd', label: '🌙' },
}

const BUDGET_COLORS = ['#C8D9E6', '#567C8D', '#2F4156', '#F5EFEB', '#a0bbd0', '#748FA0']

function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const colors = PERIOD_COLORS[activity.period]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="relative pl-12"
    >
      {/* Timeline dot */}
      <div className="absolute left-4 top-5 w-4 h-4 rounded-full border-2 border-highlight/50 z-10"
        style={{ background: colors.dot }} />

      <div className="rounded-3xl overflow-hidden mb-4 cursor-pointer"
        style={{ background: colors.bg, border: `1px solid ${colors.border}`, backdropFilter: 'blur(12px)' }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-accent/60 text-xs font-medium">{colors.label} {activity.time}</span>
                <span className="badge text-xs">{activity.category}</span>
              </div>
              <h3 className="text-highlight font-bold text-base leading-snug">{activity.title}</h3>
              <p className="text-accent/70 text-sm mt-1 line-clamp-2">{activity.description}</p>
            </div>
            {activity.photos[0] && (
              <img src={activity.photos[0]} alt={activity.title}
                className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
            )}
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-accent/60">
              <Clock size={12} /> {activity.duration}
            </span>
            <span className="flex items-center gap-1 text-xs text-accent/60">
              <DollarSign size={12} /> {formatINR(activity.estimatedCost)}
            </span>
            <span className="flex items-center gap-1 text-xs text-accent/60">
              <Navigation size={12} /> {activity.travelTime}
            </span>
            <span className="flex items-center gap-1 text-xs text-accent/60">
              <Star size={12} className="text-yellow-400" /> {activity.rating}
            </span>
          </div>

          <button className="mt-2 flex items-center gap-1 text-xs text-secondary hover:text-accent transition-colors">
            {expanded ? <><ChevronUp size={14} /> Less details</> : <><ChevronDown size={14} /> More details</>}
          </button>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-white/10 pt-4 space-y-3">
                {/* Transport */}
                <div className="flex items-center gap-2 text-sm">
                  <Car size={14} className="text-accent/60" />
                  <span className="text-accent/60">Transportation:</span>
                  <span className="text-highlight capitalize">{activity.transportation}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-accent/60" />
                  <span className="text-highlight text-xs">{activity.location.address}</span>
                </div>

                {/* Tips */}
                {activity.tips.length > 0 && (
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-accent/70 mb-2">
                      <Lightbulb size={12} /> Tips
                    </p>
                    <ul className="space-y-1">
                      {activity.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-accent/60 flex items-start gap-2">
                          <span className="text-secondary mt-0.5">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function ResultPage() {
  const navigate = useNavigate()
  const { currentTrip, saveTrip, setGenerating, setCurrentTrip, searchParams } = useTripStore()
  const { addItem, hasItem, removeItem } = useWishlistStore()
  const { toggleAssistant } = useUIStore()
  const [activeSection, setActiveSection] = useState<'timeline' | 'budget' | 'tips'>('timeline')
  const [activePeriod, setActivePeriod] = useState<string | null>(null)

  if (!currentTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-accent/60 mb-4">No trip generated yet</p>
          <button onClick={() => navigate('/home')} className="btn-primary">Plan a Trip</button>
        </div>
      </div>
    )
  }

  const trip = currentTrip
  const isSaved = hasItem(trip.id)

  function handleSave() {
    if (isSaved) removeItem(trip.id)
    else {
      saveTrip(trip)
      addItem({ id: trip.id, type: 'trip', title: trip.destination, subtitle: trip.summary.slice(0, 80), image: trip.heroImage })
    }
  }

  async function handleRegenerate() {
    if (!searchParams) return
    const { generateTrip } = await import('@/services/ai.service')
    setGenerating(true)
    navigate('/loading')
    try {
      const newTrip = await generateTrip(searchParams)
      setCurrentTrip(newTrip)
      navigate('/result')
    } finally { setGenerating(false) }
  }

  const filteredTimeline = activePeriod
    ? trip.timeline.filter((a) => a.period === activePeriod)
    : trip.timeline

  const budgetData = [
    { name: 'Food', value: trip.budgetBreakdown.food },
    { name: 'Transport', value: trip.budgetBreakdown.transport },
    { name: 'Activities', value: trip.budgetBreakdown.activities },
    { name: 'Shopping', value: trip.budgetBreakdown.shopping },
    { name: 'Accommodation', value: trip.budgetBreakdown.accommodation },
    { name: 'Emergency', value: trip.budgetBreakdown.emergency },
  ]

  return (
    <div className="min-h-screen bg-primary-900 pb-32 md:pb-8">
      <Navbar />

      {/* Hero image */}
      <div className="relative h-64 md:h-80 mt-0">
        <img src={trip.heroImage} alt={trip.destination}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/40 via-transparent to-primary-900" />

        {/* Back button */}
        <button onClick={() => navigate('/home')}
          className="absolute top-20 left-4 p-2.5 rounded-2xl bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all">
          <ArrowLeft size={20} />
        </button>

        {/* Destination title */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="font-display font-black text-3xl md:text-4xl text-white mb-1" style={{ letterSpacing: '-0.03em' }}>
            {trip.destination}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-white/80 text-sm">
              <Clock size={14} /> {trip.totalTime}
            </span>
            <span className="flex items-center gap-1 text-white/80 text-sm">
              <Navigation size={14} /> {trip.totalDistance}
            </span>
            <span className="flex items-center gap-1 text-white/80 text-sm">
              <DollarSign size={14} /> {formatINR(trip.estimatedBudget)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Weather */}
        <div className="mt-4 mb-4">
          <WeatherWidget weather={trip.weather} compact />
        </div>

        {/* Summary */}
        <div className="glass-card p-5 mb-4">
          <p className="text-accent/80 text-sm leading-relaxed">{trip.summary}</p>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 mb-4">
          {['timeline', 'budget', 'tips'].map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s as typeof activeSection)}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold capitalize transition-all ${
                activeSection === s ? 'bg-secondary/40 text-highlight border border-secondary/60' : 'bg-white/5 text-accent/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              {s === 'timeline' ? '📋' : s === 'budget' ? '💰' : '💡'} {s}
            </button>
          ))}
        </div>

        {/* TIMELINE */}
        {activeSection === 'timeline' && (
          <div>
            {/* Period filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
              <button onClick={() => setActivePeriod(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${!activePeriod ? 'bg-secondary/40 text-highlight border border-secondary/60' : 'bg-white/5 text-accent/60 border border-white/10'}`}>
                All
              </button>
              {Object.entries(PERIOD_COLORS).map(([period, { label }]) => (
                <button key={period} onClick={() => setActivePeriod(activePeriod === period ? null : period)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${activePeriod === period ? 'bg-secondary/40 text-highlight border border-secondary/60' : 'bg-white/5 text-accent/60 border border-white/10'}`}>
                  {label} {period}
                </button>
              ))}
            </div>

            {/* Timeline connector */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary/50 to-transparent" />
              {filteredTimeline.map((activity, i) => (
                <ActivityCard key={activity.id} activity={activity} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* BUDGET */}
        {activeSection === 'budget' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Pie chart */}
            <div className="glass-card p-5 mb-4">
              <h3 className="text-highlight font-bold mb-4 flex items-center gap-2">
                <DollarSign size={16} /> Budget Breakdown
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={budgetData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      paddingAngle={3} dataKey="value">
                      {budgetData.map((_, index) => (
                        <Cell key={index} fill={BUDGET_COLORS[index % BUDGET_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatINR(value)} contentStyle={{ background: 'rgba(47,65,86,0.95)', border: '1px solid rgba(200,217,230,0.2)', borderRadius: 12, color: '#F5EFEB' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Budget legend */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {budgetData.map(({ name, value }, i) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: BUDGET_COLORS[i] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-accent/60 text-xs">{name}</p>
                      <p className="text-highlight text-xs font-bold">{formatINR(value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="glass-card p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent/70">
                <Zap size={16} /> <span>Total Estimated Budget</span>
              </div>
              <span className="text-highlight font-black text-xl">{formatINR(trip.estimatedBudget)}</span>
            </div>

            {/* Emergency contacts */}
            <div className="glass-card p-5">
              <h3 className="text-highlight font-bold mb-3 flex items-center gap-2">
                <Shield size={16} /> Emergency Contacts
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '🚔 Police', number: trip.emergencyInfo.police },
                  { label: '🚑 Ambulance', number: trip.emergencyInfo.ambulance },
                  { label: '🚒 Fire', number: trip.emergencyInfo.fire },
                ].map(({ label, number }) => (
                  <a key={label} href={`tel:${number}`} className="flex flex-col items-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10">
                    <span className="text-lg mb-1">{label.split(' ')[0]}</span>
                    <span className="text-accent/60 text-xs">{label.split(' ')[1]}</span>
                    <span className="text-highlight font-bold text-lg">{number}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TIPS */}
        {activeSection === 'tips' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {[
              { title: '🎒 Packing Tips', icon: <Package size={16} />, items: trip.packingTips },
              { title: '🤝 Local Etiquette', icon: <Users size={16} />, items: trip.localEtiquette },
              { title: '🛡️ Safety Tips', icon: <Shield size={16} />, items: trip.safetyTips },
            ].map(({ title, items }) => (
              <div key={title} className="glass-card p-5">
                <h3 className="text-highlight font-bold mb-3">{title}</h3>
                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-accent/80">
                      <span className="text-secondary mt-1 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        )}

        {/* Bottom actions */}
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-2xl mx-auto z-40">
          <div className="glass rounded-3xl p-3 flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleRegenerate}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-accent/80 hover:text-highlight hover:bg-white/10 transition-all">
              <RefreshCw size={16} /> Regenerate
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${isSaved ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'btn-primary'}`}>
              <Heart size={16} className={isSaved ? 'fill-current' : ''} />
              {isSaved ? 'Saved!' : 'Save Trip'}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { if (navigator.share) navigator.share({ title: `FIGO: ${trip.destination}`, text: trip.summary }) }}
              className="p-3 rounded-2xl text-accent/70 hover:text-highlight hover:bg-white/10 transition-all border border-white/10">
              <Share2 size={16} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              className="p-3 rounded-2xl text-accent/70 hover:text-highlight hover:bg-white/10 transition-all border border-white/10">
              <Download size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAssistant />
    </div>
  )
}
