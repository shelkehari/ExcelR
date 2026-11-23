import type { ReactNode } from 'react'
import { clsx } from 'clsx'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  iconBg?: string
  trend?: { value: number; label: string }
  className?: string
}

export function MetricCard({ title, value, subtitle, icon, iconBg = 'bg-primary/10', trend, className }: MetricCardProps) {
  return (
    <div className={clsx('card flex items-start gap-4', className)}>
      <div className={clsx('p-2.5 rounded-lg flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-secondary-text font-medium">{title}</p>
        <p className="text-2xl font-semibold text-primary-text mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-secondary-text mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={clsx('text-xs mt-1 font-medium', trend.value >= 0 ? 'text-success' : 'text-danger')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  )
}
