'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'

interface Student {
  id: string
  name: string
  studentId: string
  class: {
    id: string
    className: string
    classCode: string
  }
  batch?: {
    id: string
    batchName: string
    batchCode: string
  }
}

interface FeeStructure {
  id: string
  feeCode: string
  name: string
  description?: string
  amount: number
  frequency: string
  category: string
  isMandatory: boolean
  isActive: boolean
  applicableFrom: string
  applicableTo?: string
  class?: {
    id: string
    className: string
    classCode: string
  }
  batch?: {
    id: string
    batchName: string
    batchCode: string
  }
  collections: Array<{
    id: string
    amount: number
    status: string
    date: string
    dueDate?: string
  }>
  totalPaid: number
  pendingAmount: number
  isPaid: boolean
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
      fetchStudents()
    }
  }, [propStudentId])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/academic/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchStudentFeeDetails = async (studentId: string) => {
    if (!studentId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/financial/fee-structures/student?studentId=${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data.student)
        setFeeStructures(data.feeStructures || [])
      } else {
        toast.error('Failed to fetch student fee details')
      }
    } catch (error) {
      console.error('Error fetching student fee details:', error)
      toast.error('Error fetching student fee details')
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
      'SEMESTERLY': 'Semesterly',
      'ANNUAL': 'Annual',
      'ONE_TIME': 'One Time'
    }
    return frequencies[frequency] || frequency
  }

  const totalAmount = feeStructures.reduce((sum, fee) => sum + fee.amount, 0)
  const totalPaid = feeStructures.reduce((sum, fee) => sum + fee.totalPaid, 0)
  const totalPending = feeStructures.reduce((sum, fee) => sum + fee.pendingAmount, 0)
  const paidPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

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
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.studentId})
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
                  <p className="font-semibold">{student.class.className}</p>
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

      {student && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Structure Details</CardTitle>
            <CardDescription>
              Detailed breakdown of all applicable fees for {student.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Code</TableHead>
                    <TableHead>Fee Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Collections</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No fee structures found for this student
                      </TableCell>
                    </TableRow>
                  ) : (
                    feeStructures.map((feeStructure) => (
                      <TableRow key={feeStructure.id}>
                        <TableCell className="font-mono text-sm">
                          {feeStructure.feeCode}
                        </TableCell>
                        <TableCell className="font-medium">
                          {feeStructure.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getCategoryBadgeVariant(feeStructure.category)}>
                            {getCategoryLabel(feeStructure.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          ₹{feeStructure.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getFrequencyLabel(feeStructure.frequency)}
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600 font-medium">
                            ₹{feeStructure.totalPaid.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={feeStructure.pendingAmount > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                            ₹{feeStructure.pendingAmount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {feeStructure.isPaid ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Paid
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {feeStructure.collections.length === 0 ? (
                              <span className="text-muted-foreground text-sm">No payments</span>
                            ) : (
                              feeStructure.collections.map((collection) => (
                                <div key={collection.id} className="flex items-center gap-2 text-sm">
                                  {getStatusBadge(collection.status)}
                                  <span>₹{collection.amount.toLocaleString()}</span>
                                  <span className="text-muted-foreground">
                                    {new Date(collection.date).toLocaleDateString()}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
