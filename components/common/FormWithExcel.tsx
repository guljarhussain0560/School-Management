'use client'

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, Upload, FileSpreadsheet, AlertCircle, 
  CheckCircle, X, Plus, Trash2 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  downloadExcelTemplate, 
  uploadExcelFile, 
  validateFormData, 
  showUploadResults,
  ExcelUploadResult,
  EXCEL_TEMPLATES 
} from '@/lib/excel-utils';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: (value: any) => boolean;
}

interface FormWithExcelProps {
  title: string;
  description?: string;
  fields: FormField[];
  templateKey: string;
  onSubmit: (data: any) => Promise<void>;
  onBulkSubmit?: (data: any[]) => Promise<void>;
  initialData?: any;
  submitButtonText?: string;
  showExcelFeatures?: boolean;
}

const FormWithExcel: React.FC<FormWithExcelProps> = ({
  title,
  description,
  fields,
  templateKey,
  onSubmit,
  onBulkSubmit,
  initialData = {},
  submitButtonText = 'Submit',
  showExcelFeatures = true
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState<ExcelUploadResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const template = EXCEL_TEMPLATES[templateKey];

  const validateField = (name: string, value: any): string | null => {
    const field = fields.find(f => f.name === name);
    if (!field) return null;

    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`;
    }

    if (field.validation && value && !field.validation(value)) {
      return `${field.label} is invalid`;
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success('Data submitted successfully');
      setFormData(initialData);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!uploadResult || !uploadResult.success || !onBulkSubmit) {
      toast.error('No valid data to submit');
      return;
    }

    setIsSubmitting(true);
    try {
      await onBulkSubmit(uploadResult.data);
      toast.success(`${uploadResult.data.length} records submitted successfully`);
      setUploadResult(null);
      setShowBulkUpload(false);
    } catch (error) {
      console.error('Bulk submit error:', error);
      toast.error('Failed to submit bulk data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setUploadProgress(0);
    const result = await uploadExcelFile(file, templateKey, setUploadProgress);
    setUploadResult(result);
    showUploadResults(result, template?.name || 'Template');
  };

  const downloadTemplate = () => {
    downloadExcelTemplate(templateKey);
  };

  const isFormValid = () => {
    return fields.every(field => {
      if (!field.required) return true;
      const value = formData[field.name];
      return value && value.toString().trim() !== '';
    });
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(field.name, val)}>
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value}
              onCheckedChange={(checked) => handleInputChange(field.name, checked)}
            />
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Excel Features */}
      {showExcelFeatures && template && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Excel Import/Export
            </CardTitle>
            <CardDescription>
              Download template or upload data in bulk using Excel files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowBulkUpload(!showBulkUpload)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Bulk Upload
              </Button>
            </div>

            {showBulkUpload && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="file-upload">Upload Excel File</Label>
                  <Input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing file...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {uploadResult && (
                  <div className="space-y-3">
                    <Alert className={uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <div className="flex items-center gap-2">
                        {uploadResult.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription>
                          {uploadResult.success 
                            ? `${uploadResult.data.length} records processed successfully`
                            : `Upload failed with ${uploadResult.errors.length} errors`
                          }
                        </AlertDescription>
                      </div>
                    </Alert>

                    {uploadResult.errors.length > 0 && (
                      <div className="max-h-32 overflow-y-auto">
                        {uploadResult.errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-600">{error}</p>
                        ))}
                      </div>
                    )}

                    {uploadResult.success && onBulkSubmit && (
                      <Button
                        onClick={handleBulkSubmit}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? 'Submitting...' : `Submit ${uploadResult.data.length} Records`}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(renderField)}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData(initialData)}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Submitting...' : submitButtonText}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormWithExcel;
