import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WishlistItem } from '@/types'

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: Omit<WishlistItem, 'savedAt'>) => void
  removeItem: (id: string) => void
  hasItem: (id: string) => boolean
  clearAll: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((s) => ({
          items: s.items.find((x) => x.id === item.id)
            ? s.items
            : [{ ...item, savedAt: new Date().toISOString() }, ...s.items],
        })),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      hasItem: (id) => get().items.some((x) => x.id === id),
      clearAll: () => set({ items: [] }),
    }),
    { name: 'figo-wishlist' }
  )
)
