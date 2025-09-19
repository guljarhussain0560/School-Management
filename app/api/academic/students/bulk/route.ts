import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.schoolId || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)
    
    console.log('Processing file:', file.name, 'with', jsonData.length, 'rows')

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 })
    }

    const students = []
    const errors = []

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any
      
      try {
        // Validate required fields
        if (!row['Name'] || !row['Age'] || !row['Grade'] || !row['Parent Name'] || !row['Parent Email'] || !row['Parent Phone']) {
          errors.push(`Row ${i + 2}: Missing required fields (Name, Age, Grade, Parent Name, Parent Email, Parent Phone)`)
          continue
        }

        // Generate unique roll number and admission number
        const rollNumber = `STU${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const admissionNumber = `ADM${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

        // Validate bus route ID if provided
        let validBusRouteId = null
        const busRouteIdFromExcel = row['Bus Route ID']?.toString().trim()
        if (busRouteIdFromExcel) {
          try {
            const existingRoute = await prisma.busRoute.findUnique({
              where: { id: busRouteIdFromExcel }
            })
            if (existingRoute) {
              validBusRouteId = busRouteIdFromExcel
            } else {
              console.warn(`Bus Route ID '${busRouteIdFromExcel}' not found in database, setting to null`)
            }
          } catch (error) {
            console.warn(`Error validating bus route ID '${busRouteIdFromExcel}':`, error)
          }
        }

        // Handle documents from Excel (document-name_url format)
        const documents: any[] = []
        const documentFields = [
          'Birth Certificate URL', 'Transfer Certificate URL', 'Mark Sheets URL',
          'Medical Certificate URL', 'Passport Photo URL', 'Aadhar Card URL', 'Parent ID Proof URL', 'Other Documents URL'
        ]

        documentFields.forEach(field => {
          const url = row[field]?.toString().trim()
          if (url) {
            documents.push({
              name: field.toLowerCase().replace(' url', '').replace(/\s+/g, '_'),
              url: url,
              originalName: url.split('/').pop() || '',
              size: 0,
              type: 'application/octet-stream'
            })
          }
        })

        const studentData = {
          name: row['Name'].toString().trim(),
          email: row['Email']?.toString().trim() || '',
          age: parseInt(row['Age']),
          grade: row['Grade'].toString().trim(),
          rollNumber: row['Roll Number']?.toString().trim() || rollNumber,
          parentContact: row['Parent Contact']?.toString().trim() || '',
          address: row['Address']?.toString().trim() || '',
          idProofUrl: row['ID Proof URL']?.toString().trim() || null,
          busRouteId: validBusRouteId,
          
          // Personal Information
          dateOfBirth: row['Date of Birth'] ? new Date(row['Date of Birth']) : null,
          gender: row['Gender']?.toString().trim() || '',
          bloodGroup: row['Blood Group']?.toString().trim() || '',
          nationality: row['Nationality']?.toString().trim() || '',
          religion: row['Religion']?.toString().trim() || '',
          
          // Contact Information
          studentPhone: row['Student Phone']?.toString().trim() || '',
          parentName: row['Parent Name']?.toString().trim() || '',
          parentEmail: row['Parent Email']?.toString().trim() || '',
          parentPhone: row['Parent Phone']?.toString().trim() || '',
          parentOccupation: row['Parent Occupation']?.toString().trim() || '',
          emergencyContact: row['Emergency Contact']?.toString().trim() || '',
          emergencyPhone: row['Emergency Phone']?.toString().trim() || '',
          
          // Address Information
          permanentAddress: row['Permanent Address']?.toString().trim() || '',
          temporaryAddress: row['Temporary Address']?.toString().trim() || '',
          city: row['City']?.toString().trim() || '',
          state: row['State']?.toString().trim() || '',
          pincode: row['Pincode']?.toString().trim() || '',
          
          // Academic Information
          previousSchool: row['Previous School']?.toString().trim() || '',
          previousGrade: row['Previous Grade']?.toString().trim() || '',
          admissionDate: row['Admission Date'] ? new Date(row['Admission Date']) : new Date(),
          admissionNumber: row['Admission Number']?.toString().trim() || admissionNumber,
          academicYear: row['Academic Year']?.toString().trim() || '',
          
          // Medical Information
          medicalConditions: row['Medical Conditions']?.toString().trim() || '',
          allergies: row['Allergies']?.toString().trim() || '',
          medications: row['Medications']?.toString().trim() || '',
          doctorName: row['Doctor Name']?.toString().trim() || '',
          doctorPhone: row['Doctor Phone']?.toString().trim() || '',
          
          // Transport Information
          transportRequired: row['Transport Required']?.toString().toLowerCase() === 'yes',
          pickupAddress: row['Pickup Address']?.toString().trim() || '',
          dropAddress: row['Drop Address']?.toString().trim() || '',
          
          // Documents
          documents: documents,
          
          schoolId: session.user.schoolId!,
          createdBy: session.user.id,
        }

        // Create student
        const student = await prisma.student.create({
          data: studentData
        })

        students.push(student)
        console.log(`Successfully created student: ${student.name}`)
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error)
        errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${students.length} students`,
      students,
      errors: errors.length > 0 ? errors : undefined,
      totalProcessed: jsonData.length,
      successCount: students.length,
      errorCount: errors.length
    }, { status: 201 })

  } catch (error) {
    console.error('Error in bulk student upload:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk upload' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return template data for download
    const templateData = [
      // Headers - All fields from Prisma schema organized by sections
      ['Name', 'Email', 'Age', 'Grade', 'Roll Number', 'Parent Contact', 'Address', 'ID Proof URL', 'Bus Route ID',
       'Date of Birth', 'Gender', 'Blood Group', 'Nationality', 'Religion',
       'Student Phone', 'Parent Name', 'Parent Email', 'Parent Phone', 'Parent Occupation', 'Emergency Contact', 'Emergency Phone',
       'Permanent Address', 'Temporary Address', 'City', 'State', 'Pincode',
       'Previous School', 'Previous Grade', 'Admission Date', 'Admission Number', 'Academic Year',
       'Medical Conditions', 'Allergies', 'Medications', 'Doctor Name', 'Doctor Phone',
       'Transport Required', 'Pickup Address', 'Drop Address',
       'Birth Certificate URL', 'Transfer Certificate URL', 'Mark Sheets URL', 'Medical Certificate URL', 'Passport Photo URL', 'Aadhar Card URL', 'Parent ID Proof URL', 'Other Documents URL'],
      // Sample Data Row
      ['John Doe', 'john@example.com', '10', 'Grade 5', 'STU001', '+1234567890', '123 Main St', 'https://example.com/id.pdf', 'route-a',
       '2014-05-15', 'Male', 'O+', 'Indian', 'Hindu',
       '+1234567891', 'Jane Doe', 'jane@example.com', '+1234567892', 'Teacher', 'Bob Doe', '+1234567893',
       '123 Main St', '123 Main St', 'Mumbai', 'Maharashtra', '400001',
       'ABC School', 'Grade 4', '2024-01-15', 'ADM001', '2024-25',
       'None', 'None', 'None', 'Dr. Smith', '+1234567894',
       'Yes', '123 Main St', '456 School St',
       'https://example.com/birth.pdf', 'https://example.com/transfer.pdf', 'https://example.com/marks.pdf', 'https://example.com/medical.pdf', 'https://example.com/photo.jpg', 'https://example.com/aadhar.pdf', 'https://example.com/parent_id.pdf', 'https://example.com/other.pdf']
    ]

    return NextResponse.json({
      template: templateData,
      headers: templateData[0],
      sampleData: templateData.slice(1)
    })

  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}
