import {
  GraduationCap, DollarSign, UserPlus,
  BarChart3, Calendar, FileText, BookOpen,
  Users, Settings, Briefcase,
  School, ClipboardList, TrendingUp, Shield,
  Bus, Wrench, UserCheck, FileSpreadsheet,
  PieChart, LineChart, Database, Globe, Clock,
  Award, BookMarked, Calculator, Receipt,
  MapPin, Car, AlertTriangle, CheckCircle,
  Plus, Upload, Download,
} from 'lucide-react'

export interface NavigationSubSection {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
}

export interface NavigationSection {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  subSections: NavigationSubSection[]
}

export const navigationSections: NavigationSection[] = [
  {
    id: 'dashboard',
    name: 'Dashboard Overview',
    icon: BarChart3,
    subSections: [
      { id: 'overview', name: 'Analytics Overview', icon: TrendingUp },
      { id: 'quick-stats', name: 'Quick Statistics', icon: PieChart },
      { id: 'recent-activities', name: 'Recent Activities', icon: Clock },
    ],
  },
  {
    id: 'school-management',
    name: 'School Management',
    icon: School,
    subSections: [
      { id: 'school-profile', name: 'School Profile', icon: Globe },
      { id: 'school-settings', name: 'School Settings', icon: Settings },
      { id: 'compliance', name: 'Compliance & Reports', icon: CheckCircle },
      { id: 'system-config', name: 'System Configuration', icon: Database },
    ],
  },
  {
    id: 'employee',
    name: 'Employee Management',
    icon: Briefcase,
    subSections: [
      { id: 'employee-management', name: 'Employee Records', icon: Users },
      { id: 'payroll-integration', name: 'Payroll Integration', icon: Calculator },
      { id: 'employee-reports', name: 'Employee Reports', icon: FileSpreadsheet },
    ],
  },
  {
    id: 'user-management',
    name: 'User Management',
    icon: Shield,
    subSections: [
      { id: 'user-management', name: 'User Management', icon: Shield },
      { id: 'users-dashboard', name: 'Users Dashboard', icon: Users },
    ],
  },
  {
    id: 'account-settings',
    name: 'Account & Settings',
    icon: Settings,
    subSections: [
      { id: 'profile', name: 'Profile Management', icon: Users },
      { id: 'account-settings', name: 'Account Settings', icon: Settings },
      { id: 'security', name: 'Security Settings', icon: Shield },
      { id: 'system-settings', name: 'System Settings', icon: Database },
    ],
  },
  {
    id: 'academic',
    name: 'Academic Management',
    icon: GraduationCap,
    subSections: [
      { id: 'academic-management', name: 'Academic Settings', icon: Settings },
      { id: 'curriculum', name: 'Curriculum Planning', icon: BookOpen },
      { id: 'performance', name: 'Student Performance', icon: Award },
      { id: 'attendance', name: 'Attendance Tracking', icon: Calendar },
      { id: 'assignments', name: 'Assignment Management', icon: FileText },
      { id: 'exams', name: 'Exam Management', icon: ClipboardList },
      { id: 'academic-calendar', name: 'Academic Calendar', icon: Calendar },
      { id: 'teacher-assignments', name: 'Teacher Assignments', icon: UserCheck },
    ],
  },
  {
    id: 'batch-management',
    name: 'Batch Management',
    icon: Calendar,
    subSections: [
      { id: 'create-batch', name: 'Create Batch', icon: Plus },
      { id: 'batch-overview', name: 'Batch Overview', icon: BarChart3 },
      { id: 'assign-students', name: 'Assign Students', icon: UserCheck },
      { id: 'batch-reports', name: 'Batch Reports', icon: FileSpreadsheet },
    ],
  },
  {
    id: 'student-management',
    name: 'Student Management',
    icon: School,
    subSections: [
      { id: 'class-management', name: 'Class Management', icon: School },
      { id: 'student-profiles', name: 'Student Profiles', icon: UserCheck },
      { id: 'student-reports', name: 'Student Reports', icon: FileSpreadsheet },
    ],
  },
  {
    id: 'admissions',
    name: 'Admissions',
    icon: UserPlus,
    subSections: [
      { id: 'student-onboarding', name: 'Student Onboarding', icon: UserPlus },
      { id: 'batch-upload', name: 'Batch Upload', icon: Upload },
      { id: 'recent-admissions', name: 'Recent Admissions', icon: Clock },
      { id: 'admission-reports', name: 'Admission Reports', icon: FileSpreadsheet },
    ],
  },
  {
    id: 'financial',
    name: 'Financial Management',
    icon: DollarSign,
    subSections: [
      { id: 'fee-structures', name: 'Fee Structures', icon: Calculator },
      { id: 'fee-collections', name: 'Fee Collections', icon: Receipt },
      { id: 'student-fees', name: 'Student Fee Details', icon: Users },
      { id: 'payroll', name: 'Payroll Management', icon: Briefcase },
      { id: 'budget', name: 'Budget Management', icon: PieChart },
      { id: 'financial-reports', name: 'Financial Reports', icon: LineChart },
    ],
  },
  {
    id: 'transport',
    name: 'Transport & Operations',
    icon: Bus,
    subSections: [
      { id: 'bus-management', name: 'Bus Management', icon: Car },
      { id: 'route-management', name: 'Route Management', icon: MapPin },
      { id: 'operations-dashboard', name: 'Operations Dashboard', icon: Bus },
      { id: 'maintenance-log', name: 'Maintenance Log', icon: Wrench },
      { id: 'safety-alerts', name: 'Safety Alerts', icon: AlertTriangle },
      { id: 'transport-reports', name: 'Transport Reports', icon: FileSpreadsheet },
    ],
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    icon: FileSpreadsheet,
    subSections: [
      { id: 'academic-reports', name: 'Academic Reports', icon: BookMarked },
      { id: 'financial-reports', name: 'Financial Reports', icon: DollarSign },
      { id: 'operational-reports', name: 'Operational Reports', icon: Bus },
      { id: 'system-reports', name: 'System Reports', icon: Database },
      { id: 'custom-reports', name: 'Custom Reports', icon: FileText },
      { id: 'data-export', name: 'Data Export/Import', icon: Download },
    ],
  },
]
