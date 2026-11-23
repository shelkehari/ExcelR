import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { delayService } from '../services/delay.service'
import { projectService } from '../services/project.service'
import type { DelayPrediction, Project } from '../types'
import { RiskBadge } from '../components/Badge'
import { ProgressBar } from '../components/ProgressBar'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatDate } from '../utils/format'
import toast from 'react-hot-toast'

export default function DelayPredictionPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [prediction, setPrediction] = useState<DelayPrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [projectsLoading, setProjectsLoading] = useState(true)

  useEffect(() => {
    projectService.getAll()
      .then(p => {
        const active = p.filter(proj => proj.status === 'IN_PROGRESS' || proj.status === 'DELAYED' || proj.status === 'ON_HOLD')
        setProjects(active)
        if (active.length > 0) setSelectedProject(active[0].id)
      })
      .finally(() => setProjectsLoading(false))
  }, [])

  useEffect(() => {
    if (selectedProject) runPrediction(selectedProject)
  }, [selectedProject])

  const runPrediction = async (id: number) => {
    setLoading(true)
    setPrediction(null)
    try {
      const result = await delayService.predict(id)
      setPrediction(result)
    } catch {
      toast.error('Failed to run prediction')
    } finally {
      setLoading(false)
    }
  }

  if (projectsLoading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-primary-text">Delay Prediction</h1>
        <p className="text-sm text-secondary-text mt-0.5">Rule-based schedule estimation model</p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>This is a <strong>rule-based estimation model</strong>, not a trained machine learning system. Predictions are based on current progress rate, milestone status, and elapsed time.</span>
      </div>

      {/* Project selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-secondary-text">Project:</label>
        <select
          className="input w-72 text-sm"
          value={selectedProject ?? ''}
          onChange={e => setSelectedProject(Number(e.target.value))}
        >
          {projects.length === 0 && <option value="">No active projects</option>}
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button
          onClick={() => selectedProject && runPrediction(selectedProject)}
          disabled={loading || !selectedProject}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Recalculate
        </button>
      </div>

      {loading && <LoadingSpinner message="Running prediction..." />}

      {prediction && !loading && (
        <div className="space-y-5">
          {/* Risk summary */}
          <div className={`p-5 rounded-xl border-2 ${
            prediction.delayRisk === 'HIGH' ? 'border-danger/30 bg-danger/5' :
            prediction.delayRisk === 'MEDIUM' ? 'border-warning/30 bg-warning/5' :
            'border-success/30 bg-success/5'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-primary-text">{prediction.projectName}</h2>
                <p className="text-sm text-secondary-text mt-0.5">{prediction.summary}</p>
              </div>
              <RiskBadge risk={prediction.delayRisk} />
            </div>
            {prediction.delayDays > 0 && (
              <p className={`text-sm font-medium ${prediction.delayRisk === 'HIGH' ? 'text-danger' : 'text-warning'}`}>
                Estimated delay: {prediction.delayDays} day{prediction.delayDays !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Planned End Date', value: formatDate(prediction.plannedEndDate) },
              { label: 'Estimated End Date', value: formatDate(prediction.estimatedEndDate) },
              { label: 'Remaining Days', value: `${prediction.estimatedRemainingDays} days` },
              { label: 'Delay Days', value: prediction.delayDays > 0 ? `+${prediction.delayDays} days` : 'On track', color: prediction.delayDays > 0 ? 'text-danger' : 'text-success' },
            ].map(item => (
              <div key={item.label} className="card py-4">
                <p className="text-xs text-secondary-text">{item.label}</p>
                <p className={`text-base font-semibold mt-0.5 ${item.color ?? 'text-primary-text'}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Progress comparison */}
          <div className="card">
            <h3 className="text-sm font-semibold text-primary-text mb-4">Progress Analysis</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-secondary-text mb-1.5">
                  <span>Current Progress</span>
                  <span className="font-medium text-primary-text">{prediction.currentProgress}%</span>
                </div>
                <ProgressBar value={prediction.currentProgress} color="primary" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-secondary-text mb-1.5">
                  <span>Expected Progress (by today)</span>
                  <span className="font-medium text-primary-text">{prediction.expectedProgress}%</span>
                </div>
                <ProgressBar value={prediction.expectedProgress} color={prediction.progressDifference < -10 ? 'danger' : 'warning'} />
              </div>
              <div className={`flex items-center gap-2 text-sm font-medium ${prediction.progressDifference >= 0 ? 'text-success' : 'text-danger'}`}>
                <span>Progress difference:</span>
                <span>{prediction.progressDifference >= 0 ? '+' : ''}{prediction.progressDifference}%</span>
                <span className="text-secondary-text font-normal text-xs">
                  ({prediction.progressDifference >= 0 ? 'ahead of schedule' : 'behind schedule'})
                </span>
              </div>
            </div>
          </div>

          {/* Risk factors */}
          {prediction.riskFactors.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-primary-text mb-3">Risk Factors</h3>
              <ul className="space-y-2">
                {prediction.riskFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-secondary-text">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Model info */}
          <div className="px-4 py-3 bg-border/30 rounded-lg">
            <p className="text-xs text-secondary-text">
              <strong>Model:</strong> {prediction.modelType} — Estimates are based on current completion rate, elapsed time, and milestone analysis. 
              A machine learning model can be integrated in a future version for improved accuracy.
            </p>
          </div>
        </div>
      )}

      {!loading && !prediction && projects.length === 0 && (
        <div className="card text-center py-12">
          <AlertTriangle className="w-8 h-8 text-secondary-text mx-auto mb-3" />
          <p className="text-secondary-text text-sm">No active projects available for prediction.</p>
        </div>
      )}
    </div>
  )
}
