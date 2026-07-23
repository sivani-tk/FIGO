import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TripItinerary, TripSearchParams } from '@/types'

interface TripStore {
  searchParams: TripSearchParams | null
  currentTrip: TripItinerary | null
  isGenerating: boolean
  savedTrips: TripItinerary[]
  setSearchParams: (p: TripSearchParams) => void
  setCurrentTrip: (t: TripItinerary) => void
  setGenerating: (v: boolean) => void
  saveTrip: (t: TripItinerary) => void
  removeTrip: (id: string) => void
  clearCurrent: () => void
}

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      searchParams: null,
      currentTrip: null,
      isGenerating: false,
      savedTrips: [],
      setSearchParams: (p) => set({ searchParams: p }),
      setCurrentTrip: (t) => set({ currentTrip: t }),
      setGenerating: (v) => set({ isGenerating: v }),
      saveTrip: (t) =>
        set((s) => ({
          savedTrips: s.savedTrips.find((x) => x.id === t.id)
            ? s.savedTrips
            : [t, ...s.savedTrips],
        })),
      removeTrip: (id) =>
        set((s) => ({ savedTrips: s.savedTrips.filter((x) => x.id !== id) })),
      clearCurrent: () => set({ currentTrip: null, searchParams: null }),
    }),
    { name: 'figo-trips' }
  )
)
