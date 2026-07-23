import { useState, useEffect } from 'react'
import type { GPSLocation } from '@/types'

export function useGPS() {
  const [location, setLocation] = useState<GPSLocation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const detect = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords
        const base: GPSLocation = { lat, lng, accuracy }

        // Reverse geocode using Open-Meteo geocoding (free)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          base.city = data.address?.city ?? data.address?.town ?? data.address?.village ?? data.address?.county
          base.country = data.address?.country
          base.countryCode = data.address?.country_code?.toUpperCase()
        } catch { /* use coords only */ }

        setLocation(base)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  useEffect(() => {
    detect()
  }, [])

  return { location, error, loading, redetect: detect }
}
