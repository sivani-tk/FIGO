// ============================================================
// FIGO — AI Trip Generation Service
// Mock AI service with structured JSON output
// Future: Replace generateMockTrip with OpenAI API call
// ============================================================
import type { TripItinerary, TripSearchParams, Activity, WeatherData } from '@/types'
import { getWeatherByCity, getMockWeather } from './weather.service'
import { getDestinationImage } from './images.service'

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const EMERGENCY_INFO: Record<string, { police: string; ambulance: string; fire: string; touristPolice?: string }> = {
  IN: { police: '100', ambulance: '108', fire: '101', touristPolice: '1800-111-363' },
  FR: { police: '17', ambulance: '15', fire: '18', touristPolice: '3430' },
  JP: { police: '110', ambulance: '119', fire: '119' },
  AE: { police: '999', ambulance: '998', fire: '997' },
  GB: { police: '999', ambulance: '999', fire: '999' },
  US: { police: '911', ambulance: '911', fire: '911' },
  IT: { police: '113', ambulance: '118', fire: '115', touristPolice: '06-46861' },
  DEFAULT: { police: '112', ambulance: '112', fire: '112' },
}

function getEmergencyInfo(destination: string, countryCode?: string) {
  const key = countryCode ?? 'DEFAULT'
  const info = EMERGENCY_INFO[key] ?? EMERGENCY_INFO.DEFAULT
  const d = destination.toLowerCase()
  const autoCode = d.includes('india') || d.includes('mumbai') || d.includes('delhi') || d.includes('goa') ? 'IN' :
                   d.includes('paris') || d.includes('france') ? 'FR' :
                   d.includes('tokyo') || d.includes('japan') ? 'JP' :
                   d.includes('dubai') || d.includes('uae') ? 'AE' :
                   d.includes('london') ? 'GB' :
                   d.includes('new york') || d.includes('usa') ? 'US' :
                   d.includes('rome') || d.includes('italy') ? 'IT' : 'DEFAULT'
  return { ...(EMERGENCY_INFO[autoCode] ?? info), country: destination }
}

function generateActivities(destination: string, params: TripSearchParams): Activity[] {
  const d = destination.toLowerCase()

  const cityData: Record<string, { morning: string; afternoon: string; evening: string; night: string; lat: number; lng: number }> = {
    paris: { morning: 'Eiffel Tower', afternoon: 'Louvre Museum', evening: 'Seine River Cruise', night: 'Moulin Rouge Show', lat: 48.8566, lng: 2.3522 },
    tokyo: { morning: 'Senso-ji Temple', afternoon: 'Shibuya Crossing', evening: 'Shinjuku Night Market', night: 'Izakaya Dinner', lat: 35.6762, lng: 139.6503 },
    dubai: { morning: 'Burj Khalifa', afternoon: 'Dubai Mall', evening: 'Dubai Creek Dhow Cruise', night: 'Desert Safari', lat: 25.2048, lng: 55.2708 },
    london: { morning: 'Tower of London', afternoon: 'British Museum', evening: 'Thames River Walk', night: 'West End Show', lat: 51.5074, lng: -0.1278 },
    rome: { morning: 'Colosseum', afternoon: 'Vatican Museums', evening: 'Trastevere Food Tour', night: 'Rooftop Bar', lat: 41.9028, lng: 12.4964 },
    'new york': { morning: 'Central Park', afternoon: 'Metropolitan Museum', evening: 'Brooklyn Bridge', night: 'Broadway Show', lat: 40.7128, lng: -74.0060 },
    bali: { morning: 'Tanah Lot Temple', afternoon: 'Ubud Rice Terraces', evening: 'Kecak Dance', night: 'Seminyak Beach Bar', lat: -8.3405, lng: 115.0920 },
  }

  const match = Object.entries(cityData).find(([k]) => d.includes(k))
  const city = match?.[1] ?? { morning: 'Morning Exploration', afternoon: 'City Center Tour', evening: 'Local Market', night: 'Traditional Dinner', lat: 20.5937, lng: 78.9629 }
  const baseLat = city.lat
  const baseLng = city.lng

  const costMultiplier = params.budgetMax / 10000
  const baseCost = Math.min(Math.max(500, costMultiplier * 200), 5000)

  return [
    {
      id: uuid(), time: params.startTime || '08:00', title: city.morning,
      description: `Start your day with an iconic visit to ${city.morning}. The best time to visit is early morning when crowds are minimal and the light is perfect for photos.`,
      duration: '2 hours', estimatedCost: Math.round(baseCost * 1.2), travelTime: '15 min',
      transportation: params.transportation[0] ?? 'metro', rating: 4.8,
      tips: ['Arrive early to beat crowds', 'Book tickets online in advance', 'Wear comfortable shoes'],
      photos: ['https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80'],
      location: { lat: baseLat + 0.01, lng: baseLng + 0.01, address: `${city.morning}, ${destination}`, name: city.morning },
      period: 'morning', category: 'Landmark',
    },
    {
      id: uuid(), time: '10:30', title: 'Local Breakfast Café',
      description: `Discover authentic local flavors at a beloved neighborhood café. Experience the true taste of ${destination} with fresh pastries, local beverages and warm hospitality.`,
      duration: '1 hour', estimatedCost: Math.round(baseCost * 0.4), travelTime: '10 min',
      transportation: 'walking', rating: 4.5,
      tips: ['Try the local specialty', 'Great for people-watching', 'Cash preferred at local spots'],
      photos: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80'],
      location: { lat: baseLat + 0.005, lng: baseLng - 0.008, address: `Old Town, ${destination}`, name: 'Local Café' },
      period: 'morning', category: 'Food',
    },
    {
      id: uuid(), time: '12:00', title: city.afternoon,
      description: `Explore ${city.afternoon} — one of the most celebrated attractions in ${destination}. Immerse yourself in history, art and culture that has shaped this remarkable city.`,
      duration: '3 hours', estimatedCost: Math.round(baseCost * 1.5), travelTime: '20 min',
      transportation: params.transportation[1] ?? 'taxi', rating: 4.9,
      tips: ['Download the audio guide', 'Start from the top floor', 'Gift shop at the exit'],
      photos: ['https://images.unsplash.com/photo-1596422846543-75c6fc197f11?w=400&q=80'],
      location: { lat: baseLat - 0.01, lng: baseLng + 0.02, address: `City Centre, ${destination}`, name: city.afternoon },
      period: 'afternoon', category: 'Culture',
    },
    {
      id: uuid(), time: '15:30', title: 'Street Food & Local Market',
      description: `Dive into the vibrant street food scene and bustling local markets of ${destination}. Sample delicacies, pick up souvenirs, and interact with friendly vendors.`,
      duration: '1.5 hours', estimatedCost: Math.round(baseCost * 0.6), travelTime: '15 min',
      transportation: 'walking', rating: 4.6,
      tips: ['Bring small bills', 'Try before you buy', 'Bargain respectfully'],
      photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'],
      location: { lat: baseLat + 0.02, lng: baseLng - 0.01, address: `Market District, ${destination}`, name: 'Local Market' },
      period: 'afternoon', category: 'Food',
    },
    {
      id: uuid(), time: '18:00', title: city.evening,
      description: `As the golden hour descends on ${destination}, experience ${city.evening} — a magical way to see the city come alive with lights and local culture.`,
      duration: '2 hours', estimatedCost: Math.round(baseCost * 0.8), travelTime: '25 min',
      transportation: params.transportation[0] ?? 'metro', rating: 4.7,
      tips: ['Best views at sunset', 'Book in advance during peak season', 'Dress smart-casual'],
      photos: ['https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&q=80'],
      location: { lat: baseLat - 0.005, lng: baseLng + 0.015, address: `Waterfront, ${destination}`, name: city.evening },
      period: 'evening', category: 'Experience',
    },
    {
      id: uuid(), time: '20:30', title: 'Fine Dining Experience',
      description: `End your perfect day with an unforgettable dinner at a premium local restaurant. Savor authentic cuisine with panoramic views and impeccable service.`,
      duration: '2 hours', estimatedCost: Math.round(baseCost * 2), travelTime: '15 min',
      transportation: 'taxi', rating: 4.8,
      tips: ['Make a reservation', 'Try the chef\'s tasting menu', 'Dress code: smart casual'],
      photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80'],
      location: { lat: baseLat + 0.008, lng: baseLng + 0.008, address: `Restaurant District, ${destination}`, name: 'Premium Restaurant' },
      period: 'night', category: 'Food',
    },
    {
      id: uuid(), time: '23:00', title: city.night,
      description: `The perfect nightcap! Experience ${city.night} — the definitive evening entertainment experience that ${destination} is celebrated for worldwide.`,
      duration: '2 hours', estimatedCost: Math.round(baseCost * 1.5), travelTime: '20 min',
      transportation: 'taxi', rating: 4.9,
      tips: ['Book VIP seating', 'Arrive 15 min early', 'No photography during performance'],
      photos: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80'],
      location: { lat: baseLat - 0.015, lng: baseLng - 0.005, address: `Entertainment District, ${destination}`, name: city.night },
      period: 'night', category: 'Entertainment',
    },
  ]
}

export async function generateTrip(params: TripSearchParams): Promise<TripItinerary> {
  const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY

  if (OPENAI_KEY) {
    try {
      // Future OpenAI integration point
      // const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
      //   model: 'gpt-4o',
      //   messages: [{ role: 'user', content: buildPrompt(params) }],
      //   response_format: { type: 'json_object' },
      // }, { headers: { Authorization: `Bearer ${OPENAI_KEY}` } })
      // return JSON.parse(data.choices[0].message.content)
    } catch { /* fallthrough to mock */ }
  }

  return generateMockTrip(params)
}

async function generateMockTrip(params: TripSearchParams): Promise<TripItinerary> {
  // Simulate AI processing time
  await delay(3500)

  const [weatherData, heroImage] = await Promise.all([
    getWeatherByCity(params.destination).catch(() => getMockWeather(params.destination)),
    getDestinationImage(params.destination),
  ])

  const timeline = generateActivities(params.destination, params)
  const totalCost = timeline.reduce((s, a) => s + a.estimatedCost, 0)
  const budget = params.budgetMax

  return {
    id: uuid(),
    destination: params.destination,
    summary: `Your perfect ${params.days}-day ${params.travelStyle} adventure in ${params.destination}. We've crafted an itinerary that balances iconic landmarks, authentic local experiences, and hidden gems — all optimized for your budget and travel style.`,
    weather: weatherData,
    estimatedBudget: Math.min(totalCost, budget),
    currency: params.currency,
    timeline,
    budgetBreakdown: {
      food: Math.round(totalCost * 0.30),
      transport: Math.round(totalCost * 0.20),
      activities: Math.round(totalCost * 0.30),
      shopping: Math.round(totalCost * 0.10),
      accommodation: Math.round(totalCost * 0.05),
      emergency: Math.round(totalCost * 0.05),
    },
    packingTips: [
      'Comfortable walking shoes are essential',
      'Pack a lightweight rain jacket',
      'Bring a universal power adapter',
      'Download offline maps before leaving',
      'Keep copies of important documents',
      'Carry local currency for street vendors',
    ],
    localEtiquette: [
      'Dress modestly when visiting religious sites',
      'Ask permission before photographing locals',
      'Learn a few basic local phrases',
      'Tipping customs vary — research beforehand',
      'Respect local customs and traditions',
    ],
    safetyTips: [
      'Keep your passport in the hotel safe',
      'Share your itinerary with someone back home',
      'Use official taxis or ride-sharing apps',
      'Stay aware of your surroundings in crowded areas',
      'Keep emergency contacts saved offline',
    ],
    emergencyInfo: {
      ...getEmergencyInfo(params.destination),
      country: params.destination,
    },
    totalDistance: `${Math.floor(Math.random() * 15 + 8)} km`,
    totalTime: `${Math.floor(Math.random() * 3 + 10)} hours`,
    heroImage,
    createdAt: new Date().toISOString(),
    params,
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
