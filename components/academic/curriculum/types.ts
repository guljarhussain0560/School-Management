export interface CurriculumItem {
  id: string
  subject: string
  grade: string
  module: string
  progress: number
  updatedAt?: string
  updater?: {
    name: string
  }
}

export interface CurriculumSummary {
  totalModules: number
  averageProgress: number
  completedModules: number
  inProgressModules: number
  notStartedModules: number
}
