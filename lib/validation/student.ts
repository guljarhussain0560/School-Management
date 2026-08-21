import { z } from 'zod'

export const studentDocumentSchema = z.object({
  name: z.string(),
  url: z.string(),
  originalName: z.string().optional(),
  size: z.number().optional(),
  type: z.string().optional(),
})

export const studentAdmissionPayloadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  age: z.coerce.number().int().positive('Age must be a positive integer'),
  grade: z.string().optional().nullable().or(z.literal('')),
  gradeId: z.string().optional().nullable().or(z.literal('')),
  sectionId: z.string().min(1, 'Section is required'),
  classId: z.string().optional().nullable().or(z.literal('')),
  rollNumber: z.string().optional().nullable().or(z.literal('')),
  parentContact: z.string().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable().or(z.literal('')),
  idProofUrl: z.string().optional().nullable().or(z.literal('')),
  busRouteId: z.string().optional().nullable().or(z.literal('')),
  
  dateOfBirth: z.string().optional().nullable().or(z.literal('')),
  gender: z.string().optional().nullable().or(z.literal('')),
  bloodGroup: z.string().optional().nullable().or(z.literal('')),
  nationality: z.string().optional().nullable().or(z.literal('')),
  religion: z.string().optional().nullable().or(z.literal('')),
  
  studentPhone: z.string().optional().nullable().or(z.literal('')),
  parentName: z.string().min(2, 'Parent name is required'),
  parentEmail: z.string().email('Valid parent email is required'),
  parentPhone: z.string().min(6, 'Valid parent phone is required'),
  parentOccupation: z.string().optional().nullable().or(z.literal('')),
  emergencyContact: z.string().optional().nullable().or(z.literal('')),
  emergencyPhone: z.string().optional().nullable().or(z.literal('')),
  
  permanentAddress: z.string().optional().nullable().or(z.literal('')),
  temporaryAddress: z.string().optional().nullable().or(z.literal('')),
  city: z.string().optional().nullable().or(z.literal('')),
  state: z.string().optional().nullable().or(z.literal('')),
  pincode: z.string().optional().nullable().or(z.literal('')),
  
  previousSchool: z.string().optional().nullable().or(z.literal('')),
  previousGrade: z.string().optional().nullable().or(z.literal('')),
  admissionDate: z.string().optional().nullable().or(z.literal('')),
  admissionNumber: z.string().optional().nullable().or(z.literal('')),
  academicYear: z.string().optional().nullable().or(z.literal('')),
  
  medicalConditions: z.string().optional().nullable().or(z.literal('')),
  allergies: z.string().optional().nullable().or(z.literal('')),
  medications: z.string().optional().nullable().or(z.literal('')),
  doctorName: z.string().optional().nullable().or(z.literal('')),
  doctorPhone: z.string().optional().nullable().or(z.literal('')),
  
  transportRequired: z.boolean().default(false),
  pickupAddress: z.string().optional().nullable().or(z.literal('')),
  dropAddress: z.string().optional().nullable().or(z.literal('')),
  
  documents: z.array(studentDocumentSchema).optional().default([]),
})

export const studentQueryFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().default(''),
  batchId: z.string().optional().nullable(),
  gradeId: z.string().optional().nullable(),
  sectionId: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
})

export type StudentAdmissionPayload = z.infer<typeof studentAdmissionPayloadSchema>
export type StudentQueryFilter = z.infer<typeof studentQueryFilterSchema>
