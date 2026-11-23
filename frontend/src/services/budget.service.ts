import api from './api'
import type { Expense, BudgetSummary } from '../types'

export const budgetService = {
  getProjectExpenses: (projectId: number) =>
    api.get<Expense[]>(`/budget/projects/${projectId}/expenses`).then(r => r.data),
  getBudgetSummary: (projectId: number) =>
    api.get<BudgetSummary>(`/budget/projects/${projectId}/summary`).then(r => r.data),
  recordExpense: (data: Partial<Expense>) => api.post<Expense>('/budget/expenses', data).then(r => r.data),
  updateExpense: (id: number, data: Partial<Expense>) =>
    api.put<Expense>(`/budget/expenses/${id}`, data).then(r => r.data),
  deleteExpense: (id: number) => api.delete(`/budget/expenses/${id}`),
}
