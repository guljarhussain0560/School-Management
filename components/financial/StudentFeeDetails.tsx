'use client'

import { logger } from '@/lib/logger'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  User, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt
} from 'lucide-react'
import { apiGet, getStudents } from '@/lib/api-client'

interface Student {
  id: string
  name: string
  studentId: string
  class?: {
    id: string
    className?: string
    classCode?: string
  }
  batch?: {
    id: string
    batchName: string
    batchCode?: string
  }
}

interface FeeStructure {
  id: string
  feeCode: string
  name: string
  amount: number
  frequency: string
  category: string
  isMandatory: boolean
  isActive: boolean
  applicableFrom: string
  totalPaid?: number
  pendingAmount?: number
  isPaid?: boolean
  collections?: {
    id: string
    amount: number
    status: string
    date: string
  }[]
}

interface StudentFeeDetailsProps {
  studentId?: string
}

export default function StudentFeeDetails({ studentId: propStudentId }: StudentFeeDetailsProps) {
  const [student, setStudent] = useState<Student | null>(null)
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>(propStudentId || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (propStudentId) {
      setSelectedStudentId(propStudentId)
      fetchStudentFeeDetails(propStudentId)
    } else {
      fetchStudentsList()
    }
  }, [propStudentId])

  const fetchStudentsList = async () => {
    try {
      const data = await getStudents()
      setStudents(data?.students || [])
    } catch (error) {
      logger.error('Error fetching students:', error)
    }
  }

  const fetchStudentFeeDetails = async (studentId: string) => {
    if (!studentId) return

    try {
      setLoading(true)
      const data = await apiGet<any>(`/api/financial/fee-structures/student?studentId=${studentId}`, {
        context: 'StudentFeeDetails',
      })
      if (data) {
        setStudent(data.student)
        setFeeStructures(data.feeStructures || [])
      }
    } catch (error) {
      logger.error('Error fetching student fee details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId)
    fetchStudentFeeDetails(studentId)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'OVERDUE':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>
      case 'PARTIAL':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Partial</Badge>
      case 'WAIVED':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800"><CheckCircle className="h-3 w-3 mr-1" />Waived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'TUITION': return 'default'
      case 'TRANSPORT': return 'secondary'
      case 'LIBRARY': return 'outline'
      case 'LABORATORY': return 'destructive'
      default: return 'outline'
    }
  }

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      'TUITION': 'Tuition Fee',
      'TRANSPORT': 'Transport Fee',
      'LIBRARY': 'Library Fee',
      'LABORATORY': 'Laboratory Fee',
      'SPORTS': 'Sports Fee',
      'EXAMINATION': 'Examination Fee',
      'DEVELOPMENT': 'Development Fee',
      'MISCELLANEOUS': 'Miscellaneous'
    }
    return categories[category] || category
  }

  const getFrequencyLabel = (frequency: string) => {
    const frequencies: { [key: string]: string } = {
      'MONTHLY': 'Monthly',
      'QUARTERLY': 'Quarterly',
      'ANNUAL': 'Annual',
      'ONE_TIME': 'One Time'
    }
    return frequencies[frequency] || frequency
  }

  const totalAmount = feeStructures.reduce((sum, fs) => sum + fs.amount, 0)
  const totalPaid = feeStructures.reduce((sum, fs) => sum + (fs.totalPaid || 0), 0)
  const totalPending = feeStructures.reduce((sum, fs) => sum + (fs.pendingAmount ?? fs.amount), 0)
  const paidPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Student Fee Details
              </CardTitle>
              <CardDescription>
                View and manage student fee payments and outstanding amounts
              </CardDescription>
            </div>
            {!propStudentId && (
              <div className="w-64">
                <Select value={selectedStudentId} onValueChange={handleStudentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.studentId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        {student && (
          <CardContent>
            {/* Student Info & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.studentId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-semibold">{(student.class?.classCode || (student.class as any)?.className || "N/A")}</p>
                  {student.batch && (
                    <p className="text-sm text-muted-foreground">{student.batch.batchName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold">₹{totalAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Receipt className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Paid Amount</p>
                  <p className="font-semibold">₹{totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Payment Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Payment Progress</span>
                <span className="text-sm text-muted-foreground">
                  {paidPercentage.toFixed(1)}% ({totalPaid.toLocaleString()} / {totalAmount.toLocaleString()})
                </span>
              </div>
              <Progress value={paidPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₹{totalPaid.toLocaleString()} Paid</span>
                <span>₹{totalPending.toLocaleString()} Pending</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Fee Breakdown */}
      {student && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Breakdown</CardTitle>
            <CardDescription>
              Detailed breakdown of all applicable fees and payment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading fee details...</div>
            ) : feeStructures.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No fee structures found for this student.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Paid Amount</TableHead>
                    <TableHead className="text-right">Pending Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructures.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{fee.name}</p>
                          <p className="text-xs text-muted-foreground">{fee.feeCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoryBadgeVariant(fee.category)}>
                          {getCategoryLabel(fee.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getFrequencyLabel(fee.frequency)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{fee.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        ₹{(fee.totalPaid || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        ₹{(fee.pendingAmount ?? fee.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(fee.isPaid ? 'PAID' : (fee.totalPaid || 0) > 0 ? 'PARTIAL' : 'PENDING')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
