import type { WeddingStatePayload } from '~/types/cloud'

export function useWeddingCloudSync() {
  const guestStore = useGuestStore()
  const seatingStore = useSeatingStore()
  const weddingStore = useWeddingStore()
  const config = useRuntimeConfig()

  const loading = ref(false)
  const error = ref('')
  const lastSyncedAt = ref('')

  const weddingId = computed(() => weddingStore.wedding.id || config.public.defaultWeddingId)

  async function loadFromCloud() {
    loading.value = true
    error.value = ''
    try {
      const state = await $fetch<WeddingStatePayload>('/api/v1/wedding-state', {
        query: { weddingId: weddingId.value }
      })
      weddingStore.replaceWedding(state.wedding)
      guestStore.replaceGuests(state.guests)
      seatingStore.replaceState({
        tables: state.tables,
        seats: state.seats,
        layoutItems: state.layoutItems
      })
      lastSyncedAt.value = new Date().toLocaleString()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '云端加载失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function saveToCloud() {
    loading.value = true
    error.value = ''
    try {
      const result = await $fetch<{ ok: boolean; savedAt: string }>('/api/v1/wedding-state', {
        method: 'PUT',
        body: {
          wedding: weddingStore.wedding,
          guests: guestStore.guests,
          tables: seatingStore.tables,
          seats: seatingStore.seats,
          layoutItems: seatingStore.layoutItems
        } satisfies WeddingStatePayload
      })
      seatingStore.markSaved()
      weddingStore.touch(result.savedAt)
      lastSyncedAt.value = new Date(result.savedAt).toLocaleString()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '云端保存失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    lastSyncedAt,
    loadFromCloud,
    saveToCloud
  }
}
