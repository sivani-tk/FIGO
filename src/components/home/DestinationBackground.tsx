import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFallbackImage } from '@/services/images.service'

const DESTINATION_ICONS: Record<string, string> = {
  paris: '🗼',
  tokyo: '🗾',
  dubai: '🏙️',
  london: '🎡',
  rome: '🏛️',
  'new york': '🗽',
  bali: '🌴',
  singapore: '🦁',
  barcelona: '🎨',
  amsterdam: '🚲',
  maldives: '🏝️',
  mumbai: '🌊',
  goa: '🏖️',
  delhi: '🕌',
  default: '✈️',
}

interface DestinationBackgroundProps {
  destination: string
  className?: string
}

export function DestinationBackground({ destination, className = '' }: DestinationBackgroundProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [prevImage, setPrevImage] = useState<string>('')
  const [icon, setIcon] = useState('✈️')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!destination || destination.length < 3) {
      setImageUrl('')
      setIcon('✈️')
      return
    }

    // Debounce to avoid too many requests while typing
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const d = destination.toLowerCase()
      const match = Object.entries(DESTINATION_ICONS).find(([k]) => d.includes(k))
      setIcon(match ? match[1] : DESTINATION_ICONS.default)

      const img = getFallbackImage(destination)
      setPrevImage(imageUrl)
      setImageUrl(img)
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [destination])

  if (!imageUrl) return null

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <AnimatePresence>
        {prevImage && (
          <motion.div
            key={prevImage}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${prevImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        <motion.div
          key={imageUrl}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-900/40 to-primary-900/80" />

      {/* Floating destination icon */}
      <motion.div
        key={icon}
        initial={{ opacity: 0, y: 20, scale: 0.5 }}
        animate={{ opacity: 0.15, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] select-none pointer-events-none"
        style={{ filter: 'blur(2px)' }}
      >
        {icon}
      </motion.div>
    </div>
  )
}
