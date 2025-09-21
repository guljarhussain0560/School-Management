import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Only Excel files (.xlsx, .xls) are allowed' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data found in the Excel file' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      errors: 0,
      total: data.length,
      errorDetails: [] as string[]
    }

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any
      
      try {
        // Validate required fields
        const subject = row.subject || row.Subject
        const grade = row.grade || row.Grade
        const module = row.module || row.Module
        const progress = row.progress || row.Progress

        if (!subject || !grade || !module || progress === undefined) {
          results.errors++
          results.errorDetails.push(`Row ${i + 2}: Missing required fields (subject, grade, module, progress)`)
          continue
        }

        const progressNum = parseFloat(progress)
        if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
          results.errors++
          results.errorDetails.push(`Row ${i + 2}: Invalid progress value (must be 0-100)`)
          continue
        }

        // Upsert curriculum progress
        await prisma.curriculumProgress.upsert({
          where: {
            subject_grade_module_schoolId: {
              subject: String(subject),
              grade: String(grade),
              module: String(module),
              schoolId: session.user.schoolId ?? ''
            }
          },
          update: {
            progress: progressNum,
            updatedBy: session.user.id
          },
          create: {
            subject: String(subject),
            grade: String(grade),
            module: String(module),
            progress: progressNum,
            schoolId: session.user.schoolId ?? '',
            updatedBy: session.user.id
          }
        })

        results.success++
      } catch (error) {
        results.errors++
        results.errorDetails.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: 'Excel upload completed',
      results
    })

  } catch (error) {
    console.error('Error processing Excel upload:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
