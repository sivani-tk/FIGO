// ============================================================
// FIGO — Images Service
// Supports: Unsplash, Pexels, with curated fallback URLs
// ============================================================
import axios from 'axios'

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
const PEXELS_KEY = import.meta.env.VITE_PEXELS_API_KEY

// Curated fallback images from Unsplash (no-auth CDN)
const DESTINATION_IMAGES: Record<string, string[]> = {
  paris: [
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80',
    'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=1200&q=80',
  ],
  tokyo: [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
    'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&q=80',
  ],
  dubai: [
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=1200&q=80',
  ],
  london: [
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
    'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1200&q=80',
  ],
  rome: [
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80',
    'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&q=80',
  ],
  'new york': [
    'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=1200&q=80',
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80',
  ],
  bali: [
    'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1200&q=80',
    'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=80',
  ],
  amsterdam: [
    'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80',
  ],
  barcelona: [
    'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80',
  ],
  singapore: [
    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80',
  ],
  maldives: [
    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80',
  ],
  mumbai: [
    'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1200&q=80',
  ],
  goa: [
    'https://images.unsplash.com/photo-1587922546307-776227941871?w=1200&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
    'https://images.unsplash.com/photo-1501446529957-6226bd447c46?w=1200&q=80',
  ],
}

export function getFallbackImage(destination: string): string {
  const key = destination.toLowerCase()
  const match = Object.entries(DESTINATION_IMAGES).find(([k]) => key.includes(k))
  const images = match ? match[1] : DESTINATION_IMAGES.default
  return images[Math.floor(Math.random() * images.length)]
}

export async function searchUnsplash(query: string): Promise<string> {
  if (UNSPLASH_KEY) {
    try {
      const { data } = await axios.get(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }, timeout: 6000 }
      )
      const results = data.results
      if (results?.length > 0) {
        const idx = Math.floor(Math.random() * Math.min(results.length, 5))
        return results[idx].urls.regular
      }
    } catch { /* fallthrough */ }
  }
  return getFallbackImage(query)
}

export async function searchPexels(query: string): Promise<string> {
  if (PEXELS_KEY) {
    try {
      const { data } = await axios.get(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
        { headers: { Authorization: PEXELS_KEY }, timeout: 6000 }
      )
      if (data.photos?.length > 0) {
        const idx = Math.floor(Math.random() * Math.min(data.photos.length, 5))
        return data.photos[idx].src.large2x
      }
    } catch { /* fallthrough */ }
  }
  return getFallbackImage(query)
}

export async function getDestinationImage(destination: string): Promise<string> {
  if (UNSPLASH_KEY) return searchUnsplash(destination + ' travel landmark')
  if (PEXELS_KEY) return searchPexels(destination + ' travel')
  return getFallbackImage(destination)
}
