// ============================================================
// FIGO — AI Trip Generation Service
// Supports: OpenAI GPT-4o (with key) + rich multi-day mock fallback
// ============================================================
import axios from 'axios'
import type { TripItinerary, TripSearchParams, Activity, WeatherData } from '@/types'
import { getWeatherByCity, getMockWeather } from './weather.service'
import { getDestinationImage } from './images.service'

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─── Emergency Info ──────────────────────────────────────────
const EMERGENCY_INFO: Record<string, { police: string; ambulance: string; fire: string; touristPolice?: string }> = {
  IN: { police: '100', ambulance: '108', fire: '101', touristPolice: '1800-111-363' },
  FR: { police: '17', ambulance: '15', fire: '18', touristPolice: '3430' },
  JP: { police: '110', ambulance: '119', fire: '119' },
  AE: { police: '999', ambulance: '998', fire: '997' },
  GB: { police: '999', ambulance: '999', fire: '999' },
  US: { police: '911', ambulance: '911', fire: '911' },
  IT: { police: '113', ambulance: '118', fire: '115', touristPolice: '06-46861' },
  ES: { police: '091', ambulance: '112', fire: '080' },
  AU: { police: '000', ambulance: '000', fire: '000' },
  SG: { police: '999', ambulance: '995', fire: '995' },
  TH: { police: '191', ambulance: '1669', fire: '199' },
  ID: { police: '110', ambulance: '118', fire: '113' },
  DEFAULT: { police: '112', ambulance: '112', fire: '112' },
}

function getEmergencyInfo(destination: string) {
  const d = destination.toLowerCase()
  const autoCode =
    d.includes('india') || d.includes('mumbai') || d.includes('delhi') || d.includes('goa') || d.includes('kerala') ? 'IN' :
    d.includes('paris') || d.includes('france') ? 'FR' :
    d.includes('tokyo') || d.includes('japan') || d.includes('kyoto') || d.includes('osaka') ? 'JP' :
    d.includes('dubai') || d.includes('uae') || d.includes('abu dhabi') ? 'AE' :
    d.includes('london') || d.includes('england') || d.includes('uk') ? 'GB' :
    d.includes('new york') || d.includes('usa') || d.includes('los angeles') ? 'US' :
    d.includes('rome') || d.includes('italy') || d.includes('milan') || d.includes('venice') ? 'IT' :
    d.includes('barcelona') || d.includes('madrid') || d.includes('spain') ? 'ES' :
    d.includes('sydney') || d.includes('australia') || d.includes('melbourne') ? 'AU' :
    d.includes('singapore') ? 'SG' :
    d.includes('bangkok') || d.includes('thailand') || d.includes('phuket') ? 'TH' :
    d.includes('bali') || d.includes('indonesia') || d.includes('jakarta') ? 'ID' : 'DEFAULT'
  return { ...(EMERGENCY_INFO[autoCode] ?? EMERGENCY_INFO.DEFAULT), country: destination }
}

// ─── City Data ───────────────────────────────────────────────
interface CitySlots {
  slots: string[][]  // [morning, afternoon, evening, night][]
  lat: number
  lng: number
}

const CITY_DATA: Record<string, CitySlots> = {
  paris: {
    lat: 48.8566, lng: 2.3522,
    slots: [
      ['Eiffel Tower at Dawn', 'Louvre Museum', 'Seine River Cruise', 'Moulin Rouge Show'],
      ['Montmartre & Sacré-Cœur', 'Musée d\'Orsay', 'Marais Neighbourhood Walk', 'Bistro Dinner at St-Germain'],
      ['Palace of Versailles', 'Champs-Élysées Shopping', 'Arc de Triomphe Sunset', 'Latin Quarter Night Tour'],
    ],
  },
  tokyo: {
    lat: 35.6762, lng: 139.6503,
    slots: [
      ['Senso-ji Temple at Dawn', 'Shibuya Crossing', 'Shinjuku Night Market', 'Izakaya Dinner'],
      ['Harajuku & Meiji Shrine', 'Akihabara Electric Town', 'Odaiba Waterfront', 'Golden Gai Bar Hopping'],
      ['Tsukiji Fish Market Breakfast', 'teamLab Digital Art Museum', 'Ueno Park & Museum', 'Kabuki-za Theatre Show'],
    ],
  },
  dubai: {
    lat: 25.2048, lng: 55.2708,
    slots: [
      ['Burj Khalifa Sunrise View', 'Dubai Mall & Fountain Show', 'Dubai Creek Dhow Cruise', 'Desert Safari & BBQ'],
      ['Jumeirah Beach & Mosque', 'Gold & Spice Souk', 'Dubai Frame Sunset', 'Rooftop Dining at DIFC'],
      ['Miracle Garden Visit', 'Ferrari World Day Trip', 'Dubai Marina Yacht Cruise', 'Burj Al Arab Night View'],
    ],
  },
  london: {
    lat: 51.5074, lng: -0.1278,
    slots: [
      ['Tower of London', 'British Museum', 'Thames River Walk', 'West End Show'],
      ['Buckingham Palace & Guards', 'National Gallery', 'Borough Market Lunch', 'Shoreditch Street Art Tour'],
      ['Greenwich Royal Observatory', 'Kew Gardens', 'Notting Hill Exploration', 'Jazz at Ronnie Scott\'s'],
    ],
  },
  rome: {
    lat: 41.9028, lng: 12.4964,
    slots: [
      ['Colosseum & Roman Forum', 'Vatican Museums', 'Trastevere Food Tour', 'Rooftop Bar Aperitivo'],
      ['Pantheon & Piazza Navona', 'Borghese Gallery', 'Campo de\' Fiori Market', 'Gnocchi di Giovedì Dinner'],
      ['Ostia Antica Day Trip', 'Aventine Hill & Keyhole', 'Testaccio Food Market', 'Gelato Tasting Tour'],
    ],
  },
  'new york': {
    lat: 40.7128, lng: -74.0060,
    slots: [
      ['Central Park Morning Run', 'Metropolitan Museum', 'Brooklyn Bridge Walk', 'Broadway Show'],
      ['Statue of Liberty & Ellis Island', 'High Line Park', 'Chelsea Market Lunch', 'Rooftop Bar at Sunset'],
      ['Times Square at Night', 'MOMA Art Museum', 'Little Italy & Chinatown', 'Jazz Club in Harlem'],
    ],
  },
  bali: {
    lat: -8.3405, lng: 115.0920,
    slots: [
      ['Tanah Lot Temple Sunrise', 'Ubud Rice Terraces', 'Kecak Fire Dance', 'Seminyak Beach Bar'],
      ['Mount Batur Sunrise Hike', 'Tegallalang Rice Terrace', 'Ubud Cooking Class', 'Canggu Night Scene'],
      ['Uluwatu Cliffside Temple', 'Nusa Dua Beach Club', 'Traditional Spa & Massage', 'Fire Dance Dinner Show'],
    ],
  },
  singapore: {
    lat: 1.3521, lng: 103.8198,
    slots: [
      ['Gardens by the Bay Morning', 'National Museum of Singapore', 'Chinatown Food Trail', 'Marina Bay Sands Rooftop'],
      ['Sentosa Island & Beach', 'Universal Studios', 'Clarke Quay Riverside Lunch', 'Singapore Flyer at Sunset'],
      ['Hawker Centre Breakfast', 'Little India & Arab Street', 'Botanic Garden Orchid Walk', 'Spectra Light & Water Show'],
    ],
  },
  barcelona: {
    lat: 41.3851, lng: 2.1734,
    slots: [
      ['Sagrada Família Morning', 'Park Güell', 'La Boqueria Market Lunch', 'Flamenco Show'],
      ['Gothic Quarter Walk', 'Picasso Museum', 'Barceloneta Beach', 'Tapas Bar Crawl'],
      ['Camp Nou Stadium Tour', 'Tibidabo Amusement Park', 'El Born Neighbourhood', 'Rooftop Cocktails'],
    ],
  },
  amsterdam: {
    lat: 52.3676, lng: 4.9041,
    slots: [
      ['Rijksmuseum Opening', 'Anne Frank House', 'Canal Boat Tour', 'Leidseplein Evening'],
      ['Van Gogh Museum', 'Jordaan Neighbourhood Stroll', 'Heineken Experience', 'Red Light District Walk'],
      ['Keukenhof Tulip Gardens', 'Vondelpark Picnic', 'De Pijp Market', 'Bitterballen Bar Night'],
    ],
  },
  mumbai: {
    lat: 19.0760, lng: 72.8777,
    slots: [
      ['Marine Drive Sunrise Walk', 'Chhatrapati Shivaji Museum', 'Dharavi Slum Tour', 'Juhu Beach Evening'],
      ['Gateway of India & Elephanta', 'Crawford Market & Colaba Causeway', 'Dhobi Ghat Visit', 'Colaba Nightlife'],
      ['Bandra Bandstand & Linking Rd', 'Film City Tour', 'Worli Sea Link Drive', 'Dal Makhani Dinner at Trishna'],
    ],
  },
  goa: {
    lat: 15.2993, lng: 74.1240,
    slots: [
      ['Basilica of Bom Jesus', 'Old Goa Heritage Walk', 'Calangute Beach Afternoon', 'Anjuna Night Market'],
      ['Dudhsagar Waterfall Trek', 'Spice Plantation Tour', 'Chapora Fort Sunset', 'Beach Shack Seafood Dinner'],
      ['Dolphin Watching Cruise', 'Arambol Beach & Yoga', 'Local Flea Market', 'Beach Bonfire Night'],
    ],
  },
  maldives: {
    lat: 4.1755, lng: 73.5093,
    slots: [
      ['Overwater Bungalow Sunrise', 'Snorkelling Coral Reef', 'Manta Ray Watching', 'Beach Dinner Under Stars'],
      ['Island Hopping Day Trip', 'Dolphin Sunset Cruise', 'Underwater Restaurant', 'Bioluminescent Beach Night'],
      ['Sandbank Picnic', 'Water Sports Adventure', 'Spa in Paradise', 'Stargazing from the Beach'],
    ],
  },
}

// Activity photo pools per category
const PHOTO_POOLS: Record<string, string[]> = {
  Landmark: [
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80',
    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
  ],
  Food: [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
  ],
  Culture: [
    'https://images.unsplash.com/photo-1596422846543-75c6fc197f11?w=400&q=80',
    'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=400&q=80',
  ],
  Experience: [
    'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
  ],
  Entertainment: [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80',
  ],
  Nature: [
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
  ],
}

const PERIODS = ['morning', 'afternoon', 'evening', 'night'] as const
const PERIOD_TIMES = ['08:00', '12:30', '18:00', '21:00']
const CATEGORIES = ['Landmark', 'Food', 'Culture', 'Experience', 'Entertainment', 'Nature']

function getPhoto(category: string, index = 0): string {
  const pool = PHOTO_POOLS[category] ?? PHOTO_POOLS.Landmark
  return pool[index % pool.length]
}

function generateActivitiesForDay(
  destination: string,
  params: TripSearchParams,
  dayIndex: number,
  citySlots: CitySlots
): Activity[] {
  const costMultiplier = params.budgetMax / 10000
  const baseCost = Math.min(Math.max(500, costMultiplier * 200), 8000)
  const { lat, lng } = citySlots

  // Pick 4 slots for this day (cycle through available days)
  const daySlots = citySlots.slots[dayIndex % citySlots.slots.length]

  const activities: Activity[] = PERIODS.map((period, i) => {
    const title = daySlots[i] ?? `${destination} ${period.charAt(0).toUpperCase() + period.slice(1)} Experience`
    const isFoodSlot = i === 1 && dayIndex % 2 === 1 // alternate food slots
    const category = isFoodSlot ? 'Food' : CATEGORIES[Math.floor((i + dayIndex) % CATEGORIES.length)]
    const transport = params.transportation[i % params.transportation.length] ?? 'walking'

    return {
      id: uuid(),
      time: PERIOD_TIMES[i],
      title,
      description: buildActivityDescription(title, destination, period, params),
      duration: i === 1 || i === 3 ? '1.5 hours' : '2 hours',
      estimatedCost: Math.round(baseCost * [1.2, 0.5, 1.0, 1.5][i]),
      travelTime: `${10 + i * 5} min`,
      transportation: transport,
      rating: parseFloat((4.4 + Math.random() * 0.5).toFixed(1)),
      tips: buildTips(title, destination, period),
      photos: [getPhoto(category, dayIndex + i)],
      location: {
        lat: lat + (Math.random() - 0.5) * 0.04,
        lng: lng + (Math.random() - 0.5) * 0.04,
        address: `${title}, ${destination}`,
        name: title,
      },
      period,
      category,
    }
  })

  return activities
}

function buildActivityDescription(title: string, destination: string, period: string, params: TripSearchParams): string {
  const styleNote =
    params.travelStyle === 'luxury' ? 'with premium access and VIP treatment' :
    params.travelStyle === 'backpacking' ? 'on a budget-friendly exploration' :
    params.travelStyle === 'family' ? 'perfect for the whole family' :
    params.travelStyle === 'couple' ? 'a romantic experience for two' :
    'at your own pace'

  const periodNote =
    period === 'morning' ? 'Start your day early to beat the crowds and enjoy the best light.' :
    period === 'afternoon' ? 'The perfect midday escape into local life and culture.' :
    period === 'evening' ? 'As the golden hour descends, immerse yourself in the atmosphere.' :
    'End your day on a high note with this unforgettable evening experience.'

  return `Experience ${title} in ${destination} ${styleNote}. ${periodNote} This is one of the most celebrated highlights of any trip to ${destination}, loved by travellers for its authentic local character.`
}

function buildTips(title: string, _destination: string, period: string): string[] {
  const baseTips = [
    'Book tickets in advance to skip queues',
    'Bring a reusable water bottle',
    `Best visited ${period === 'morning' ? 'early morning for fewer crowds' : period === 'evening' ? 'at golden hour for photos' : 'on weekdays to avoid rush'}`,
  ]
  if (title.toLowerCase().includes('market') || title.toLowerCase().includes('food')) {
    return ['Carry small cash bills', 'Try before you buy', 'Come hungry!']
  }
  if (title.toLowerCase().includes('temple') || title.toLowerCase().includes('mosque') || title.toLowerCase().includes('church')) {
    return ['Dress modestly — cover shoulders and knees', 'Remove shoes at the entrance', 'No photography in sanctuaries']
  }
  return baseTips
}

// ─── OpenAI Prompt Builder ───────────────────────────────────
function buildOpenAIPrompt(params: TripSearchParams): string {
  return `You are FIGO, an expert AI travel planner. Generate a detailed, realistic ${params.days}-day trip itinerary for ${params.destination}.

Trip Context:
- Travellers: ${params.travellers} (${params.travelStyle} style)
- Budget: ₹${params.budgetMin.toLocaleString()} – ₹${params.budgetMax.toLocaleString()} total
- Interests: ${params.interests.join(', ')}
- Preferred transport: ${params.transportation.join(', ')}
- Start time each day: ${params.startTime}
- Language for descriptions: ${params.language}

Return a JSON object matching this exact TypeScript type (no extra fields, no markdown, only raw JSON):
{
  "destination": string,
  "summary": string (2-3 sentences),
  "timeline": Activity[] where each Activity has:
    { "id": string, "time": "HH:MM", "title": string, "description": string (2-3 sentences),
      "duration": string, "estimatedCost": number (INR),
      "travelTime": string, "transportation": string,
      "rating": number (4.0-5.0), "tips": string[3],
      "photos": string[] (empty array),
      "location": { "lat": number, "lng": number, "address": string, "name": string },
      "period": "morning"|"afternoon"|"evening"|"night",
      "category": string, "day": number },
  "budgetBreakdown": { "food": number, "transport": number, "activities": number, "shopping": number, "accommodation": number, "emergency": number },
  "packingTips": string[6],
  "localEtiquette": string[5],
  "safetyTips": string[5],
  "totalDistance": string,
  "totalTime": string
}

Generate ${params.days * 4} activities total (4 per day: morning, afternoon, evening, night). Include a mix of ${params.interests.join(', ')} experiences. All costs must sum to approximately ₹${params.budgetMax}.`
}

// ─── Main Export ─────────────────────────────────────────────
export async function generateTrip(params: TripSearchParams): Promise<TripItinerary> {
  const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY

  if (OPENAI_KEY) {
    try {
      const { data } = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are FIGO, an expert AI travel planner. Always respond with valid JSON only.' },
            { role: 'user', content: buildOpenAIPrompt(params) },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      )

      const parsed = JSON.parse(data.choices[0].message.content)
      const [weatherData, heroImage] = await Promise.all([
        getWeatherByCity(params.destination).catch(() => getMockWeather(params.destination)),
        getDestinationImage(params.destination),
      ])

      return {
        id: uuid(),
        destination: parsed.destination ?? params.destination,
        summary: parsed.summary,
        weather: weatherData,
        estimatedBudget: parsed.budgetBreakdown
          ? Object.values(parsed.budgetBreakdown as Record<string, number>).reduce((a, b) => a + b, 0)
          : params.budgetMax,
        currency: params.currency,
        timeline: (parsed.timeline ?? []).map((a: Activity) => ({ ...a, id: a.id || uuid() })),
        budgetBreakdown: parsed.budgetBreakdown,
        packingTips: parsed.packingTips ?? [],
        localEtiquette: parsed.localEtiquette ?? [],
        safetyTips: parsed.safetyTips ?? [],
        emergencyInfo: getEmergencyInfo(params.destination),
        totalDistance: parsed.totalDistance ?? `${Math.floor(Math.random() * 15 + 8)} km`,
        totalTime: parsed.totalTime ?? `${Math.floor(Math.random() * 3 + 10)} hours`,
        heroImage,
        createdAt: new Date().toISOString(),
        params,
      }
    } catch (err) {
      console.warn('OpenAI trip generation failed, falling back to mock:', err)
      // fallthrough to mock
    }
  }

  return generateMockTrip(params)
}

// ─── Mock Trip Generator (multi-day) ─────────────────────────
async function generateMockTrip(params: TripSearchParams): Promise<TripItinerary> {
  await delay(3000)

  const [weatherData, heroImage] = await Promise.all([
    getWeatherByCity(params.destination).catch(() => getMockWeather(params.destination)),
    getDestinationImage(params.destination),
  ])

  const d = params.destination.toLowerCase()
  const cityEntry = Object.entries(CITY_DATA).find(([k]) => d.includes(k))
  const citySlots: CitySlots = cityEntry
    ? cityEntry[1]
    : {
        lat: 20.5937,
        lng: 78.9629,
        slots: [
          ['Morning Landmark Visit', 'Local Street Food Tour', 'Cultural Centre Evening', 'Traditional Dinner Show'],
          ['Day Trip Excursion', 'Local Market Exploration', 'Scenic Viewpoint Sunset', 'Night Market Stroll'],
          ['Heritage Walk', 'Art Gallery Visit', 'Riverside Evening Walk', 'Rooftop Cocktail Bar'],
        ],
      }

  // Generate activities across all days
  const timeline: Activity[] = []
  for (let day = 0; day < params.days; day++) {
    const dayActivities = generateActivitiesForDay(params.destination, params, day, citySlots)
    // Tag each activity with day number for multi-day display
    dayActivities.forEach((act) => {
      ;(act as Activity & { day?: number }).day = day + 1
    })
    timeline.push(...dayActivities)
  }

  const totalCost = timeline.reduce((s, a) => s + a.estimatedCost, 0)
  const budget = Math.min(totalCost, params.budgetMax)

  return {
    id: uuid(),
    destination: params.destination,
    summary: `Your perfect ${params.days}-day ${params.travelStyle} adventure in ${params.destination} for ${params.travellers} traveller${params.travellers > 1 ? 's' : ''}. We've crafted an itinerary that balances iconic landmarks, authentic local experiences, and hidden gems — all tailored for your ${params.interests.slice(0, 3).join(', ')} interests and optimised for your ₹${(params.budgetMax / 1000).toFixed(0)}K budget.`,
    weather: weatherData,
    estimatedBudget: budget,
    currency: params.currency,
    timeline,
    budgetBreakdown: {
      food: Math.round(budget * 0.28),
      transport: Math.round(budget * 0.18),
      activities: Math.round(budget * 0.30),
      shopping: Math.round(budget * 0.12),
      accommodation: Math.round(budget * 0.07),
      emergency: Math.round(budget * 0.05),
    },
    packingTips: buildPackingTips(params),
    localEtiquette: buildLocalEtiquette(params.destination),
    safetyTips: [
      'Keep your passport in the hotel safe and carry a certified copy',
      'Share your daily itinerary with someone back home',
      'Use official taxis or verified ride-sharing apps',
      'Stay aware of your surroundings in crowded tourist areas',
      'Keep emergency contacts saved offline and enable GPS location',
    ],
    emergencyInfo: getEmergencyInfo(params.destination),
    totalDistance: `${Math.floor(Math.random() * 8 + 6) * params.days} km`,
    totalTime: `${Math.floor(Math.random() * 2 + 9) * params.days} hours over ${params.days} day${params.days > 1 ? 's' : ''}`,
    heroImage,
    createdAt: new Date().toISOString(),
    params,
  }
}

function buildPackingTips(params: TripSearchParams): string[] {
  const base = [
    'Comfortable walking shoes are essential for exploring',
    'Pack a lightweight rain jacket — weather changes fast',
    'Bring a universal power adapter for international outlets',
    'Download offline maps (Maps.me or Google Maps) before leaving',
    'Keep digital and physical copies of all travel documents',
    'Carry local currency in small denominations for markets and tips',
  ]
  if (params.interests.includes('photography')) base.push('Extra SD cards and a portable phone charger for long shooting days')
  if (params.interests.includes('beaches')) base.push('Pack reef-safe sunscreen and a quick-dry towel')
  if (params.travelStyle === 'backpacking') base.push('A padlock for hostel lockers and a money belt for valuables')
  return base.slice(0, 8)
}

function buildLocalEtiquette(destination: string): string[] {
  const d = destination.toLowerCase()
  const isAsia = d.includes('japan') || d.includes('tokyo') || d.includes('bali') || d.includes('india') || d.includes('singapore')
  const isMiddleEast = d.includes('dubai') || d.includes('uae')

  if (isAsia) {
    return [
      'Remove shoes before entering homes, temples and many restaurants',
      'Bow slightly as a greeting — do not initiate a handshake',
      'Use both hands when giving or receiving items, cards or gifts',
      'Avoid pointing with a single finger — use an open hand instead',
      'Dress modestly at religious sites — cover shoulders and knees',
    ]
  }
  if (isMiddleEast) {
    return [
      'Dress conservatively in public — avoid sleeveless tops and short skirts',
      'Public displays of affection are considered disrespectful',
      'Always accept offered tea or coffee — refusing is impolite',
      'Use your right hand for eating, greeting and handing over items',
      'Photography of mosques and locals requires permission',
    ]
  }
  return [
    'Dress modestly when visiting religious sites',
    'Ask permission before photographing locals or their homes',
    'Learn a few basic phrases in the local language — it goes a long way',
    'Tipping customs vary by country — research beforehand',
    'Respect local dining customs and table manners',
  ]
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
