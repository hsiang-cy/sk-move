import { ref } from 'vue'
import { defineStore } from 'pinia'
import { vehicleTypesService } from '@/services/vehicleTypes'
import type { VehicleType } from '@/types'

export const useVehicleTypesStore = defineStore('vehicleTypes', () => {
  const types = ref<VehicleType[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      types.value = await vehicleTypesService.getAll()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '載入失敗'
    } finally {
      loading.value = false
    }
  }

  async function create(data: Omit<VehicleType, 'id'>) {
    const created = await vehicleTypesService.create(data)
    types.value.push(created)
    return created
  }

  async function update(id: string, data: Omit<VehicleType, 'id'>) {
    const updated = await vehicleTypesService.update(id, data)
    const index = types.value.findIndex((t) => t.id === id)
    if (index !== -1) types.value[index] = updated
    return updated
  }

  async function remove(id: string) {
    await vehicleTypesService.remove(id)
    types.value = types.value.filter((t) => t.id !== id)
  }

  function getById(id: string): VehicleType | undefined {
    return types.value.find((t) => t.id === id)
  }

  return { types, loading, error, fetchAll, create, update, remove, getById }
})
