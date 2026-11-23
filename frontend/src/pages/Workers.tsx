import { useEffect, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { workerService } from '../services/worker.service'
import { projectService } from '../services/project.service'
import type { Worker, Project } from '../types'
import { WorkerStatusBadge, Badge } from '../components/Badge'
import { SearchBar } from '../components/SearchBar'
import { Modal } from '../components/Modal'
import { DataTable } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/format'
import toast from 'react-hot-toast'

const TRADES = ['Mason', 'Carpenter', 'Electrician', 'Plumber', 'Welder', 'Painter', 'Laborer', 'Supervisor', 'Engineer', 'Other']

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [workerModal, setWorkerModal] = useState(false)
  const [assignModal, setAssignModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [editing, setEditing] = useState<Worker | null>(null)
  const [form, setForm] = useState({ name: '', employeeId: '', trade: '', phone: '', email: '', type: 'EMPLOYEE', dailyWage: 0, joiningDate: '' })
  const [assignForm, setAssignForm] = useState({ projectId: '', role: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([workerService.getAll(), projectService.getAll()])
      .then(([w, p]) => { setWorkers(w); setProjects(p) })
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', employeeId: '', trade: '', phone: '', email: '', type: 'EMPLOYEE', dailyWage: 0, joiningDate: '' })
    setWorkerModal(true)
  }

  const openEdit = (w: Worker) => {
    setEditing(w)
    setForm({ name: w.name, employeeId: w.employeeId, trade: w.trade, phone: w.phone ?? '', email: w.email ?? '', type: w.type, dailyWage: w.dailyWage, joiningDate: w.joiningDate ?? '' })
    setWorkerModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.employeeId || !form.trade || !form.dailyWage) {
      toast.error('Please fill required fields')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const updated = await workerService.update(editing.id, form as any)
        setWorkers(prev => prev.map(w => w.id === updated.id ? updated : w))
        toast.success('Worker updated')
      } else {
        const created = await workerService.create(form as any)
        setWorkers(prev => [created, ...prev])
        toast.success('Worker registered')
      }
      setWorkerModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to save worker')
    } finally { setSaving(false) }
  }

  const openAssign = (w: Worker) => {
    setSelectedWorker(w)
    setAssignForm({ projectId: '', role: '' })
    setAssignModal(true)
  }

  const handleAssign = async () => {
    if (!selectedWorker || !assignForm.projectId || !assignForm.role) {
      toast.error('Select a project and role')
      return
    }
    try {
      await workerService.assign(selectedWorker.id, Number(assignForm.projectId), assignForm.role)
      const updated = await workerService.getAll()
      setWorkers(updated)
      setAssignModal(false)
      toast.success('Worker assigned')
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to assign worker')
    }
  }

  const filtered = workers.filter(w => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      w.trade.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || w.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return <LoadingSpinner />

  const stats = {
    total: workers.length,
    available: workers.filter(w => w.status === 'AVAILABLE').length,
    assigned: workers.filter(w => w.status === 'ASSIGNED').length,
    onLeave: workers.filter(w => w.status === 'ON_LEAVE').length,
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary-text">Workers</h1>
          <p className="text-sm text-secondary-text mt-0.5">{workers.length} registered workers</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Worker
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-primary-text' },
          { label: 'Available', value: stats.available, color: 'text-success' },
          { label: 'Assigned', value: stats.assigned, color: 'text-primary' },
          { label: 'On Leave', value: stats.onLeave, color: 'text-warning' },
        ].map(s => (
          <div key={s.label} className="card py-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-secondary-text mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search workers..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-40 text-sm">
          <option value="">All Statuses</option>
          {['AVAILABLE', 'ASSIGNED', 'ON_LEAVE', 'ABSENT'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<Users className="w-8 h-8" />} title="No workers found" />
        ) : (
          <DataTable
            data={filtered}
            keyExtractor={w => w.id}
            columns={[
              { key: 'name', header: 'Name', render: w => <span className="font-medium text-primary-text">{w.name}</span> },
              { key: 'employeeId', header: 'ID', render: w => <span className="text-secondary-text font-mono text-xs">{w.employeeId}</span> },
              { key: 'trade', header: 'Trade' },
              { key: 'type', header: 'Type', render: w => <Badge label={w.type} variant={w.type === 'EMPLOYEE' ? 'info' : 'neutral'} /> },
              { key: 'status', header: 'Status', render: w => <WorkerStatusBadge status={w.status} /> },
              { key: 'dailyWage', header: 'Daily Wage', render: w => formatCurrency(w.dailyWage) },
              { key: 'joiningDate', header: 'Joined', render: w => formatDate(w.joiningDate) },
              {
                key: 'actions', header: '', render: w => (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(w)} className="text-xs text-primary hover:underline">Edit</button>
                    {w.status === 'AVAILABLE' && (
                      <button onClick={() => openAssign(w)} className="text-xs text-success hover:underline">Assign</button>
                    )}
                  </div>
                )
              },
            ]}
          />
        )}
      </div>

      {/* Worker Modal */}
      <Modal open={workerModal} onClose={() => setWorkerModal(false)} title={editing ? 'Edit Worker' : 'Register Worker'} size="md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Full Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Employee ID *</label>
            <input className="input" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} disabled={!!editing} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Trade *</label>
            <select className="input" value={form.trade} onChange={e => setForm(f => ({ ...f, trade: e.target.value }))}>
              <option value="">Select trade</option>
              {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Type</label>
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="EMPLOYEE">Employee</option>
              <option value="CONTRACTOR">Contractor</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Phone</label>
            <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Email</label>
            <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Daily Wage ($) *</label>
            <input type="number" className="input" value={form.dailyWage} onChange={e => setForm(f => ({ ...f, dailyWage: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Joining Date</label>
            <input type="date" className="input" value={form.joiningDate} onChange={e => setForm(f => ({ ...f, joiningDate: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setWorkerModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : editing ? 'Update' : 'Register'}
          </button>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title={`Assign ${selectedWorker?.name}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Project *</label>
            <select className="input" value={assignForm.projectId} onChange={e => setAssignForm(f => ({ ...f, projectId: e.target.value }))}>
              <option value="">Select project</option>
              {projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PLANNING').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Role *</label>
            <input className="input" value={assignForm.role} onChange={e => setAssignForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Lead Mason" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setAssignModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleAssign} className="btn-primary text-sm">Assign</button>
        </div>
      </Modal>
    </div>
  )
}
