import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, Users, Boxes, Wrench,
  DollarSign, ClipboardCheck, BarChart3, Bell, Settings,
  ChevronLeft, ChevronRight, HardHat, LogOut, AlertTriangle,
  Calendar, UserCheck
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { clsx } from 'clsx'
import { NotificationPanel } from '../components/NotificationPanel'

const navGroups = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    label: 'Projects',
    items: [
      { to: '/projects', icon: FolderKanban, label: 'All Projects' },
      { to: '/milestones', icon: Calendar, label: 'Milestones' },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { to: '/workers', icon: Users, label: 'Workers' },
      { to: '/attendance', icon: UserCheck, label: 'Attendance' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { to: '/materials', icon: Boxes, label: 'Materials' },
      { to: '/equipment', icon: Wrench, label: 'Equipment' },
    ],
  },
  {
    label: 'Finance',
    items: [{ to: '/budget', icon: DollarSign, label: 'Budget & Expenses' }],
  },
  {
    label: 'Site Operations',
    items: [{ to: '/inspections', icon: ClipboardCheck, label: 'Inspections' }],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/delay-prediction', icon: AlertTriangle, label: 'Delay Prediction' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/notifications', icon: Bell, label: 'Notifications' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export default function MainLayout() {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={clsx(
        'relative flex flex-col bg-surface border-r border-border transition-all duration-200 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <HardHat className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary-text leading-tight">ConstructPM</p>
              <p className="text-xs text-secondary-text">Project Platform</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {navGroups.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-2 mb-1 text-xs font-semibold text-secondary-text/60 uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors',
                      collapsed && 'justify-center',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-secondary-text hover:bg-border/50 hover:text-primary-text'
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3">
          {!collapsed && user && (
            <div className="flex items-center gap-2 mb-2 px-1">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{user.name[0]}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-primary-text truncate">{user.name}</p>
                <p className="text-xs text-secondary-text truncate">{user.role.replace(/_/g, ' ')}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            title={collapsed ? 'Logout' : undefined}
            className={clsx(
              'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-secondary-text hover:text-danger hover:bg-danger/5 transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center hover:bg-border/50 transition-colors z-10 shadow-soft"
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3 text-secondary-text" />
            : <ChevronLeft className="w-3 h-3 text-secondary-text" />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-surface border-b border-border px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotifOpen(true)}
              className="p-2 rounded-lg hover:bg-border/50 transition-colors"
            >
              <Bell className="w-4 h-4 text-secondary-text" />
            </button>
            {user && (
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">{user.name[0]}</span>
                  </div>
                )}
                <span className="text-sm font-medium text-primary-text hidden sm:block">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  )
}
