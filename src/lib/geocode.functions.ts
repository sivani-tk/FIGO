// ============================================================
// FIGO — Geocoding Functions
// Handles city geocoding & coordinate lookups
// ============================================================
import axios from 'axios'

export interface Coordinates {
  lat: number
  lng: number
  city?: string
  country?: string
}

const CITY_COORDINATES: Record<string, Coordinates> = {
  calicut: { lat: 11.2588, lng: 75.7804, city: 'Calicut', country: 'India' },
  kozhikode: { lat: 11.2588, lng: 75.7804, city: 'Kozhikode', country: 'India' },
  hyderabad: { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', country: 'India' },
  delhi: { lat: 28.6139, lng: 77.2090, city: 'New Delhi', country: 'India' },
  goa: { lat: 15.2993, lng: 74.1240, city: 'Goa', country: 'India' },
  tokyo: { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan' },
  london: { lat: 51.5074, lng: -0.1278, city: 'London', country: 'United Kingdom' },
  dubai: { lat: 25.2048, lng: 55.2708, city: 'Dubai', country: 'United Arab Emirates' },
  'new york': { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'United States' },
  paris: { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France' },
  rome: { lat: 41.9028, lng: 12.4964, city: 'Rome', country: 'Italy' },
  bali: { lat: -8.3405, lng: 115.0920, city: 'Bali', country: 'Indonesia' },
  singapore: { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore' },
  barcelona: { lat: 41.3851, lng: 2.1734, city: 'Barcelona', country: 'Spain' },
  amsterdam: { lat: 52.3676, lng: 4.9041, city: 'Amsterdam', country: 'Netherlands' },
  mumbai: { lat: 19.0760, lng: 72.8777, city: 'Mumbai', country: 'India' },
}

export async function geocodeCity(city: string): Promise<Coordinates> {
  const d = city.toLowerCase().trim()
  const known = Object.entries(CITY_COORDINATES).find(([k]) => d.includes(k) || k.includes(d))
  if (known) return known[1]

  try {
    const res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
    const r = res.data?.results?.[0]
    if (r) {
      return {
        lat: r.latitude,
        lng: r.longitude,
        city: r.name,
        country: r.country,
      }
    }
  } catch { /* ignore */ }

  return { lat: 20.5937, lng: 78.9629, city, country: 'World' }
}

export async function getCoordinates(destination: string): Promise<Coordinates> {
  return geocodeCity(destination)
}
