'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, Users, Building, Upload, Download, Search, 
  CheckCircle, Clock, AlertCircle, Plus, FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  grade: string;
  fee: number;
  status: string;
}

interface Expense {
  id: number;
  department: string;
  amount: string | number;
  status: string;
  receipt: string;
}

const FinancialDataForm = () => {
  const [loading, setLoading] = useState(false);
  
  // Fee Collection State
  const [feeForm, setFeeForm] = useState({
    studentId: '',
    paymentMode: '',
    amount: ''
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payroll State
  const [payrollData, setPayrollData] = useState([]);
  
  // Budget State
  const [expenseForm, setExpenseForm] = useState({
    department: '',
    amount: '',
    status: 'Pending',
    receipt: null
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Department payroll summary
  const departmentSummary = [
    { name: 'Administration', employees: 12, payroll: 245000, status: 'Synced' },
    { name: 'Teaching Staff', employees: 12, payroll: 245000, status: 'Synced' },
    { name: 'Support Staff', employees: 12, payroll: 245000, status: 'Synced' },
    { name: 'Maintenance', employees: 12, payroll: 245000, status: 'Synced' }
  ];

  // Sample student data
  const sampleStudents = [
    { id: 'ST001', name: 'Alice Johnson', grade: 'Class 8', fee: 5000, status: 'Paid' },
    { id: 'ST002', name: 'Bob Smith', grade: 'Class 7', fee: 4500, status: 'Pending' },
    { id: 'ST003', name: 'Carol Davis', grade: 'Class 9', fee: 5500, status: 'Overdue' }
  ];

  // Sample expenses
  const sampleExpenses = [
    { id: 1, department: 'Teaching Staff', amount: 45000, status: 'Approved', receipt: 'Uploaded' },
    { id: 2, department: 'Maintenance', amount: 12000, status: 'Pending', receipt: 'Upload' }
  ];

  useEffect(() => {
    setStudents(sampleStudents);
    setExpenses(sampleExpenses);
  }, []);

  const handleFeePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/financial/fee-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feeForm)
      });

      if (response.ok) {
        toast.success('Payment recorded successfully');
        setFeeForm({ studentId: '', paymentMode: '', amount: '' });
      } else {
        toast.error('Failed to record payment');
      }
    } catch (error) {
      toast.error('Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePayrollUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.info('Payroll upload functionality will be implemented');
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newExpense = {
        id: expenses.length + 1,
        department: expenseForm.department,
        amount: expenseForm.amount,
        status: expenseForm.status,
        receipt: 'Upload'
      };
      
      setExpenses([...expenses, newExpense]);
      setExpenseForm({ department: '', amount: '', status: 'Pending', receipt: null });
      toast.success('Expense added successfully');
    } catch (error) {
      toast.error('Error adding expense');
    } finally {
      setLoading(false);
    }
  };

  const downloadPayrollTemplate = () => {
    const templateData = [
      ['Employee ID', 'Name', 'Department', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary'],
      ['EMP001', 'John Doe', 'Teaching Staff', '50000', '10000', '5000', '55000'],
      ['EMP002', 'Jane Smith', 'Administration', '45000', '8000', '4000', '49000']
    ];
    
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Fee Collection Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fee Collection Input
          </CardTitle>
          <CardDescription>Record fee payments from students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="space-y-4">
              <form onSubmit={handleFeePayment} className="space-y-4">
                <div>
                  <Label htmlFor="searchStudent">Search Student</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="searchStudent"
                      placeholder="Search by ID or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="studentId">Student</Label>
                  <Select value={feeForm.studentId} onValueChange={(value) => setFeeForm({...feeForm, studentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select value={feeForm.paymentMode} onValueChange={(value) => setFeeForm({...feeForm, paymentMode: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                    required
                  />
                </div>
                
                <Button type="submit" disabled={loading} className="w-full">
                  Record Payment
                </Button>
              </form>
            </div>
            
            {/* Student Results */}
            <div>
              <h4 className="font-semibold mb-4">Student Results</h4>
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-600">ID: {student.id} • {student.grade}</div>
                      <div className="text-sm font-medium">₹{student.fee}</div>
                    </div>
                    <Badge 
                      variant={student.status === 'Paid' ? 'default' : 
                              student.status === 'Pending' ? 'secondary' : 'destructive'}
                    >
                      {student.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Payroll Management
          </CardTitle>
          <CardDescription>Upload and manage staff payroll data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Payroll Data</h3>
            <p className="text-gray-600 mb-4">Upload Excel file with staff salary information</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={downloadPayrollTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handlePayrollUpload}
                  className="hidden"
                  id="payroll-upload"
                />
                <Button asChild>
                  <label htmlFor="payroll-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </label>
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Accepted: .xlsx, .xls</p>
          </div>
        </CardContent>
      </Card>

      {/* Department Payroll Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Department Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departmentSummary.map((dept) => (
              <div key={dept.name} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4" />
                  <span className="font-medium">{dept.name}</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{dept.employees} employees</div>
                <div className="text-lg font-semibold mb-2">₹{dept.payroll.toLocaleString()}</div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">{dept.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Allocation & Expenses */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Budget Allocation & Expenses
              </CardTitle>
              <CardDescription>Track department expenses and budget utilization</CardDescription>
            </div>
            <Button onClick={() => document.getElementById('expense-form')?.scrollIntoView()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-semibold">Expense Records</h4>
            
            {/* Add Expense Form */}
            <Card id="expense-form">
              <CardContent className="pt-6">
                <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={expenseForm.department} onValueChange={(value) => setExpenseForm({...expenseForm, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Teaching Staff">Teaching Staff</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Support Staff">Support Staff</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={expenseForm.status} onValueChange={(value) => setExpenseForm({...expenseForm, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button type="submit" disabled={loading} className="w-full">
                      Add Expense
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Expense Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.department}</TableCell>
                      <TableCell>₹{expense.amount}</TableCell>
                      <TableCell>
                        <Badge variant={expense.status === 'Approved' ? 'default' : 'secondary'}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {expense.receipt === 'Uploaded' ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Uploaded</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              <span className="text-sm">Upload</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <Button className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Sync Budget Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDataForm;
