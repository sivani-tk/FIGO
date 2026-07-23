import { motion } from 'framer-motion'
import type { WeatherData } from '@/types'
import { Wind, Droplets, Eye, Sun, Sunrise, Sunset, Thermometer } from 'lucide-react'

interface WeatherWidgetProps {
  weather: WeatherData
  compact?: boolean
  className?: string
}

export function WeatherWidget({ weather, compact = false, className = '' }: WeatherWidgetProps) {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl ${className}`}
        style={{
          background: 'rgba(86, 124, 141, 0.15)',
          border: '1px solid rgba(200, 217, 230, 0.2)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <span className="text-2xl">{weather.icon}</span>
        <div>
          <p className="text-highlight font-bold text-lg leading-none">{weather.temperature}°C</p>
          <p className="text-accent/70 text-xs mt-0.5">{weather.condition}</p>
        </div>
        <div className="h-8 w-px bg-white/10 mx-1" />
        <div className="flex flex-col gap-0.5">
          <span className="text-accent/60 text-xs flex items-center gap-1"><Droplets size={10} />{weather.humidity}%</span>
          <span className="text-accent/60 text-xs flex items-center gap-1"><Wind size={10} />{weather.windSpeed}km/h</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-3xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(47,65,86,0.8) 0%, rgba(86,124,141,0.5) 100%)',
        border: '1px solid rgba(200, 217, 230, 0.2)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Main temp row */}
      <div className="p-6 flex items-start justify-between">
        <div>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-light text-highlight">{weather.temperature}°</span>
            <span className="text-highlight/60 text-2xl mb-2">C</span>
          </div>
          <p className="text-accent font-medium text-lg mt-1">{weather.condition}</p>
          <p className="text-accent/60 text-sm mt-0.5">Feels like {weather.feelsLike}°C</p>
        </div>
        <div className="text-right">
          <span className="text-6xl">{weather.icon}</span>
          <p className="text-accent/60 text-xs mt-2">UV Index: {weather.uvIndex}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-px bg-white/5">
        {[
          { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%`, color: '#7dd3fc' },
          { icon: Wind, label: 'Wind', value: `${weather.windSpeed} km/h`, color: '#86efac' },
          { icon: Eye, label: 'Visibility', value: `${weather.visibility} km`, color: '#c4b5fd' },
          { icon: Thermometer, label: 'Rain', value: `${weather.rainChance}%`, color: '#93c5fd' },
          { icon: Sunrise, label: 'Sunrise', value: weather.sunrise, color: '#fde68a' },
          { icon: Sunset, label: 'Sunset', value: weather.sunset, color: '#fdba74' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="p-4 flex flex-col gap-1.5"
            style={{ background: 'rgba(47, 65, 86, 0.4)' }}>
            <Icon size={16} style={{ color }} />
            <p className="text-accent/50 text-xs">{label}</p>
            <p className="text-highlight font-semibold text-sm">{value}</p>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="px-6 py-4" style={{ background: 'rgba(86, 124, 141, 0.1)' }}>
        <p className="text-accent/80 text-sm leading-relaxed">{weather.recommendation}</p>
      </div>
    </motion.div>
  )
}
