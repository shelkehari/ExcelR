export interface User {
  id: number
  email: string
  name: string
  avatarUrl?: string
  role: UserRole
  active: boolean
  createdAt: string
}

export type UserRole =
  | 'ADMIN'
  | 'PROJECT_MANAGER'
  | 'SITE_ENGINEER'
  | 'SITE_SUPERVISOR'
  | 'ACCOUNTANT'
  | 'INVENTORY_MANAGER'

export interface Project {
  id: number
  name: string
  description?: string
  location: string
  clientName: string
  projectManager?: User
  startDate: string
  plannedEndDate: string
  actualEndDate?: string
  totalBudget: number
  status: ProjectStatus
  progressPercentage: number
  milestones: Milestone[]
  totalExpenses: number
  activeWorkers: number
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'DELAYED' | 'COMPLETED'

export interface Milestone {
  id: number
  projectId: number
  name: string
  description?: string
  plannedDate: string
  completedDate?: string
  status: MilestoneStatus
  completionPercentage: number
  sequenceOrder: number
  createdAt: string
}

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED'

export interface Worker {
  id: number
  name: string
  employeeId: string
  trade: string
  phone?: string
  email?: string
  status: WorkerStatus
  type: WorkerType
  joiningDate?: string
  dailyWage: number
  active: boolean
  createdAt: string
}

export type WorkerStatus = 'AVAILABLE' | 'ASSIGNED' | 'ON_LEAVE' | 'ABSENT'
export type WorkerType = 'EMPLOYEE' | 'CONTRACTOR'

export interface WorkerAssignment {
  id: number
  worker: Worker
  project: Project
  role: string
  assignedDate: string
  releasedDate?: string
  status: 'ACTIVE' | 'RELEASED'
}

export interface Material {
  id: number
  name: string
  category: string
  unit: string
  availableQuantity: number
  reorderLevel: number
  unitCost: number
  supplier?: string
  active: boolean
  createdAt: string
}

export interface MaterialTransaction {
  id: number
  materialId: number
  materialName: string
  projectId?: number
  projectName?: string
  type: TransactionType
  quantity: number
  unitCost: number
  notes?: string
  createdAt: string
}

export type TransactionType = 'PURCHASE' | 'CONSUMPTION' | 'RETURN' | 'ADJUSTMENT'

export interface Expense {
  id: number
  projectId: number
  projectName: string
  description: string
  category: ExpenseCategory
  amount: number
  expenseDate: string
  vendor?: string
  referenceNumber?: string
  createdAt: string
}

export type ExpenseCategory = 'MATERIAL' | 'LABOUR' | 'EQUIPMENT' | 'OVERHEAD' | 'SUBCONTRACT' | 'OTHER'

export interface BudgetSummary {
  totalBudget: number
  totalExpenses: number
  remainingBudget: number
  utilizationPercentage: number
  byCategory: Record<string, number>
}

export interface Equipment {
  id: number
  name: string
  equipmentCode: string
  category: string
  model?: string
  manufacturer?: string
  status: EquipmentStatus
  currentProjectId?: number
  currentProjectName?: string
  location?: string
  notes?: string
  active: boolean
  createdAt: string
}

export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'UNAVAILABLE'

export interface SiteInspection {
  id: number
  projectId: number
  projectName: string
  inspectorId?: number
  inspectorName?: string
  title: string
  scheduledDate: string
  completedDate?: string
  status: InspectionStatus
  observations?: string
  recommendations?: string
  issues: InspectionIssue[]
  createdAt: string
}

export type InspectionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

export interface InspectionIssue {
  id?: number
  title: string
  description?: string
  severity: IssueSeverity
  status: IssueStatus
  resolution?: string
}

export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export interface DelayPrediction {
  projectId: number
  projectName: string
  plannedEndDate: string
  estimatedEndDate: string
  estimatedRemainingDays: number
  delayDays: number
  delayRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  currentProgress: number
  expectedProgress: number
  progressDifference: number
  modelType: string
  riskFactors: string[]
  summary: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  read: boolean
  referenceId?: number
  createdAt: string
}

export interface DashboardData {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  delayedProjects: number
  totalWorkers: number
  assignedWorkers: number
  availableWorkers: number
  totalBudget: number
  totalExpenses: number
  lowStockMaterials: number
  pendingInspections: number
  equipmentInMaintenance: number
  recentProjects: ProjectSummary[]
  monthlyExpenses: { month: number; amount: number }[]
  alerts: Alert[]
}

export interface ProjectSummary {
  id: number
  name: string
  location: string
  projectManagerName: string
  status: string
  progressPercentage: number
  plannedEndDate: string
  totalBudget: number
  totalExpenses: number
}

export interface Alert {
  type: string
  message: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  referenceId?: number
}
