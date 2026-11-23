import api from './api'
import type { DashboardData, Notification } from '../types'

export const dashboardService = {
  getDashboard: () => api.get<DashboardData>('/dashboard').then(r => r.data),
  getNotifications: () => api.get<Notification[]>('/dashboard/notifications').then(r => r.data),
  getUnreadCount: () => api.get<number>('/dashboard/notifications/unread-count').then(r => r.data),
  markAsRead: (id: number) => api.post(`/dashboard/notifications/${id}/read`),
  markAllRead: () => api.post('/dashboard/notifications/read-all'),
}
