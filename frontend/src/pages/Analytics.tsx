import { useEffect, useState } from 'react'
import { projectService } from '../services/project.service'
import { workerService } from '../services/worker.service'
import { materialService } from '../services/material.service'
import type { Project, Worker, Material } from '../types'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatCurrency } from '../utils/format'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'

const COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#64748B']

export default function Analytics() {
  const [projects, setProjects] = useState<Project[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([projectService.getAll(), workerService.getAll(), materialService.getAll()])
      .then(([p, w, m]) => { setProjects(p); setWorkers(w); setMaterials(m) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const statusData = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'DELAYED', 'COMPLETED'].map(s => ({
    name: s.replace('_', ' '),
    value: projects.filter(p => p.status === s).length,
  })).filter(d => d.value > 0)

  const workerTradeData = workers.reduce((acc, w) => {
    acc[w.trade] = (acc[w.trade] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const tradeChartData = Object.entries(workerTradeData).map(([name, value]) => ({ name, value }))

  const budgetData = projects.slice(0, 8).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    budget: Number(p.totalBudget),
    spent: Number(p.totalExpenses),
  }))

  const progressData = projects.filter(p => p.status !== 'COMPLETED').slice(0, 6).map(p => ({
    project: p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name,
    progress: p.progressPercentage,
  }))

  const materialCategoryData = materials.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const materialChartData = Object.entries(materialCategoryData).map(([name, value]) => ({ name, value }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-primary-text">Analytics</h1>
        <p className="text-sm text-secondary-text mt-0.5">Platform-wide insights and metrics</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: projects.length },
          { label: 'Total Workers', value: workers.length },
          { label: 'Total Materials', value: materials.length },
          { label: 'Total Budget', value: formatCurrency(projects.reduce((s, p) => s + Number(p.totalBudget), 0)) },
        ].map(item => (
          <div key={item.label} className="card py-4 text-center">
            <p className="text-2xl font-bold text-primary-text">{item.value}</p>
            <p className="text-xs text-secondary-text mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <div className="card">
          <h3 className="text-sm font-semibold text-primary-text mb-4">Project Status Distribution</h3>
          {statusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-secondary-text text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Worker Trade Distribution */}
        <div className="card">
          <h3 className="text-sm font-semibold text-primary-text mb-4">Workforce by Trade</h3>
          {tradeChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-secondary-text text-sm">No workers registered</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tradeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} name="Workers" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Budget vs Spent */}
        <div className="card">
          <h3 className="text-sm font-semibold text-primary-text mb-4">Budget vs Expenditure</h3>
          {budgetData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-secondary-text text-sm">No projects</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="budget" fill="#2563EB" radius={[4, 4, 0, 0]} name="Budget" />
                <Bar dataKey="spent" fill="#16A34A" radius={[4, 4, 0, 0]} name="Spent" />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Project Progress */}
        <div className="card">
          <h3 className="text-sm font-semibold text-primary-text mb-4">Active Project Progress</h3>
          {progressData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-secondary-text text-sm">No active projects</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={progressData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="project" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Radar name="Progress" dataKey="progress" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} formatter={(v: number) => [`${v}%`, 'Progress']} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Material categories */}
      {materialChartData.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-primary-text mb-4">Materials by Category</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={materialChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="value" fill="#16A34A" radius={[0, 4, 4, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
