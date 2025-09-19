import jsPDF from 'jspdf';

interface ReceiptData {
  receiptNumber: string;
  studentName: string;
  studentId: string;
  admissionNumber?: string;
  grade: string;
  amount: number;
  paymentMode: string;
  notes?: string;
  date: string;
  collectedBy: string;
  schoolName: string;
}

export function generateFeeReceiptPDF(data: ReceiptData): jsPDF {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // School Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.schoolName, 105, 20, { align: 'center' });
  
  // Receipt Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FEE COLLECTION RECEIPT', 105, 35, { align: 'center' });
  
  // Receipt Number
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt No: ${data.receiptNumber}`, 20, 50);
  doc.text(`Date: ${data.date}`, 20, 60);
  
  // Line separator
  doc.line(20, 70, 190, 70);
  
  // Student Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT INFORMATION', 20, 85);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student Name: ${data.studentName}`, 20, 100);
  doc.text(`Student ID: ${data.studentId}`, 20, 110);
  if (data.admissionNumber) {
    doc.text(`Admission Number: ${data.admissionNumber}`, 20, 120);
  }
  doc.text(`Grade: ${data.grade}`, 20, data.admissionNumber ? 130 : 120);
  
  // Payment Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INFORMATION', 20, data.admissionNumber ? 150 : 140);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Amount: ₹${data.amount.toLocaleString()}`, 20, data.admissionNumber ? 165 : 155);
  doc.text(`Payment Mode: ${data.paymentMode}`, 20, data.admissionNumber ? 175 : 165);
  if (data.notes) {
    doc.text(`Notes: ${data.notes}`, 20, data.admissionNumber ? 185 : 175);
  }
  
  // Collected By
  doc.text(`Collected By: ${data.collectedBy}`, 20, data.notes ? (data.admissionNumber ? 195 : 185) : (data.admissionNumber ? 185 : 175));
  
  // Line separator
  doc.line(20, data.notes ? (data.admissionNumber ? 205 : 195) : (data.admissionNumber ? 195 : 185), 190, data.notes ? (data.admissionNumber ? 205 : 195) : (data.admissionNumber ? 195 : 185));
  
  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer generated receipt.', 105, data.notes ? (data.admissionNumber ? 220 : 210) : (data.admissionNumber ? 210 : 200), { align: 'center' });
  doc.text('No signature required.', 105, data.notes ? (data.admissionNumber ? 230 : 220) : (data.admissionNumber ? 220 : 210), { align: 'center' });
  
  return doc;
}

export function downloadReceiptPDF(data: ReceiptData): void {
  const doc = generateFeeReceiptPDF(data);
  const fileName = `Fee_Receipt_${data.receiptNumber}_${data.studentName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
