import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const filePath = path.join(process.cwd(), 'data', 'grades.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    const gradesData = JSON.parse(fileContents)

    return NextResponse.json({
      grades: gradesData.grades
    })

  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
