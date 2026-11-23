import api from './api'
import type { Project, Milestone } from '../types'

export interface ProjectRequest {
  name: string
  description?: string
  location: string
  clientName: string
  projectManagerId?: number
  startDate: string
  plannedEndDate: string
  totalBudget: number
  status?: string
}

export const projectService = {
  getAll: () => api.get<Project[]>('/projects').then(r => r.data),
  getById: (id: number) => api.get<Project>(`/projects/${id}`).then(r => r.data),
  create: (data: ProjectRequest) => api.post<Project>('/projects', data).then(r => r.data),
  update: (id: number, data: ProjectRequest) => api.put<Project>(`/projects/${id}`, data).then(r => r.data),
  updateProgress: (id: number, progress: number, notes?: string) =>
    api.patch<Project>(`/projects/${id}/progress`, null, { params: { progress, notes } }).then(r => r.data),
  delete: (id: number) => api.delete(`/projects/${id}`),
  getMilestones: (id: number) => api.get<Milestone[]>(`/projects/${id}/milestones`).then(r => r.data),
  createMilestone: (id: number, data: Partial<Milestone>) =>
    api.post<Milestone>(`/projects/${id}/milestones`, data).then(r => r.data),
  updateMilestone: (milestoneId: number, data: Partial<Milestone>) =>
    api.put<Milestone>(`/projects/milestones/${milestoneId}`, data).then(r => r.data),
}
