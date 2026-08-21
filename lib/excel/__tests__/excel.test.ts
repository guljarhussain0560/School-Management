import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  EXCEL_TEMPLATES,
  downloadExcelTemplate,
  downloadCsvTemplate,
  validateFormData,
  showUploadResults,
  uploadExcelFile
} from '../index';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}));

describe('Excel Templates & Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EXCEL_TEMPLATES', () => {
    it('defines standard required templates', () => {
      expect(EXCEL_TEMPLATES.students).toBeDefined();
      expect(EXCEL_TEMPLATES.employees).toBeDefined();
      expect(EXCEL_TEMPLATES.feeStructures).toBeDefined();
      expect(EXCEL_TEMPLATES.feeCollections).toBeDefined();
      expect(EXCEL_TEMPLATES.exams).toBeDefined();
      expect(EXCEL_TEMPLATES.buses).toBeDefined();
      expect(EXCEL_TEMPLATES.routes).toBeDefined();
      expect(EXCEL_TEMPLATES.schoolProfile).toBeDefined();
    });

    it('contains valid column definitions and sample data', () => {
      const studentTmpl = EXCEL_TEMPLATES.students;
      expect(studentTmpl.name).toBe('Student Registration Template');
      expect(studentTmpl.columns.length).toBeGreaterThan(5);
      expect(studentTmpl.sampleData?.length).toBeGreaterThan(0);
      expect(studentTmpl.sampleData?.[0].name).toBe('John Doe');
    });
  });

  describe('downloadCsvTemplate', () => {
    it('generates payroll CSV template correctly', () => {
      const csv = downloadCsvTemplate('payroll');
      expect(csv).toContain('Employee ID');
      expect(csv).toContain('Basic Salary');
      expect(csv).toContain('EMP001');
    });

    it('generates student admission CSV template correctly', () => {
      const csv = downloadCsvTemplate('studentAdmission');
      expect(csv).toContain('Name');
      expect(csv).toContain('Grade');
      expect(csv).toContain('John Doe');
    });

    it('generates CSV from existing template definitions', () => {
      const csv = downloadCsvTemplate('feeCollections');
      expect(csv).toContain('Student ID');
      expect(csv).toContain('Payment Mode');
    });

    it('handles unknown templates with fallback columns', () => {
      const csv = downloadCsvTemplate('unknown_key');
      expect(csv).toContain('Column 1');
      expect(csv).toContain('Sample 1');
    });
  });

  describe('validateFormData', () => {
    it('returns isValid true when all required fields are present', () => {
      const result = validateFormData({ name: 'Alice', age: 12 }, ['name', 'age']);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('returns isValid false and error messages when fields are missing', () => {
      const result = validateFormData({ name: '', age: 12 }, ['name', 'sectionId']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name is required');
      expect(result.errors).toContain('sectionId is required');
    });
  });

  describe('showUploadResults', () => {
    it('shows success toast on valid result', () => {
      showUploadResults({ success: true, data: [{}], errors: [], warnings: [] }, 'Students');
      expect(toast.success).toHaveBeenCalledWith('Students: 1 records processed successfully');
    });

    it('shows error toasts on failure', () => {
      showUploadResults({ success: false, data: [], errors: ['Row 2: Invalid age'], warnings: ['Missing optional phone'] }, 'Students');
      expect(toast.error).toHaveBeenCalledWith('Students: Upload failed with 1 errors');
      expect(toast.error).toHaveBeenCalledWith('Row 2: Invalid age');
      expect(toast.warning).toHaveBeenCalledWith('Missing optional phone');
    });
  });

  describe('downloadExcelTemplate & uploadExcelFile error handling', () => {
    it('handles non-existent template key in downloadExcelTemplate', () => {
      downloadExcelTemplate('non_existent_key');
      expect(toast.error).toHaveBeenCalledWith('Template not found');
    });

    it('returns error when template is not found in uploadExcelFile', async () => {
      const dummyFile = new File([''], 'test.xlsx');
      const result = await uploadExcelFile(dummyFile, 'non_existent_key');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Template not found');
    });
  });
});
