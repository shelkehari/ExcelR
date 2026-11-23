import { useEffect, useState } from 'react'
import { UserCheck } from 'lucide-react'
import { workerService } from '../services/worker.service'
import { projectService } from '../services/project.service'
import type { Worker, Project } from '../types'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { formatDate } from '../utils/format'
import toast from 'react-hot-toast'

const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE']

export default function Attendance() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ workerId: '', projectId: '', date: new Date().toISOString().split('T')[0], status: 'PRESENT', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([workerService.getAll(), projectService.getAll()])
      .then(([w, p]) => { setWorkers(w); setProjects(p) })
      .finally(() => setLoading(false))
  }, [])

  const handleRecord = async () => {
    if (!form.workerId || !form.projectId || !form.date) { toast.error('Fill required fields'); return }
    setSaving(true)
    try {
      await workerService.recordAttendance(Number(form.workerId), Number(form.projectId), form.date, form.status, form.notes)
      setModal(false)
      toast.success('Attendance recorded')
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to record attendance')
    } finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner />

  const assignedWorkers = workers.filter(w => w.status === 'ASSIGNED')

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary-text">Attendance</h1>
          <p className="text-sm text-secondary-text mt-0.5">Record daily worker attendance</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <UserCheck className="w-4 h-4" /> Record Attendance
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Workers', value: workers.length, color: 'text-primary-text' },
          { label: 'Currently Assigned', value: assignedWorkers.length, color: 'text-primary' },
          { label: 'Available', value: workers.filter(w => w.status === 'AVAILABLE').length, color: 'text-success' },
        ].map(s => (
          <div key={s.label} className="card py-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-secondary-text mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-primary-text">Assigned Workers</p>
        </div>
        {assignedWorkers.length === 0 ? (
          <EmptyState icon={<UserCheck className="w-8 h-8" />} title="No assigned workers" description="Assign workers to projects first" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Name', 'ID', 'Trade', 'Status'].map(h => (
                  <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-secondary-text uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignedWorkers.map(w => (
                <tr key={w.id} className="border-b border-border/50 hover:bg-background">
                  <td className="py-3 px-4 font-medium text-primary-text">{w.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-secondary-text">{w.employeeId}</td>
                  <td className="py-3 px-4 text-secondary-text">{w.trade}</td>
                  <td className="py-3 px-4"><Badge label="Assigned" variant="info" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Record Attendance" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Worker *</label>
            <select className="input" value={form.workerId} onChange={e => setForm(f => ({ ...f, workerId: e.target.value }))}>
              <option value="">Select worker</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.employeeId})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Project *</label>
            <select className="input" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Date *</label>
            <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Status *</label>
            <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {ATTENDANCE_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleRecord} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Recording…' : 'Record'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
