import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.schoolId || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get student details with all related information
    const student = await prisma.student.findUnique({
      where: { 
        id: params.id,
        schoolId: session.user.schoolId // Ensure student belongs to admin's school
      },
      include: {
        creator: {
          select: { name: true, email: true }
        },
        busRoute: {
          select: { routeName: true, id: true }
        },
        school: {
          select: { name: true, id: true }
        },
        class: {
          select: { className: true, classCode: true }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Format the response with all student details
    const studentDetails = {
      id: student.id,
      name: student.name,
      email: student.email,
      age: student.age,
      grade: student.class?.className || 'Unknown',
      rollNumber: student.rollNumber,
      parentContact: student.parentContact,
      address: student.address,
      idProofUrl: student.idProofUrl,
      
      // Personal Information
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      bloodGroup: student.bloodGroup,
      nationality: student.nationality,
      religion: student.religion,
      
      // Contact Information
      studentPhone: student.studentPhone,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      parentOccupation: student.parentOccupation,
      emergencyContact: student.emergencyContact,
      emergencyPhone: student.emergencyPhone,
      
      // Address Information
      permanentAddress: student.permanentAddress,
      temporaryAddress: student.temporaryAddress,
      city: student.city,
      state: student.state,
      pincode: student.pincode,
      
      // Academic Information
      previousSchool: student.previousSchool,
      previousGrade: student.previousGrade,
      admissionDate: student.admissionDate,
      admissionNumber: student.admissionNumber,
      academicYear: student.academicYear,
      
      // Medical Information
      medicalConditions: student.medicalConditions,
      allergies: student.allergies,
      medications: student.medications,
      doctorName: student.doctorName,
      doctorPhone: student.doctorPhone,
      
      // Transport Information
      transportRequired: student.transportRequired,
      pickupAddress: student.pickupAddress,
      dropAddress: student.dropAddress,
      busRoute: student.busRoute,
      
      // Documents
      documents: student.documents,
      
      // Metadata
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      createdBy: student.creator,
      school: student.school
    }

    return NextResponse.json({ student: studentDetails })

  } catch (error) {
    console.error('Error fetching student details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
