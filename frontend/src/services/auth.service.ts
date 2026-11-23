import api from './api'
import type { User } from '../types'

export const authService = {
  getMe: () => api.get<User>('/auth/me').then(r => r.data),
  getAllUsers: () => api.get<User[]>('/auth/users').then(r => r.data),
  getGoogleLoginUrl: () => '/api/auth/oauth2/authorize/google',
}
