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

  // Bulk Upload State
  const [isUploadingPayroll, setIsUploadingPayroll] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Payroll Status Update State
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Budget Expense State
  const [budgetForm, setBudgetForm] = useState({
    department: '',
    amount: '',
    description: '',
    receipt: null as File | null
  });
  const [isSubmittingBudget, setIsSubmittingBudget] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [expenseCurrentPage, setExpenseCurrentPage] = useState(1);
  const [expenseTotalPages, setExpenseTotalPages] = useState(1);
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [expenseSearchField, setExpenseSearchField] = useState('description');
  const [expenseDepartmentFilter, setExpenseDepartmentFilter] = useState('all');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState('all');
  const [updatingBudgetStatus, setUpdatingBudgetStatus] = useState<string | null>(null);
  
  // Budget Summary State
  const [budgetSummary, setBudgetSummary] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    netBudget: 0,
    pendingTotal: 0,
    underReviewTotal: 0,
    approvedTotal: 0,
    rejectedTotal: 0,
    completedTotal: 0,
    cancelledTotal: 0
  });

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
    fetchRecentExpenses(1, expenseSearchTerm, expenseSearchField, expenseDepartmentFilter, expenseStatusFilter);
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
        
        // Check if employee is terminated
        if (employee.status === 'TERMINATED') {
          toast.error(`Employee terminated - ${employee.name} (${employee.employeeId})`);
          setEmployeeNotFound(true);
          return;
        }
        
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
      studentId: collection.student?.studentId || collection.studentId,
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
    // Use receipt data if available (generated when status changed to PAID), otherwise generate from payroll record
    const receiptData = lastReceiptData && lastReceiptData.employeeName === payroll.employeeName 
      ? lastReceiptData 
      : null;

    const salarySlipData = {
      slipNumber: receiptData?.receiptNumber || `PAY-${payroll.id.slice(-8).toUpperCase()}`,
      employeeName: payroll.employeeName || 'Unknown Employee',
      employeeId: payroll.displayEmployeeId || payroll.employeeId || 'N/A',
      department: payroll.department || 'N/A',
      position: payroll.position || 'N/A',
      basicSalary: Number(payroll.basicSalary) || 0,
      allowances: Number(payroll.allowances) || 0,
      deductions: Number(payroll.deductions) || 0,
      netSalary: Number(payroll.amount) || 0,
      month: payroll.month || new Date().getMonth() + 1,
      year: payroll.year || new Date().getFullYear(),
      status: payroll.status || 'PENDING',
      // Use exact payment date from receipt data if available, otherwise current date
      date: receiptData?.paymentDate 
        ? new Date(receiptData.paymentDate).toLocaleDateString('en-IN')
        : new Date().toLocaleDateString('en-IN'),
      time: receiptData?.paymentDate 
        ? new Date(receiptData.paymentDate).toLocaleTimeString('en-IN')
        : new Date().toLocaleTimeString('en-IN'),
      schoolName: 'Sample School'
    };

    downloadSalarySlipPDF(salarySlipData);
    toast.success('Payroll receipt printed successfully');
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
        const errorData = await response.json();
        if (errorData.error === 'Employee terminated') {
          toast.error(`Employee terminated - ${errorData.employeeName} (${errorData.employeeId})`);
        } else {
          toast.error(errorData.message || 'Failed to create payroll record');
        }
      }
    } catch (error) {
      toast.error('Error creating payroll record');
    } finally {
      setLoading(false);
    }
  };

  const downloadPayrollTemplate = () => {
    const templateData = [
      ['Employee ID', 'Month', 'Year', 'Allowances', 'Deductions', 'Status'],
      ['EMP001', '1', '2024', '5000', '2000', 'PENDING'],
      ['EMP002', '1', '2024', '3000', '1500', 'PENDING'],
      ['EMP003', '1', '2024', '2000', '1000', 'PENDING']
    ];

    // Create worksheet with data
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    
    // Set column widths
    const colWidths = [
      { wch: 12 }, // Employee ID
      { wch: 8 },  // Month
      { wch: 8 },  // Year
      { wch: 12 }, // Allowances
      { wch: 12 }, // Deductions
      { wch: 10 }  // Status
    ];
    ws['!cols'] = colWidths;

    // Style the header row
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:F1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "366092" } },
        alignment: { horizontal: "center" }
      };
    }

    // Create workbook and save
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll Template');
    
    // Save as Excel file
    XLSX.writeFile(wb, 'payroll_template.xlsx');
    
    toast.success('Payroll template downloaded successfully');
  };

  const handlePayrollUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error('Please upload a valid CSV or Excel file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploadingPayroll(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/financial/payroll', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        setUploadResult(result);
        
        if (result.errors && result.errors.length > 0) {
          const employeeNotFoundErrors = result.errors.filter((error: string) => error.includes('Employee not found')).length;
          const terminatedEmployeeErrors = result.errors.filter((error: string) => error.includes('Employee terminated')).length;
          const otherErrors = result.errors.length - employeeNotFoundErrors - terminatedEmployeeErrors;
          
          if (terminatedEmployeeErrors > 0) {
            toast.warning(`${terminatedEmployeeErrors} terminated employee(s) skipped. ${result.successCount} records processed successfully.`);
          } else if (employeeNotFoundErrors > 0) {
            toast.warning(`${employeeNotFoundErrors} employee(s) not found and skipped. ${result.successCount} records processed successfully.`);
          } else {
            toast.warning(`Upload completed with ${result.errors.length} errors. ${result.successCount} records processed successfully.`);
          }
        } else {
          toast.success(`Successfully processed ${result.successCount} payroll records`);
        }
        
        // Refresh the payroll list
        fetchRecentPayrolls(1, payrollSearchTerm, payrollSearchField, payrollDepartmentFilter, payrollStatusFilter);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload payroll data');
      }
    } catch (error) {
      console.error('Error processing payroll file:', error);
      toast.error('Error processing payroll file');
    } finally {
      setIsUploadingPayroll(false);
      setUploadProgress(0);
      // Clear the file input
      event.target.value = '';
    }
  };

  const handlePayrollStatusUpdate = async (payrollId: string, newStatus: string) => {
    setUpdatingStatus(payrollId);
    
    try {
      const response = await fetch(`/api/financial/payroll/${payrollId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the payroll list
        setRecentPayrolls(prev => 
          prev.map(payroll => 
            payroll.id === payrollId 
              ? { ...payroll, status: newStatus }
              : payroll
          )
        );

        // If status changed to PAID, store receipt data and show success message
        if (newStatus === 'PAID' && result.receiptData) {
          setLastReceiptData(result.receiptData);
          toast.success(`Payroll status updated to PAID. Receipt generated for ${result.receiptData.employeeName}`);
        } else {
          toast.success(`Payroll status updated to ${newStatus}`);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update payroll status');
      }
    } catch (error) {
      console.error('Error updating payroll status:', error);
      toast.error('Failed to update payroll status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBudget(true);
    
    try {
      const formData = new FormData();
      formData.append('department', budgetForm.department);
      formData.append('amount', budgetForm.amount);
      formData.append('description', budgetForm.description);
      
      if (budgetForm.receipt) {
        formData.append('receipt', budgetForm.receipt);
      }

      const response = await fetch('/api/financial/budget', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast.success('Budget expense recorded successfully');
        setBudgetForm({
          department: '',
          amount: '',
          description: '',
          receipt: null
        });
        // Refresh expenses list
        fetchRecentExpenses(1, expenseSearchTerm, expenseSearchField, expenseDepartmentFilter, expenseStatusFilter);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to record budget expense');
      }
    } catch (error) {
      console.error('Error recording budget expense:', error);
      toast.error('Failed to record budget expense');
    } finally {
      setIsSubmittingBudget(false);
    }
  };

  const fetchRecentExpenses = async (page: number, search: string, field: string, department: string, status: string) => {
    setIsLoadingExpenses(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        search,
        field,
        department,
        status
      });

      const response = await fetch(`/api/financial/budget?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecentExpenses(data.expenses);
        setExpenseTotalPages(data.pagination.totalPages);
        setExpenseCurrentPage(page);
        
        // Update budget summary
        if (data.summary) {
          setBudgetSummary({
            totalExpenses: data.summary.totalExpenses || 0,
            totalAmount: data.summary.totalAmount || 0,
            netBudget: data.summary.netBudget || 0,
            pendingTotal: data.summary.pendingTotal || 0,
            underReviewTotal: data.summary.underReviewTotal || 0,
            approvedTotal: data.summary.approvedTotal || 0,
            rejectedTotal: data.summary.rejectedTotal || 0,
            completedTotal: data.summary.completedTotal || 0,
            cancelledTotal: data.summary.cancelledTotal || 0
          });
        }
      } else {
        toast.error('Failed to fetch budget expenses');
      }
    } catch (error) {
      console.error('Error fetching budget expenses:', error);
      toast.error('Failed to fetch budget expenses');
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const handleExpenseSearch = () => {
    fetchRecentExpenses(1, expenseSearchTerm, expenseSearchField, expenseDepartmentFilter, expenseStatusFilter);
  };

  const handleExpensePageChange = (page: number) => {
    fetchRecentExpenses(page, expenseSearchTerm, expenseSearchField, expenseDepartmentFilter, expenseStatusFilter);
  };

  const handleBudgetStatusUpdate = async (expenseId: string, newStatus: string) => {
    setUpdatingBudgetStatus(expenseId);
    
    try {
      const response = await fetch(`/api/financial/budget/${expenseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Budget expense status updated to ${newStatus}`);
        // Refresh expenses list
        fetchRecentExpenses(expenseCurrentPage, expenseSearchTerm, expenseSearchField, expenseDepartmentFilter, expenseStatusFilter);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update budget status');
      }
    } catch (error) {
      console.error('Error updating budget status:', error);
      toast.error('Failed to update budget status');
    } finally {
      setUpdatingBudgetStatus(null);
    }
  };

  const handlePrintBudgetReceipt = (expense: any) => {
    // Create a simple receipt in a new window
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Budget Expense Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .receipt-details { margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; }
            .amount { font-size: 18px; font-weight: bold; color: #2563eb; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>School Management System</h1>
            <h2>Budget Expense Receipt</h2>
          </div>
          
          <div class="receipt-details">
            <div class="detail-row">
              <span class="label">Expense ID:</span>
              <span>${expense.id}</span>
            </div>
            <div class="detail-row">
              <span class="label">Department:</span>
              <span>${expense.department}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount:</span>
              <span class="amount">₹${Number(expense.amount).toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Description:</span>
              <span>${expense.description || 'No description provided'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span>${expense.status}</span>
            </div>
            <div class="detail-row">
              <span class="label">Created By:</span>
              <span>${expense.creator?.name || 'Unknown'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span>${new Date(expense.createdAt).toLocaleDateString()}</span>
            </div>
            ${expense.receiptUrl ? `
            <div class="detail-row">
              <span class="label">Receipt:</span>
              <span>Attached</span>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>This is a computer-generated receipt.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `);
      receiptWindow.document.close();
      receiptWindow.print();
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
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                <CardTitle className="flex items-center gap-3 text-green-800">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Fee Collection</h3>
                    <p className="text-sm font-normal text-green-600 mt-1">
                      Record and process student fee payments
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeePayment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentId" className="text-sm font-semibold text-gray-700">
                        Student Identification
                      </Label>
                      <Input
                        id="studentId"
                        placeholder="Enter Student ID, Roll Number, or Admission Number"
                        value={feeForm.studentId}
                        onChange={(e) => setFeeForm({...feeForm, studentId: e.target.value})}
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        <span className="font-medium">Accepted formats:</span> Student ID (STU12345678), Roll Number (RN123456), or Admission Number (ADM123456)
                      </p>
                      {availableStudents.length > 0 && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <p className="font-semibold text-blue-800 text-sm">Registered Students</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {availableStudents.slice(0, 5).map((student) => (
                              <span key={student.id} className="bg-white text-blue-700 px-3 py-1.5 rounded-md text-xs font-medium border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                                {student.studentId || student.admissionNumber || student.id}
                              </span>
                            ))}
                            {availableStudents.length > 5 && (
                              <span className="text-blue-600 text-xs font-medium bg-white px-3 py-1.5 rounded-md border border-blue-200">
                                +{availableStudents.length - 5} more students
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
                        Fee Amount
                      </Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={feeForm.amount}
                          onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                          className="pl-8"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Enter the fee amount in Indian Rupees
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="paymentMode" className="text-sm font-semibold text-gray-700">
                        Payment Method
                      </Label>
                      <Select
                        value={feeForm.paymentMode}
                        onValueChange={(value) => setFeeForm({...feeForm, paymentMode: value})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Cash Payment
                            </div>
                          </SelectItem>
                          <SelectItem value="UPI">
                            <div className="flex items-center gap-2">
                              <Share2 className="h-4 w-4" />
                              UPI Transfer
                            </div>
                          </SelectItem>
                          <SelectItem value="BANK_TRANSFER">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Bank Transfer
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                        Additional Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Enter any additional notes or remarks about this payment..."
                        value={feeForm.notes}
                        onChange={(e) => setFeeForm({...feeForm, notes: e.target.value})}
                        className="mt-1 resize-none"
                        rows={3}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Add any relevant information about this fee payment
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 font-semibold"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing Payment...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Record Fee Payment
                        </div>
                      )}
                    </Button>
                  </div>
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
                              <p className="text-sm text-gray-500">Student ID: {collection.student?.studentId || collection.studentId}</p>
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
                              PRINT RECEIPT
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
                  {isUploadingPayroll ? (
                    <div className="space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <h3 className="text-lg font-medium text-gray-900">Uploading Payroll Data...</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{uploadProgress}% Complete</p>
                    </div>
                  ) : (
                    <>
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
                            disabled={isUploadingPayroll}
                          />
                          <Button asChild disabled={isUploadingPayroll}>
                            <label htmlFor="payroll-upload" className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload File
                            </label>
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Accepted formats: .csv, .xlsx, .xls (Max 10MB)</p>
                    </>
                  )}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Required Fields:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Employee ID (must exist in system)</li>
                    <li>• Month (1-12), Year (e.g., 2024)</li>
                    <li>• Allowances, Deductions, Status (PENDING/APPROVED/PAID)</li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-2">
                    <strong>Note:</strong> Employee data (Name, Department, Position, Basic Salary) will be automatically fetched from the database using Employee ID.
                  </p>
                </div>

                {/* Upload Results */}
                {uploadResult && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Upload Results</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{uploadResult.successCount || 0}</div>
                        <div className="text-sm text-gray-600">Successfully Processed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{uploadResult.errorCount || 0}</div>
                        <div className="text-sm text-gray-600">Errors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{uploadResult.totalProcessed || 0}</div>
                        <div className="text-sm text-gray-600">Total Records</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {uploadResult.totalProcessed > 0 ? Math.round(((uploadResult.successCount || 0) / uploadResult.totalProcessed) * 100) : 0}%
                        </div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                    
                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-red-700 mb-2">Issues Found:</h5>
                        <div className="max-h-40 overflow-y-auto bg-red-50 p-3 rounded border">
                          {uploadResult.errors.map((error: string, index: number) => {
                            const isEmployeeNotFound = error.includes('Employee not found');
                            return (
                              <div key={index} className={`text-sm mb-1 ${isEmployeeNotFound ? 'text-orange-700' : 'text-red-700'}`}>
                                {isEmployeeNotFound ? '⚠️ ' : '❌ '}{error}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          ⚠️ = Employee not found (skipped), ❌ = Other validation errors
                        </p>
                      </div>
                    )}
                  </div>
                )}
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
                              <p className="text-sm text-gray-500">ID: {payroll.displayEmployeeId || payroll.employeeId}</p>
                              <p className="text-sm text-gray-500">{payroll.department} - {payroll.position}</p>
                              <p className="text-sm text-gray-500">₹{Number(payroll.amount).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Status Badge */}
                            <Badge 
                              variant={payroll.status === 'PAID' ? 'default' : payroll.status === 'APPROVED' ? 'secondary' : 'outline'}
                            >
                              {payroll.status}
                            </Badge>
                            
                            {/* Month/Year */}
                            <div className="text-sm text-gray-500">
                              {payroll.month}/{payroll.year}
                            </div>

                            {/* Status Change Dropdown */}
                            <Select
                              value={payroll.status}
                              onValueChange={(newStatus) => handlePayrollStatusUpdate(payroll.id, newStatus)}
                              disabled={updatingStatus === payroll.id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">PENDING</SelectItem>
                                <SelectItem value="APPROVED">APPROVED</SelectItem>
                                <SelectItem value="PAID">PAID</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Print Receipt Button - Only visible when status is PAID */}
                            {payroll.status === 'PAID' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePrintSalarySlip(payroll)}
                                className="ml-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 font-medium"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Print Receipt
                              </Button>
                            )}

                            {/* Loading indicator */}
                            {updatingStatus === payroll.id && (
                              <div className="ml-2">
                                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                              </div>
                            )}
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
                <form onSubmit={handleBudgetSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select
                        value={budgetForm.department}
                        onValueChange={(value) => setBudgetForm({...budgetForm, department: value})}
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
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Support Staff">Support Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={budgetForm.amount}
                        onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter expense description"
                      value={budgetForm.description}
                      onChange={(e) => setBudgetForm({...budgetForm, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="receipt">Receipt (Optional)</Label>
                    <Input
                      id="receipt"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setBudgetForm({...budgetForm, receipt: e.target.files?.[0] || null})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload receipt for expense verification</p>
                  </div>
                  <Button type="submit" disabled={isSubmittingBudget}>
                    {isSubmittingBudget ? 'Recording...' : 'Record Expense'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Search & Filter Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="expenseSearch">Search</Label>
                    <Input
                      id="expenseSearch"
                      placeholder="Search expenses..."
                      value={expenseSearchTerm}
                      onChange={(e) => setExpenseSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenseSearchField">Search By</Label>
                    <Select
                      value={expenseSearchField}
                      onValueChange={setExpenseSearchField}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="description">Description</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expenseDepartmentFilter">Department</Label>
                    <Select
                      value={expenseDepartmentFilter}
                      onValueChange={setExpenseDepartmentFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Support Staff">Support Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expenseStatusFilter">Status</Label>
                    <Select
                      value={expenseStatusFilter}
                      onValueChange={setExpenseStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleExpenseSearch} className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingExpenses ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading expenses...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentExpenses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No expenses found
                      </div>
                    ) : (
                      recentExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{expense.department}</p>
                              <p className="text-sm text-gray-500">{expense.description || 'No description'}</p>
                              <p className="text-sm text-gray-500">₹{Number(expense.amount).toLocaleString()}</p>
                              <p className="text-xs text-gray-400">
                                Created by {expense.creator?.name || 'Unknown'} • {new Date(expense.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge 
                              variant={
                                expense.status === 'COMPLETED' ? 'default' :
                                expense.status === 'APPROVED' ? 'default' :
                                expense.status === 'UNDER_REVIEW' ? 'secondary' :
                                expense.status === 'PENDING' ? 'secondary' :
                                expense.status === 'CANCELLED' ? 'outline' :
                                'destructive'
                              }
                            >
                              {expense.status}
                            </Badge>
                            
                            {/* Status Update Dropdown */}
                            <Select
                              value={expense.status}
                              onValueChange={(value) => handleBudgetStatusUpdate(expense.id, value)}
                              disabled={updatingBudgetStatus === expense.id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Print Receipt Button - Only for COMPLETED status */}
                            {expense.status === 'COMPLETED' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePrintBudgetReceipt(expense)}
                                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Print Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense Pagination */}
            {expenseTotalPages > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing {recentExpenses.length} expenses • Page {expenseCurrentPage} of {expenseTotalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExpensePageChange(expenseCurrentPage - 1)}
                        disabled={expenseCurrentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExpensePageChange(expenseCurrentPage + 1)}
                        disabled={expenseCurrentPage === expenseTotalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Budget Summary Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Budget Summary Overview
                </CardTitle>
                <CardDescription>
                  Comprehensive budget status breakdown and financial overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Main Budget Totals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-blue-700">Total Budget</p>
                            <p className="text-2xl font-bold text-blue-900">₹{budgetSummary.totalAmount.toLocaleString()}</p>
                            <p className="text-xs text-blue-600">{budgetSummary.totalExpenses} expenses</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-green-700">Net Budget</p>
                            <p className="text-2xl font-bold text-green-900">₹{budgetSummary.netBudget.toLocaleString()}</p>
                            <p className="text-xs text-green-600">After deductions</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                            <Building className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-purple-700">Completed</p>
                            <p className="text-2xl font-bold text-purple-900">₹{budgetSummary.completedTotal.toLocaleString()}</p>
                            <p className="text-xs text-purple-600">Finalized expenses</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Status Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-700">Pending</p>
                            <p className="text-xl font-bold text-yellow-900">₹{budgetSummary.pendingTotal.toLocaleString()}</p>
                          </div>
                          <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-orange-700">Under Review</p>
                            <p className="text-xl font-bold text-orange-900">₹{budgetSummary.underReviewTotal.toLocaleString()}</p>
                          </div>
                          <Eye className="h-8 w-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700">Approved</p>
                            <p className="text-xl font-bold text-green-900">₹{budgetSummary.approvedTotal.toLocaleString()}</p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-700">Rejected</p>
                            <p className="text-xl font-bold text-red-900">₹{budgetSummary.rejectedTotal.toLocaleString()}</p>
                          </div>
                          <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Deductions Section */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Budget Deductions</CardTitle>
                      <CardDescription>Amounts deducted from total budget</CardDescription>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Understanding Budget Deductions:</p>
                            <p><strong>Rejected Expenses:</strong> Expenses that were submitted but denied during the approval process due to policy violations, insufficient justification, or budget constraints.</p>
                            <p className="mt-1"><strong>Cancelled Expenses:</strong> Expenses that were withdrawn or cancelled before completion, often due to changed plans, duplicate requests, or no longer needed items.</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <div>
                              <p className="font-medium text-red-900">Rejected Expenses</p>
                              <p className="text-sm text-red-600">Denied during approval process</p>
                            </div>
                          </div>
                          <p className="text-lg font-bold text-red-900">₹{budgetSummary.rejectedTotal.toLocaleString()}</p>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-300">
                          <div className="flex items-center gap-3">
                            <X className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">Cancelled Expenses</p>
                              <p className="text-sm text-gray-600">Withdrawn before completion</p>
                            </div>
                          </div>
                          <p className="text-lg font-bold text-gray-900">₹{budgetSummary.cancelledTotal.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">Total Deductions</p>
                              <p className="text-sm text-blue-600">Rejected + Cancelled expenses</p>
                            </div>
                          </div>
                          <p className="text-xl font-bold text-blue-900">
                            ₹{(budgetSummary.rejectedTotal + budgetSummary.cancelledTotal).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Budget Utilization Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Budget Utilization</CardTitle>
                      <CardDescription>Visual breakdown of budget allocation by status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress bars for each status */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Completed</span>
                            <span className="text-sm text-gray-500">
                              ₹{budgetSummary.completedTotal.toLocaleString()} 
                              ({budgetSummary.totalAmount > 0 ? Math.round((budgetSummary.completedTotal / budgetSummary.totalAmount) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ 
                                width: budgetSummary.totalAmount > 0 ? `${(budgetSummary.completedTotal / budgetSummary.totalAmount) * 100}%` : '0%' 
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Approved</span>
                            <span className="text-sm text-gray-500">
                              ₹{budgetSummary.approvedTotal.toLocaleString()} 
                              ({budgetSummary.totalAmount > 0 ? Math.round((budgetSummary.approvedTotal / budgetSummary.totalAmount) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ 
                                width: budgetSummary.totalAmount > 0 ? `${(budgetSummary.approvedTotal / budgetSummary.totalAmount) * 100}%` : '0%' 
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Under Review</span>
                            <span className="text-sm text-gray-500">
                              ₹{budgetSummary.underReviewTotal.toLocaleString()} 
                              ({budgetSummary.totalAmount > 0 ? Math.round((budgetSummary.underReviewTotal / budgetSummary.totalAmount) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ 
                                width: budgetSummary.totalAmount > 0 ? `${(budgetSummary.underReviewTotal / budgetSummary.totalAmount) * 100}%` : '0%' 
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Pending</span>
                            <span className="text-sm text-gray-500">
                              ₹{budgetSummary.pendingTotal.toLocaleString()} 
                              ({budgetSummary.totalAmount > 0 ? Math.round((budgetSummary.pendingTotal / budgetSummary.totalAmount) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ 
                                width: budgetSummary.totalAmount > 0 ? `${(budgetSummary.pendingTotal / budgetSummary.totalAmount) * 100}%` : '0%' 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
