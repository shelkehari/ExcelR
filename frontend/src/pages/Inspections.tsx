import { useEffect, useState } from 'react'
import { Plus, ClipboardCheck } from 'lucide-react'
import { inspectionService } from '../services/inspection.service'
import { projectService } from '../services/project.service'
import { authService } from '../services/auth.service'
import type { SiteInspection, Project, User } from '../types'
import { InspectionStatusBadge, Badge } from '../components/Badge'
import { SearchBar } from '../components/SearchBar'
import { Modal } from '../components/Modal'
import { DataTable } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatDate } from '../utils/format'
import toast from 'react-hot-toast'

const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED']
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function Inspections() {
  const [inspections, setInspections] = useState<SiteInspection[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [editing, setEditing] = useState<SiteInspection | null>(null)
  const [selected, setSelected] = useState<SiteInspection | null>(null)
  const [form, setForm] = useState({ projectId: '', inspectorId: '', title: '', scheduledDate: '', status: 'SCHEDULED', observations: '', recommendations: '' })
  const [issues, setIssues] = useState<{ title: string; description: string; severity: string; status: string; resolution: string }[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([inspectionService.getAll(), projectService.getAll(), authService.getAllUsers().catch(() => [])])
      .then(([i, p, u]) => { setInspections(i); setProjects(p); setUsers(u) })
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ projectId: '', inspectorId: '', title: '', scheduledDate: '', status: 'SCHEDULED', observations: '', recommendations: '' })
    setIssues([])
    setModal(true)
  }

  const openEdit = (i: SiteInspection) => {
    setEditing(i)
    setForm({ projectId: String(i.projectId), inspectorId: String(i.inspectorId ?? ''), title: i.title, scheduledDate: i.scheduledDate, status: i.status, observations: i.observations ?? '', recommendations: i.recommendations ?? '' })
    setIssues(i.issues.map(iss => ({ title: iss.title, description: iss.description ?? '', severity: iss.severity, status: iss.status, resolution: iss.resolution ?? '' })))
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.projectId || !form.title || !form.scheduledDate) { toast.error('Fill required fields'); return }
    setSaving(true)
    try {
      const payload = {
        projectId: Number(form.projectId),
        inspectorId: form.inspectorId ? Number(form.inspectorId) : undefined,
        title: form.title, scheduledDate: form.scheduledDate,
        status: form.status as any, observations: form.observations,
        recommendations: form.recommendations,
        issues: issues.map(iss => ({ ...iss, severity: iss.severity as any, status: iss.status as any })),
      }
      if (editing) {
        const updated = await inspectionService.update(editing.id, payload)
        setInspections(prev => prev.map(i => i.id === updated.id ? updated : i))
        toast.success('Inspection updated')
      } else {
        const created = await inspectionService.create(payload)
        setInspections(prev => [created, ...prev])
        toast.success('Inspection scheduled')
      }
      setModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to save')
    } finally { setSaving(false) }
  }

  const addIssue = () => setIssues(prev => [...prev, { title: '', description: '', severity: 'MEDIUM', status: 'OPEN', resolution: '' }])
  const removeIssue = (i: number) => setIssues(prev => prev.filter((_, idx) => idx !== i))
  const updateIssue = (i: number, field: string, value: string) => setIssues(prev => prev.map((iss, idx) => idx === i ? { ...iss, [field]: value } : iss))

  const filtered = inspections.filter(i => {
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.projectName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || i.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary-text">Site Inspections</h1>
          <p className="text-sm text-secondary-text mt-0.5">{inspections.length} total inspections</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Schedule Inspection
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'] as const).map(s => (
          <div key={s} className="card py-4 text-center">
            <p className="text-2xl font-bold text-primary-text">{inspections.filter(i => i.status === s).length}</p>
            <p className="text-xs text-secondary-text mt-0.5">{s.replace('_', ' ')}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search inspections..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-44 text-sm">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<ClipboardCheck className="w-8 h-8" />} title="No inspections found" />
        ) : (
          <DataTable
            data={filtered}
            keyExtractor={i => i.id}
            onRowClick={i => { setSelected(i); setDetailModal(true) }}
            columns={[
              { key: 'title', header: 'Title', render: i => <span className="font-medium text-primary-text">{i.title}</span> },
              { key: 'projectName', header: 'Project' },
              { key: 'inspectorName', header: 'Inspector', render: i => i.inspectorName ?? '—' },
              { key: 'scheduledDate', header: 'Scheduled', render: i => formatDate(i.scheduledDate) },
              { key: 'completedDate', header: 'Completed', render: i => formatDate(i.completedDate) },
              { key: 'status', header: 'Status', render: i => <InspectionStatusBadge status={i.status} /> },
              { key: 'issues', header: 'Issues', render: i => (
                <span className={`text-sm font-medium ${i.issues.length > 0 ? 'text-warning' : 'text-secondary-text'}`}>
                  {i.issues.length}
                </span>
              )},
              { key: 'actions', header: '', render: i => (
                <button onClick={e => { e.stopPropagation(); openEdit(i) }} className="text-xs text-primary hover:underline">Edit</button>
              )},
            ]}
          />
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <Modal open={detailModal} onClose={() => setDetailModal(false)} title={selected.title} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-secondary-text text-xs">Project</p><p className="font-medium">{selected.projectName}</p></div>
              <div><p className="text-secondary-text text-xs">Inspector</p><p className="font-medium">{selected.inspectorName ?? '—'}</p></div>
              <div><p className="text-secondary-text text-xs">Scheduled</p><p className="font-medium">{formatDate(selected.scheduledDate)}</p></div>
              <div><p className="text-secondary-text text-xs">Status</p><InspectionStatusBadge status={selected.status} /></div>
            </div>
            {selected.observations && (
              <div><p className="text-xs font-medium text-secondary-text mb-1">Observations</p><p className="text-sm text-primary-text leading-relaxed">{selected.observations}</p></div>
            )}
            {selected.recommendations && (
              <div><p className="text-xs font-medium text-secondary-text mb-1">Recommendations</p><p className="text-sm text-primary-text leading-relaxed">{selected.recommendations}</p></div>
            )}
            {selected.issues.length > 0 && (
              <div>
                <p className="text-xs font-medium text-secondary-text mb-2">Issues ({selected.issues.length})</p>
                <div className="space-y-2">
                  {selected.issues.map((iss, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-primary-text">{iss.title}</p>
                        <Badge label={iss.severity} variant={iss.severity === 'CRITICAL' || iss.severity === 'HIGH' ? 'danger' : iss.severity === 'MEDIUM' ? 'warning' : 'neutral'} />
                        <Badge label={iss.status} variant={iss.status === 'RESOLVED' || iss.status === 'CLOSED' ? 'success' : 'info'} />
                      </div>
                      {iss.description && <p className="text-xs text-secondary-text">{iss.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-5">
            <button onClick={() => setDetailModal(false)} className="btn-secondary text-sm">Close</button>
          </div>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Inspection' : 'Schedule Inspection'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-secondary-text mb-1">Project *</label>
              <select className="input" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary-text mb-1">Inspector</label>
              <select className="input" value={form.inspectorId} onChange={e => setForm(f => ({ ...f, inspectorId: e.target.value }))}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-secondary-text mb-1">Title *</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary-text mb-1">Scheduled Date *</label>
              <input type="date" className="input" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary-text mb-1">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-secondary-text mb-1">Observations</label>
              <textarea className="input resize-none" rows={2} value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-secondary-text mb-1">Recommendations</label>
              <textarea className="input resize-none" rows={2} value={form.recommendations} onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))} />
            </div>
          </div>

          {/* Issues */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-secondary-text">Issues</p>
              <button onClick={addIssue} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Issue
              </button>
            </div>
            {issues.map((iss, i) => (
              <div key={i} className="p-3 rounded-lg border border-border mb-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className="input text-xs" placeholder="Issue title" value={iss.title} onChange={e => updateIssue(i, 'title', e.target.value)} />
                  <select className="input text-xs" value={iss.severity} onChange={e => updateIssue(i, 'severity', e.target.value)}>
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input className="input text-xs flex-1" placeholder="Description" value={iss.description} onChange={e => updateIssue(i, 'description', e.target.value)} />
                  <button onClick={() => removeIssue(i)} className="text-xs text-danger hover:underline px-2">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : editing ? 'Update' : 'Schedule'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
