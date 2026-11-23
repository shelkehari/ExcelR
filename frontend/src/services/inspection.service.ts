import api from './api'
import type { SiteInspection } from '../types'

export const inspectionService = {
  getAll: () => api.get<SiteInspection[]>('/inspections').then(r => r.data),
  getById: (id: number) => api.get<SiteInspection>(`/inspections/${id}`).then(r => r.data),
  getByProject: (projectId: number) =>
    api.get<SiteInspection[]>(`/inspections/projects/${projectId}`).then(r => r.data),
  create: (data: Partial<SiteInspection>) => api.post<SiteInspection>('/inspections', data).then(r => r.data),
  update: (id: number, data: Partial<SiteInspection>) =>
    api.put<SiteInspection>(`/inspections/${id}`, data).then(r => r.data),
}
