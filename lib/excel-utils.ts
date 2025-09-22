/**
 * Excel Utility Functions for School Management System
 * Handles download/upload of Excel files with validation
 */

import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export interface ExcelColumn {
  key: string;
  header: string;
  required?: boolean;
  type?: 'string' | 'number' | 'date' | 'boolean';
  validation?: (value: any) => boolean;
  transform?: (value: any) => any;
}

export interface ExcelTemplate {
  name: string;
  columns: ExcelColumn[];
  sampleData?: any[];
}

export interface ExcelUploadResult {
  success: boolean;
  data: any[];
  errors: string[];
  warnings: string[];
}

// Common Excel Templates
export const EXCEL_TEMPLATES: Record<string, ExcelTemplate> = {
  students: {
    name: 'Student Registration Template',
    columns: [
      { key: 'name', header: 'Student Name', required: true, type: 'string' },
      { key: 'email', header: 'Email', required: false, type: 'string' },
      { key: 'age', header: 'Age', required: true, type: 'number' },
      { key: 'dateOfBirth', header: 'Date of Birth', required: false, type: 'date' },
      { key: 'gender', header: 'Gender', required: false, type: 'string' },
      { key: 'parentName', header: 'Parent Name', required: true, type: 'string' },
      { key: 'parentPhone', header: 'Parent Phone', required: true, type: 'string' },
      { key: 'parentEmail', header: 'Parent Email', required: false, type: 'string' },
      { key: 'address', header: 'Address', required: false, type: 'string' },
      { key: 'city', header: 'City', required: false, type: 'string' },
      { key: 'state', header: 'State', required: false, type: 'string' },
      { key: 'pincode', header: 'Pincode', required: false, type: 'string' },
      { key: 'previousSchool', header: 'Previous School', required: false, type: 'string' },
      { key: 'transportRequired', header: 'Transport Required', required: false, type: 'boolean', transform: (val) => val === 'Yes' || val === 'true' || val === true },
      { key: 'medicalConditions', header: 'Medical Conditions', required: false, type: 'string' },
      { key: 'allergies', header: 'Allergies', required: false, type: 'string' }
    ],
    sampleData: [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        age: 15,
        dateOfBirth: '2008-05-15',
        gender: 'Male',
        parentName: 'Robert Doe',
        parentPhone: '9876543210',
        parentEmail: 'robert.doe@example.com',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        previousSchool: 'ABC School',
        transportRequired: 'Yes',
        medicalConditions: 'None',
        allergies: 'None'
      }
    ]
  },
  employees: {
    name: 'Employee Registration Template',
    columns: [
      { key: 'name', header: 'Employee Name', required: true, type: 'string' },
      { key: 'email', header: 'Email', required: true, type: 'string' },
      { key: 'phone', header: 'Phone', required: false, type: 'string' },
      { key: 'dateOfBirth', header: 'Date of Birth', required: false, type: 'date' },
      { key: 'dateOfJoining', header: 'Date of Joining', required: true, type: 'date' },
      { key: 'department', header: 'Department', required: true, type: 'string' },
      { key: 'position', header: 'Position', required: true, type: 'string' },
      { key: 'salary', header: 'Salary', required: true, type: 'number' },
      { key: 'qualifications', header: 'Qualifications', required: false, type: 'string' },
      { key: 'experience', header: 'Experience', required: false, type: 'string' },
      { key: 'address', header: 'Address', required: false, type: 'string' },
      { key: 'emergencyContact', header: 'Emergency Contact', required: false, type: 'string' },
      { key: 'emergencyPhone', header: 'Emergency Phone', required: false, type: 'string' },
      { key: 'bankAccount', header: 'Bank Account', required: false, type: 'string' },
      { key: 'ifscCode', header: 'IFSC Code', required: false, type: 'string' },
      { key: 'panNumber', header: 'PAN Number', required: false, type: 'string' },
      { key: 'aadharNumber', header: 'Aadhar Number', required: false, type: 'string' }
    ],
    sampleData: [
      {
        name: 'Jane Smith',
        email: 'jane.smith@school.com',
        phone: '9876543210',
        dateOfBirth: '1985-03-20',
        dateOfJoining: '2024-01-01',
        department: 'Teaching',
        position: 'Mathematics Teacher',
        salary: 45000,
        qualifications: 'M.Sc Mathematics, B.Ed',
        experience: '5 years',
        address: '456 Park Avenue',
        emergencyContact: 'John Smith',
        emergencyPhone: '9876543211',
        bankAccount: '1234567890',
        ifscCode: 'SBIN0001234',
        panNumber: 'ABCDE1234F',
        aadharNumber: '123456789012'
      }
    ]
  },
  feeStructures: {
    name: 'Fee Structure Template',
    columns: [
      { key: 'name', header: 'Fee Name', required: true, type: 'string' },
      { key: 'description', header: 'Description', required: false, type: 'string' },
      { key: 'amount', header: 'Amount', required: true, type: 'number' },
      { key: 'frequency', header: 'Frequency', required: true, type: 'string' },
      { key: 'category', header: 'Category', required: true, type: 'string' },
      { key: 'isMandatory', header: 'Is Mandatory', required: false, type: 'boolean', transform: (val) => val === 'Yes' || val === 'true' || val === true },
      { key: 'applicableFrom', header: 'Applicable From', required: true, type: 'date' },
      { key: 'applicableTo', header: 'Applicable To', required: false, type: 'date' }
    ],
    sampleData: [
      {
        name: 'Tuition Fee',
        description: 'Monthly tuition fee',
        amount: 15000,
        frequency: 'MONTHLY',
        category: 'TUITION',
        isMandatory: 'Yes',
        applicableFrom: '2024-04-01',
        applicableTo: '2025-03-31'
      }
    ]
  },
  feeCollections: {
    name: 'Fee Collection Template',
    columns: [
      { key: 'studentId', header: 'Student ID', required: true, type: 'string' },
      { key: 'amount', header: 'Amount', required: true, type: 'number' },
      { key: 'paymentMode', header: 'Payment Mode', required: true, type: 'string' },
      { key: 'date', header: 'Payment Date', required: true, type: 'date' },
      { key: 'dueDate', header: 'Due Date', required: false, type: 'date' },
      { key: 'notes', header: 'Notes', required: false, type: 'string' }
    ],
    sampleData: [
      {
        studentId: 'ABC24A001',
        amount: 15000,
        paymentMode: 'CASH',
        date: '2024-04-01',
        dueDate: '2024-04-05',
        notes: 'Monthly tuition fee'
      }
    ]
  },
  exams: {
    name: 'Exam Management Template',
    columns: [
      { key: 'examName', header: 'Exam Name', required: true, type: 'string' },
      { key: 'examType', header: 'Exam Type', required: true, type: 'string' },
      { key: 'subjectId', header: 'Subject ID', required: true, type: 'string' },
      { key: 'classId', header: 'Class ID', required: true, type: 'string' },
      { key: 'totalMarks', header: 'Total Marks', required: true, type: 'number' },
      { key: 'passingMarks', header: 'Passing Marks', required: true, type: 'number' },
      { key: 'duration', header: 'Duration (minutes)', required: true, type: 'number' },
      { key: 'instructions', header: 'Instructions', required: false, type: 'string' }
    ],
    sampleData: [
      {
        examName: 'Mathematics Mid Term',
        examType: 'MID_TERM',
        subjectId: 'subj_001',
        classId: 'class_001',
        totalMarks: 100,
        passingMarks: 40,
        duration: 120,
        instructions: 'All questions are compulsory'
      }
    ]
  },
  academicEvents: {
    name: 'Academic Calendar Template',
    columns: [
      { key: 'title', header: 'Event Title', required: true, type: 'string' },
      { key: 'description', header: 'Description', required: false, type: 'string' },
      { key: 'eventType', header: 'Event Type', required: true, type: 'string' },
      { key: 'startDate', header: 'Start Date', required: true, type: 'date' },
      { key: 'endDate', header: 'End Date', required: false, type: 'date' },
      { key: 'startTime', header: 'Start Time', required: false, type: 'string' },
      { key: 'endTime', header: 'End Time', required: false, type: 'string' },
      { key: 'venue', header: 'Venue', required: false, type: 'string' },
      { key: 'isAllDay', header: 'All Day Event', required: false, type: 'boolean', transform: (val) => val === 'Yes' || val === 'true' || val === true }
    ],
    sampleData: [
      {
        title: 'Annual Sports Day',
        description: 'School annual sports competition',
        eventType: 'EVENT',
        startDate: '2024-03-15',
        endDate: '2024-03-15',
        startTime: '09:00',
        endTime: '17:00',
        venue: 'School Ground',
        isAllDay: 'No'
      }
    ]
  },
  buses: {
    name: 'Bus Management Template',
    columns: [
      { key: 'busNumber', header: 'Bus Number', required: true, type: 'string' },
      { key: 'registrationNumber', header: 'Registration Number', required: true, type: 'string' },
      { key: 'capacity', header: 'Seating Capacity', required: true, type: 'number' },
      { key: 'driverName', header: 'Driver Name', required: true, type: 'string' },
      { key: 'driverPhone', header: 'Driver Phone', required: true, type: 'string' },
      { key: 'conductorName', header: 'Conductor Name', required: false, type: 'string' },
      { key: 'conductorPhone', header: 'Conductor Phone', required: false, type: 'string' },
      { key: 'routeId', header: 'Route ID', required: false, type: 'string' },
      { key: 'status', header: 'Status', required: true, type: 'string' },
      { key: 'fuelType', header: 'Fuel Type', required: true, type: 'string' },
      { key: 'yearOfManufacture', header: 'Year of Manufacture', required: true, type: 'number' },
      { key: 'insuranceExpiry', header: 'Insurance Expiry', required: true, type: 'date' },
      { key: 'fitnessExpiry', header: 'Fitness Expiry', required: true, type: 'date' },
      { key: 'lastServiceDate', header: 'Last Service Date', required: false, type: 'date' },
      { key: 'nextServiceDate', header: 'Next Service Date', required: false, type: 'date' },
      { key: 'mileage', header: 'Current Mileage', required: false, type: 'number' },
      { key: 'notes', header: 'Notes', required: false, type: 'string' }
    ],
    sampleData: [
      {
        busNumber: 'BUS-001',
        registrationNumber: 'MH-01-AB-1234',
        capacity: 50,
        driverName: 'John Doe',
        driverPhone: '9876543210',
        conductorName: 'Jane Smith',
        conductorPhone: '9876543211',
        routeId: 'route_001',
        status: 'ACTIVE',
        fuelType: 'DIESEL',
        yearOfManufacture: 2020,
        insuranceExpiry: '2024-12-31',
        fitnessExpiry: '2024-12-31',
        lastServiceDate: '2024-01-15',
        nextServiceDate: '2024-04-15',
        mileage: 50000,
        notes: 'Regular maintenance required'
      }
    ]
  },
  routes: {
    name: 'Route Management Template',
    columns: [
      { key: 'routeName', header: 'Route Name', required: true, type: 'string' },
      { key: 'routeCode', header: 'Route Code', required: true, type: 'string' },
      { key: 'description', header: 'Description', required: false, type: 'string' },
      { key: 'startLocation', header: 'Start Location', required: true, type: 'string' },
      { key: 'endLocation', header: 'End Location', required: true, type: 'string' },
      { key: 'totalDistance', header: 'Total Distance (km)', required: true, type: 'number' },
      { key: 'estimatedDuration', header: 'Estimated Duration (minutes)', required: true, type: 'number' },
      { key: 'isActive', header: 'Active Route', required: false, type: 'boolean', transform: (val) => val === 'Yes' || val === 'true' || val === true }
    ],
    sampleData: [
      {
        routeName: 'Route A - Downtown',
        routeCode: 'RTE-A',
        description: 'Main downtown route',
        startLocation: 'School Main Gate',
        endLocation: 'Downtown Area',
        totalDistance: 15.5,
        estimatedDuration: 45,
        isActive: 'Yes'
      }
    ]
  },
  schoolProfile: {
    name: 'School Profile Template',
    columns: [
      { key: 'schoolName', header: 'School Name', required: true, type: 'string' },
      { key: 'schoolCode', header: 'School Code', required: true, type: 'string' },
      { key: 'address', header: 'Address', required: true, type: 'string' },
      { key: 'city', header: 'City', required: true, type: 'string' },
      { key: 'state', header: 'State', required: true, type: 'string' },
      { key: 'pincode', header: 'Pincode', required: true, type: 'string' },
      { key: 'country', header: 'Country', required: true, type: 'string' },
      { key: 'phone', header: 'Phone', required: true, type: 'string' },
      { key: 'email', header: 'Email', required: true, type: 'string' },
      { key: 'website', header: 'Website', required: false, type: 'string' },
      { key: 'establishedYear', header: 'Established Year', required: true, type: 'number' },
      { key: 'affiliation', header: 'Affiliation', required: true, type: 'string' },
      { key: 'board', header: 'Board', required: true, type: 'string' },
      { key: 'principalName', header: 'Principal Name', required: true, type: 'string' },
      { key: 'principalEmail', header: 'Principal Email', required: true, type: 'string' },
      { key: 'principalPhone', header: 'Principal Phone', required: true, type: 'string' },
      { key: 'motto', header: 'School Motto', required: false, type: 'string' },
      { key: 'vision', header: 'Vision', required: false, type: 'string' },
      { key: 'mission', header: 'Mission', required: false, type: 'string' }
    ],
    sampleData: [
      {
        schoolName: 'ABC International School',
        schoolCode: 'ABC001',
        address: '123 Education Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        phone: '9876543210',
        email: 'info@abcschool.com',
        website: 'https://abcschool.com',
        establishedYear: 2000,
        affiliation: 'CBSE',
        board: 'Central Board of Secondary Education',
        principalName: 'Dr. John Smith',
        principalEmail: 'principal@abcschool.com',
        principalPhone: '9876543211',
        motto: 'Excellence in Education',
        vision: 'To be a leading educational institution',
        mission: 'Providing quality education to all students'
      }
    ]
  }
};

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
 * Upload and validate Excel file
 */
export const uploadExcelFile = async (
  file: File, 
  templateKey: string,
  onProgress?: (progress: number) => void
): Promise<ExcelUploadResult> => {
  try {
    const template = EXCEL_TEMPLATES[templateKey];
    if (!template) {
      return {
        success: false,
        data: [],
        errors: ['Template not found'],
        warnings: []
      };
    }

    // Read file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    if (rawData.length === 0) {
      return {
        success: false,
        data: [],
        errors: ['No data found in the file'],
        warnings: []
      };
    }

    // Validate and transform data
    const validatedData: any[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    rawData.forEach((row: any, index: number) => {
      const rowNumber = index + 2; // +2 because Excel is 1-indexed and we skip header
      const validatedRow: any = {};
      let hasErrors = false;

      // Validate each column
      template.columns.forEach(column => {
        const value = row[column.header];
        
        // Check required fields
        if (column.required && (!value || value.toString().trim() === '')) {
          errors.push(`Row ${rowNumber}: ${column.header} is required`);
          hasErrors = true;
          return;
        }

        // Skip validation if value is empty and not required
        if (!value || value.toString().trim() === '') {
          validatedRow[column.key] = null;
          return;
        }

        // Type validation and transformation
        let processedValue = value;
        
        if (column.type === 'number') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors.push(`Row ${rowNumber}: ${column.header} must be a valid number`);
            hasErrors = true;
            return;
          }
          processedValue = numValue;
        } else if (column.type === 'date') {
          const dateValue = new Date(value);
          if (isNaN(dateValue.getTime())) {
            errors.push(`Row ${rowNumber}: ${column.header} must be a valid date`);
            hasErrors = true;
            return;
          }
          processedValue = dateValue;
        } else if (column.type === 'boolean') {
          processedValue = column.transform ? column.transform(value) : value;
        } else {
          processedValue = value.toString().trim();
        }

        // Custom validation
        if (column.validation && !column.validation(processedValue)) {
          errors.push(`Row ${rowNumber}: ${column.header} failed validation`);
          hasErrors = true;
          return;
        }

        // Apply transformation
        if (column.transform) {
          processedValue = column.transform(processedValue);
        }

        validatedRow[column.key] = processedValue;
      });

      if (!hasErrors) {
        validatedData.push(validatedRow);
      }
    });

    // Progress callback
    if (onProgress) {
      onProgress(100);
    }

    return {
      success: errors.length === 0,
      data: validatedData,
      errors,
      warnings
    };

  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      data: [],
      errors: ['Failed to process file: ' + (error as Error).message],
      warnings: []
    };
  }
};

/**
 * Validate form data before submission
 */
export const validateFormData = (data: any, requiredFields: string[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field} is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Show upload results with toast notifications
 */
export const showUploadResults = (result: ExcelUploadResult, templateName: string): void => {
  if (result.success) {
    toast.success(`${templateName}: ${result.data.length} records processed successfully`);
  } else {
    toast.error(`${templateName}: Upload failed with ${result.errors.length} errors`);
  }

  // Show individual errors
  result.errors.forEach(error => {
    toast.error(error);
  });

  // Show warnings
  result.warnings.forEach(warning => {
    toast.warning(warning);
  });
};
