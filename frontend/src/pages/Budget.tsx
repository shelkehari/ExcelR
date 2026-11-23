import { useEffect, useState } from 'react'
import { Plus, DollarSign, Trash2 } from 'lucide-react'
import { budgetService } from '../services/budget.service'
import { projectService } from '../services/project.service'
import type { Expense, Project, BudgetSummary } from '../types'
import { SearchBar } from '../components/SearchBar'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DataTable } from '../components/DataTable'
import { ProgressBar } from '../components/ProgressBar'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatCurrency, formatDate, budgetUtilization } from '../utils/format'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import toast from 'react-hot-toast'

const CATEGORIES = ['MATERIAL', 'LABOUR', 'EQUIPMENT', 'OVERHEAD', 'SUBCONTRACT', 'OTHER']
const CATEGORY_COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#64748B']

export default function Budget() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [expenseModal, setExpenseModal] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({ description: '', category: 'MATERIAL', amount: 0, expenseDate: '', vendor: '', referenceNumber: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    projectService.getAll().then(p => {
      setProjects(p)
      if (p.length > 0) setSelectedProject(p[0].id)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    Promise.all([
      budgetService.getProjectExpenses(selectedProject),
      budgetService.getBudgetSummary(selectedProject),
    ]).then(([e, s]) => { setExpenses(e); setSummary(s) })
  }, [selectedProject])

  const openCreate = () => {
    setEditing(null)
    setForm({ description: '', category: 'MATERIAL', amount: 0, expenseDate: new Date().toISOString().split('T')[0], vendor: '', referenceNumber: '' })
    setExpenseModal(true)
  }

  const openEdit = (e: Expense) => {
    setEditing(e)
    setForm({ description: e.description, category: e.category, amount: e.amount, expenseDate: e.expenseDate, vendor: e.vendor ?? '', referenceNumber: e.referenceNumber ?? '' })
    setExpenseModal(true)
  }

  const handleSave = async () => {
    if (!form.description || !form.amount || !form.expenseDate || !selectedProject) {
      toast.error('Fill required fields'); return
    }
    setSaving(true)
    try {
      if (editing) {
        const updated = await budgetService.updateExpense(editing.id, form as any)
        setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e))
        toast.success('Expense updated')
      } else {
        const created = await budgetService.recordExpense({ ...form, projectId: selectedProject } as any)
        setExpenses(prev => [created, ...prev])
        toast.success('Expense recorded')
      }
      const s = await budgetService.getBudgetSummary(selectedProject)
      setSummary(s)
      setExpenseModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId || !selectedProject) return
    await budgetService.deleteExpense(deleteId)
    setExpenses(prev => prev.filter(e => e.id !== deleteId))
    const s = await budgetService.getBudgetSummary(selectedProject)
    setSummary(s)
    toast.success('Expense deleted')
  }

  const filtered = expenses.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) || (e.vendor ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = !categoryFilter || e.category === categoryFilter
    return matchSearch && matchCat
  })

  const pieData = summary ? Object.entries(summary.byCategory).map(([name, value]) => ({ name, value: Number(value) })) : []
  const utilPct = summary ? budgetUtilization(summary.totalExpenses, summary.totalBudget) : 0

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary-text">Budget & Expenses</h1>
          <p className="text-sm text-secondary-text mt-0.5">Financial tracking by project</p>
        </div>
        <button onClick={openCreate} disabled={!selectedProject} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Record Expense
        </button>
      </div>

      {/* Project selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-secondary-text">Project:</label>
        <select className="input w-64 text-sm" value={selectedProject ?? ''} onChange={e => setSelectedProject(Number(e.target.value))}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {summary && (
        <>
          {/* Budget summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Budget', value: formatCurrency(summary.totalBudget), color: 'text-primary-text' },
              { label: 'Total Spent', value: formatCurrency(summary.totalExpenses), color: 'text-primary' },
              { label: 'Remaining', value: formatCurrency(summary.remainingBudget), color: summary.remainingBudget < 0 ? 'text-danger' : 'text-success' },
              { label: 'Utilization', value: `${utilPct}%`, color: utilPct > 90 ? 'text-danger' : utilPct > 70 ? 'text-warning' : 'text-success' },
            ].map(item => (
              <div key={item.label} className="card py-4">
                <p className="text-xs text-secondary-text">{item.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex justify-between text-xs text-secondary-text mb-2">
              <span>Budget Utilization</span><span>{utilPct}%</span>
            </div>
            <ProgressBar value={utilPct} color={utilPct > 90 ? 'danger' : utilPct > 70 ? 'warning' : 'success'} />
          </div>

          {/* Charts */}
          {pieData.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-primary-text mb-4">Expenses by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search expenses..." />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input w-44 text-sm">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Expenses table */}
      <div className="card p-0 overflow-hidden">
        <DataTable
          data={filtered}
          keyExtractor={e => e.id}
          emptyMessage="No expenses recorded"
          columns={[
            { key: 'description', header: 'Description', render: e => <span className="font-medium text-primary-text">{e.description}</span> },
            { key: 'category', header: 'Category', render: e => <span className="text-xs px-2 py-0.5 bg-border/50 rounded-full">{e.category}</span> },
            { key: 'amount', header: 'Amount', render: e => <span className="font-medium">{formatCurrency(e.amount)}</span> },
            { key: 'expenseDate', header: 'Date', render: e => formatDate(e.expenseDate) },
            { key: 'vendor', header: 'Vendor', render: e => e.vendor ?? '—' },
            { key: 'referenceNumber', header: 'Ref #', render: e => e.referenceNumber ?? '—' },
            { key: 'actions', header: '', render: e => (
              <div className="flex gap-2">
                <button onClick={() => openEdit(e)} className="text-xs text-primary hover:underline">Edit</button>
                <button onClick={() => setDeleteId(e.id)} className="text-xs text-danger hover:underline">Delete</button>
              </div>
            )},
          ]}
        />
      </div>

      {/* Expense Modal */}
      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title={editing ? 'Edit Expense' : 'Record Expense'} size="md">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-secondary-text mb-1">Description *</label>
            <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Category *</label>
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Amount ($) *</label>
            <input type="number" className="input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Date *</label>
            <input type="date" className="input" value={form.expenseDate} onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Vendor</label>
            <input className="input" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-secondary-text mb-1">Reference Number</label>
            <input className="input" value={form.referenceNumber} onChange={e => setForm(f => ({ ...f, referenceNumber: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setExpenseModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : editing ? 'Update' : 'Record'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
