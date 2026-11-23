import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { dashboardService } from '../services/dashboard.service'
import type { Notification } from '../types'
import { formatDate } from '../utils/format'
import { clsx } from 'clsx'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const priorityColor: Record<string, string> = {
  CRITICAL: 'bg-danger',
  HIGH: 'bg-warning',
  MEDIUM: 'bg-primary',
  LOW: 'bg-secondary-text',
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    dashboardService.getNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id: number) => {
    await dashboardService.markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAll = async () => {
    await dashboardService.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  if (loading) return <LoadingSpinner />

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary-text">Notifications</h1>
          <p className="text-sm text-secondary-text mt-0.5">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAll} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              filter === f ? 'border-primary text-primary' : 'border-transparent text-secondary-text hover:text-primary-text'
            }`}>
            {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Bell className="w-8 h-8 text-secondary-text mx-auto mb-3 opacity-30" />
          <p className="text-secondary-text text-sm">No {filter === 'unread' ? 'unread ' : ''}notifications</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={clsx(
                'flex items-start gap-4 px-5 py-4 border-b border-border/50 last:border-0 transition-colors',
                !n.read ? 'bg-primary/5 cursor-pointer hover:bg-primary/10' : 'hover:bg-background'
              )}
            >
              <div className={clsx('w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0', priorityColor[n.priority])} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={clsx('text-sm', !n.read ? 'font-semibold text-primary-text' : 'font-medium text-secondary-text')}>
                    {n.title}
                  </p>
                  <span className="text-xs text-secondary-text/60 flex-shrink-0">{formatDate(n.createdAt)}</span>
                </div>
                <p className="text-sm text-secondary-text mt-0.5 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs px-2 py-0.5 bg-border/50 rounded-full text-secondary-text">{n.priority}</span>
                  {!n.read && <span className="text-xs text-primary">• Unread</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
