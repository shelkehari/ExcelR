import { useAuth } from '../contexts/AuthContext'
import { HardHat, User, Shield } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-primary-text">Settings</h1>
        <p className="text-sm text-secondary-text mt-0.5">Account and platform settings</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-primary-text">Profile</h3>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-semibold text-primary">{user.name[0]}</span>
              </div>
            )}
            <div>
              <p className="font-semibold text-primary-text">{user.name}</p>
              <p className="text-sm text-secondary-text">{user.email}</p>
              <p className="text-xs text-secondary-text mt-0.5">{user.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-primary-text">Role & Permissions</h3>
        </div>
        <div className="space-y-2 text-sm">
          {[
            { role: 'ADMIN', perms: 'Full access to all modules, user management, analytics' },
            { role: 'PROJECT_MANAGER', perms: 'Manage projects, budgets, workforce allocation' },
            { role: 'SITE_ENGINEER', perms: 'Update progress, submit inspections, record issues' },
            { role: 'SITE_SUPERVISOR', perms: 'Monitor activities, manage attendance, report progress' },
            { role: 'ACCOUNTANT', perms: 'View and record expenses, financial reports' },
            { role: 'INVENTORY_MANAGER', perms: 'Manage materials, track stock, record transactions' },
          ].map(item => (
            <div key={item.role} className={`flex items-start gap-3 p-3 rounded-lg ${user?.role === item.role ? 'bg-primary/5 border border-primary/20' : 'bg-background'}`}>
              <span className={`text-xs font-mono px-2 py-0.5 rounded flex-shrink-0 ${user?.role === item.role ? 'bg-primary text-white' : 'bg-border text-secondary-text'}`}>
                {item.role}
              </span>
              <span className="text-secondary-text text-xs">{item.perms}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <HardHat className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-primary-text">Platform Info</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Platform', value: 'ConstructPM' },
            { label: 'Version', value: '1.0.0' },
            { label: 'Backend', value: 'Spring Boot 3.x / Java 21' },
            { label: 'Database', value: 'MySQL 8' },
            { label: 'Authentication', value: 'Google OAuth 2.0 + JWT' },
            { label: 'Delay Model', value: 'Rule-Based Estimation' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs text-secondary-text">{item.label}</p>
              <p className="font-medium text-primary-text">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
