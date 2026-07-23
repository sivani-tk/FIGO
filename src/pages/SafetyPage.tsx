import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Phone, MapPin, Loader2, AlertTriangle, Navigation,
  Thermometer, Wind, Droplets, RefreshCw, Info
} from 'lucide-react'
import L from 'leaflet'
import { Navbar } from '@/components/layout/Navbar'
import { WeatherWidget } from '@/components/weather/WeatherWidget'
import { useGPS } from '@/hooks/useGPS'
import { useWeather } from '@/hooks/useWeather'
import { useTripStore } from '@/store/useTripStore'

const SAFETY_TIPS = [
  { icon: '🔐', tip: 'Keep your passport in the hotel safe and carry a copy.' },
  { icon: '💳', tip: 'Notify your bank before international travel to avoid card blocks.' },
  { icon: '📱', tip: 'Save important contacts offline in case you lose internet access.' },
  { icon: '🚕', tip: 'Use official taxis or trusted ride-sharing apps like Uber or Grab.' },
  { icon: '👁️', tip: 'Stay aware of your surroundings, especially in crowded tourist areas.' },
  { icon: '🌐', tip: 'Register with your embassy if staying abroad for an extended period.' },
  { icon: '💊', tip: 'Carry a basic first-aid kit and any prescription medications.' },
  { icon: '📸', tip: 'Photograph your valuables and important documents before traveling.' },
  { icon: '🔋', tip: 'Always carry a portable charger — your phone is your lifeline.' },
  { icon: '🗺️', tip: 'Download offline maps for your destination before you leave.' },
]

function LeafletMap({ lat, lng, city }: { lat: number; lng: number; city?: string }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Custom marker
    const markerHtml = `
      <div style="
        width: 44px; height: 44px; border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #567C8D, #2F4156);
        border: 3px solid #C8D9E6;
        transform: rotate(-45deg);
        box-shadow: 0 4px 16px rgba(86,124,141,0.6), 0 0 0 8px rgba(86,124,141,0.15);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 18px;">📍</span>
      </div>
    `
    const icon = L.divIcon({ html: markerHtml, iconSize: [44, 44], iconAnchor: [22, 44], className: '' })
    const marker = L.marker([lat, lng], { icon }).addTo(map)

    if (city) {
      marker.bindPopup(
        `<div style="font-family: 'Inter', sans-serif; color: #2F4156; font-weight: 600; padding: 4px 0;">${city}</div>
         <div style="color: #567C8D; font-size: 12px;">${lat.toFixed(4)}, ${lng.toFixed(4)}</div>`,
        { closeButton: false }
      ).openPopup()
    }

    mapInstanceRef.current = map
    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [lat, lng, city])

  return (
    <div
      ref={mapRef}
      className="w-full rounded-3xl overflow-hidden"
      style={{ height: 260, border: '1px solid rgba(200,217,230,0.15)' }}
      id="safety-map"
    />
  )
}

function EmergencyCard({ emoji, label, number, href }: { emoji: string; label: string; number: string; href: string }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      className="flex flex-col items-center gap-2 p-4 rounded-3xl transition-all"
      style={{
        background: 'rgba(47,65,86,0.6)',
        border: '1px solid rgba(200,217,230,0.12)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-accent/70 text-xs font-medium text-center leading-tight">{label}</span>
      <span className="text-highlight font-black text-xl">{number}</span>
      <div className="flex items-center gap-1 text-xs text-secondary">
        <Phone size={10} />
        <span>Tap to call</span>
      </div>
    </motion.a>
  )
}

export default function SafetyPage() {
  const { location, loading: gpsLoading, error: gpsError, redetect } = useGPS()
  const { weather, loading: weatherLoading } = useWeather(
    undefined,
    location?.lat,
    location?.lng
  )
  const { currentTrip } = useTripStore()

  const emergency = currentTrip?.emergencyInfo ?? {
    police: '112',
    ambulance: '112',
    fire: '112',
    country: 'International',
  }

  return (
    <div className="relative min-h-screen bg-primary-900 pb-28 md:pb-8">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(86,124,141,0.1) 0%, transparent 60%)',
        }}
      />

      <Navbar />

      <div className="relative z-10 pt-28 px-4 max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Shield size={22} className="text-secondary" />
            <h1 className="font-display font-black text-3xl text-highlight" style={{ letterSpacing: '-0.03em' }}>
              Travel Safety
            </h1>
          </div>
          <p className="text-accent/60 text-sm">Your live location, weather and emergency contacts</p>
        </motion.div>

        {/* GPS Location + Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-highlight font-bold flex items-center gap-2">
              <Navigation size={16} className="text-secondary" />
              Your Location
            </h2>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={redetect}
              disabled={gpsLoading}
              className="p-2 rounded-xl text-accent/60 hover:text-accent hover:bg-white/10 transition-all"
              aria-label="Refresh location"
              id="refresh-location-btn"
            >
              <RefreshCw size={14} className={gpsLoading ? 'animate-spin' : ''} />
            </motion.button>
          </div>

          {gpsLoading && (
            <div className="flex items-center gap-3 py-6 justify-center">
              <Loader2 size={20} className="animate-spin text-secondary" />
              <span className="text-accent/60 text-sm">Detecting your location...</span>
            </div>
          )}

          {gpsError && !gpsLoading && (
            <div className="flex items-center gap-3 py-4 px-4 rounded-2xl mb-4"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium">Location access denied</p>
                <p className="text-red-400/60 text-xs mt-0.5">Enable location in browser settings to see your map.</p>
              </div>
            </div>
          )}

          {location && !gpsLoading && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={14} className="text-secondary flex-shrink-0" />
                <div>
                  <p className="text-highlight font-semibold text-sm">
                    {location.city && location.country
                      ? `${location.city}, ${location.country}`
                      : `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                  </p>
                  {location.accuracy && (
                    <p className="text-accent/40 text-xs">
                      Accuracy: ±{Math.round(location.accuracy)}m
                    </p>
                  )}
                </div>
              </div>
              <LeafletMap lat={location.lat} lng={location.lng} city={location.city} />
            </>
          )}

          {!location && !gpsLoading && !gpsError && (
            <div className="text-center py-6">
              <MapPin size={32} className="text-accent/20 mx-auto mb-3" />
              <p className="text-accent/50 text-sm">No location detected</p>
            </div>
          )}
        </motion.div>

        {/* Live Weather at Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-highlight font-bold flex items-center gap-2 mb-3">
            <Thermometer size={16} className="text-secondary" />
            Live Weather
          </h2>
          {weatherLoading && (
            <div className="glass-card p-6 flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-secondary" />
              <span className="text-accent/60 text-sm">Loading weather...</span>
            </div>
          )}
          {weather && !weatherLoading && (
            <WeatherWidget weather={weather} />
          )}
          {!weather && !weatherLoading && (
            <div className="glass-card p-6 text-center">
              <p className="text-accent/50 text-sm">Enable location to see live weather</p>
            </div>
          )}
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <h2 className="text-highlight font-bold mb-1 flex items-center gap-2">
            <Phone size={16} className="text-secondary" />
            Emergency Contacts
          </h2>
          {currentTrip && (
            <p className="text-accent/50 text-xs mb-4 flex items-center gap-1">
              <MapPin size={10} />
              {currentTrip.destination}
            </p>
          )}
          {!currentTrip && (
            <p className="text-accent/50 text-xs mb-4">International default numbers</p>
          )}

          <div className="grid grid-cols-3 gap-3 mb-4">
            <EmergencyCard emoji="🚔" label="Police" number={emergency.police} href={`tel:${emergency.police}`} />
            <EmergencyCard emoji="🚑" label="Ambulance" number={emergency.ambulance} href={`tel:${emergency.ambulance}`} />
            <EmergencyCard emoji="🚒" label="Fire" number={emergency.fire} href={`tel:${emergency.fire}`} />
          </div>

          {emergency.touristPolice && (
            <a
              href={`tel:${emergency.touristPolice}`}
              className="flex items-center justify-between p-3 rounded-2xl transition-all hover:bg-white/5"
              style={{ background: 'rgba(86,124,141,0.1)', border: '1px solid rgba(86,124,141,0.2)' }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">👮</span>
                <div>
                  <p className="text-highlight text-sm font-semibold">Tourist Police</p>
                  <p className="text-accent/50 text-xs">Specialised tourist assistance</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-secondary font-bold text-sm">{emergency.touristPolice}</span>
                <Phone size={14} className="text-secondary" />
              </div>
            </a>
          )}
        </motion.div>

        {/* Safety Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5"
        >
          <h2 className="text-highlight font-bold mb-4 flex items-center gap-2">
            <Info size={16} className="text-secondary" />
            Essential Safety Tips
          </h2>
          <div className="space-y-3">
            {SAFETY_TIPS.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-start gap-3 py-2"
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{tip.icon}</span>
                <p className="text-accent/70 text-sm leading-relaxed">{tip.tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick weather summary */}
        {weather && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { icon: <Thermometer size={16} />, label: 'Temperature', value: `${weather.temperature}°C`, color: '#fdba74' },
              { icon: <Wind size={16} />, label: 'Wind', value: `${weather.windSpeed} km/h`, color: '#86efac' },
              { icon: <Droplets size={16} />, label: 'Rain chance', value: `${weather.rainChance}%`, color: '#93c5fd' },
            ].map(({ icon, label, value, color }) => (
              <div
                key={label}
                className="flex flex-col items-center p-4 rounded-2xl"
                style={{ background: 'rgba(47,65,86,0.5)', border: '1px solid rgba(200,217,230,0.1)' }}
              >
                <div style={{ color }}>{icon}</div>
                <p className="text-accent/50 text-xs mt-2 text-center">{label}</p>
                <p className="text-highlight font-bold text-sm mt-0.5">{value}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
