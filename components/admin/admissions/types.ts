export interface StudentAdmissionData {
  id?: string
  studentId?: string
  name: string
  email: string
  age: string | number
  grade: string
  classId?: string
  rollNumber: string
  parentContact: string
  address: string
  idProofUrl?: string
  busRouteId?: string
  status?: string
  admissionStatus?: string
  createdAt?: string
  
  // Personal
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  nationality?: string
  religion?: string
  
  // Contact
  studentPhone?: string
  parentName?: string
  parentEmail?: string
  parentPhone?: string
  parentOccupation?: string
  emergencyContact?: string
  emergencyPhone?: string
  
  // Address
  permanentAddress?: string
  temporaryAddress?: string
  city?: string
  state?: string
  pincode?: string
  
  // Academic
  previousSchool?: string
  previousGrade?: string
  admissionDate?: string
  admissionNumber?: string
  academicYear?: string
  
  // Medical
  medicalConditions?: string
  allergies?: string
  medications?: string
  doctorName?: string
  doctorPhone?: string
  
  // Transport
  transportRequired?: boolean
  pickupAddress?: string
  dropAddress?: string
}

export interface StudentFormState {
  name: string
  email: string
  age: string
  grade: string
  rollNumber: string
  parentContact: string
  address: string
  idProofUrl: string
  busRouteId: string
  
  dateOfBirth: string
  gender: string
  bloodGroup: string
  nationality: string
  religion: string
  
  studentPhone: string
  parentName: string
  parentEmail: string
  parentPhone: string
  parentOccupation: string
  emergencyContact: string
  emergencyPhone: string
  
  permanentAddress: string
  temporaryAddress: string
  city: string
  state: string
  pincode: string
  
  previousSchool: string
  previousGrade: string
  admissionDate: string
  admissionNumber: string
  academicYear: string
  
  medicalConditions: string
  allergies: string
  medications: string
  doctorName: string
  doctorPhone: string
  
  transportRequired: boolean
  pickupAddress: string
  dropAddress: string
  
  birthCertificate: File | null
  transferCertificate: File | null
  markSheets: File | null
  medicalCertificate: File | null
  passportPhoto: File | null
  aadharCard: File | null
  parentIdProof: File | null
  otherDocuments: File | null
}

export interface AdmissionApplication {
  id: string | number
  name: string
  grade: string
  enrolledDate?: string
  createdAt?: string
  status: string
}

export interface AdmissionStats {
  approved: number
  pending: number
  underReview: number
  rejected: number
}
