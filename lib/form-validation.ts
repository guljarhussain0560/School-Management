/**
 * Form Validation Utilities
 * Provides client-side validation for forms with required field checking
 */

import React from 'react';

export interface FormField {
  name: string;
  value: any;
  required?: boolean;
  type?: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a single field
 */
export function validateField(field: FormField): string | null {
  const { name, value, required, type, minLength, maxLength, pattern, customValidator } = field;

  // Check required fields
  if (required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return `${name} is required`;
  }

  // Skip further validation if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // Type-specific validation
  switch (type) {
    case 'email':
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return 'Please enter a valid email address';
      }
      break;
    
    case 'number':
      if (isNaN(Number(value))) {
        return 'Please enter a valid number';
      }
      break;
    
    case 'date':
      if (isNaN(Date.parse(value))) {
        return 'Please enter a valid date';
      }
      break;
  }

  // Length validation
  if (typeof value === 'string') {
    if (minLength && value.length < minLength) {
      return `${name} must be at least ${minLength} characters long`;
    }
    if (maxLength && value.length > maxLength) {
      return `${name} must be no more than ${maxLength} characters long`;
    }
  }

  // Pattern validation
  if (pattern && typeof value === 'string' && !pattern.test(value)) {
    return `Please enter a valid ${name}`;
  }

  // Custom validation
  if (customValidator) {
    return customValidator(value);
  }

  return null;
}

/**
 * Validates multiple fields
 */
export function validateForm(fields: FormField[]): ValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;

  fields.forEach(field => {
    const error = validateField(field);
    if (error) {
      errors[field.name] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
}

/**
 * Checks if a form is valid (all required fields filled)
 */
export function isFormValid(formData: Record<string, any>, requiredFields: string[]): boolean {
  return requiredFields.every(field => {
    const value = formData[field];
    return value !== undefined && value !== null && value !== '' && 
           (typeof value !== 'string' || value.trim() !== '');
  });
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  phone: /^[6-9]\d{9}$/,
  pincode: /^\d{6}$/,
  aadhar: /^\d{12}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  rollNumber: /^[A-Z0-9]+$/,
  studentId: /^[A-Z]{3}\d{8}$/,
  employeeId: /^[A-Z]{3}\d{5}$/
};

/**
 * Common field validators
 */
export const FieldValidators = {
  phone: (value: string) => {
    if (!ValidationPatterns.phone.test(value)) {
      return 'Please enter a valid 10-digit phone number';
    }
    return null;
  },
  
  email: (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },
  
  pincode: (value: string) => {
    if (!ValidationPatterns.pincode.test(value)) {
      return 'Please enter a valid 6-digit pincode';
    }
    return null;
  },
  
  aadhar: (value: string) => {
    if (!ValidationPatterns.aadhar.test(value)) {
      return 'Please enter a valid 12-digit Aadhar number';
    }
    return null;
  },
  
  pan: (value: string) => {
    if (!ValidationPatterns.pan.test(value)) {
      return 'Please enter a valid PAN number';
    }
    return null;
  },
  
  ifsc: (value: string) => {
    if (!ValidationPatterns.ifsc.test(value)) {
      return 'Please enter a valid IFSC code';
    }
    return null;
  },
  
  age: (value: string) => {
    const age = parseInt(value);
    if (isNaN(age) || age < 3 || age > 25) {
      return 'Please enter a valid age between 3 and 25';
    }
    return null;
  },
  
  salary: (value: string) => {
    const salary = parseFloat(value);
    if (isNaN(salary) || salary < 0) {
      return 'Please enter a valid salary amount';
    }
    return null;
  },
  
  marks: (value: string, maxMarks: number = 100) => {
    const marks = parseFloat(value);
    if (isNaN(marks) || marks < 0 || marks > maxMarks) {
      return `Please enter valid marks between 0 and ${maxMarks}`;
    }
    return null;
  }
};

/**
 * Hook for form validation
 */
export function useFormValidation(requiredFields: string[]) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isValid, setIsValid] = React.useState(false);

  const validate = (formData: Record<string, any>) => {
    const newErrors: Record<string, string> = {};
    let formIsValid = true;

    requiredFields.forEach(field => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = `${field} is required`;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return { isValid: formIsValid, errors: newErrors };
  };

  const clearErrors = () => {
    setErrors({});
    setIsValid(false);
  };

  return { errors, isValid, validate, clearErrors };
}
