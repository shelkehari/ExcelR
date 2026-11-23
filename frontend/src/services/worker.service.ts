import api from './api'
import type { Worker, WorkerAssignment } from '../types'

export const workerService = {
  getAll: () => api.get<Worker[]>('/workers').then(r => r.data),
  getById: (id: number) => api.get<Worker>(`/workers/${id}`).then(r => r.data),
  create: (data: Partial<Worker>) => api.post<Worker>('/workers', data).then(r => r.data),
  update: (id: number, data: Partial<Worker>) => api.put<Worker>(`/workers/${id}`, data).then(r => r.data),
  assign: (workerId: number, projectId: number, role: string) =>
    api.post<WorkerAssignment>(`/workers/${workerId}/assign`, null, { params: { projectId, role } }).then(r => r.data),
  release: (assignmentId: number) => api.post(`/workers/assignments/${assignmentId}/release`),
  getProjectAssignments: (projectId: number) =>
    api.get<WorkerAssignment[]>(`/workers/projects/${projectId}/assignments`).then(r => r.data),
  recordAttendance: (workerId: number, projectId: number, date: string, status: string, notes?: string) =>
    api.post('/workers/attendance', null, { params: { workerId, projectId, date, status, notes } }).then(r => r.data),
}
