import { z } from 'zod'

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
  examType: z.string().min(1, 'Exam type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  batchId: z.string().optional().nullable(),
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

export type CreateClassInput = z.infer<typeof createClassSchema>
export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>
export type CreateExamInput = z.infer<typeof createExamSchema>
export type SubmitStudentMarksInput = z.infer<typeof submitStudentMarksSchema>
