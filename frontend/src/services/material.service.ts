import api from './api'
import type { Material, MaterialTransaction } from '../types'

export const materialService = {
  getAll: () => api.get<Material[]>('/materials').then(r => r.data),
  getById: (id: number) => api.get<Material>(`/materials/${id}`).then(r => r.data),
  create: (data: Partial<Material>) => api.post<Material>('/materials', data).then(r => r.data),
  update: (id: number, data: Partial<Material>) => api.put<Material>(`/materials/${id}`, data).then(r => r.data),
  recordTransaction: (data: Partial<MaterialTransaction>) =>
    api.post<MaterialTransaction>('/materials/transactions', data).then(r => r.data),
  getProjectTransactions: (projectId: number) =>
    api.get<MaterialTransaction[]>(`/materials/projects/${projectId}/transactions`).then(r => r.data),
  getLowStock: () => api.get<Material[]>('/materials/low-stock').then(r => r.data),
}
