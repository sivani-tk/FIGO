import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, RefreshCw, Heart, Share2, Download, MapPin, Clock, DollarSign,
  ChevronDown, ChevronUp, Star, Navigation, Lightbulb, Shield, Package, Users,
  Utensils, Car, Zap, Copy, CheckCircle2,
} from 'lucide-react'
import L from 'leaflet'
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

// ─── Activity Card ────────────────────────────────────────────
function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const colors = PERIOD_COLORS[activity.period]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
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
                {activity.day && (
                  <span className="text-accent/40 text-xs font-medium">Day {activity.day}</span>
                )}
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
                <div className="flex items-center gap-2 text-sm">
                  <Car size={14} className="text-accent/60" />
                  <span className="text-accent/60">Transportation:</span>
                  <span className="text-highlight capitalize">{activity.transportation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-accent/60" />
                  <span className="text-highlight text-xs">{activity.location.address}</span>
                </div>
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

// ─── Activity Map ─────────────────────────────────────────────
function ActivityMap({ activities }: { activities: Activity[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || activities.length === 0) return

    const center: [number, number] = [activities[0].location.lat, activities[0].location.lng]
    const map = L.map(mapRef.current, {
      center,
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const periodEmojis: Record<string, string> = {
      morning: '🌅', afternoon: '☀️', evening: '🌆', night: '🌙',
    }
    const periodColors: Record<string, string> = {
      morning: '#fde68a', afternoon: '#86efac', evening: '#c4b5fd', night: '#93c5fd',
    }

    const bounds: L.LatLng[] = []

    activities.forEach((activity, idx) => {
      const { lat, lng } = activity.location
      const color = periodColors[activity.period] ?? '#C8D9E6'
      const emoji = periodEmojis[activity.period] ?? '📍'
      const dayLabel = activity.day ? `Day ${activity.day} · ` : ''

      const markerHtml = `
        <div style="
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, ${color}cc, ${color}88);
          border: 2px solid ${color};
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 4px ${color}33;
        ">${emoji}</div>
      `
      const icon = L.divIcon({ html: markerHtml, iconSize: [36, 36], iconAnchor: [18, 18], className: '' })
      const marker = L.marker([lat, lng], { icon }).addTo(map)
      marker.bindPopup(
        `<div style="font-family: 'Inter', sans-serif; min-width: 160px;">
          <p style="color: #2F4156; font-weight: 700; font-size: 13px; margin: 0 0 4px;">${idx + 1}. ${activity.title}</p>
          <p style="color: #567C8D; font-size: 11px; margin: 0 0 2px;">${dayLabel}${activity.time}</p>
          <p style="color: #567C8D; font-size: 11px; margin: 0;">${formatINR(activity.estimatedCost)} · ${activity.duration}</p>
        </div>`,
        { closeButton: false }
      )
      bounds.push(L.latLng(lat, lng))
    })

    if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30] })
    }

    mapInstanceRef.current = map
    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [activities])

  return (
    <div
      ref={mapRef}
      className="w-full rounded-3xl overflow-hidden"
      style={{ height: 380, border: '1px solid rgba(200,217,230,0.15)' }}
      id="result-activity-map"
    />
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function ResultPage() {
  const navigate = useNavigate()
  const { currentTrip, saveTrip, setGenerating, setCurrentTrip, searchParams } = useTripStore()
  const { addItem, hasItem, removeItem } = useWishlistStore()
  const { toggleAssistant } = useUIStore()
  const [activeSection, setActiveSection] = useState<'timeline' | 'budget' | 'tips' | 'map'>('timeline')
  const [activePeriod, setActivePeriod] = useState<string | null>(null)
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

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

  // Compute unique days for filter
  const uniqueDays = [...new Set(trip.timeline.map((a) => a.day).filter(Boolean))] as number[]
  const isMultiDay = uniqueDays.length > 1

  function handleSave() {
    if (isSaved) removeItem(trip.id)
    else {
      saveTrip(trip)
      addItem({ id: trip.id, type: 'trip', title: trip.destination, subtitle: trip.summary.slice(0, 80), image: trip.heroImage })
    }
  }

  async function handleRegenerate() {
    if (!searchParams) return
    const { generateTrip } = await import('@/lib/trip.functions')
    setGenerating(true)
    navigate('/loading')
    try {
      const newTrip = await generateTrip(searchParams)
      setCurrentTrip(newTrip)
      navigate('/result')
    } finally { setGenerating(false) }
  }

  async function handleShare() {
    const shareText = `🌍 FIGO Trip: ${trip.destination}\n\n${trip.summary}\n\nBudget: ${formatINR(trip.estimatedBudget)} · ${trip.totalTime}\n\nPlan your trip at FIGO!`
    if (navigator.share) {
      try {
        await navigator.share({ title: `FIGO: ${trip.destination}`, text: shareText })
        return
      } catch { /* fallthrough */ }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* ignore */ }
  }

  function handleDownload() {
    const lines: string[] = [
      `═══════════════════════════════════════════`,
      `  FIGO TRAVEL ITINERARY`,
      `  ${trip.destination.toUpperCase()}`,
      `═══════════════════════════════════════════`,
      ``,
      `📋 SUMMARY`,
      trip.summary,
      ``,
      `📊 TRIP OVERVIEW`,
      `  • Duration:  ${trip.totalTime}`,
      `  • Distance:  ${trip.totalDistance}`,
      `  • Budget:    ${formatINR(trip.estimatedBudget)}`,
      `  • Weather:   ${trip.weather.temperature}°C, ${trip.weather.condition}`,
      ``,
      `🗓️ ITINERARY`,
      ``,
    ]

    // Group by day
    const byDay: Record<number, Activity[]> = {}
    trip.timeline.forEach((act) => {
      const d = act.day ?? 1
      if (!byDay[d]) byDay[d] = []
      byDay[d].push(act)
    })

    Object.entries(byDay).forEach(([day, acts]) => {
      lines.push(`── DAY ${day} ──────────────────────────────────`)
      acts.forEach((act) => {
        lines.push(``)
        lines.push(`  ${act.time}  ${act.period.toUpperCase()} · ${act.category}`)
        lines.push(`  📍 ${act.title}`)
        lines.push(`  ${act.description}`)
        lines.push(`  ⏱  ${act.duration}  |  🚗 ${act.travelTime} travel  |  💰 ${formatINR(act.estimatedCost)}`)
        lines.push(`  📌 ${act.location.address}`)
        if (act.tips.length) {
          lines.push(`  💡 Tips: ${act.tips.join(' · ')}`)
        }
      })
      lines.push(``)
    })

    lines.push(``)
    lines.push(`💰 BUDGET BREAKDOWN`)
    lines.push(`  Food:          ${formatINR(trip.budgetBreakdown.food)}`)
    lines.push(`  Transport:     ${formatINR(trip.budgetBreakdown.transport)}`)
    lines.push(`  Activities:    ${formatINR(trip.budgetBreakdown.activities)}`)
    lines.push(`  Shopping:      ${formatINR(trip.budgetBreakdown.shopping)}`)
    lines.push(`  Accommodation: ${formatINR(trip.budgetBreakdown.accommodation)}`)
    lines.push(`  Emergency:     ${formatINR(trip.budgetBreakdown.emergency)}`)
    lines.push(`  ─────────────────────────────────────────`)
    lines.push(`  TOTAL:         ${formatINR(trip.estimatedBudget)}`)
    lines.push(``)
    lines.push(`🎒 PACKING TIPS`)
    trip.packingTips.forEach((t) => lines.push(`  • ${t}`))
    lines.push(``)
    lines.push(`🛡️ SAFETY TIPS`)
    trip.safetyTips.forEach((t) => lines.push(`  • ${t}`))
    lines.push(``)
    lines.push(`🚨 EMERGENCY CONTACTS — ${trip.emergencyInfo.country}`)
    lines.push(`  Police:    ${trip.emergencyInfo.police}`)
    lines.push(`  Ambulance: ${trip.emergencyInfo.ambulance}`)
    lines.push(`  Fire:      ${trip.emergencyInfo.fire}`)
    if (trip.emergencyInfo.touristPolice) {
      lines.push(`  Tourist:   ${trip.emergencyInfo.touristPolice}`)
    }
    lines.push(``)
    lines.push(`═══════════════════════════════════════════`)
    lines.push(`  Generated by FIGO — Every Journey Starts Here`)
    lines.push(`  ${new Date().toLocaleDateString('en', { dateStyle: 'long' })}`)
    lines.push(`═══════════════════════════════════════════`)

    const content = lines.join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `FIGO-${trip.destination.replace(/\s+/g, '-')}-Itinerary.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Filtered timeline
  let filteredTimeline = trip.timeline
  if (activePeriod) filteredTimeline = filteredTimeline.filter((a) => a.period === activePeriod)
  if (activeDay !== null) filteredTimeline = filteredTimeline.filter((a) => a.day === activeDay)

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

        <button onClick={() => navigate('/home')}
          className="absolute top-20 left-4 p-2.5 rounded-2xl bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all">
          <ArrowLeft size={20} />
        </button>

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
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {(['timeline', 'map', 'budget', 'tips'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`flex-shrink-0 flex-1 py-2.5 rounded-2xl text-sm font-semibold capitalize transition-all ${
                activeSection === s ? 'bg-secondary/40 text-highlight border border-secondary/60' : 'bg-white/5 text-accent/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              {s === 'timeline' ? '📋' : s === 'map' ? '🗺️' : s === 'budget' ? '💰' : '💡'} {s}
            </button>
          ))}
        </div>

        {/* ── TIMELINE ── */}
        {activeSection === 'timeline' && (
          <div>
            {/* Day filter (multi-day only) */}
            {isMultiDay && (
              <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveDay(null)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeDay === null ? 'bg-secondary/40 text-highlight border border-secondary/60' : 'bg-white/5 text-accent/60 border border-white/10'}`}>
                  All Days
                </button>
                {uniqueDays.map((d) => (
                  <button key={d} onClick={() => setActiveDay(activeDay === d ? null : d)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeDay === d ? 'bg-secondary/40 text-highlight border border-secondary/60' : 'bg-white/5 text-accent/60 border border-white/10'}`}>
                    Day {d}
                  </button>
                ))}
              </div>
            )}

            {/* Period filter */}
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

            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary/50 to-transparent" />
              {filteredTimeline.length === 0 ? (
                <div className="text-center py-12 text-accent/50 text-sm">No activities match the filter</div>
              ) : (
                filteredTimeline.map((activity, i) => (
                  <ActivityCard key={activity.id} activity={activity} index={i} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── MAP ── */}
        {activeSection === 'map' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="text-highlight font-bold mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-secondary" /> Activity Locations
                <span className="text-accent/50 text-xs font-normal ml-1">({trip.timeline.length} pins)</span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(PERIOD_COLORS).map(([period, { dot, label }]) => (
                  <span key={period} className="flex items-center gap-1.5 text-xs text-accent/60">
                    <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ background: dot }} />
                    {label} {period}
                  </span>
                ))}
              </div>
              <ActivityMap activities={trip.timeline} />
            </div>

            {/* Activity list with coordinates */}
            <div className="glass-card p-5">
              <h3 className="text-highlight font-bold mb-3 flex items-center gap-2">
                <Navigation size={16} className="text-secondary" /> All Stops
              </h3>
              <div className="space-y-2">
                {trip.timeline.map((act, i) => {
                  const colors = PERIOD_COLORS[act.period]
                  return (
                    <div key={act.id} className="flex items-center gap-3 py-2.5 border-b border-white/6 last:border-0">
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-primary-900"
                        style={{ background: colors.dot }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-highlight text-sm font-semibold truncate">{act.title}</p>
                        <p className="text-accent/50 text-xs mt-0.5">
                          {act.day ? `Day ${act.day} · ` : ''}{act.time} · {act.duration}
                        </p>
                      </div>
                      <span className="text-accent/40 text-xs flex-shrink-0">{formatINR(act.estimatedCost)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── BUDGET ── */}
        {activeSection === 'budget' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                    <Tooltip formatter={(value) => formatINR(Number(value))} contentStyle={{ background: 'rgba(47,65,86,0.95)', border: '1px solid rgba(200,217,230,0.2)', borderRadius: 12, color: '#F5EFEB' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

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

            <div className="glass-card p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent/70">
                <Zap size={16} /> <span>Total Estimated Budget</span>
              </div>
              <span className="text-highlight font-black text-xl">{formatINR(trip.estimatedBudget)}</span>
            </div>

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
              {trip.emergencyInfo.touristPolice && (
                <a href={`tel:${trip.emergencyInfo.touristPolice}`}
                  className="mt-3 flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all"
                  style={{ background: 'rgba(86,124,141,0.1)', border: '1px solid rgba(86,124,141,0.2)' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">👮</span>
                    <div>
                      <p className="text-highlight text-sm font-semibold">Tourist Police</p>
                      <p className="text-accent/50 text-xs">Specialised tourist assistance</p>
                    </div>
                  </div>
                  <span className="text-secondary font-bold text-sm">{trip.emergencyInfo.touristPolice}</span>
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* ── TIPS ── */}
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
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare}
              className="p-3 rounded-2xl text-accent/70 hover:text-highlight hover:bg-white/10 transition-all border border-white/10"
              title={copied ? 'Copied!' : 'Share'}>
              {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Share2 size={16} />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleDownload}
              id="download-trip-btn"
              className="p-3 rounded-2xl text-accent/70 hover:text-highlight hover:bg-white/10 transition-all border border-white/10"
              title="Download itinerary">
              <Download size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Clipboard toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-36 md:bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', backdropFilter: 'blur(12px)' }}
          >
            <Copy size={14} className="text-green-400" />
            <span className="text-green-300 text-sm font-semibold">Copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Assistant */}
      <FloatingAssistant />
    </div>
  )
}
