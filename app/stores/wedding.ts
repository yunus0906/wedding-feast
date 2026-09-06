import type { Wedding } from '~/types/wedding'

const defaultWeddingId = '00000000-0000-4000-8000-000000000001'

export const useWeddingStore = defineStore('wedding-store', {
  state: () => ({
    wedding: {
      id: defaultWeddingId,
      name: 'Wedding Feast',
      updatedAt: new Date().toISOString()
    }
  }),
  actions: {
    replaceWedding(wedding: Wedding) {
      this.wedding = wedding
    },
    rename(name: string) {
      this.wedding.name = name
      this.wedding.updatedAt = new Date().toISOString()
    },
    touch(updatedAt = new Date().toISOString()) {
      this.wedding.updatedAt = updatedAt
    }
  },
  persist: true
})
