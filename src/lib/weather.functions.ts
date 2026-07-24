// ============================================================
// FIGO — Weather Functions
// API integration for real-time weather and forecasts
// ============================================================
import type { WeatherData } from '@/types'
import { getWeatherByCity as serviceGetWeatherByCity, getMockWeather as serviceGetMockWeather } from '@/services/weather.service'

export async function getWeather(destination: string): Promise<WeatherData> {
  if (!destination || destination.trim().length === 0) {
    return getMockWeather('World')
  }
  try {
    return await serviceGetWeatherByCity(destination)
  } catch {
    return getMockWeather(destination)
  }
}

export function getMockWeather(destination?: string): WeatherData {
  return serviceGetMockWeather(destination)
}
