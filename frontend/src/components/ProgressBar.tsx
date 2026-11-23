import { clsx } from 'clsx'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const colorClasses = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

export function ProgressBar({ value, max = 100, className, showLabel = false, size = 'md', color }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const autoColor = pct >= 80 ? 'success' : pct >= 50 ? 'primary' : pct >= 25 ? 'warning' : 'danger'
  const barColor = color ?? autoColor

  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx('w-full bg-border rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}>
        <div
          className={clsx('h-full rounded-full transition-all duration-300', colorClasses[barColor])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-secondary-text mt-1">{Math.round(pct)}%</span>
      )}
    </div>
  )
}
