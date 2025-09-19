'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, FileSpreadsheet, GraduationCap, Upload, Download, Search, 
  CheckCircle, Clock, AlertCircle, Eye, UserPlus, DollarSign, 
  Building, Users, BarChart3, Share2,
  BookOpen, Calendar, FileText, Settings, Menu, X, UploadCloud, UserPlus2,
  ChevronLeft, ChevronRight, Filter, RefreshCw, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { downloadReceiptPDF } from '@/lib/pdf-receipt';
import { downloadSalarySlipPDF } from '@/lib/salary-slip-pdf';

interface Student {
  id: string;
  name: string;
  grade: string;
  fee: number;
  status: string;
}

interface FinancialManagementDashboardProps {
  activeSubSection: string;
  setActiveSubSection: (section: string) => void;
}

export default function FinancialManagementDashboard({ activeSubSection, setActiveSubSection }: FinancialManagementDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  // Fee Collection Pagination and Search State
  const [feeCurrentPage, setFeeCurrentPage] = useState(1);
  const [feeTotalPages, setFeeTotalPages] = useState(1);
  const [feeSearchTerm, setFeeSearchTerm] = useState('');
  const [feeSearchField, setFeeSearchField] = useState('studentId');
  const [feePaymentModeFilter, setFeePaymentModeFilter] = useState('all');
  const [isLoadingFeeCollections, setIsLoadingFeeCollections] = useState(false);
  const [recentFeeCollections, setRecentFeeCollections] = useState<any[]>([]);
  const [printDateRange, setPrintDateRange] = useState({ from: '', to: '' });

  // Fee Collection Form State
  const [feeForm, setFeeForm] = useState({
    studentId: '',
    amount: '',
    paymentMode: '',
    notes: ''
  });

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    department: '',
    amount: '',
    description: '',
    receipt: null as File | null
  });

  // Payroll Form State
  const [payrollForm, setPayrollForm] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    position: '',
    basicSalary: '',
    allowances: '',
    deductions: '',
    netSalary: '',
    month: '',
    year: '',
    status: 'Pending'
  });

  // Employee Search State
  const [employeeSearchId, setEmployeeSearchId] = useState('');
  const [isSearchingEmployee, setIsSearchingEmployee] = useState(false);
  const [employeeNotFound, setEmployeeNotFound] = useState(false);

  // Payroll Management State
  const [recentPayrolls, setRecentPayrolls] = useState<any[]>([]);
  const [isLoadingPayrolls, setIsLoadingPayrolls] = useState(false);
  const [payrollCurrentPage, setPayrollCurrentPage] = useState(1);
  const [payrollTotalPages, setPayrollTotalPages] = useState(1);
  const [payrollSearchTerm, setPayrollSearchTerm] = useState('');
  const [payrollSearchField, setPayrollSearchField] = useState('employeeName');
  const [payrollDepartmentFilter, setPayrollDepartmentFilter] = useState('all');
  const [payrollStatusFilter, setPayrollStatusFilter] = useState('all');
  const [payrollSummary, setPayrollSummary] = useState({
    totalPayroll: 0,
    totalEmployees: 0,
    teachingTotal: 0,
    adminTotal: 0,
    supportTotal: 0
  });

  const fetchAvailableStudents = async () => {
    try {
      const response = await fetch('/api/students/list');
      if (response.ok) {
        const data = await response.json();
        setAvailableStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    // Initialize with empty data - real data will be fetched from API
    setStudents([]);
    setExpenses([]);
    fetchRecentFeeCollections();
    fetchAvailableStudents();
    fetchRecentPayrolls();
  }, []);

  const [feeStats, setFeeStats] = useState({
    totalAmount: 0,
    cashTotal: 0,
    upiTotal: 0,
    bankTransferTotal: 0
  });

  const [lastReceiptData, setLastReceiptData] = useState<any>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);

  const fetchRecentFeeCollections = async (page = 1, search = '', field = 'studentId', paymentMode = 'all') => {
    setIsLoadingFeeCollections(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
        field: field,
        paymentMode: paymentMode
      });
      
      console.log('🔍 Fetching fee collections with params:', params.toString());
      const response = await fetch(`/api/financial/fee-collection?${params}`);
      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Fee collections data:', data);
        setRecentFeeCollections(data.feeCollections || []);
        setFeeTotalPages(data.pagination?.totalPages || 1);
        setFeeCurrentPage(data.pagination?.currentPage || page);
        
        // Update statistics
        if (data.summary) {
          setFeeStats({
            totalAmount: data.summary.totalAmount || 0,
            cashTotal: data.summary.cashTotal || 0,
            upiTotal: data.summary.upiTotal || 0,
            bankTransferTotal: data.summary.bankTransferTotal || 0
          });
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching fee collections:', error);
      toast.error('Failed to fetch fee collections');
    } finally {
      setIsLoadingFeeCollections(false);
    }
  };

  const handleFeeSearch = () => {
    fetchRecentFeeCollections(1, feeSearchTerm, feeSearchField, feePaymentModeFilter);
  };

  const handleFeePageChange = (page: number) => {
    fetchRecentFeeCollections(page, feeSearchTerm, feeSearchField, feePaymentModeFilter);
  };

  const fetchRecentPayrolls = async (page = 1, search = '', field = 'employeeName', department = 'all', status = 'all') => {
    setIsLoadingPayrolls(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
        field: field,
        department: department,
        status: status
      });
      
      const response = await fetch(`/api/financial/payroll?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setRecentPayrolls(data.payrolls || []);
        setPayrollTotalPages(data.pagination?.totalPages || 1);
        setPayrollCurrentPage(data.pagination?.currentPage || page);
        
        // Update statistics
        if (data.summary) {
          setPayrollSummary({
            totalPayroll: data.summary.totalPayroll || 0,
            totalEmployees: data.summary.totalEmployees || 0,
            teachingTotal: data.summary.teachingTotal || 0,
            adminTotal: data.summary.adminTotal || 0,
            supportTotal: data.summary.supportTotal || 0
          });
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      toast.error('Failed to fetch payroll records');
    } finally {
      setIsLoadingPayrolls(false);
    }
  };

  const handlePayrollSearch = () => {
    fetchRecentPayrolls(1, payrollSearchTerm, payrollSearchField, payrollDepartmentFilter, payrollStatusFilter);
  };

  const handlePayrollPageChange = (page: number) => {
    fetchRecentPayrolls(page, payrollSearchTerm, payrollSearchField, payrollDepartmentFilter, payrollStatusFilter);
  };

  const handleEmployeeSearch = async () => {
    if (!employeeSearchId.trim()) {
      toast.error('Please enter an employee ID');
      return;
    }

    setIsSearchingEmployee(true);
    setEmployeeNotFound(false);

    try {
      const response = await fetch(`/api/employee/${employeeSearchId.trim()}`);
      
      if (response.ok) {
        const data = await response.json();
        const employee = data.employee;
        
        // Populate form with employee data
        setPayrollForm(prev => ({
          ...prev,
          employeeId: employee.employeeId,
          employeeName: employee.name,
          department: employee.department,
          position: employee.position,
          basicSalary: employee.salary.toString(),
          netSalary: employee.salary.toString() // Default net salary same as basic
        }));
        
        toast.success(`Employee found: ${employee.name}`);
      } else if (response.status === 404) {
        setEmployeeNotFound(true);
        toast.error('Employee not found');
      } else {
        toast.error('Failed to search employee');
      }
    } catch (error) {
      console.error('Error searching employee:', error);
      toast.error('Failed to search employee');
    } finally {
      setIsSearchingEmployee(false);
    }
  };

  const calculateNetSalary = () => {
    const basic = parseFloat(payrollForm.basicSalary) || 0;
    const allowances = parseFloat(payrollForm.allowances) || 0;
    const deductions = parseFloat(payrollForm.deductions) || 0;
    const netSalary = basic + allowances - deductions;
    
    setPayrollForm(prev => ({
      ...prev,
      netSalary: netSalary.toString()
    }));
  };

  const handleDownloadReceipt = () => {
    if (lastReceiptData) {
      downloadReceiptPDF(lastReceiptData);
      toast.success('Receipt downloaded successfully');
    }
  };

  const handlePrintReceipt = (collection: any) => {
    // Generate receipt data from existing collection
    const receiptData = {
      receiptNumber: `REC-${collection.id.slice(-8).toUpperCase()}`,
      studentName: collection.student?.name || 'Unknown Student',
      studentId: collection.studentId,
      admissionNumber: collection.student?.admissionNumber,
      grade: collection.student?.grade || 'Unknown Grade',
      amount: Number(collection.amount),
      paymentMode: collection.paymentMode,
      notes: collection.notes || '',
      date: new Date(collection.date).toLocaleDateString('en-IN'),
      collectedBy: collection.collector?.name || 'Admin',
      schoolName: 'Sample School'
    };

    downloadReceiptPDF(receiptData);
    toast.success('Receipt printed successfully');
  };

  const handlePrintSalarySlip = (payroll: any) => {
    // Generate salary slip data from payroll record
    const salarySlipData = {
      slipNumber: `SLIP-${payroll.id.slice(-8).toUpperCase()}`,
      employeeName: payroll.employeeName || 'Unknown Employee',
      employeeId: payroll.employeeId || 'N/A',
      department: payroll.department || 'N/A',
      position: payroll.position || 'N/A',
      basicSalary: Number(payroll.basicSalary) || 0,
      allowances: Number(payroll.allowances) || 0,
      deductions: Number(payroll.deductions) || 0,
      netSalary: Number(payroll.netSalary) || 0,
      month: payroll.month || new Date().getMonth() + 1,
      year: payroll.year || new Date().getFullYear(),
      status: payroll.status || 'PENDING',
      date: new Date().toLocaleDateString('en-IN'),
      schoolName: 'Sample School'
    };

    downloadSalarySlipPDF(salarySlipData);
    toast.success('Salary slip printed successfully');
  };

  const handlePrintByDateRange = () => {
    if (!printDateRange.from || !printDateRange.to) {
      toast.error('Please select both start and end dates');
      return;
    }

    const fromDate = new Date(printDateRange.from);
    const toDate = new Date(printDateRange.to);
    
    const filteredCollections = recentFeeCollections.filter(collection => {
      const collectionDate = new Date(collection.date);
      return collectionDate >= fromDate && collectionDate <= toDate;
    });

    if (filteredCollections.length === 0) {
      toast.error('No receipts found for the selected date range');
      return;
    }

    filteredCollections.forEach((collection, index) => {
      setTimeout(() => handlePrintReceipt(collection), index * 200);
    });

    toast.success(`Printing ${filteredCollections.length} receipts for date range`);
  };

  const handleFeePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/financial/fee-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feeForm,
          amount: parseFloat(feeForm.amount)
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Fee payment recorded successfully');
        setFeeForm({ studentId: '', amount: '', paymentMode: '', notes: '' });
        setLastReceiptData(result.receiptData);
        fetchRecentFeeCollections();
      } else {
        toast.error('Failed to record fee payment');
      }
    } catch (error) {
      toast.error('Error recording fee payment');
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('department', expenseForm.department);
      formData.append('amount', expenseForm.amount);
      formData.append('description', expenseForm.description);
      if (expenseForm.receipt) {
        formData.append('receipt', expenseForm.receipt);
      }

      const response = await fetch('/api/financial/expenses', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast.success('Expense recorded successfully');
        setExpenseForm({ department: '', amount: '', description: '', receipt: null });
      } else {
        toast.error('Failed to record expense');
      }
    } catch (error) {
      toast.error('Error recording expense');
    } finally {
      setLoading(false);
    }
  };

  const handlePayrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/financial/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payrollForm,
          basicSalary: parseFloat(payrollForm.basicSalary),
          allowances: parseFloat(payrollForm.allowances),
          deductions: parseFloat(payrollForm.deductions),
          netSalary: parseFloat(payrollForm.netSalary),
          month: parseInt(payrollForm.month),
          year: parseInt(payrollForm.year)
        })
      });

      if (response.ok) {
        toast.success('Payroll record created successfully');
        setPayrollForm({
          employeeId: '', employeeName: '', department: '', position: '',
          basicSalary: '', allowances: '', deductions: '', netSalary: '',
          month: '', year: '', status: 'Pending'
        });
      } else {
        toast.error('Failed to create payroll record');
      }
    } catch (error) {
      toast.error('Error creating payroll record');
    } finally {
      setLoading(false);
    }
  };

  const downloadPayrollTemplate = () => {
    const templateData = [
      ['Employee ID', 'Employee Name', 'Department', 'Position', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Month', 'Year', 'Status'],
      ['EMP001', 'John Doe', 'Teaching', 'Teacher', '50000', '5000', '2000', '53000', '1', '2024', 'Pending'],
      ['EMP002', 'Jane Smith', 'Administration', 'Admin', '45000', '3000', '1500', '46500', '1', '2024', 'Pending']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll Template');
    XLSX.writeFile(wb, 'payroll_template.csv');
  };

  const handlePayrollUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/financial/payroll', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload payroll data');
      }
    } catch (error) {
      console.error('Error processing payroll file:', error);
      toast.error('Error processing payroll file');
    }
  };

  const renderContent = () => {
    switch (activeSubSection) {
      case 'fee-collection':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Fee Collection</h2>
                <p className="text-gray-600">Manage student fee payments and collections</p>
              </div>
              <div className="flex gap-2">
                {recentFeeCollections.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      recentFeeCollections.forEach(collection => {
                        setTimeout(() => handlePrintReceipt(collection), 100);
                      });
                      toast.success(`Printing ${recentFeeCollections.length} receipts`);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Print All
                  </Button>
                )}
                <Button variant="outline" onClick={() => fetchRecentFeeCollections(feeCurrentPage, feeSearchTerm, feeSearchField, feePaymentModeFilter)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Fee Collection Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Record Fee Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeePayment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentId">Student ID / Admission Number</Label>
                      <Input
                        id="studentId"
                        placeholder="Enter student ID or admission number (e.g., STU304, ADM330)"
                        value={feeForm.studentId}
                        onChange={(e) => setFeeForm({...feeForm, studentId: e.target.value})}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        You can enter either the student ID or admission number
                      </p>
                      {availableStudents.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <p className="font-medium text-blue-800 mb-1">Available Students:</p>
                          <div className="flex flex-wrap gap-1">
                            {availableStudents.slice(0, 5).map((student) => (
                              <span key={student.id} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                {student.admissionNumber || student.id}
                              </span>
                            ))}
                            {availableStudents.length > 5 && (
                              <span className="text-blue-600">+{availableStudents.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      )}
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
                    <div>
                      <Label htmlFor="paymentMode">Payment Mode</Label>
                      <Select
                        value={feeForm.paymentMode}
                        onValueChange={(value) => setFeeForm({...feeForm, paymentMode: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        placeholder="Enter any notes"
                        value={feeForm.notes}
                        onChange={(e) => setFeeForm({...feeForm, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Recording...' : 'Record Payment'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Receipt Download Section */}
            {lastReceiptData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Payment Receipt
                  </CardTitle>
                  <CardDescription>
                    Download the receipt for the last successful payment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                    <div>
                      <p className="font-medium text-green-800">Payment Successful!</p>
                      <p className="text-sm text-green-600">
                        Receipt No: {lastReceiptData.receiptNumber}
                      </p>
                      <p className="text-sm text-green-600">
                        Amount: ₹{lastReceiptData.amount.toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      onClick={handleDownloadReceipt}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search and Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter Fee Collections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="feeSearchField">Search Field</Label>
                    <Select value={feeSearchField} onValueChange={setFeeSearchField}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studentId">Student ID</SelectItem>
                        <SelectItem value="admissionNumber">Admission Number</SelectItem>
                        <SelectItem value="studentName">Student Name</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="paymentMode">Payment Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="feeSearchTerm">Search Term</Label>
                    <Input
                      id="feeSearchTerm"
                      placeholder="Enter search term"
                      value={feeSearchTerm}
                      onChange={(e) => setFeeSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="feePaymentModeFilter">Payment Mode Filter</Label>
                    <Select value={feePaymentModeFilter} onValueChange={setFeePaymentModeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modes</SelectItem>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={handleFeeSearch} className="flex-1">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    {recentFeeCollections.length > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          recentFeeCollections.forEach(collection => {
                            setTimeout(() => handlePrintReceipt(collection), 100);
                          });
                          toast.success(`Printing ${recentFeeCollections.length} receipts`);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Print All
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Print Receipts by Date Range */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Print Receipts by Date Range
                </CardTitle>
                <CardDescription>
                  Print multiple receipts for a specific date range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="printFromDate">From Date</Label>
                    <Input
                      id="printFromDate"
                      type="date"
                      value={printDateRange.from}
                      onChange={(e) => setPrintDateRange({...printDateRange, from: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="printToDate">To Date</Label>
                    <Input
                      id="printToDate"
                      type="date"
                      value={printDateRange.to}
                      onChange={(e) => setPrintDateRange({...printDateRange, to: e.target.value})}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handlePrintByDateRange}
                      className="w-full"
                      disabled={!printDateRange.from || !printDateRange.to}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Print by Date
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Fee Collections */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Fee Collections</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchRecentFeeCollections(feeCurrentPage, feeSearchTerm, feeSearchField, feePaymentModeFilter)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingFeeCollections ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading fee collections...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Debug info */}
                    <div className="text-xs text-gray-400 mb-2">
                      Debug: {recentFeeCollections.length} collections loaded
                    </div>

                    {recentFeeCollections.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No fee collections found
                      </div>
                    ) : (
                      recentFeeCollections.map((collection) => (
                        <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">
                                {collection.student?.name || 'Unknown Student'} 
                                {collection.student?.grade && ` (${collection.student.grade})`}
                              </p>
                              <p className="text-sm text-gray-500">Student ID: {collection.studentId}</p>
                              <p className="text-sm text-gray-500">Amount: ₹{Number(collection.amount).toLocaleString()}</p>
                              <p className="text-sm text-gray-500">Mode: {collection.paymentMode}</p>
                              {collection.notes && (
                                <p className="text-sm text-gray-500">Notes: {collection.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="default">
                              Paid
                            </Badge>
                            <div className="text-sm text-gray-500">
                              {new Date(collection.date).toLocaleDateString()}
                            </div>
                            {collection.collector?.name && (
                              <div className="text-sm text-gray-500">
                                By: {collection.collector.name}
                              </div>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePrintReceipt(collection)}
                              className="ml-2 bg-green-500 hover:bg-green-70000 border-green-950 text-white font-medium"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              PRINT TEST
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fee Collection Pagination */}
            {feeTotalPages > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Page {feeCurrentPage} of {feeTotalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeePageChange(feeCurrentPage - 1)}
                        disabled={feeCurrentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      {Array.from({ length: feeTotalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === feeCurrentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFeePageChange(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeePageChange(feeCurrentPage + 1)}
                        disabled={feeCurrentPage === feeTotalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fee Collection Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Collected</p>
                      <p className="text-2xl font-bold text-gray-900">₹{feeStats.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Cash Payments</p>
                      <p className="text-2xl font-bold text-gray-900">₹{feeStats.cashTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">UPI Payments</p>
                      <p className="text-2xl font-bold text-gray-900">₹{feeStats.upiTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Bank Transfers</p>
                      <p className="text-2xl font-bold text-gray-900">₹{feeStats.bankTransferTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'payroll':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
              <p className="text-gray-600">Manage staff payroll and salary processing</p>
            </div>

            {/* Payroll Entry Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Payroll Entry
                </CardTitle>
                <CardDescription>
                  Add payroll record for individual employee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayrollSubmit} className="space-y-4">
                  {/* Employee Search Section */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">Search Employee</h4>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label htmlFor="employeeSearchId">Employee ID</Label>
                        <Input
                          id="employeeSearchId"
                          placeholder="Enter employee ID to search"
                          value={employeeSearchId}
                          onChange={(e) => setEmployeeSearchId(e.target.value)}
                        />
                      </div>
                      <Button 
                        type="button"
                        onClick={handleEmployeeSearch}
                        disabled={isSearchingEmployee}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSearchingEmployee ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Search
                          </>
                        )}
                      </Button>
                    </div>
                    {employeeNotFound && (
                      <p className="text-red-600 text-sm mt-2">Employee not found. Please check the employee ID.</p>
                    )}
                    <div className="mt-3">
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEmployeeSearchId('');
                          setPayrollForm({
                            employeeId: '',
                            employeeName: '',
                            department: '',
                            position: '',
                            basicSalary: '',
                            allowances: '',
                            deductions: '',
                            netSalary: '',
                            month: '',
                            year: '',
                            status: 'Pending'
                          });
                          setEmployeeNotFound(false);
                        }}
                        className="text-gray-600"
                      >
                        Clear Form
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeId">Employee ID *</Label>
                      <Input
                        id="employeeId"
                        placeholder="Employee ID"
                        value={payrollForm.employeeId}
                        onChange={(e) => setPayrollForm({...payrollForm, employeeId: e.target.value})}
                        required
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="employeeName">Employee Name *</Label>
                      <Input
                        id="employeeName"
                        placeholder="Employee Name"
                        value={payrollForm.employeeName}
                        onChange={(e) => setPayrollForm({...payrollForm, employeeName: e.target.value})}
                        required
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
                        placeholder="Department"
                        value={payrollForm.department}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position *</Label>
                      <Input
                        id="position"
                        placeholder="Position"
                        value={payrollForm.position}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="basicSalary">Basic Salary *</Label>
                      <Input
                        id="basicSalary"
                        type="number"
                        placeholder="Enter basic salary"
                        value={payrollForm.basicSalary}
                        onChange={(e) => {
                          setPayrollForm({...payrollForm, basicSalary: e.target.value});
                          setTimeout(calculateNetSalary, 100); // Small delay to ensure state is updated
                        }}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="allowances">Allowances</Label>
                      <Input
                        id="allowances"
                        type="number"
                        placeholder="Enter allowances"
                        value={payrollForm.allowances}
                        onChange={(e) => {
                          setPayrollForm({...payrollForm, allowances: e.target.value});
                          setTimeout(calculateNetSalary, 100); // Small delay to ensure state is updated
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deductions">Deductions</Label>
                      <Input
                        id="deductions"
                        type="number"
                        placeholder="Enter deductions"
                        value={payrollForm.deductions}
                        onChange={(e) => {
                          setPayrollForm({...payrollForm, deductions: e.target.value});
                          setTimeout(calculateNetSalary, 100); // Small delay to ensure state is updated
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="netSalary">Net Salary *</Label>
                      <Input
                        id="netSalary"
                        type="number"
                        placeholder="Net Salary (Auto-calculated)"
                        value={payrollForm.netSalary}
                        onChange={(e) => setPayrollForm({...payrollForm, netSalary: e.target.value})}
                        required
                        className="bg-green-50 border-green-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="month">Month *</Label>
                      <Select
                        value={payrollForm.month}
                        onValueChange={(value) => setPayrollForm({...payrollForm, month: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="Enter year"
                        value={payrollForm.year}
                        onChange={(e) => setPayrollForm({...payrollForm, year: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={payrollForm.status}
                        onValueChange={(value) => setPayrollForm({...payrollForm, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Payroll Record'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Bulk Upload Payroll */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5" />
                  Bulk Upload Payroll Data
                </CardTitle>
                <CardDescription>
                  Upload CSV or Excel file with payroll information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <UploadCloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Payroll Data</h3>
                  <p className="text-gray-600 mb-4">Upload CSV or Excel file with staff payroll information</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={downloadPayrollTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <div>
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
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
                  <p className="text-xs text-gray-500 mt-2">Accepted formats: .csv, .xlsx, .xls</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Required Fields:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Employee ID, Employee Name, Department, Position</li>
                    <li>• Basic Salary, Net Salary, Month, Year</li>
                  </ul>
                  <h4 className="font-medium text-blue-900 mb-2 mt-3">Optional Fields:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Allowances, Deductions, Status</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Search & Filter Payroll Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter Payroll Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="payrollSearchField">Search Field</Label>
                    <Select value={payrollSearchField} onValueChange={setPayrollSearchField}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employeeName">Employee Name</SelectItem>
                        <SelectItem value="employeeId">Employee ID</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="position">Position</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="payrollSearchTerm">Search Term</Label>
                    <Input
                      id="payrollSearchTerm"
                      value={payrollSearchTerm}
                      onChange={(e) => setPayrollSearchTerm(e.target.value)}
                      placeholder="Enter search term"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="payrollDepartment">Department</Label>
                    <Select value={payrollDepartmentFilter} onValueChange={setPayrollDepartmentFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="Teaching">Teaching</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="payrollStatus">Status</Label>
                    <Select value={payrollStatusFilter} onValueChange={setPayrollStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handlePayrollSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Payroll Records */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payroll Records</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPayrolls ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading payroll records...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentPayrolls.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No payroll records found
                      </div>
                    ) : (
                      recentPayrolls.map((payroll) => (
                        <div key={payroll.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{payroll.employeeName || 'Unknown Employee'}</p>
                              <p className="text-sm text-gray-500">ID: {payroll.employeeId}</p>
                              <p className="text-sm text-gray-500">{payroll.department} - {payroll.position}</p>
                              <p className="text-sm text-gray-500">₹{Number(payroll.amount).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge 
                              variant={payroll.status === 'PAID' ? 'default' : payroll.status === 'APPROVED' ? 'secondary' : 'outline'}
                            >
                              {payroll.status}
                            </Badge>
                            <div className="text-sm text-gray-500">
                              {payroll.month}/{payroll.year}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePrintSalarySlip(payroll)}
                              className="ml-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 font-medium"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Print Slip
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payroll Pagination */}
            {payrollTotalPages > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Page {payrollCurrentPage} of {payrollTotalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePayrollPageChange(payrollCurrentPage - 1)}
                        disabled={payrollCurrentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      {Array.from({ length: payrollTotalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === payrollCurrentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePayrollPageChange(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePayrollPageChange(payrollCurrentPage + 1)}
                        disabled={payrollCurrentPage === payrollTotalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payroll Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Payroll</p>
                      <p className="text-2xl font-bold text-gray-900">₹{payrollSummary.totalPayroll.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Employees</p>
                      <p className="text-2xl font-bold text-gray-900">{payrollSummary.totalEmployees}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Building className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Teaching Staff</p>
                      <p className="text-2xl font-bold text-gray-900">₹{payrollSummary.teachingTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Settings className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Admin & Support</p>
                      <p className="text-2xl font-bold text-gray-900">₹{payrollSummary.adminTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Budget Management</h2>
              <p className="text-gray-600">Track and manage budget expenses</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Record Expense
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={expenseForm.department}
                        onValueChange={(value) => setExpenseForm({...expenseForm, department: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Academic">Academic</SelectItem>
                          <SelectItem value="Administration">Administration</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Transport">Transport</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
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
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter expense description"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="receipt">Receipt</Label>
                    <Input
                      id="receipt"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setExpenseForm({...expenseForm, receipt: e.target.files?.[0] || null})}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Recording...' : 'Record Expense'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Expense List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">{expense.department}</p>
                          <p className="text-sm text-gray-500">₹{expense.amount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={expense.status === 'Approved' ? 'default' : 'secondary'}
                        >
                          {expense.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {expense.receipt}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Financial Management</h2>
              <p className="text-gray-600">Select a section from the sidebar to get started</p>
            </div>
          </div>
        );
    }
  };

  return renderContent();
}
