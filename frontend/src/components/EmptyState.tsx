import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="p-4 bg-border/50 rounded-full text-secondary-text">
        {icon}
      </div>
      <div>
        <p className="font-medium text-primary-text">{title}</p>
        {description && <p className="text-sm text-secondary-text mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
