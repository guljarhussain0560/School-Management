/**
 * Excel & CSV Download Utilities for School Management System
 */

import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { EXCEL_TEMPLATES } from './templates';

/**
 * Download Excel template
 */
export const downloadExcelTemplate = (templateKey: string, data?: any[]): void => {
  try {
    const template = EXCEL_TEMPLATES[templateKey];
    if (!template) {
      toast.error('Template not found');
      return;
    }

    // Prepare data for Excel
    const excelData = data || template.sampleData || [];
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Generate filename
    const filename = `${template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Download file
    XLSX.writeFile(workbook, filename);
    
    toast.success(`${template.name} downloaded successfully`);
  } catch (error) {
    console.error('Error downloading template:', error);
    toast.error('Failed to download template');
  }
};

/**
 * Shared CSV template generator and downloader for admin forms
 */
export const downloadCsvTemplate = (templateKey: string, customFilename?: string): string => {
  const normalizedKey = templateKey.toLowerCase().replace(/[-_]/g, '');
  let headers: string[] = [];
  let sampleRows: string[][] = [];

  if (normalizedKey === 'payroll') {
    headers = ['Employee ID', 'Employee Name', 'Basic Salary', 'Allowances', 'Deductions', 'Payment Method'];
    sampleRows = [
      ['EMP001', 'John Doe', '50000', '10000', '5000', 'Bank Transfer'],
      ['EMP002', 'Jane Smith', '45000', '8000', '4000', 'Cheque']
    ];
  } else if (normalizedKey === 'studentadmission' || normalizedKey === 'students' || normalizedKey === 'student') {
    headers = ['Name', 'Grade', 'Age', 'Parent Name', 'Parent Phone', 'Address'];
    sampleRows = [
      ['John Doe', '10th', '15', 'Robert Doe', '9876543210', '123 Main St'],
      ['Jane Smith', '9th', '14', 'William Smith', '9876543211', '456 Oak Ave']
    ];
  } else if (EXCEL_TEMPLATES[templateKey]) {
    const tmpl = EXCEL_TEMPLATES[templateKey];
    headers = tmpl.columns.map(c => c.header);
    if (tmpl.sampleData && tmpl.sampleData.length > 0) {
      sampleRows = tmpl.sampleData.map(row => tmpl.columns.map(c => String(row[c.key] ?? '')));
    }
  } else {
    headers = ['Column 1', 'Column 2'];
    sampleRows = [['Sample 1', 'Sample 2']];
  }

  const csvRows = [headers, ...sampleRows];
  const csvContent = csvRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');

  if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof window.URL?.createObjectURL === 'function') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = customFilename || `${templateKey.toLowerCase()}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof window.URL?.revokeObjectURL === 'function') {
      window.URL.revokeObjectURL(url);
    }
  }

  return csvContent;
};
