'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { isFormValid, validateForm, FormField, FieldValidators } from '@/lib/form-validation';

interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validator?: (value: any) => string | null;
  description?: string;
}

interface ValidatedFormProps {
  fields: FormFieldConfig[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  submitText?: string;
  loading?: boolean;
  className?: string;
}

const ValidatedForm: React.FC<ValidatedFormProps> = ({
  fields,
  initialData = {},
  onSubmit,
  submitText = 'Submit',
  loading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get required fields
  const requiredFields = fields.filter(field => field.required).map(field => field.name);

  // Check if form is valid
  const formIsValid = isFormValid(formData, requiredFields);

  // Update form data
  const updateField = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateFormData = () => {
    const formFields: FormField[] = fields.map(field => ({
      name: field.name,
      value: formData[field.name],
      required: field.required,
      type: field.type,
      minLength: field.minLength,
      maxLength: field.maxLength,
      pattern: field.pattern,
      customValidator: field.validator
    }));

    const validation = validateForm(formFields);
    setErrors(validation.errors);
    return validation.isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render field based on type
  const renderField = (field: FormFieldConfig) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    const commonProps = {
      id: field.name,
      value: value,
      onChange: (e: any) => updateField(field.name, e.target.value),
      className: error ? 'border-red-500' : '',
      placeholder: field.placeholder
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={3}
            onChange={(e) => updateField(field.name, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(value) => updateField(field.name, value)}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              checked={!!value}
              onChange={(e) => updateField(field.name, e.target.checked)}
              className="rounded border-gray-300"
              aria-label={field.label}
            />
            <Label htmlFor={field.name} className="text-sm font-normal">
              {field.label}
            </Label>
          </div>
        );

      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
            required={field.required}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          {field.type !== 'checkbox' && (
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          
          {renderField(field)}
          
          {field.description && (
            <p className="text-xs text-gray-500">{field.description}</p>
          )}
          
          {errors[field.name] && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {errors[field.name]}
              </AlertDescription>
            </Alert>
          )}
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={!formIsValid || loading || isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting || loading ? 'Processing...' : submitText}
        </Button>
      </div>
    </form>
  );
};

export default ValidatedForm;
