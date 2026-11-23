import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit2, TrendingUp, Download } from 'lucide-react'
import { projectService } from '../services/project.service'
import { budgetService } from '../services/budget.service'
import type { Project, Milestone, BudgetSummary } from '../types'
import { ProjectStatusBadge, MilestoneStatusBadge } from '../components/Badge'
import { ProgressBar } from '../components/ProgressBar'
import { Modal } from '../components/Modal'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatCurrency, formatDate, budgetUtilization } from '../utils/format'
import toast from 'react-hot-toast'

const MILESTONE_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED']

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [budget, setBudget] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [progressModal, setProgressModal] = useState(false)
  const [milestoneModal, setMilestoneModal] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [progressValue, setProgressValue] = useState(0)
  const [progressNotes, setProgressNotes] = useState('')
  const [milestoneForm, setMilestoneForm] = useState({ name: '', description: '', plannedDate: '', status: 'PENDING', completionPercentage: 0, sequenceOrder: 0 })

  useEffect(() => {
    if (!id) return
    Promise.all([
      projectService.getById(Number(id)),
      budgetService.getBudgetSummary(Number(id)).catch(() => null),
    ]).then(([p, b]) => {
      setProject(p)
      setProgressValue(p.progressPercentage)
      setBudget(b)
    }).finally(() => setLoading(false))
  }, [id])

  const handleUpdateProgress = async () => {
    if (!project) return
    try {
      const updated = await projectService.updateProgress(project.id, progressValue, progressNotes)
      setProject(updated)
      setProgressModal(false)
      toast.success('Progress updated')
    } catch { toast.error('Failed to update progress') }
  }

  const openMilestoneEdit = (m: Milestone) => {
    setEditingMilestone(m)
    setMilestoneForm({ name: m.name, description: m.description ?? '', plannedDate: m.plannedDate, status: m.status, completionPercentage: m.completionPercentage, sequenceOrder: m.sequenceOrder })
    setMilestoneModal(true)
  }

  const openMilestoneCreate = () => {
    setEditingMilestone(null)
    setMilestoneForm({ name: '', description: '', plannedDate: '', status: 'PENDING', completionPercentage: 0, sequenceOrder: (project?.milestones.length ?? 0) + 1 })
    setMilestoneModal(true)
  }

  const handleSaveMilestone = async () => {
    if (!project || !milestoneForm.name || !milestoneForm.plannedDate) {
      toast.error('Name and planned date are required')
      return
    }
    try {
      if (editingMilestone) {
        const updated = await projectService.updateMilestone(editingMilestone.id, milestoneForm as any)
        setProject(prev => prev ? { ...prev, milestones: prev.milestones.map(m => m.id === updated.id ? updated : m) } : prev)
        toast.success('Milestone updated')
      } else {
        const created = await projectService.createMilestone(project.id, { ...milestoneForm, projectId: project.id } as any)
        setProject(prev => prev ? { ...prev, milestones: [...prev.milestones, created] } : prev)
        toast.success('Milestone created')
      }
      setMilestoneModal(false)
    } catch { toast.error('Failed to save milestone') }
  }

  if (loading) return <LoadingSpinner />
  if (!project) return <div className="p-6 text-secondary-text">Project not found.</div>

  const utilPct = budget ? budgetUtilization(budget.totalExpenses, budget.totalBudget) : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/projects')} className="p-2 rounded-lg hover:bg-border/50 transition-colors mt-0.5">
          <ArrowLeft className="w-4 h-4 text-secondary-text" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-primary-text">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="text-sm text-secondary-text mt-0.5">{project.location} · Client: {project.clientName}</p>
        </div>
        <button onClick={() => setProgressModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4" /> Update Progress
        </button>
        <a
          href={`/api/reports/projects/${project.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" /> Export Report
        </a>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Start Date', value: formatDate(project.startDate) },
          { label: 'Planned End', value: formatDate(project.plannedEndDate) },
          { label: 'Active Workers', value: String(project.activeWorkers) },
          { label: 'Milestones', value: `${project.milestones.filter(m => m.status === 'COMPLETED').length}/${project.milestones.length}` },
        ].map(item => (
          <div key={item.label} className="card py-4">
            <p className="text-xs text-secondary-text">{item.label}</p>
            <p className="text-base font-semibold text-primary-text mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Progress + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-primary-text mb-4">Overall Progress</h3>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-4xl font-bold text-primary-text">{project.progressPercentage}%</span>
            <span className="text-secondary-text text-sm mb-1">complete</span>
          </div>
          <ProgressBar value={project.progressPercentage} size="md" />
          {project.description && (
            <p className="text-sm text-secondary-text mt-4 leading-relaxed">{project.description}</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-primary-text mb-4">Budget Overview</h3>
          {budget ? (
            <>
              <div className="flex items-end gap-3 mb-3">
                <span className="text-4xl font-bold text-primary-text">{utilPct}%</span>
                <span className="text-secondary-text text-sm mb-1">utilized</span>
              </div>
              <ProgressBar value={utilPct} color={utilPct > 90 ? 'danger' : utilPct > 70 ? 'warning' : 'success'} />
              <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
                <div>
                  <p className="text-secondary-text">Total Budget</p>
                  <p className="font-semibold text-primary-text">{formatCurrency(budget.totalBudget)}</p>
                </div>
                <div>
                  <p className="text-secondary-text">Spent</p>
                  <p className="font-semibold text-primary-text">{formatCurrency(budget.totalExpenses)}</p>
                </div>
                <div>
                  <p className="text-secondary-text">Remaining</p>
                  <p className={`font-semibold ${budget.remainingBudget < 0 ? 'text-danger' : 'text-success'}`}>
                    {formatCurrency(budget.remainingBudget)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-secondary-text">No budget data available</p>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-primary-text">Milestones</h3>
          <button onClick={openMilestoneCreate} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add Milestone
          </button>
        </div>
        {project.milestones.length === 0 ? (
          <p className="text-sm text-secondary-text py-6 text-center">No milestones defined yet</p>
        ) : (
          <div className="space-y-3">
            {[...project.milestones].sort((a, b) => a.sequenceOrder - b.sequenceOrder).map(m => (
              <div key={m.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-background transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary">{m.sequenceOrder}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-primary-text">{m.name}</p>
                    <MilestoneStatusBadge status={m.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <ProgressBar value={m.completionPercentage} size="sm" className="w-24" />
                    <span className="text-xs text-secondary-text">{m.completionPercentage}%</span>
                    <span className="text-xs text-secondary-text">Due: {formatDate(m.plannedDate)}</span>
                  </div>
                </div>
                <button onClick={() => openMilestoneEdit(m)} className="p-1.5 rounded-lg hover:bg-border/50 transition-colors">
                  <Edit2 className="w-3.5 h-3.5 text-secondary-text" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Progress Modal */}
      <Modal open={progressModal} onClose={() => setProgressModal(false)} title="Update Project Progress" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Progress: {progressValue}%</label>
            <input type="range" min={0} max={100} value={progressValue}
              onChange={e => setProgressValue(Number(e.target.value))}
              className="w-full accent-primary" />
            <ProgressBar value={progressValue} className="mt-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Notes</label>
            <textarea className="input resize-none" rows={3} value={progressNotes}
              onChange={e => setProgressNotes(e.target.value)} placeholder="Progress update notes..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setProgressModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleUpdateProgress} className="btn-primary text-sm">Update</button>
        </div>
      </Modal>

      {/* Milestone Modal */}
      <Modal open={milestoneModal} onClose={() => setMilestoneModal(false)} title={editingMilestone ? 'Edit Milestone' : 'Add Milestone'} size="sm">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Name *</label>
            <input className="input" value={milestoneForm.name} onChange={e => setMilestoneForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Planned Date *</label>
            <input type="date" className="input" value={milestoneForm.plannedDate} onChange={e => setMilestoneForm(f => ({ ...f, plannedDate: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-secondary-text mb-1">Status</label>
              <select className="input" value={milestoneForm.status} onChange={e => setMilestoneForm(f => ({ ...f, status: e.target.value }))}>
                {MILESTONE_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary-text mb-1">Completion %</label>
              <input type="number" min={0} max={100} className="input" value={milestoneForm.completionPercentage}
                onChange={e => setMilestoneForm(f => ({ ...f, completionPercentage: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Description</label>
            <textarea className="input resize-none" rows={2} value={milestoneForm.description}
              onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setMilestoneModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleSaveMilestone} className="btn-primary text-sm">
            {editingMilestone ? 'Update' : 'Add Milestone'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
