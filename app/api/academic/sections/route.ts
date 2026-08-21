import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IDService } from '@/lib/id-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const gradeId = searchParams.get('gradeId');
    const batchId = searchParams.get('batchId');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId!
    };

    if (gradeId && gradeId !== 'all') {
      where.gradeId = gradeId;
    }

    if (batchId && batchId !== 'all') {
      where.batchId = batchId;
    }

    if (search) {
      where.OR = [
        { sectionName: { contains: search, mode: 'insensitive' } },
        { classCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [sections, totalCount] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { grade: { gradeLevel: 'asc' } },
          { sectionName: 'asc' }
        ],
        include: {
          grade: {
            select: { id: true, gradeName: true, gradeCode: true, gradeLevel: true }
          },
          batch: {
            select: { id: true, batchName: true, academicYear: true }
          },
          creator: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: { students: true }
          }
        }
      }),
      prisma.class.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      sections,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });

  } catch (error) {
    logger.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      sectionName,
      sectionType,
      description,
      capacity = 30,
      gradeId,
      batchId
    } = await request.json();

    if (!sectionName || !sectionType || !gradeId || !batchId) {
      return NextResponse.json(
        { error: 'Section name, type, grade, and batch are required' },
        { status: 400 }
      );
    }

    // Get grade and batch information
    const [grade, batch] = await Promise.all([
      prisma.grade.findUnique({
        where: { id: gradeId },
        select: { gradeCode: true, gradeName: true }
      }),
      prisma.studentBatch.findUnique({
        where: { id: batchId },
        select: { batchCode: true }
      })
    ]);

    if (!grade) {
      return NextResponse.json(
        { error: 'Invalid grade ID' },
        { status: 400 }
      );
    }

    if (!batch) {
      return NextResponse.json(
        { error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    // Initialize ID service with school configuration
    await IDService.initializeSchool(session.user.schoolId!);

    // Generate unique class code
    const classCode = await IDService.generateClassCode(
      batch.batchCode, 
      grade.gradeCode, 
      sectionName, 
      session.user.schoolId!
    );

    // Check if section already exists in the same grade
    const existingSection = await prisma.class.findFirst({
      where: {
        sectionName,
        gradeId,
        schoolId: session.user.schoolId!
      }
    });

    if (existingSection) {
      return NextResponse.json(
        { error: 'Section already exists in this grade' },
        { status: 400 }
      );
    }

    const newSection = await prisma.class.create({
      data: {
        sectionName,
        sectionType,
        classCode,
        description: description || null,
        capacity,
        gradeId,
        batchId,
        schoolId: session.user.schoolId!,
        createdBy: session.user.id
      },
      include: {
        grade: {
          select: { id: true, gradeName: true, gradeCode: true, gradeLevel: true }
        },
        batch: {
          select: { id: true, batchName: true, academicYear: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { students: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Section created successfully',
      section: newSection
    });

  } catch (error) {
    logger.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}
