import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const grade = searchParams.get('grade')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId
    }

    if (grade) {
      where.grade = grade
    }

    // Get students with pagination
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        select: {
          id: true,
          name: true,
          age: true,
          grade: true,
          parentContact: true,
          address: true,
          createdAt: true,
          creator: {
            select: {
              name: true
            }
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
    console.error('Get students error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Teacher access required' },
        { status: 403 }
      )
    }

    // Handle both JSON and FormData
    let studentData: any = {}
    
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      
      // Basic Information (from Prisma schema)
      studentData.name = formData.get('name') as string
      studentData.email = formData.get('email') as string
      studentData.age = formData.get('age') as string
      studentData.grade = formData.get('grade') as string
      studentData.rollNumber = formData.get('rollNumber') as string
      studentData.parentContact = formData.get('parentContact') as string
      studentData.address = formData.get('address') as string
      studentData.idProofUrl = formData.get('idProofUrl') as string
      studentData.busRouteId = formData.get('busRouteId') as string
      
      // Personal Information
      studentData.dateOfBirth = formData.get('dateOfBirth') as string
      studentData.gender = formData.get('gender') as string
      studentData.bloodGroup = formData.get('bloodGroup') as string
      studentData.nationality = formData.get('nationality') as string
      studentData.religion = formData.get('religion') as string
      
      // Contact Information
      studentData.studentPhone = formData.get('studentPhone') as string
      studentData.parentName = formData.get('parentName') as string
      studentData.parentEmail = formData.get('parentEmail') as string
      studentData.parentPhone = formData.get('parentPhone') as string
      studentData.parentOccupation = formData.get('parentOccupation') as string
      studentData.emergencyContact = formData.get('emergencyContact') as string
      studentData.emergencyPhone = formData.get('emergencyPhone') as string
      
      // Address Information
      studentData.permanentAddress = formData.get('permanentAddress') as string
      studentData.temporaryAddress = formData.get('temporaryAddress') as string
      studentData.city = formData.get('city') as string
      studentData.state = formData.get('state') as string
      studentData.pincode = formData.get('pincode') as string
      
      // Academic Information
      studentData.previousSchool = formData.get('previousSchool') as string
      studentData.previousGrade = formData.get('previousGrade') as string
      studentData.admissionDate = formData.get('admissionDate') as string
      studentData.admissionNumber = formData.get('admissionNumber') as string
      studentData.academicYear = formData.get('academicYear') as string
      
      // Medical Information
      studentData.medicalConditions = formData.get('medicalConditions') as string
      studentData.allergies = formData.get('allergies') as string
      studentData.medications = formData.get('medications') as string
      studentData.doctorName = formData.get('doctorName') as string
      studentData.doctorPhone = formData.get('doctorPhone') as string
      
      // Transport Information
      studentData.transportRequired = formData.get('transportRequired') === 'true'
      studentData.pickupAddress = formData.get('pickupAddress') as string
      studentData.dropAddress = formData.get('dropAddress') as string
      
      // Handle document files
      const documents: any[] = []
      const documentFields = [
        'birthCertificate', 'transferCertificate', 'markSheets', 
        'medicalCertificate', 'passportPhoto', 'aadharCard', 'parentIdProof', 'otherDocuments'
      ]
      
      documentFields.forEach(field => {
        const file = formData.get(field) as File
        if (file) {
          documents.push({
            name: field,
            url: `uploads/${Date.now()}_${file.name}`,
            originalName: file.name,
            size: file.size,
            type: file.type
          })
        }
      })
      
      studentData.documents = documents
    } else {
      const body = await request.json()
      studentData = body
    }

    const {
      name, email, age, grade, rollNumber, parentContact, address, idProofUrl, busRouteId,
      dateOfBirth, gender, bloodGroup, nationality, religion,
      studentPhone, parentName, parentEmail, parentPhone, parentOccupation,
      emergencyContact, emergencyPhone, permanentAddress, temporaryAddress,
      city, state, pincode, previousSchool, previousGrade, admissionDate,
      admissionNumber, academicYear, medicalConditions, allergies, medications,
      doctorName, doctorPhone, transportRequired, pickupAddress, dropAddress,
      documents
    } = studentData

    // Validation
    if (!name || !age || !grade || !parentName || !parentEmail || !parentPhone) {
      return NextResponse.json(
        { error: 'Name, Age, Grade, Parent Name, Parent Email, and Parent Phone are required' },
        { status: 400 }
      )
    }

    // Generate unique roll number and admission number if not provided
    const finalRollNumber = rollNumber || `STU${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const finalAdmissionNumber = admissionNumber || `ADM${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

    // Validate bus route ID if provided
    let validBusRouteId = null
    if (busRouteId) {
      try {
        const existingRoute = await prisma.busRoute.findUnique({
          where: { id: busRouteId }
        })
        if (existingRoute) {
          validBusRouteId = busRouteId
        } else {
          console.warn(`Bus Route ID '${busRouteId}' not found in database, setting to null`)
        }
      } catch (error) {
        console.warn(`Error validating bus route ID '${busRouteId}':`, error)
      }
    }

    // Create student data object
    const studentCreateData: any = {
      name,
      email,
      age: parseInt(age),
      grade,
      rollNumber: finalRollNumber,
      parentContact,
      address,
      idProofUrl: documents?.find((doc: any) => doc.name === 'aadharCard')?.url || idProofUrl,
      
      // Personal Information
      gender,
      bloodGroup,
      nationality,
      religion,
      
      // Contact Information
      studentPhone,
      parentName,
      parentEmail,
      parentPhone,
      parentOccupation,
      emergencyContact,
      emergencyPhone,
      
      // Address Information
      permanentAddress,
      temporaryAddress,
      city,
      state,
      pincode,
      
      // Academic Information
      previousSchool,
      previousGrade,
      admissionNumber: finalAdmissionNumber,
      academicYear,
      
      // Medical Information
      medicalConditions,
      allergies,
      medications,
      doctorName,
      doctorPhone,
      
      // Transport Information
      transportRequired: transportRequired || false,
      pickupAddress,
      dropAddress,
      busRouteId: validBusRouteId,
      
      // Documents
      documents: documents || [],
      
      schoolId: session.user.schoolId!,
      createdBy: session.user.id,
    }

    // Add optional date fields
    if (dateOfBirth) {
      studentCreateData.dateOfBirth = new Date(dateOfBirth)
    }
    if (admissionDate) {
      studentCreateData.admissionDate = new Date(admissionDate)
    } else {
      studentCreateData.admissionDate = new Date()
    }

    // Create student
    const student = await prisma.student.create({
      data: studentCreateData
    })

    return NextResponse.json({
      message: 'Student enrolled successfully',
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        enrolledDate: student.createdAt.toISOString().split('T')[0],
        status: (student as any).status || 'PENDING'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
