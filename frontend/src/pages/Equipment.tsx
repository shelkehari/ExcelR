import { useEffect, useState } from 'react'
import { Plus, Wrench } from 'lucide-react'
import { equipmentService } from '../services/equipment.service'
import { projectService } from '../services/project.service'
import type { Equipment, Project } from '../types'
import { EquipmentStatusBadge } from '../components/Badge'
import { SearchBar } from '../components/SearchBar'
import { Modal } from '../components/Modal'
import { DataTable } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatDate } from '../utils/format'
import toast from 'react-hot-toast'

const CATEGORIES = ['Excavator', 'Crane', 'Bulldozer', 'Concrete Mixer', 'Forklift', 'Generator', 'Compactor', 'Scaffolding', 'Other']

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState(false)
  const [assignModal, setAssignModal] = useState(false)
  const [maintenanceModal, setMaintenanceModal] = useState(false)
  const [editing, setEditing] = useState<Equipment | null>(null)
  const [selected, setSelected] = useState<Equipment | null>(null)
  const [form, setForm] = useState({ name: '', equipmentCode: '', category: '', model: '', manufacturer: '', location: '', notes: '' })
  const [assignProjectId, setAssignProjectId] = useState('')
  const [maintenanceForm, setMaintenanceForm] = useState({ description: '', scheduledDate: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([equipmentService.getAll(), projectService.getAll()])
      .then(([e, p]) => { setEquipment(e); setProjects(p) })
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', equipmentCode: '', category: '', model: '', manufacturer: '', location: '', notes: '' })
    setModal(true)
  }

  const openEdit = (e: Equipment) => {
    setEditing(e)
    setForm({ name: e.name, equipmentCode: e.equipmentCode, category: e.category, model: e.model ?? '', manufacturer: e.manufacturer ?? '', location: e.location ?? '', notes: e.notes ?? '' })
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.equipmentCode || !form.category) { toast.error('Fill required fields'); return }
    setSaving(true)
    try {
      if (editing) {
        const updated = await equipmentService.update(editing.id, form as any)
        setEquipment(prev => prev.map(e => e.id === updated.id ? updated : e))
        toast.success('Equipment updated')
      } else {
        const created = await equipmentService.create(form as any)
        setEquipment(prev => [created, ...prev])
        toast.success('Equipment registered')
      }
      setModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleAssign = async () => {
    if (!selected || !assignProjectId) { toast.error('Select a project'); return }
    try {
      const updated = await equipmentService.assignToProject(selected.id, Number(assignProjectId))
      setEquipment(prev => prev.map(e => e.id === updated.id ? updated : e))
      setAssignModal(false)
      toast.success('Equipment assigned')
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to assign')
    }
  }

  const handleRelease = async (e: Equipment) => {
    try {
      const updated = await equipmentService.release(e.id)
      setEquipment(prev => prev.map(eq => eq.id === updated.id ? updated : eq))
      toast.success('Equipment released')
    } catch { toast.error('Failed to release') }
  }

  const handleMaintenance = async () => {
    if (!selected || !maintenanceForm.description || !maintenanceForm.scheduledDate) {
      toast.error('Fill required fields'); return
    }
    try {
      await equipmentService.scheduleMaintenance(selected.id, maintenanceForm)
      const updated = await equipmentService.getAll()
      setEquipment(updated)
      setMaintenanceModal(false)
      toast.success('Maintenance scheduled')
    } catch { toast.error('Failed to schedule maintenance') }
  }

  const filtered = equipment.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.equipmentCode.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || e.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return <LoadingSpinner />

  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'AVAILABLE').length,
    inUse: equipment.filter(e => e.status === 'IN_USE').length,
    maintenance: equipment.filter(e => e.status === 'MAINTENANCE').length,
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary-text">Equipment</h1>
          <p className="text-sm text-secondary-text mt-0.5">{equipment.length} registered equipment</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Equipment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-primary-text' },
          { label: 'Available', value: stats.available, color: 'text-success' },
          { label: 'In Use', value: stats.inUse, color: 'text-primary' },
          { label: 'Maintenance', value: stats.maintenance, color: 'text-warning' },
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
          <SearchBar value={search} onChange={setSearch} placeholder="Search equipment..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-44 text-sm">
          <option value="">All Statuses</option>
          {['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'UNAVAILABLE'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<Wrench className="w-8 h-8" />} title="No equipment found" />
        ) : (
          <DataTable
            data={filtered}
            keyExtractor={e => e.id}
            columns={[
              { key: 'name', header: 'Equipment', render: e => <span className="font-medium text-primary-text">{e.name}</span> },
              { key: 'equipmentCode', header: 'Code', render: e => <span className="font-mono text-xs text-secondary-text">{e.equipmentCode}</span> },
              { key: 'category', header: 'Category' },
              { key: 'model', header: 'Model', render: e => e.model ?? '—' },
              { key: 'status', header: 'Status', render: e => <EquipmentStatusBadge status={e.status} /> },
              { key: 'currentProjectName', header: 'Project', render: e => e.currentProjectName ?? '—' },
              { key: 'location', header: 'Location', render: e => e.location ?? '—' },
              { key: 'actions', header: '', render: e => (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => openEdit(e)} className="text-xs text-primary hover:underline">Edit</button>
                  {e.status === 'AVAILABLE' && (
                    <button onClick={() => { setSelected(e); setAssignProjectId(''); setAssignModal(true) }} className="text-xs text-success hover:underline">Assign</button>
                  )}
                  {e.status === 'IN_USE' && (
                    <button onClick={() => handleRelease(e)} className="text-xs text-warning hover:underline">Release</button>
                  )}
                  {e.status !== 'MAINTENANCE' && (
                    <button onClick={() => { setSelected(e); setMaintenanceForm({ description: '', scheduledDate: '' }); setMaintenanceModal(true) }} className="text-xs text-secondary-text hover:underline">Maintenance</button>
                  )}
                </div>
              )},
            ]}
          />
        )}
      </div>

      {/* Equipment Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Equipment' : 'Register Equipment'} size="md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Equipment Code *</label>
            <input className="input" value={form.equipmentCode} onChange={e => setForm(f => ({ ...f, equipmentCode: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Category *</label>
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Model</label>
            <input className="input" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Manufacturer</label>
            <input className="input" value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Location</label>
            <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-secondary-text mb-1">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : editing ? 'Update' : 'Register'}
          </button>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title={`Assign ${selected?.name}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Project *</label>
            <select className="input" value={assignProjectId} onChange={e => setAssignProjectId(e.target.value)}>
              <option value="">Select project</option>
              {projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PLANNING').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setAssignModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleAssign} className="btn-primary text-sm">Assign</button>
        </div>
      </Modal>

      {/* Maintenance Modal */}
      <Modal open={maintenanceModal} onClose={() => setMaintenanceModal(false)} title={`Schedule Maintenance: ${selected?.name}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Description *</label>
            <textarea className="input resize-none" rows={3} value={maintenanceForm.description}
              onChange={e => setMaintenanceForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Scheduled Date *</label>
            <input type="date" className="input" value={maintenanceForm.scheduledDate}
              onChange={e => setMaintenanceForm(f => ({ ...f, scheduledDate: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setMaintenanceModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleMaintenance} className="btn-primary text-sm">Schedule</button>
        </div>
      </Modal>
    </div>
  )
}
