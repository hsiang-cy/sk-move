import api from './api'
import type { VehicleType } from '@/types'

export const vehicleTypesService = {
  async getAll(): Promise<VehicleType[]> {
    const response = await api.get<VehicleType[]>('/vehicle-types')
    return response.data
  },

  async create(data: Omit<VehicleType, 'id'>): Promise<VehicleType> {
    const response = await api.post<VehicleType>('/vehicle-types', data)
    return response.data
  },

  async update(id: string, data: Omit<VehicleType, 'id'>): Promise<VehicleType> {
    const response = await api.put<VehicleType>(`/vehicle-types/${id}`, data)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/vehicle-types/${id}`)
  },
}
