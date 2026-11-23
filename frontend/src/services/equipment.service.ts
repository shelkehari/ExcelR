import api from './api'
import type { Equipment } from '../types'

export const equipmentService = {
  getAll: () => api.get<Equipment[]>('/equipment').then(r => r.data),
  create: (data: Partial<Equipment>) => api.post<Equipment>('/equipment', data).then(r => r.data),
  update: (id: number, data: Partial<Equipment>) => api.put<Equipment>(`/equipment/${id}`, data).then(r => r.data),
  assignToProject: (equipmentId: number, projectId: number) =>
    api.post<Equipment>(`/equipment/${equipmentId}/assign`, null, { params: { projectId } }).then(r => r.data),
  release: (equipmentId: number) => api.post<Equipment>(`/equipment/${equipmentId}/release`).then(r => r.data),
  scheduleMaintenance: (equipmentId: number, data: { description: string; scheduledDate: string }) =>
    api.post(`/equipment/${equipmentId}/maintenance`, { maintenanceType: 'SCHEDULED', ...data }).then(r => r.data),
}
