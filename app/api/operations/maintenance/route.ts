import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const maintenanceItems = await prisma.maintenanceItem.findMany({
      orderBy: { lastChecked: 'desc' }
    });

    return NextResponse.json({ maintenanceItems });
  } catch (error) {
    console.error('Error fetching maintenance items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, status } = await request.json();

    if (!name || !status) {
      return NextResponse.json(
        { error: 'Name and status are required' },
        { status: 400 }
      );
    }

    const maintenanceItem = await prisma.maintenanceItem.create({
      data: {
        name,
        description: description || null,
        status,
        lastChecked: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Maintenance item created successfully',
      item: maintenanceItem
    });
  } catch (error) {
    console.error('Error creating maintenance item:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const itemId = formData.get('itemId') as string;
    const notes = formData.get('notes') as string;
    const photo = formData.get('photo') as File | null;

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      notes: notes || null,
      lastChecked: new Date()
    };

    // Handle photo upload if provided
    if (photo && photo.size > 0) {
      // In a real application, you would upload the photo to a cloud storage service
      // For now, we'll just store the filename
      updateData.photoUrl = photo.name;
    }

    const updatedItem = await prisma.maintenanceItem.update({
      where: { id: parseInt(itemId) },
      data: updateData
    });

    return NextResponse.json({ 
      message: 'Maintenance item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Error updating maintenance item:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance item' },
      { status: 500 }
    );
  }
}