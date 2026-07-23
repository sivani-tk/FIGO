import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, MapPin, Calendar, Plane, ChevronRight, Search, Star } from 'lucide-react'
import { useWishlistStore } from '@/store/useWishlistStore'
import { useTripStore } from '@/store/useTripStore'
import { Navbar } from '@/components/layout/Navbar'
import { timeAgo } from '@/utils'
import { useTranslation } from '@/i18n/translations'
import type { WishlistItem } from '@/types'

type FilterType = 'all' | 'trip' | 'destination' | 'attraction' | 'restaurant'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  trip: <Plane size={14} />,
  destination: <MapPin size={14} />,
  attraction: <Star size={14} />,
  restaurant: <span className="text-xs">🍽️</span>,
}

function WishlistCard({ item, onRemove, onView }: { item: WishlistItem; onRemove: () => void; onView?: () => void }) {
  const [removing, setRemoving] = useState(false)

  async function handleRemove() {
    setRemoving(true)
    await new Promise((r) => setTimeout(r, 250))
    onRemove()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -60, scale: 0.9 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-3xl cursor-pointer group"
      style={{
        background: 'rgba(47, 65, 86, 0.6)',
        border: '1px solid rgba(200, 217, 230, 0.12)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={onView}
    >
      {/* Image */}
      {item.image && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-900/20 to-transparent" />

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
              style={{ background: 'rgba(47,65,86,0.85)', color: '#C8D9E6', border: '1px solid rgba(200,217,230,0.2)', backdropFilter: 'blur(8px)' }}
            >
              {TYPE_ICONS[item.type] ?? <Heart size={12} />}
              {item.type}
            </span>
          </div>

          {/* Remove button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); handleRemove() }}
            className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: removing ? 'rgba(239,68,68,0.8)' : 'rgba(47,65,86,0.8)', border: '1px solid rgba(200,217,230,0.15)', backdropFilter: 'blur(8px)' }}
            disabled={removing}
            id={`remove-wishlist-${item.id}`}
            aria-label={`Remove ${item.title} from wishlist`}
          >
            <Trash2 size={14} className={removing ? 'text-white' : 'text-red-400'} />
          </motion.button>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-highlight font-bold text-base truncate">{item.title}</h3>
            {item.subtitle && (
              <p className="text-accent/60 text-xs mt-0.5 line-clamp-2 leading-relaxed">{item.subtitle}</p>
            )}
          </div>
          {onView && (
            <ChevronRight size={16} className="text-accent/40 flex-shrink-0 mt-1 group-hover:text-accent transition-colors" />
          )}
        </div>

        <div className="flex items-center gap-3 mt-3">
          {item.rating && (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <Star size={12} className="fill-current" />
              {item.rating}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-accent/40">
            <Calendar size={10} />
            {timeAgo(item.savedAt)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState({ filter }: { filter: FilterType }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl mb-6"
      >
        {filter === 'all' ? '🧳' : filter === 'trip' ? '✈️' : filter === 'destination' ? '🗺️' : '⭐'}
      </motion.div>
      <h3 className="text-highlight font-bold text-xl mb-2">
        {filter === 'all' ? 'Your wishlist is empty' : `No saved ${filter}s yet`}
      </h3>
      <p className="text-accent/60 text-sm mb-8 max-w-xs leading-relaxed">
        Save trips, destinations and experiences you love to find them here later.
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/home')}
        className="btn-primary"
        id="explore-btn"
      >
        <Plane size={16} />
        Explore Destinations
      </motion.button>
    </motion.div>
  )
}

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore()
  const { savedTrips, setCurrentTrip } = useTripStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  const filtered = items.filter((item) => {
    const matchesFilter = filter === 'all' || item.type === filter
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const allTypes: { id: FilterType; label: string; count: number }[] = [
    { id: 'all' as FilterType, label: 'All', count: items.length },
    { id: 'trip' as FilterType, label: 'Trips', count: items.filter((i) => i.type === 'trip').length },
    { id: 'destination' as FilterType, label: 'Destinations', count: items.filter((i) => i.type === 'destination').length },
    { id: 'attraction' as FilterType, label: 'Attractions', count: items.filter((i) => i.type === 'attraction').length },
  ]
  const types = allTypes.filter((t) => t.id === 'all' || t.count > 0)

  function handleViewTrip(item: WishlistItem) {
    if (item.type !== 'trip') return
    const trip = savedTrips.find((t) => t.id === item.id)
    if (trip) {
      setCurrentTrip(trip)
      navigate('/result')
    }
  }

  return (
    <div className="relative min-h-screen bg-primary-900 pb-28 md:pb-8">
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(86,124,141,0.12) 0%, transparent 60%)',
        }}
      />

      <Navbar />

      <div className="relative z-10 pt-28 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Heart size={22} className="text-red-400" />
            <h1 className="font-display font-black text-3xl text-highlight" style={{ letterSpacing: '-0.03em' }}>
              My Wishlist
            </h1>
          </div>
          <p className="text-accent/60 text-sm">
            {items.length} saved {items.length === 1 ? 'item' : 'items'}
          </p>
        </motion.div>

        {items.length > 0 && (
          <>
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative mb-4"
            >
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search wishlist..."
                className="w-full bg-white/5 border border-white/15 text-highlight placeholder-white/30 rounded-2xl px-4 py-3 pl-11 text-sm outline-none focus:border-secondary/60 focus:bg-white/8 transition-all"
                id="wishlist-search"
              />
            </motion.div>

            {/* Filter tabs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex gap-2 mb-6 overflow-x-auto no-scrollbar"
            >
              {types.map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                    filter === id
                      ? 'text-highlight'
                      : 'text-accent/60 hover:text-accent'
                  }`}
                  style={{
                    background: filter === id ? 'rgba(86,124,141,0.3)' : 'rgba(255,255,255,0.04)',
                    border: filter === id ? '1px solid rgba(86,124,141,0.5)' : '1px solid rgba(200,217,230,0.1)',
                  }}
                  id={`filter-${id}`}
                >
                  {label}
                  <span
                    className="text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    style={{ background: filter === id ? 'rgba(86,124,141,0.4)' : 'rgba(200,217,230,0.1)' }}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </motion.div>
          </>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {filtered.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                  onView={item.type === 'trip' ? () => handleViewTrip(item) : undefined}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Clear all */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <button
              onClick={() => {
                if (confirm('Clear all wishlist items?')) {
                  useWishlistStore.getState().clearAll()
                }
              }}
              className="text-red-400/60 hover:text-red-400 text-sm flex items-center gap-2 transition-colors py-2 px-4 rounded-xl hover:bg-red-500/10"
              id="clear-wishlist-btn"
            >
              <Trash2 size={14} />
              Clear Wishlist
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
