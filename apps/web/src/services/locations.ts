import api from './api'
import type { Location } from '@/types'

export const locationsService = {
  async getAll(): Promise<Location[]> {
    const response = await api.get<Location[]>('/locations')
    return response.data
  },

  async create(data: Omit<Location, 'id'>): Promise<Location> {
    const response = await api.post<Location>('/locations', data)
    return response.data
  },

  async update(id: string, data: Omit<Location, 'id'>): Promise<Location> {
    const response = await api.put<Location>(`/locations/${id}`, data)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/locations/${id}`)
  },
}
