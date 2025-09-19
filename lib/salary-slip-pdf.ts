import jsPDF from 'jspdf';

interface SalarySlipData {
  slipNumber: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  month: number;
  year: number;
  status: string;
  date: string;
  schoolName: string;
}

export function downloadSalarySlipPDF(data: SalarySlipData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = [59, 130, 246]; // Blue
  const secondaryColor = [107, 114, 128]; // Gray
  const successColor = [34, 197, 94]; // Green
  
  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  // School Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.schoolName, pageWidth / 2, 15, { align: 'center' });
  
  // Salary Slip Title
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SALARY SLIP', pageWidth / 2, 40, { align: 'center' });
  
  // Slip Number and Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Slip No: ${data.slipNumber}`, 20, 50);
  doc.text(`Date: ${data.date}`, pageWidth - 20, 50, { align: 'right' });
  
  // Employee Information Section
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 60, pageWidth - 40, 40, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 25, 70);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${data.employeeName}`, 25, 80);
  doc.text(`Employee ID: ${data.employeeId}`, 25, 88);
  doc.text(`Department: ${data.department}`, 25, 96);
  doc.text(`Position: ${data.position}`, pageWidth / 2, 80);
  doc.text(`Month/Year: ${getMonthName(data.month)} ${data.year}`, pageWidth / 2, 88);
  doc.text(`Status: ${data.status}`, pageWidth / 2, 96);
  
  // Salary Details Section
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 110, pageWidth - 40, 60, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Salary Details', 25, 120);
  
  // Salary breakdown table
  const tableData = [
    ['Description', 'Amount (₹)'],
    ['Basic Salary', data.basicSalary.toLocaleString()],
    ['Allowances', data.allowances.toLocaleString()],
    ['Gross Salary', (data.basicSalary + data.allowances).toLocaleString()],
    ['Deductions', `-${data.deductions.toLocaleString()}`],
    ['Net Salary', data.netSalary.toLocaleString()]
  ];
  
  let yPosition = 130;
  tableData.forEach((row, index) => {
    if (index === 0) {
      // Header row
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(25, yPosition - 5, pageWidth - 50, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
    }
    
    doc.text(row[0], 30, yPosition);
    doc.text(row[1], pageWidth - 30, yPosition, { align: 'right' });
    yPosition += 8;
  });
  
  // Net Salary Highlight
  doc.setFillColor(successColor[0], successColor[1], successColor[2]);
  doc.rect(25, yPosition - 5, pageWidth - 50, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('NET SALARY', 30, yPosition);
  doc.text(`₹${data.netSalary.toLocaleString()}`, pageWidth - 30, yPosition, { align: 'right' });
  
  // Footer
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer generated salary slip and does not require signature.', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text('For any queries, please contact the HR department.', pageWidth / 2, pageHeight - 15, { align: 'center' });
  
  // Download the PDF
  doc.save(`salary-slip-${data.employeeId}-${data.month}-${data.year}.pdf`);
}

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
}
