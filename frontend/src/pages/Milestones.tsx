import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { projectService } from '../services/project.service'
import type { Project, Milestone } from '../types'
import { MilestoneStatusBadge } from '../components/Badge'
import { ProgressBar } from '../components/ProgressBar'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { formatDate } from '../utils/format'

export default function Milestones() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])

  useEffect(() => {
    projectService.getAll().then(p => {
      setProjects(p)
      if (p.length > 0) setSelectedProject(p[0].id)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    projectService.getMilestones(selectedProject).then(setMilestones)
  }, [selectedProject])

  if (loading) return <LoadingSpinner />

  const sorted = [...milestones].sort((a, b) => a.sequenceOrder - b.sequenceOrder)

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-primary-text">Milestones</h1>
        <p className="text-sm text-secondary-text mt-0.5">Track project milestone progress</p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-secondary-text">Project:</label>
        <select className="input w-72 text-sm" value={selectedProject ?? ''} onChange={e => setSelectedProject(Number(e.target.value))}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={<Calendar className="w-8 h-8" />} title="No milestones" description="Add milestones from the project details page" />
      ) : (
        <div className="space-y-3">
          {sorted.map((m, idx) => (
            <div key={m.id} className="card flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-primary-text">{m.name}</p>
                  <MilestoneStatusBadge status={m.status} />
                </div>
                {m.description && <p className="text-xs text-secondary-text mb-2">{m.description}</p>}
                <div className="flex items-center gap-3">
                  <ProgressBar value={m.completionPercentage} size="sm" className="w-32" />
                  <span className="text-xs text-secondary-text">{m.completionPercentage}%</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-secondary-text">Planned</p>
                <p className="text-sm font-medium text-primary-text">{formatDate(m.plannedDate)}</p>
                {m.completedDate && (
                  <>
                    <p className="text-xs text-secondary-text mt-1">Completed</p>
                    <p className="text-sm font-medium text-success">{formatDate(m.completedDate)}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
