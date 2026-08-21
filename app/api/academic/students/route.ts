import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IDService } from '@/lib/id-service'
import { studentAdmissionPayloadSchema, studentQueryFilterSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/api-handler'
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from '@/lib/errors'
import { Prisma } from '@prisma/client'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.schoolId) {
      throw new UnauthorizedError('Authentication required to access student records')
    }

    const { searchParams } = new URL(request.url)
    const filterParsed = studentQueryFilterSchema.safeParse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 50,
      search: searchParams.get('search') || '',
      batchId: searchParams.get('batchId'),
      gradeId: searchParams.get('gradeId'),
      sectionId: searchParams.get('sectionId'),
      status: searchParams.get('status'),
    })

    const { page, limit, search, batchId, gradeId, sectionId, status } = filterParsed.success
      ? filterParsed.data
      : { page: 1, limit: 50, search: '', batchId: null, gradeId: null, sectionId: null, status: null }

    const skip = (page - 1) * limit

    // Build typed where clause
    const where: Prisma.StudentWhereInput = {
      schoolId: session.user.schoolId
    }

    // Search by text
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filter by batch
    if (batchId && batchId !== 'all') {
      where.batchId = batchId
    }

    // Filter by grade
    if (gradeId && gradeId !== 'all') {
      where.class = {
        gradeId: gradeId
      }
    }

    // Filter by section
    if (sectionId && sectionId !== 'all') {
      where.classId = sectionId
    }

    // Filter by status
    if (status && status !== 'all') {
      where.status = status as any
    }

    // Get students with pagination
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        select: {
          id: true,
          studentId: true,
          name: true,
          email: true,
          age: true,
          rollNumber: true,
          parentContact: true,
          status: true,
          admissionDate: true,
          class: {
            select: {
              id: true,
              classCode: true,
              sectionName: true,
              sectionType: true,
              grade: {
                select: {
                  id: true,
                  gradeName: true,
                  gradeCode: true,
                  gradeLevel: true
                }
              },
              batch: {
                select: { id: true, batchName: true, academicYear: true }
              }
            }
          },
          admissionNumber: true,
          address: true,
          createdAt: true,
          creator: {
            select: { name: true }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.student.count({ where })
    ])

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    return handleApiError(error, request)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      throw new UnauthorizedError('Authentication required to register student')
    }

    if (!['ADMIN', 'TEACHER'].includes(session.user?.role)) {
      throw new ForbiddenError('Unauthorized - Admin or Teacher access required')
    }

    let rawData: Record<string, unknown> = {}
    const contentType = request.headers.get('content-type')

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      
      rawData.name = formData.get('name')
      rawData.email = formData.get('email')
      rawData.age = formData.get('age')
      rawData.grade = formData.get('grade')
      rawData.gradeId = formData.get('gradeId')
      rawData.sectionId = formData.get('sectionId') || formData.get('classId')
      rawData.classId = formData.get('classId') || formData.get('sectionId')
      rawData.rollNumber = formData.get('rollNumber')
      rawData.parentContact = formData.get('parentContact')
      rawData.address = formData.get('address')
      rawData.idProofUrl = formData.get('idProofUrl')
      rawData.busRouteId = formData.get('busRouteId')
      
      rawData.dateOfBirth = formData.get('dateOfBirth')
      rawData.gender = formData.get('gender')
      rawData.bloodGroup = formData.get('bloodGroup')
      rawData.nationality = formData.get('nationality')
      rawData.religion = formData.get('religion')
      
      rawData.studentPhone = formData.get('studentPhone')
      rawData.parentName = formData.get('parentName')
      rawData.parentEmail = formData.get('parentEmail')
      rawData.parentPhone = formData.get('parentPhone')
      rawData.parentOccupation = formData.get('parentOccupation')
      rawData.emergencyContact = formData.get('emergencyContact')
      rawData.emergencyPhone = formData.get('emergencyPhone')
      
      rawData.permanentAddress = formData.get('permanentAddress')
      rawData.temporaryAddress = formData.get('temporaryAddress')
      rawData.city = formData.get('city')
      rawData.state = formData.get('state')
      rawData.pincode = formData.get('pincode')
      
      rawData.previousSchool = formData.get('previousSchool')
      rawData.previousGrade = formData.get('previousGrade')
      rawData.admissionDate = formData.get('admissionDate')
      rawData.admissionNumber = formData.get('admissionNumber')
      rawData.academicYear = formData.get('academicYear')
      
      rawData.medicalConditions = formData.get('medicalConditions')
      rawData.allergies = formData.get('allergies')
      rawData.medications = formData.get('medications')
      rawData.doctorName = formData.get('doctorName')
      rawData.doctorPhone = formData.get('doctorPhone')
      
      rawData.transportRequired = formData.get('transportRequired') === 'true'
      rawData.pickupAddress = formData.get('pickupAddress')
      rawData.dropAddress = formData.get('dropAddress')
      
      const documents: Array<{ name: string; url: string; originalName: string; size: number; type: string }> = []
      const documentFields = [
        'birthCertificate', 'transferCertificate', 'markSheets', 
        'medicalCertificate', 'passportPhoto', 'aadharCard', 'parentIdProof', 'otherDocuments'
      ]
      
      documentFields.forEach(field => {
        const file = formData.get(field) as File | null
        if (file && typeof file.name === 'string') {
          documents.push({
            name: field,
            url: `uploads/${Date.now()}_${file.name}`,
            originalName: file.name,
            size: file.size,
            type: file.type
          })
        }
      })
      
      rawData.documents = documents
    } else {
      rawData = await request.json()
    }

    // Strict schema validation using Zod
    const validationResult = studentAdmissionPayloadSchema.safeParse(rawData)
    if (!validationResult.success) {
      const issueDetails = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
      throw new ValidationError(
        validationResult.error.issues[0]?.message || 'Invalid student registration data',
        issueDetails
      )
    }

    const validPayload = validationResult.data
    const {
      name, email, age, sectionId, address, idProofUrl, busRouteId,
      gender, bloodGroup, nationality, religion,
      studentPhone, parentName, parentEmail, parentPhone, parentOccupation,
      emergencyContact, emergencyPhone, permanentAddress, temporaryAddress,
      city, state, pincode, previousSchool, previousGrade, admissionDate,
      admissionNumber, medicalConditions, allergies, medications,
      doctorName, doctorPhone, transportRequired, pickupAddress, dropAddress,
      documents
    } = validPayload

    // Initialize ID service with school configuration
    if (session.user?.schoolId) {
      await IDService.initializeSchool(session.user.schoolId)
    }

    // Get section (class) information
    const sectionInfo = await prisma.class.findFirst({
      where: { 
        id: sectionId,
        ...(session.user?.schoolId ? { schoolId: session.user.schoolId } : {})
      },
      include: { 
        batch: true,
        grade: true
      }
    })

    if (!sectionInfo) {
      throw new NotFoundError('Section', sectionId)
    }

    const batchInfo = sectionInfo.batch || { batchCode: 'B2026', academicYear: '2026-2027', id: 'b-1' }
    const schoolId = session.user?.schoolId || 'school-default'

    // Generate unique student ID and roll number
    const finalStudentId = await IDService.generateStudentId(batchInfo.batchCode, schoolId)
    const finalRollNumber = await IDService.generateRollNumber(sectionInfo.classCode, batchInfo.academicYear, schoolId)
    const finalAdmissionNumber = admissionNumber || `ADM${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

    // Validate bus route ID if provided
    let validBusRouteId: string | null = null
    if (busRouteId) {
      try {
        const existingRoute = await prisma.busRoute.findUnique({
          where: { id: busRouteId }
        })
        if (existingRoute) {
          validBusRouteId = busRouteId
        }
      } catch (error) {
        logger.warn(`Error validating bus route ID '${busRouteId}'`, {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Create student data object
    const studentCreateData: Prisma.StudentCreateInput = {
      studentId: finalStudentId,
      name,
      email: email || null,
      age: age,
      class: {
        connect: { id: sectionInfo.id }
      },
      rollNumber: finalRollNumber,
      parentContact: parentPhone || '',
      address: address || permanentAddress || temporaryAddress || null,
      idProofUrl: documents?.find(doc => doc.name === 'aadharCard')?.url || idProofUrl || null,
      
      gender: gender || null,
      bloodGroup: bloodGroup || null,
      nationality: nationality || null,
      religion: religion || null,
      
      studentPhone: studentPhone || null,
      parentName: parentName,
      parentEmail: parentEmail,
      parentPhone: parentPhone,
      parentOccupation: parentOccupation || null,
      emergencyContact: emergencyContact || null,
      emergencyPhone: emergencyPhone || null,
      
      permanentAddress: permanentAddress || null,
      temporaryAddress: temporaryAddress || null,
      city: city || null,
      state: state || null,
      pincode: pincode || null,
      
      previousSchool: previousSchool || null,
      previousGrade: previousGrade || null,
      admissionNumber: finalAdmissionNumber,
      academicYear: batchInfo.academicYear,
      batch: {
        connect: { id: batchInfo.id || 'b-1' }
      },
      
      medicalConditions: medicalConditions || null,
      allergies: allergies || null,
      medications: medications || null,
      doctorName: doctorName || null,
      doctorPhone: doctorPhone || null,
      
      transportRequired: transportRequired || false,
      pickupAddress: pickupAddress || null,
      dropAddress: dropAddress || null,
      
      documents: (documents as any) || [],
      school: {
        connect: { id: schoolId }
      },
      creator: {
        connect: { id: session.user?.id || 'admin' }
      }
    }

    if (validBusRouteId) {
      studentCreateData.busRoute = { connect: { id: validBusRouteId } }
    }



    if (validPayload.dateOfBirth) {
      studentCreateData.dateOfBirth = new Date(validPayload.dateOfBirth)
    }
    if (admissionDate) {
      studentCreateData.admissionDate = new Date(admissionDate)
    } else {
      studentCreateData.admissionDate = new Date()
    }

    // Create student in database
    const student = await prisma.student.create({
      data: studentCreateData,
      include: {
        class: {
          select: { classCode: true, sectionName: true }
        }
      }
    })

    const createdAtDate = student.createdAt ? new Date(student.createdAt) : new Date()

    return NextResponse.json({
      message: 'Student enrolled successfully',
      student: {
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        grade: student.class?.classCode || 'Unknown',
        rollNumber: student.rollNumber,
        admissionNumber: student.admissionNumber,
        enrolledDate: createdAtDate.toISOString().split('T')[0],
        status: (student as any).status || 'PENDING'
      }
    }, { status: 201 })

  } catch (error) {
    return handleApiError(error, request)
  }
}
