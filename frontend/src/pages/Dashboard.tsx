import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, Users, DollarSign, TrendingUp,
  AlertTriangle, Package, Wrench, ClipboardCheck
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { dashboardService } from '../services/dashboard.service'
import type { DashboardData } from '../types'
import { MetricCard } from '../components/MetricCard'
import { ProjectStatusBadge } from '../components/Badge'
import { ProgressBar } from '../components/ProgressBar'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatCurrency, formatNumber, getMonthName } from '../utils/format'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    dashboardService.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner message="Loading dashboard..." />
  if (!data) return <div className="p-6 text-secondary-text">Failed to load dashboard.</div>

  const monthlyChartData = data.monthlyExpenses.map(m => ({
    month: getMonthName(m.month),
    amount: Number(m.amount),
  }))

  const projectProgressData = data.recentProjects.map(p => ({
    name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
    progress: p.progressPercentage,
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-primary-text">Dashboard</h1>
        <p className="text-sm text-secondary-text mt-0.5">Construction operations overview</p>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${
              alert.severity === 'HIGH' ? 'bg-danger/5 border-danger/20 text-danger' :
              alert.severity === 'MEDIUM' ? 'bg-warning/5 border-warning/20 text-warning' :
              'bg-primary/5 border-primary/20 text-primary'
            }`}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Projects"
          value={formatNumber(data.totalProjects)}
          subtitle={`${data.activeProjects} active`}
          icon={<FolderKanban className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/10"
        />
        <MetricCard
          title="Total Workforce"
          value={formatNumber(data.totalWorkers)}
          subtitle={`${data.assignedWorkers} assigned`}
          icon={<Users className="w-5 h-5 text-success" />}
          iconBg="bg-success/10"
        />
        <MetricCard
          title="Total Budget"
          value={formatCurrency(data.totalBudget)}
          subtitle={`${formatCurrency(data.totalExpenses)} spent`}
          icon={<DollarSign className="w-5 h-5 text-warning" />}
          iconBg="bg-warning/10"
        />
        <MetricCard
          title="Delayed Projects"
          value={formatNumber(data.delayedProjects)}
          subtitle={`${data.completedProjects} completed`}
          icon={<TrendingUp className="w-5 h-5 text-danger" />}
          iconBg="bg-danger/10"
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Low Stock Materials"
          value={formatNumber(data.lowStockMaterials)}
          icon={<Package className="w-4 h-4 text-warning" />}
          iconBg="bg-warning/10"
        />
        <MetricCard
          title="Pending Inspections"
          value={formatNumber(data.pendingInspections)}
          icon={<ClipboardCheck className="w-4 h-4 text-primary" />}
          iconBg="bg-primary/10"
        />
        <MetricCard
          title="Equipment in Maintenance"
          value={formatNumber(data.equipmentInMaintenance)}
          icon={<Wrench className="w-4 h-4 text-danger" />}
          iconBg="bg-danger/10"
        />
        <MetricCard
          title="Available Workers"
          value={formatNumber(data.availableWorkers)}
          icon={<Users className="w-4 h-4 text-success" />}
          iconBg="bg-success/10"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expenses */}
        <div className="card">
          <h3 className="text-sm font-semibold text-primary-text mb-4">Monthly Expenditure</h3>
          {monthlyChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-secondary-text text-sm">No expense data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'Expenses']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Area type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Project Progress */}
        <div className="card">
          <h3 className="text-sm font-semibold text-primary-text mb-4">Project Progress</h3>
          {projectProgressData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-secondary-text text-sm">No active projects</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={projectProgressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Progress']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="progress" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Active Projects Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-primary-text">Active Projects</h3>
          <button onClick={() => navigate('/projects')} className="text-xs text-primary hover:underline">
            View all
          </button>
        </div>
        {data.recentProjects.length === 0 ? (
          <p className="text-sm text-secondary-text py-8 text-center">No active projects</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Project', 'Location', 'Manager', 'Progress', 'Budget', 'Status'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-secondary-text uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentProjects.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="border-b border-border/50 hover:bg-background cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-medium text-primary-text">{p.name}</td>
                    <td className="py-3 px-3 text-secondary-text">{p.location}</td>
                    <td className="py-3 px-3 text-secondary-text">{p.projectManagerName}</td>
                    <td className="py-3 px-3 w-32">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={p.progressPercentage} size="sm" className="flex-1" />
                        <span className="text-xs text-secondary-text w-8">{p.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-secondary-text">{formatCurrency(p.totalBudget)}</td>
                    <td className="py-3 px-3">
                      <ProjectStatusBadge status={p.status as any} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
