import { useState, useEffect } from 'react'
import type { WeatherData } from '@/types'
import { getWeatherByCity, getWeatherByCoords, getMockWeather } from '@/services/weather.service'
import { getWeather } from '@/lib/weather.functions'

export function useWeather(destination?: string, lat?: number, lng?: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchWeather() {
      if (!destination && lat === undefined) return

      setLoading(true)
      setError(null)

      try {
        let data: WeatherData
        if (lat !== undefined && lng !== undefined) {
          data = await getWeatherByCoords(lat, lng)
        } else if (destination) {
          data = await getWeather(destination)
        } else {
          data = getMockWeather()
        }

        if (!cancelled) {
          setWeather(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load weather')
          setWeather(getMockWeather(destination))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchWeather()
    return () => { cancelled = true }
  }, [destination, lat, lng])

  return { weather, loading, error }
}
