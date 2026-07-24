// ============================================================
// FIGO — Weather Service
// Supports: Open-Meteo (free, no key), OpenWeatherMap (key optional)
// Falls back to mock data when offline or keys missing
// ============================================================
import axios from 'axios'
import type { WeatherData } from '@/types'

const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

// WMO weather interpretation codes → icon + label
const WMO_CODES: Record<number, { icon: string; condition: string }> = {
  0: { icon: '☀️', condition: 'Clear sky' },
  1: { icon: '🌤️', condition: 'Mainly clear' },
  2: { icon: '⛅', condition: 'Partly cloudy' },
  3: { icon: '☁️', condition: 'Overcast' },
  45: { icon: '🌫️', condition: 'Foggy' },
  48: { icon: '🌫️', condition: 'Icy fog' },
  51: { icon: '🌦️', condition: 'Light drizzle' },
  53: { icon: '🌦️', condition: 'Moderate drizzle' },
  55: { icon: '🌧️', condition: 'Dense drizzle' },
  61: { icon: '🌧️', condition: 'Light rain' },
  63: { icon: '🌧️', condition: 'Moderate rain' },
  65: { icon: '🌧️', condition: 'Heavy rain' },
  71: { icon: '🌨️', condition: 'Light snow' },
  73: { icon: '🌨️', condition: 'Moderate snow' },
  75: { icon: '❄️', condition: 'Heavy snow' },
  80: { icon: '🌦️', condition: 'Rain showers' },
  85: { icon: '🌨️', condition: 'Snow showers' },
  95: { icon: '⛈️', condition: 'Thunderstorm' },
  99: { icon: '⛈️', condition: 'Heavy thunderstorm' },
}

function buildRecommendation(data: WeatherData): string {
  if (data.temperature > 35) return '🌡️ Very hot — carry water and sunscreen. Explore early morning or evening.'
  if (data.temperature < 5) return '🧥 Cold weather — dress in warm layers.'
  if (data.rainChance > 70) return '🌧️ High chance of rain — pack an umbrella.'
  if (data.uvIndex > 7) return '🕶️ High UV — wear sunscreen and sunglasses.'
  return '✅ Great conditions for exploring! Enjoy your day.'
}

// --- Open-Meteo (no API key needed) ---
export async function getWeatherByCoords(lat: number, lng: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,wind_speed_10m,weathercode,uv_index,visibility` +
      `&daily=sunrise,sunset&timezone=auto&forecast_days=1`

    const { data } = await axios.get(url, { timeout: 8000 })
    const c = data.current
    const code = c.weathercode ?? 0
    const meta = WMO_CODES[code] ?? { icon: '🌡️', condition: 'Unknown' }

    const result: WeatherData = {
      temperature: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      windSpeed: Math.round(c.wind_speed_10m),
      condition: meta.condition,
      icon: meta.icon,
      uvIndex: c.uv_index ?? 0,
      visibility: Math.round((c.visibility ?? 10000) / 1000),
      sunrise: data.daily.sunrise?.[0]?.split('T')[1] ?? '06:00',
      sunset: data.daily.sunset?.[0]?.split('T')[1] ?? '18:30',
      rainChance: c.precipitation_probability ?? 0,
      recommendation: '',
    }
    result.recommendation = buildRecommendation(result)
    return result
  } catch {
    return getMockWeather()
  }
}

// --- OpenWeatherMap (if key available) ---
export async function getWeatherByCity(city: string): Promise<WeatherData> {
  if (OPENWEATHER_KEY) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_KEY}&units=metric`
      const { data } = await axios.get(url, { timeout: 8000 })

      const result: WeatherData = {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        condition: data.weather[0]?.description ?? 'Unknown',
        icon: data.weather[0]?.main === 'Clear' ? '☀️' :
              data.weather[0]?.main === 'Clouds' ? '☁️' :
              data.weather[0]?.main === 'Rain' ? '🌧️' :
              data.weather[0]?.main === 'Snow' ? '❄️' :
              data.weather[0]?.main === 'Thunderstorm' ? '⛈️' : '🌡️',
        uvIndex: 3,
        visibility: Math.round(data.visibility / 1000),
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false }),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false }),
        rainChance: data.clouds?.all ?? 0,
        recommendation: '',
      }
      result.recommendation = buildRecommendation(result)
      return result
    } catch {
      // fall through to geocode + open-meteo
    }
  }

  // Geocode city to coords using Open-Meteo geocoding (free)
  try {
    const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`, { timeout: 6000 })
    const r = geo.data.results?.[0]
    if (r) return getWeatherByCoords(r.latitude, r.longitude)
  } catch { /* ignore */ }

  return getMockWeather()
}

// --- Mock fallback ---
export function getMockWeather(destination?: string): WeatherData {
  const mockMap: Record<string, Partial<WeatherData>> = {
    paris: { temperature: 18, condition: 'Partly cloudy', icon: '⛅', humidity: 70, windSpeed: 12 },
    calicut: { temperature: 29, condition: 'Partly cloudy', icon: '⛅', humidity: 75, windSpeed: 10 },
    kozhikode: { temperature: 29, condition: 'Partly cloudy', icon: '⛅', humidity: 75, windSpeed: 10 },
    goa: { temperature: 31, condition: 'Sunny', icon: '☀️', humidity: 70, windSpeed: 12 },
    kerala: { temperature: 28, condition: 'Humid & Pleasant', icon: '🌤️', humidity: 80, windSpeed: 9 },
    delhi: { temperature: 32, condition: 'Clear sky', icon: '☀️', humidity: 45, windSpeed: 11 },
    jaipur: { temperature: 34, condition: 'Sunny', icon: '☀️', humidity: 35, windSpeed: 14 },
    tokyo: { temperature: 26, condition: 'Clear sky', icon: '☀️', humidity: 65, windSpeed: 8 },
    dubai: { temperature: 38, condition: 'Clear sky', icon: '☀️', humidity: 40, windSpeed: 15 },
    london: { temperature: 14, condition: 'Overcast', icon: '☁️', humidity: 80, windSpeed: 20 },
    rome: { temperature: 24, condition: 'Clear sky', icon: '☀️', humidity: 55, windSpeed: 10 },
    'new york': { temperature: 20, condition: 'Partly cloudy', icon: '⛅', humidity: 60, windSpeed: 18 },
    bali: { temperature: 28, condition: 'Light rain', icon: '🌧️', humidity: 85, windSpeed: 8 },
    mumbai: { temperature: 30, condition: 'Partly cloudy', icon: '⛅', humidity: 78, windSpeed: 14 },
  }

  const key = destination?.toLowerCase() ?? ''
  const match = Object.entries(mockMap).find(([k]) => key.includes(k))?.[1] ?? {}

  const data: WeatherData = {
    temperature: 22,
    feelsLike: 24,
    humidity: 65,
    windSpeed: 12,
    condition: 'Partly cloudy',
    icon: '⛅',
    uvIndex: 5,
    visibility: 10,
    sunrise: '06:12',
    sunset: '18:45',
    rainChance: 20,
    recommendation: '✅ Great conditions for exploring! Enjoy your day.',
    ...match,
  }
  data.recommendation = buildRecommendation(data)
  return data
}
