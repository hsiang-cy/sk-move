import api from './api'
import type { Vehicle } from '@/types'

export const vehiclesService = {
  async getAll(): Promise<Vehicle[]> {
    const response = await api.get<Vehicle[]>('/vehicles')
    return response.data
  },

  async create(data: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const response = await api.post<Vehicle>('/vehicles', data)
    return response.data
  },

  async update(id: string, data: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const response = await api.put<Vehicle>(`/vehicles/${id}`, data)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`)
  },
}
