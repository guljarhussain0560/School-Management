/**
 * Excel File Parsing & Upload Validation Utilities
 */

import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { EXCEL_TEMPLATES, ExcelUploadResult } from './templates';

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
