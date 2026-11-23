import { useEffect, useState } from 'react'
import { X, Bell, CheckCheck } from 'lucide-react'
import { dashboardService } from '../services/dashboard.service'
import type { Notification } from '../types'
import { formatDate } from '../utils/format'
import { clsx } from 'clsx'

const priorityColor: Record<string, string> = {
  CRITICAL: 'bg-danger',
  HIGH: 'bg-warning',
  MEDIUM: 'bg-primary',
  LOW: 'bg-secondary-text',
}

interface Props { open: boolean; onClose: () => void }

export function NotificationPanel({ open, onClose }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (open) {
      dashboardService.getNotifications().then(setNotifications).catch(() => {})
    }
  }, [open])

  const markRead = async (id: number) => {
    await dashboardService.markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAll = async () => {
    await dashboardService.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-96 bg-surface border-l border-border flex flex-col shadow-medium">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-primary-text text-sm">Notifications</h2>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAll} className="text-xs text-primary hover:underline flex items-center gap-1">
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-border/50">
              <X className="w-4 h-4 text-secondary-text" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-secondary-text">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={clsx(
                  'px-5 py-3.5 border-b border-border/50 cursor-pointer hover:bg-background transition-colors',
                  !n.read && 'bg-primary/5'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', priorityColor[n.priority])} />
                  <div className="flex-1 min-w-0">
                    <p className={clsx('text-sm', !n.read ? 'font-medium text-primary-text' : 'text-secondary-text')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-secondary-text mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-secondary-text/60 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
