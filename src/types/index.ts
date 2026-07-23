// ============================================================
// FIGO — Core TypeScript Types
// ============================================================

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  country?: string
  currency?: string
  travelStyle?: string
  language?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  rememberMe: boolean
}

export type TravelStyle = 'solo' | 'couple' | 'family' | 'friends' | 'luxury' | 'backpacking' | 'business'

export type Interest = 'food' | 'adventure' | 'nature' | 'culture' | 'shopping' | 'nightlife' | 'photography' | 'museums' | 'history' | 'beaches'

export type TransportMode = 'walking' | 'taxi' | 'rental' | 'metro' | 'public'

export type Currency = 'INR' | 'USD' | 'EUR' | 'AED' | 'JPY' | 'GBP' | 'CAD' | 'AUD'

export type Language = 'en' | 'fr' | 'de' | 'es' | 'it' | 'ja' | 'zh' | 'hi' | 'ar' | 'ml'

export interface TripSearchParams {
  destination: string
  budgetMin: number
  budgetMax: number
  travellers: number
  days: number
  travelStyle: TravelStyle
  interests: Interest[]
  transportation: TransportMode[]
  currency: Currency
  language: Language
  startTime: string
}

export interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  condition: string
  icon: string
  uvIndex: number
  visibility: number
  sunrise: string
  sunset: string
  rainChance: number
  recommendation: string
}

export interface Activity {
  id: string
  time: string
  title: string
  description: string
  duration: string
  estimatedCost: number
  travelTime: string
  transportation: string
  rating: number
  tips: string[]
  photos: string[]
  location: {
    lat: number
    lng: number
    address: string
    name: string
  }
  period: 'morning' | 'afternoon' | 'evening' | 'night'
  category: string
  day?: number  // which day (1-indexed) in multi-day itinerary
}

export interface BudgetBreakdown {
  food: number
  transport: number
  activities: number
  shopping: number
  accommodation: number
  emergency: number
}

export interface EmergencyInfo {
  police: string
  ambulance: string
  fire: string
  hospital?: string
  touristPolice?: string
  country: string
}

export interface TripItinerary {
  id: string
  destination: string
  summary: string
  weather: WeatherData
  estimatedBudget: number
  currency: Currency
  timeline: Activity[]
  budgetBreakdown: BudgetBreakdown
  packingTips: string[]
  localEtiquette: string[]
  safetyTips: string[]
  emergencyInfo: EmergencyInfo
  totalDistance: string
  totalTime: string
  heroImage: string
  createdAt: string
  params: TripSearchParams
}

export interface WishlistItem {
  id: string
  type: 'destination' | 'restaurant' | 'attraction' | 'trip'
  title: string
  subtitle?: string
  image?: string
  rating?: number
  savedAt: string
  data?: unknown
}

export interface CurrencyRates {
  base: Currency
  rates: Record<Currency, number>
  updatedAt: string
}

export interface GPSLocation {
  lat: number
  lng: number
  city?: string
  country?: string
  countryCode?: string
  accuracy?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export type ThemeMode = 'dark' | 'light'

export interface AppSettings {
  theme: ThemeMode
  currency: Currency
  language: Language
  notifications: boolean
  travelStyle?: TravelStyle
  privacyMode: boolean
  locationSharing: boolean
}
