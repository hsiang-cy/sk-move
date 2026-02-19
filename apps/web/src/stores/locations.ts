import { ref } from 'vue'
import { defineStore } from 'pinia'
import { locationsService } from '@/services/locations'
import type { Location } from '@/types'

export const useLocationsStore = defineStore('locations', () => {
  const locations = ref<Location[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      locations.value = await locationsService.getAll()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '載入失敗'
    } finally {
      loading.value = false
    }
  }

  async function create(data: Omit<Location, 'id'>) {
    const created = await locationsService.create(data)
    locations.value.push(created)
    return created
  }

  async function update(id: string, data: Omit<Location, 'id'>) {
    const updated = await locationsService.update(id, data)
    const index = locations.value.findIndex((l) => l.id === id)
    if (index !== -1) locations.value[index] = updated
    return updated
  }

  async function remove(id: string) {
    await locationsService.remove(id)
    locations.value = locations.value.filter((l) => l.id !== id)
  }

  return { locations, loading, error, fetchAll, create, update, remove }
})
