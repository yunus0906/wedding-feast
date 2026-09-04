import { createId } from '~/utils/id'

export const useWeddingStore = defineStore('wedding-store', {
  state: () => ({
    wedding: {
      id: createId(),
      name: 'Wedding Feast',
      updatedAt: new Date().toISOString()
    }
  }),
  actions: {
    rename(name: string) {
      this.wedding.name = name
      this.wedding.updatedAt = new Date().toISOString()
    }
  },
  persist: true
})
