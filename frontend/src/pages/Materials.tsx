import { useEffect, useState } from 'react'
import { Plus, Boxes, ArrowDown, ArrowUp } from 'lucide-react'
import { materialService } from '../services/material.service'
import { projectService } from '../services/project.service'
import type { Material, MaterialTransaction, Project } from '../types'
import { Badge } from '../components/Badge'
import { SearchBar } from '../components/SearchBar'
import { Modal } from '../components/Modal'
import { DataTable } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/format'
import toast from 'react-hot-toast'

const CATEGORIES = ['Cement', 'Steel', 'Sand', 'Bricks', 'Concrete', 'Aggregates', 'Tiles', 'Paint', 'Timber', 'Pipes', 'Other']
const TX_TYPES = ['PURCHASE', 'CONSUMPTION', 'RETURN', 'ADJUSTMENT']

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [transactions, setTransactions] = useState<MaterialTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'inventory' | 'transactions'>('inventory')
  const [materialModal, setMaterialModal] = useState(false)
  const [txModal, setTxModal] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)
  const [form, setForm] = useState({ name: '', category: '', unit: '', availableQuantity: 0, reorderLevel: 0, unitCost: 0, supplier: '' })
  const [txForm, setTxForm] = useState({ materialId: '', projectId: '', type: 'PURCHASE', quantity: 0, notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([materialService.getAll(), projectService.getAll()])
      .then(([m, p]) => { setMaterials(m); setProjects(p) })
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', category: '', unit: '', availableQuantity: 0, reorderLevel: 0, unitCost: 0, supplier: '' })
    setMaterialModal(true)
  }

  const openEdit = (m: Material) => {
    setEditing(m)
    setForm({ name: m.name, category: m.category, unit: m.unit, availableQuantity: m.availableQuantity, reorderLevel: m.reorderLevel, unitCost: m.unitCost, supplier: m.supplier ?? '' })
    setMaterialModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.category || !form.unit) { toast.error('Fill required fields'); return }
    setSaving(true)
    try {
      if (editing) {
        const updated = await materialService.update(editing.id, form as any)
        setMaterials(prev => prev.map(m => m.id === updated.id ? updated : m))
        toast.success('Material updated')
      } else {
        const created = await materialService.create(form as any)
        setMaterials(prev => [created, ...prev])
        toast.success('Material added')
      }
      setMaterialModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to save')
    } finally { setSaving(false) }
  }

  const openTransaction = () => {
    setTxForm({ materialId: '', projectId: '', type: 'PURCHASE', quantity: 0, notes: '' })
    setTxModal(true)
  }

  const handleTransaction = async () => {
    if (!txForm.materialId || !txForm.quantity) { toast.error('Select material and quantity'); return }
    setSaving(true)
    try {
      const tx = await materialService.recordTransaction({
        materialId: Number(txForm.materialId),
        projectId: txForm.projectId ? Number(txForm.projectId) : undefined,
        type: txForm.type as any,
        quantity: txForm.quantity,
        notes: txForm.notes,
      })
      setTransactions(prev => [tx, ...prev])
      const updated = await materialService.getAll()
      setMaterials(updated)
      setTxModal(false)
      toast.success('Transaction recorded')
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to record transaction')
    } finally { setSaving(false) }
  }

  const filtered = materials.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  const lowStock = materials.filter(m => m.availableQuantity <= m.reorderLevel)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary-text">Materials</h1>
          <p className="text-sm text-secondary-text mt-0.5">{materials.length} materials · {lowStock.length} low stock</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openTransaction} className="btn-secondary flex items-center gap-2 text-sm">
            <ArrowDown className="w-4 h-4" /> Record Transaction
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Material
          </button>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-warning/5 border border-warning/20 rounded-lg text-sm text-warning">
          <Boxes className="w-4 h-4 flex-shrink-0" />
          {lowStock.length} material(s) are at or below reorder level: {lowStock.map(m => m.name).join(', ')}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['inventory', 'transactions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-secondary-text hover:text-primary-text'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'inventory' && (
        <>
          <div className="w-72">
            <SearchBar value={search} onChange={setSearch} placeholder="Search materials..." />
          </div>
          <div className="card p-0 overflow-hidden">
            {filtered.length === 0 ? (
              <EmptyState icon={<Boxes className="w-8 h-8" />} title="No materials found" />
            ) : (
              <DataTable
                data={filtered}
                keyExtractor={m => m.id}
                columns={[
                  { key: 'name', header: 'Material', render: m => <span className="font-medium text-primary-text">{m.name}</span> },
                  { key: 'category', header: 'Category' },
                  { key: 'availableQuantity', header: 'Available', render: m => (
                    <span className={m.availableQuantity <= m.reorderLevel ? 'text-danger font-medium' : 'text-primary-text'}>
                      {m.availableQuantity} {m.unit}
                    </span>
                  )},
                  { key: 'reorderLevel', header: 'Reorder At', render: m => `${m.reorderLevel} ${m.unit}` },
                  { key: 'unitCost', header: 'Unit Cost', render: m => formatCurrency(m.unitCost) },
                  { key: 'supplier', header: 'Supplier', render: m => m.supplier ?? '—' },
                  { key: 'status', header: 'Stock', render: m => (
                    <Badge
                      label={m.availableQuantity <= m.reorderLevel ? 'Low Stock' : 'In Stock'}
                      variant={m.availableQuantity <= m.reorderLevel ? 'danger' : 'success'}
                    />
                  )},
                  { key: 'actions', header: '', render: m => (
                    <button onClick={() => openEdit(m)} className="text-xs text-primary hover:underline">Edit</button>
                  )},
                ]}
              />
            )}
          </div>
        </>
      )}

      {tab === 'transactions' && (
        <div className="card p-0 overflow-hidden">
          {transactions.length === 0 ? (
            <EmptyState icon={<ArrowUp className="w-8 h-8" />} title="No transactions yet" description="Record a purchase or consumption to see history" />
          ) : (
            <DataTable
              data={transactions}
              keyExtractor={t => t.id}
              columns={[
                { key: 'materialName', header: 'Material', render: t => <span className="font-medium">{t.materialName}</span> },
                { key: 'type', header: 'Type', render: t => (
                  <Badge label={t.type} variant={t.type === 'PURCHASE' ? 'success' : t.type === 'CONSUMPTION' ? 'warning' : 'info'} />
                )},
                { key: 'quantity', header: 'Quantity', render: t => String(t.quantity) },
                { key: 'projectName', header: 'Project', render: t => t.projectName ?? '—' },
                { key: 'notes', header: 'Notes', render: t => t.notes ?? '—' },
                { key: 'createdAt', header: 'Date', render: t => formatDate(t.createdAt) },
              ]}
            />
          )}
        </div>
      )}

      {/* Material Modal */}
      <Modal open={materialModal} onClose={() => setMaterialModal(false)} title={editing ? 'Edit Material' : 'Add Material'} size="md">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-secondary-text mb-1">Material Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Category *</label>
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Unit *</label>
            <input className="input" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. bags, tons, m³" />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Available Quantity</label>
            <input type="number" className="input" value={form.availableQuantity} onChange={e => setForm(f => ({ ...f, availableQuantity: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Reorder Level</label>
            <input type="number" className="input" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Unit Cost ($)</label>
            <input type="number" className="input" value={form.unitCost} onChange={e => setForm(f => ({ ...f, unitCost: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Supplier</label>
            <input className="input" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setMaterialModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : editing ? 'Update' : 'Add Material'}
          </button>
        </div>
      </Modal>

      {/* Transaction Modal */}
      <Modal open={txModal} onClose={() => setTxModal(false)} title="Record Transaction" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Material *</label>
            <select className="input" value={txForm.materialId} onChange={e => setTxForm(f => ({ ...f, materialId: e.target.value }))}>
              <option value="">Select material</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.availableQuantity} {m.unit})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Transaction Type *</label>
            <select className="input" value={txForm.type} onChange={e => setTxForm(f => ({ ...f, type: e.target.value }))}>
              {TX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Quantity *</label>
            <input type="number" className="input" value={txForm.quantity} onChange={e => setTxForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Project</label>
            <select className="input" value={txForm.projectId} onChange={e => setTxForm(f => ({ ...f, projectId: e.target.value }))}>
              <option value="">None</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Notes</label>
            <textarea className="input resize-none" rows={2} value={txForm.notes} onChange={e => setTxForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setTxModal(false)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleTransaction} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Recording…' : 'Record'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
