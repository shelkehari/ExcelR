export function formatCurrency(value: number | undefined | null): string {
  if (value == null) return '$0'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function formatDate(date: string | undefined | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatNumber(value: number | undefined | null): string {
  if (value == null) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'short' })
}

export function daysUntil(date: string): number {
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function budgetUtilization(expenses: number, budget: number): number {
  if (!budget) return 0
  return Math.min(100, Math.round((expenses / budget) * 100))
}
