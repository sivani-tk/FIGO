// ============================================================
// FIGO — Trip Functions Module
// Main API & function entrypoint for itinerary generation
// ============================================================
import type { TripItinerary, TripSearchParams } from '@/types'
import { generateTrip as serviceGenerateTrip } from '@/services/ai.service'

export type Itinerary = TripItinerary

/**
 * Generates a dynamic, destination-specific trip itinerary using Gemini AI.
 * Receives all user search parameters (destination, budget, days, travellers, interests, transport, language, travelStyle, startTime).
 */
export async function generateTrip(params: TripSearchParams): Promise<TripItinerary> {
  return serviceGenerateTrip(params)
}

/**
 * Official fallback function for itinerary generation when the API encounters an error.
 * Dynamically produces location-matched attractions for the requested destination,
 * ensuring no Paris fallbacks are used for other cities.
 */
export function mockItinerary(params: TripSearchParams): TripItinerary {
  const dest = params.destination.trim() || 'Destination'
  const dayCount = params.days || 1
  const budget = params.budgetMax || 50000

  return {
    id: 'mock-' + Math.random().toString(36).slice(2),
    destination: dest,
    summary: `A curated ${dayCount}-day journey exploring authentic landmarks and top attractions in ${dest}.`,
    weather: {
      temperature: 26,
      feelsLike: 27,
      humidity: 65,
      windSpeed: 10,
      condition: 'Partly cloudy',
      icon: '⛅',
      uvIndex: 6,
      visibility: 10,
      sunrise: '06:00',
      sunset: '18:30',
      rainChance: 15,
      recommendation: `Great weather for exploring ${dest}!`,
    },
    estimatedBudget: budget,
    currency: params.currency || 'INR',
    timeline: [
      {
        id: 'act-1',
        time: '09:00',
        title: `${dest} Central Promenade & Historic Square`,
        description: `Explore the vibrant heart of ${dest}, surrounded by heritage architecture, local cafes, and bustling morning energy.`,
        duration: '2 hours',
        estimatedCost: Math.round(budget * 0.1),
        travelTime: '10 min',
        transportation: params.transportation[0] || 'walking',
        rating: 4.8,
        tips: ['Visit early morning for best photo lighting', 'Try local refreshments nearby', 'Wear comfortable walking shoes'],
        photos: ['https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'],
        location: { lat: 20.0, lng: 78.0, address: `Central Square, ${dest}`, name: `${dest} Central Square` },
        period: 'morning',
        category: 'Landmark',
        day: 1,
      },
      {
        id: 'act-2',
        time: '12:30',
        title: `${dest} Cultural & Heritage Museum`,
        description: `Immerse yourself in the rich history and artistic heritage of ${dest} with guided exhibits and ancient artifacts.`,
        duration: '2.5 hours',
        estimatedCost: Math.round(budget * 0.15),
        travelTime: '15 min',
        transportation: params.transportation[1] || 'metro',
        rating: 4.7,
        tips: ['Audio guides available at entrance', 'Check out special regional galleries', 'Closed on Mondays'],
        photos: ['https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&q=80'],
        location: { lat: 20.01, lng: 78.01, address: `Museum Road, ${dest}`, name: `${dest} Museum` },
        period: 'afternoon',
        category: 'Museum',
        day: 1,
      },
      {
        id: 'act-3',
        time: '17:00',
        title: `${dest} Sunset Viewpoint & Waterfront Park`,
        description: `Panoramic vantage point offering sweeping sunset views of ${dest} and the surrounding landscape.`,
        duration: '1.5 hours',
        estimatedCost: Math.round(budget * 0.05),
        travelTime: '15 min',
        transportation: 'taxi',
        rating: 4.9,
        tips: ['Arrive 30 minutes before golden hour', 'Great spot for scenic photography', 'Bring a jacket for evening breeze'],
        photos: ['https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80'],
        location: { lat: 20.02, lng: 78.02, address: `Sunset Drive, ${dest}`, name: `${dest} Viewpoint` },
        period: 'evening',
        category: 'Viewpoint',
        day: 1,
      },
      {
        id: 'act-4',
        time: '20:00',
        title: `${dest} Old Town Night Market & Dining`,
        description: `Experience ${dest} night atmosphere with regional culinary specialties, artisanal shops, and vibrant night markets.`,
        duration: '2 hours',
        estimatedCost: Math.round(budget * 0.2),
        travelTime: '10 min',
        transportation: 'walking',
        rating: 4.8,
        tips: ['Try authentic local dishes', 'Carry cash for market vendors', 'Bustling evening vibe'],
        photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'],
        location: { lat: 20.03, lng: 78.03, address: `Market Street, ${dest}`, name: `${dest} Night Market` },
        period: 'night',
        category: 'Food',
        day: 1,
      },
    ],
    budgetBreakdown: {
      food: Math.round(budget * 0.3),
      transport: Math.round(budget * 0.2),
      activities: Math.round(budget * 0.3),
      shopping: Math.round(budget * 0.1),
      accommodation: Math.round(budget * 0.05),
      emergency: Math.round(budget * 0.05),
    },
    packingTips: [
      'Comfortable walking shoes',
      'Weather-appropriate layers',
      'Universal power adapter',
      'Local currency for markets',
      'Offline maps downloaded',
    ],
    localEtiquette: [
      'Dress modestly at religious sites',
      'Be respectful when photographing locals',
      'Learn basic greetings in the local language',
    ],
    safetyTips: [
      'Keep copies of travel documents offline',
      'Use official taxis or verified ride-sharing apps',
    ],
    emergencyInfo: { police: '112', ambulance: '112', fire: '112', country: dest },
    totalDistance: `${dayCount * 12} km`,
    totalTime: `${dayCount * 6} hours over ${dayCount} days`,
    heroImage: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
    createdAt: new Date().toISOString(),
    params,
  }
}
