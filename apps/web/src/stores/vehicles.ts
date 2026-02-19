import { ref } from 'vue'
import { defineStore } from 'pinia'
import { vehiclesService } from '@/services/vehicles'
import type { Vehicle } from '@/types'

export const useVehiclesStore = defineStore('vehicles', () => {
  const vehicles = ref<Vehicle[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      vehicles.value = await vehiclesService.getAll()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '載入失敗'
    } finally {
      loading.value = false
    }
  }

  async function create(data: Omit<Vehicle, 'id'>) {
    const created = await vehiclesService.create(data)
    vehicles.value.push(created)
    return created
  }

  async function update(id: string, data: Omit<Vehicle, 'id'>) {
    const updated = await vehiclesService.update(id, data)
    const index = vehicles.value.findIndex((v) => v.id === id)
    if (index !== -1) vehicles.value[index] = updated
    return updated
  }

  async function remove(id: string) {
    await vehiclesService.remove(id)
    vehicles.value = vehicles.value.filter((v) => v.id !== id)
  }

  return { vehicles, loading, error, fetchAll, create, update, remove }
})
