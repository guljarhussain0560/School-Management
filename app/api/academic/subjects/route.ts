import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import subjectsData from '@/data/subjects.json'

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

    // If grade is specified, return subjects for that grade only
    if (grade && grade !== 'all') {
      const gradeSubjects = subjectsData[grade as keyof typeof subjectsData] || []
      return NextResponse.json({
        subjects: gradeSubjects,
        grade: grade
      })
    }

    // Return all subjects organized by grade
    return NextResponse.json({
      subjectsByGrade: subjectsData,
      allSubjects: Object.values(subjectsData).flat().filter((subject, index, self) => 
        self.indexOf(subject) === index
      ).sort()
    })

  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
