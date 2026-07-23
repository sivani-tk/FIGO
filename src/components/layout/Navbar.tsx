import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Shield, Heart, Settings, LogOut, User, ChevronDown, Star, Map, Bell } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useWishlistStore } from '@/store/useWishlistStore'
import { useUIStore } from '@/store/useUIStore'
import { FigoLogo } from '@/components/ui/FigoLogo'
import { getInitials } from '@/utils'
import { useTranslation } from '@/i18n/translations'

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { items: wishlistItems } = useWishlistStore()
  const { profileOpen, setProfileOpen } = useUIStore()
  const { t } = useTranslation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const NAV_ITEMS = [
    { path: '/home', icon: Home, label: t('nav.home') },
    { path: '/safety', icon: Shield, label: t('nav.safety') },
    { path: '/wishlist', icon: Heart, label: t('nav.wishlist') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [setProfileOpen])

  function handleLogout() {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div
        className="mx-4 mt-4 rounded-3xl px-6 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(47, 65, 86, 0.7)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(200, 217, 230, 0.15)',
          boxShadow: '0 8px 32px rgba(47, 65, 86, 0.3)',
        }}
      >
        {/* Logo */}
        <Link to="/home" className="flex-shrink-0">
          <FigoLogo size={32} showText />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            return (
              <Link key={path} to={path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-highlight'
                      : 'text-accent/70 hover:text-accent hover:bg-white/8'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBg"
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: 'rgba(86, 124, 141, 0.25)', border: '1px solid rgba(86, 124, 141, 0.3)' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    />
                  )}
                  <Icon size={16} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                  {path === '/wishlist' && wishlistItems.length > 0 && (
                    <span className="relative z-10 bg-secondary text-highlight text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {wishlistItems.length}
                    </span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-200 hover:bg-white/8"
            aria-label="Open profile menu"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #567C8D, #2F4156)', color: '#C8D9E6' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user ? getInitials(user.name) : '?'}</span>
              )}
            </div>
            <span className="hidden md:block text-sm font-medium text-highlight">{user?.name?.split(' ')[0] ?? 'Account'}</span>
            <ChevronDown
              size={14}
              className={`text-accent/70 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
            />
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 mt-3 w-64 rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(47, 65, 86, 0.95)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(200, 217, 230, 0.15)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                }}
              >
                {/* Profile header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center text-lg font-bold"
                      style={{ background: 'linear-gradient(135deg, #567C8D, #2F4156)', color: '#C8D9E6' }}>
                      {user ? getInitials(user.name) : '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-highlight text-sm">{user?.name ?? 'Guest'}</p>
                      <p className="text-accent/70 text-xs">{user?.email ?? ''}</p>
                      {user?.country && <p className="text-accent/50 text-xs mt-0.5">{user.country} · {user.currency}</p>}
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  {[
                    { icon: User, label: t('nav.profile'), path: '/profile' },
                    { icon: Heart, label: t('nav.wishlist'), path: '/wishlist', badge: wishlistItems.length },
                    { icon: Star, label: t('common.savedTrips'), path: '/wishlist' },
                    { icon: Map, label: 'My Map', path: '/safety' },
                    { icon: Bell, label: t('settings.notifications'), path: '/settings' },
                    { icon: Settings, label: t('nav.settings'), path: '/settings' },
                  ].map(({ icon: Icon, label, path, badge }) => (
                    <motion.button
                      key={label}
                      whileHover={{ x: 4 }}
                      onClick={() => { navigate(path); setProfileOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-accent/80 hover:text-highlight hover:bg-white/8 transition-all duration-150 text-left"
                    >
                      <Icon size={15} />
                      <span className="flex-1">{label}</span>
                      {badge ? (
                        <span className="badge text-xs">{badge}</span>
                      ) : null}
                    </motion.button>
                  ))}
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-white/10">
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-red-400 hover:bg-red-500/10 transition-all duration-150"
                  >
                    <LogOut size={15} />
                    <span>{t('profile.logout')}</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 mx-3 mb-3">
        <div className="rounded-3xl flex items-center justify-around px-2 py-3"
          style={{
            background: 'rgba(47, 65, 86, 0.9)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(200, 217, 230, 0.15)',
            boxShadow: '0 -4px 24px rgba(47, 65, 86, 0.3)',
          }}>
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            return (
              <Link key={path} to={path} className="flex flex-col items-center gap-1 px-4 py-1">
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-secondary/30' : ''}`}>
                  <Icon size={20} className={isActive ? 'text-accent' : 'text-accent/50'} />
                </div>
                <span className={`text-xs ${isActive ? 'text-accent' : 'text-accent/40'}`}>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </motion.header>
  )
}
