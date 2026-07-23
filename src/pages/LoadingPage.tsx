import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTripStore } from '@/store/useTripStore'
import { FigoLogo } from '@/components/ui/FigoLogo'

const LOADING_MESSAGES = [
  'Finding hidden gems... 💎',
  'Planning your perfect day... 📋',
  'Checking weather conditions... 🌤️',
  'Optimizing your budget... 💰',
  'Finding local experiences... 🎭',
  'Mapping the best routes... 🗺️',
  'Discovering local cuisine... 🍜',
  'Curating unique activities... ✨',
  'Almost there... 🚀',
]

export default function LoadingPage() {
  const navigate = useNavigate()
  const { isGenerating, currentTrip } = useTripStore()
  const [progress, setProgress] = useState(0)
  const [messageIdx, setMessageIdx] = useState(0)

  // Redirect if trip ready
  useEffect(() => {
    if (currentTrip && !isGenerating) navigate('/result')
  }, [currentTrip, isGenerating, navigate])

  // Redirect if not generating
  useEffect(() => {
    if (!isGenerating && !currentTrip) navigate('/home')
  }, [isGenerating, currentTrip, navigate])

  // Animate progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 8, 92))
    }, 400)
    return () => clearInterval(interval)
  }, [])

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0b111d 0%, #2F4156 50%, #567C8D 100%)' }}>

      {/* Animated background orbs */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            width: 200 + i * 80,
            height: 200 + i * 80,
            background: i % 2 === 0 ? 'rgba(86,124,141,0.15)' : 'rgba(200,217,230,0.08)',
          }}
          animate={{
            x: [0, 80, -60, 0],
            y: [0, -60, 80, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
          initial={{ x: `${(i * 25) - 10}vw`, y: `${(i * 20) - 10}vh` }}
        />
      ))}

      <div className="relative z-10 text-center max-w-sm w-full">
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <FigoLogo size={64} showText={false} />
        </motion.div>

        {/* Title */}
        <h2 className="font-display font-bold text-2xl text-highlight mb-2">Crafting Your Journey</h2>
        <p className="text-accent/60 text-sm mb-10">Your AI travel assistant is at work</p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #567C8D, #C8D9E6, #F5EFEB)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <p className="text-accent/50 text-xs">{Math.round(progress)}%</p>
        </div>

        {/* Rotating message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-highlight/80 text-base font-medium mb-10"
          >
            {LOADING_MESSAGES[messageIdx]}
          </motion.p>
        </AnimatePresence>

        {/* Shimmer skeletons */}
        <div className="space-y-3 text-left">
          {[80, 60, 70, 50, 65].map((w, i) => (
            <motion.div
              key={i}
              className="h-4 rounded-xl skeleton"
              style={{ width: `${w}%` }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        {/* Floating activity icons */}
        <div className="mt-10 flex justify-center gap-6">
          {['✈️', '🗺️', '🌤️', '🍽️', '📸'].map((emoji, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  )
}
