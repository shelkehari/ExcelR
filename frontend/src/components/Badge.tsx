import { clsx } from 'clsx'
import type { ProjectStatus, MilestoneStatus, WorkerStatus, EquipmentStatus, InspectionStatus } from '../types'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-primary/10 text-primary',
  neutral: 'bg-secondary-text/10 text-secondary-text',
}

interface BadgeProps {
  label: string
  variant: BadgeVariant
  className?: string
}

export function Badge({ label, variant, className }: BadgeProps) {
  return (
    <span className={clsx('px-2.5 py-0.5 text-xs font-medium rounded-full', variantClasses[variant], className)}>
      {label}
    </span>
  )
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const map: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
    PLANNING: { label: 'Planning', variant: 'info' },
    IN_PROGRESS: { label: 'In Progress', variant: 'success' },
    ON_HOLD: { label: 'On Hold', variant: 'warning' },
    DELAYED: { label: 'Delayed', variant: 'danger' },
    COMPLETED: { label: 'Completed', variant: 'neutral' },
  }
  const { label, variant } = map[status]
  return <Badge label={label} variant={variant} />
}

export function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  const map: Record<MilestoneStatus, { label: string; variant: BadgeVariant }> = {
    PENDING: { label: 'Pending', variant: 'neutral' },
    IN_PROGRESS: { label: 'In Progress', variant: 'info' },
    COMPLETED: { label: 'Completed', variant: 'success' },
    DELAYED: { label: 'Delayed', variant: 'danger' },
  }
  const { label, variant } = map[status]
  return <Badge label={label} variant={variant} />
}

export function WorkerStatusBadge({ status }: { status: WorkerStatus }) {
  const map: Record<WorkerStatus, { label: string; variant: BadgeVariant }> = {
    AVAILABLE: { label: 'Available', variant: 'success' },
    ASSIGNED: { label: 'Assigned', variant: 'info' },
    ON_LEAVE: { label: 'On Leave', variant: 'warning' },
    ABSENT: { label: 'Absent', variant: 'danger' },
  }
  const { label, variant } = map[status]
  return <Badge label={label} variant={variant} />
}

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  const map: Record<EquipmentStatus, { label: string; variant: BadgeVariant }> = {
    AVAILABLE: { label: 'Available', variant: 'success' },
    IN_USE: { label: 'In Use', variant: 'info' },
    MAINTENANCE: { label: 'Maintenance', variant: 'warning' },
    UNAVAILABLE: { label: 'Unavailable', variant: 'danger' },
  }
  const { label, variant } = map[status]
  return <Badge label={label} variant={variant} />
}

export function InspectionStatusBadge({ status }: { status: InspectionStatus }) {
  const map: Record<InspectionStatus, { label: string; variant: BadgeVariant }> = {
    SCHEDULED: { label: 'Scheduled', variant: 'info' },
    IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
    COMPLETED: { label: 'Completed', variant: 'success' },
    FAILED: { label: 'Failed', variant: 'danger' },
  }
  const { label, variant } = map[status]
  return <Badge label={label} variant={variant} />
}

export function RiskBadge({ risk }: { risk: 'LOW' | 'MEDIUM' | 'HIGH' }) {
  const map = {
    LOW: { label: 'Low Risk', variant: 'success' as BadgeVariant },
    MEDIUM: { label: 'Medium Risk', variant: 'warning' as BadgeVariant },
    HIGH: { label: 'High Risk', variant: 'danger' as BadgeVariant },
  }
  return <Badge label={map[risk].label} variant={map[risk].variant} />
}
