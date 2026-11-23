import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderKanban } from 'lucide-react'
import { projectService, type ProjectRequest } from '../services/project.service'
import { authService } from '../services/auth.service'
import type { Project, User } from '../types'
import { ProjectStatusBadge } from '../components/Badge'
import { ProgressBar } from '../components/ProgressBar'
import { SearchBar } from '../components/SearchBar'
import { Modal } from '../components/Modal'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/format'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'DELAYED', 'COMPLETED']

const emptyForm: ProjectRequest = {
  name: '', description: '', location: '', clientName: '',
  startDate: '', plannedEndDate: '', totalBudget: 0, status: 'PLANNING',
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [form, setForm] = useState<ProjectRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([projectService.getAll(), authService.getAllUsers().catch(() => [])])
      .then(([p, u]) => { setProjects(p); setUsers(u) })
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(p)
    setForm({
      name: p.name, description: p.description ?? '', location: p.location,
      clientName: p.clientName, projectManagerId: p.projectManager?.id,
      startDate: p.startDate, plannedEndDate: p.plannedEndDate,
      totalBudget: p.totalBudget, status: p.status,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.location || !form.clientName || !form.startDate || !form.plannedEndDate) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const updated = await projectService.update(editing.id, form)
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
        toast.success('Project updated')
      } else {
        const created = await projectService.create(form)
        setProjects(prev => [created, ...prev])
        toast.success('Project created')
      }
      setModalOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary-text">Projects</h1>
          <p className="text-sm text-secondary-text mt-0.5">{projects.length} total projects</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search projects..." />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input w-44 text-sm"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {/* Project cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-8 h-8" />}
          title="No projects found"
          description="Create your first project to get started"
          action={<button onClick={openCreate} className="btn-primary text-sm">Create Project</button>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="card cursor-pointer hover:shadow-medium transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-primary-text truncate">{p.name}</h3>
                  <p className="text-xs text-secondary-text mt-0.5">{p.location}</p>
                </div>
                <ProjectStatusBadge status={p.status} />
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-secondary-text mb-1">
                  <span>Progress</span>
                  <span>{p.progressPercentage}%</span>
                </div>
                <ProgressBar value={p.progressPercentage} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-secondary-text">Client</p>
                  <p className="font-medium text-primary-text truncate">{p.clientName}</p>
                </div>
                <div>
                  <p className="text-secondary-text">Manager</p>
                  <p className="font-medium text-primary-text truncate">{p.projectManager?.name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-secondary-text">Budget</p>
                  <p className="font-medium text-primary-text">{formatCurrency(p.totalBudget)}</p>
                </div>
                <div>
                  <p className="text-secondary-text">Due</p>
                  <p className="font-medium text-primary-text">{formatDate(p.plannedEndDate)}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                <span className="text-xs text-secondary-text">{p.activeWorkers} workers</span>
                <button
                  onClick={e => openEdit(p, e)}
                  className="text-xs text-primary hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Project' : 'New Project'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-secondary-text mb-1">Project Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Location *</label>
            <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Client Name *</label>
            <input className="input" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Start Date *</label>
            <input type="date" className="input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Planned End Date *</label>
            <input type="date" className="input" value={form.plannedEndDate} onChange={e => setForm(f => ({ ...f, plannedEndDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Total Budget ($) *</label>
            <input type="number" className="input" value={form.totalBudget} onChange={e => setForm(f => ({ ...f, totalBudget: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Status</label>
            <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Project Manager</label>
            <select className="input" value={form.projectManagerId ?? ''} onChange={e => setForm(f => ({ ...f, projectManagerId: e.target.value ? Number(e.target.value) : undefined }))}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-secondary-text mb-1">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : editing ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
