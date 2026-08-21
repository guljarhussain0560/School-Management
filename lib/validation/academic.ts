import { z } from 'zod'

export const createStudentSchema = z.object({
  name: z.string().min(2, 'Student name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable().or(z.literal('')),
  dateOfBirth: z.string().optional().nullable().or(z.literal('')),
  gender: z.string().optional().nullable().or(z.literal('')),
  classId: z.string().min(1, 'Class ID is required'),
  batchId: z.string().optional().nullable().or(z.literal('')),
  age: z.coerce.number().int().positive().default(10),
  rollNumber: z.string().optional().nullable().or(z.literal('')),
  parentName: z.string().optional().nullable().or(z.literal('')),
  parentPhone: z.string().optional().nullable().or(z.literal('')),
  parentEmail: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable().or(z.literal('')),
  city: z.string().optional().nullable().or(z.literal('')),
  state: z.string().optional().nullable().or(z.literal('')),
  pincode: z.string().optional().nullable().or(z.literal('')),
  transportRequired: z.boolean().default(false),
  medicalConditions: z.string().optional().nullable().or(z.literal('')),
  allergies: z.string().optional().nullable().or(z.literal('')),
  previousSchool: z.string().optional().nullable().or(z.literal('')),
})

export const createClassSchema = z.object({
  className: z.string().min(1, 'Class name is required'),
  level: z.string().min(1, 'Level is required'),
  section: z.string().min(1, 'Section is required'),
  description: z.string().optional().nullable(),
  capacity: z.coerce.number().int().positive().default(30),
  batchId: z.string().min(1, 'Batch ID is required'),
})

export const createSectionSchema = z.object({
  sectionName: z.string().min(1, 'Section name is required'),
  classId: z.string().min(1, 'Class ID is required'),
  roomNumber: z.string().optional().nullable(),
  capacity: z.coerce.number().int().positive().default(30),
})

export const createBatchSchema = z.object({
  batchName: z.string().min(1, 'Batch name is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().optional().nullable(),
})

export const recordAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  grade: z.string().min(1, 'Grade is required'),
  subject: z.string().optional().nullable(),
  attendanceRecords: z.array(
    z.object({
      studentId: z.string().min(1, 'Student ID is required'),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    })
  ).min(1, 'At least one student record is required'),
})

export const createExamSchema = z.object({
  examName: z.string().min(1, 'Exam name is required'),
  examType: z.enum(['QUIZ', 'TEST', 'MID_TERM', 'FINAL', 'ASSIGNMENT', 'PROJECT', 'PRACTICAL', 'ORAL']),
  subjectId: z.string().min(1, 'Subject ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  totalMarks: z.coerce.number().positive('Total marks must be positive'),
  passingMarks: z.coerce.number().min(0, 'Passing marks cannot be negative'),
  duration: z.coerce.number().int().positive('Duration must be positive in minutes'),
  instructions: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
})

export const submitStudentMarksSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
  marks: z.coerce.number().min(0, 'Marks cannot be negative'),
  maxMarks: z.coerce.number().positive('Max marks must be positive').default(100),
  examType: z.string().min(1, 'Exam type is required'),
  examDate: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
})

export const createSubjectSchema = z.object({
  subjectName: z.string().min(1, 'Subject name is required'),
  subjectCode: z.string().min(1, 'Subject code is required'),
  classId: z.string().min(1, 'Class ID is required'),
  description: z.string().optional().nullable(),
})

export const createTeacherAssignmentSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type CreateClassInput = z.infer<typeof createClassSchema>
export type CreateSectionInput = z.infer<typeof createSectionSchema>
export type CreateBatchInput = z.infer<typeof createBatchSchema>
export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>
export type CreateExamInput = z.infer<typeof createExamSchema>
export type SubmitStudentMarksInput = z.infer<typeof submitStudentMarksSchema>
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>
export type CreateTeacherAssignmentInput = z.infer<typeof createTeacherAssignmentSchema>
