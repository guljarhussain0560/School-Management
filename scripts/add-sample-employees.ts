import { PrismaClient } from '@prisma/client'
import { IDService } from '../lib/id-service'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Adding sample employees...')

  // Get the first school
  const school = await prisma.school.findFirst()
  if (!school) {
    console.error('❌ No school found. Please create a school first.')
    return
  }

  console.log(`✅ Found school: ${school.name}`)

  // Initialize ID service
  await IDService.initializeSchool(school.id)

  const sampleEmployees = [
    {
      name: 'John Smith',
      email: 'john.smith@school.com',
      phone: '+1-555-0101',
      address: '123 Main St, City, State 12345',
      dateOfBirth: '1985-03-15',
      department: 'Teaching',
      position: 'Mathematics Teacher',
      salary: 50000,
      emergencyContact: 'Jane Smith',
      emergencyPhone: '+1-555-0102',
      qualifications: 'M.Ed Mathematics, B.Sc Mathematics',
      experience: '5 years teaching experience',
      bankAccount: '1234567890',
      ifscCode: 'BANK0001234',
      panNumber: 'ABCDE1234F',
      aadharNumber: '123456789012',
      notes: 'Excellent teacher with strong analytical skills'
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@school.com',
      phone: '+1-555-0201',
      address: '456 Oak Ave, City, State 12345',
      dateOfBirth: '1990-07-22',
      department: 'Teaching',
      position: 'English Teacher',
      salary: 48000,
      emergencyContact: 'Mike Johnson',
      emergencyPhone: '+1-555-0202',
      qualifications: 'M.A English Literature, B.A English',
      experience: '3 years teaching experience',
      bankAccount: '2345678901',
      ifscCode: 'BANK0001234',
      panNumber: 'FGHIJ5678K',
      aadharNumber: '234567890123',
      notes: 'Creative and engaging teacher'
    },
    {
      name: 'David Wilson',
      email: 'david.wilson@school.com',
      phone: '+1-555-0301',
      address: '789 Pine St, City, State 12345',
      dateOfBirth: '1988-11-10',
      department: 'Administration',
      position: 'Vice Principal',
      salary: 65000,
      emergencyContact: 'Lisa Wilson',
      emergencyPhone: '+1-555-0302',
      qualifications: 'M.Ed Educational Leadership, B.Sc Physics',
      experience: '8 years administrative experience',
      bankAccount: '3456789012',
      ifscCode: 'BANK0001234',
      panNumber: 'LMNOP9012Q',
      aadharNumber: '345678901234',
      notes: 'Strong leadership and organizational skills'
    },
    {
      name: 'Emily Brown',
      email: 'emily.brown@school.com',
      phone: '+1-555-0401',
      address: '321 Elm St, City, State 12345',
      dateOfBirth: '1992-05-18',
      department: 'Teaching',
      position: 'Science Teacher',
      salary: 52000,
      emergencyContact: 'Robert Brown',
      emergencyPhone: '+1-555-0402',
      qualifications: 'M.Sc Chemistry, B.Sc Chemistry',
      experience: '4 years teaching experience',
      bankAccount: '4567890123',
      ifscCode: 'BANK0001234',
      panNumber: 'RSTUV3456W',
      aadharNumber: '456789012345',
      notes: 'Passionate about hands-on learning'
    },
    {
      name: 'Michael Davis',
      email: 'michael.davis@school.com',
      phone: '+1-555-0501',
      address: '654 Maple Dr, City, State 12345',
      dateOfBirth: '1987-09-03',
      department: 'Transport',
      position: 'Bus Driver',
      salary: 35000,
      emergencyContact: 'Susan Davis',
      emergencyPhone: '+1-555-0502',
      qualifications: 'Commercial Driver License, First Aid Certified',
      experience: '6 years driving experience',
      bankAccount: '5678901234',
      ifscCode: 'BANK0001234',
      panNumber: 'WXYZ7890A',
      aadharNumber: '567890123456',
      notes: 'Reliable and safety-conscious driver'
    },
    {
      name: 'Lisa Garcia',
      email: 'lisa.garcia@school.com',
      phone: '+1-555-0601',
      address: '987 Cedar Ln, City, State 12345',
      dateOfBirth: '1991-12-25',
      department: 'Administration',
      position: 'Office Manager',
      salary: 42000,
      emergencyContact: 'Carlos Garcia',
      emergencyPhone: '+1-555-0602',
      qualifications: 'B.A Business Administration, Office Management Certificate',
      experience: '5 years office management experience',
      bankAccount: '6789012345',
      ifscCode: 'BANK0001234',
      panNumber: 'BCDEF1234G',
      aadharNumber: '678901234567',
      notes: 'Excellent organizational and communication skills'
    }
  ]

  for (const empData of sampleEmployees) {
    try {
      // Check if employee already exists
      const existingEmployee = await prisma.employee.findUnique({
        where: { email: empData.email }
      })

      if (existingEmployee) {
        console.log(`⏭️  Employee ${empData.name} already exists, skipping...`)
        continue
      }

      // Determine role based on department/position
      let role: 'ADMIN' | 'TEACHER' | 'TRANSPORT' = 'TEACHER'
      if (empData.department.toLowerCase().includes('admin') || empData.position.toLowerCase().includes('admin')) {
        role = 'ADMIN'
      } else if (empData.department.toLowerCase().includes('transport') || empData.position.toLowerCase().includes('transport')) {
        role = 'TRANSPORT'
      }

      // Generate unique employee ID
      const employeeId = await IDService.generateEmployeeId(role, school.id)

      // Create employee
      const employee = await prisma.employee.create({
        data: {
          employeeId,
          name: empData.name,
          email: empData.email,
          phone: empData.phone,
          address: empData.address,
          dateOfBirth: new Date(empData.dateOfBirth),
          department: empData.department,
          position: empData.position,
          salary: empData.salary,
          emergencyContact: empData.emergencyContact,
          emergencyPhone: empData.emergencyPhone,
          qualifications: empData.qualifications,
          experience: empData.experience,
          bankAccount: empData.bankAccount,
          ifscCode: empData.ifscCode,
          panNumber: empData.panNumber,
          aadharNumber: empData.aadharNumber,
          notes: empData.notes,
          status: 'ACTIVE',
          schoolId: school.id,
          createdBy: school.adminId, // Use school admin as creator
        }
      })

      console.log(`✅ Created employee: ${employee.name} (${employee.employeeId})`)
    } catch (error) {
      console.error(`❌ Error creating employee ${empData.name}:`, error)
    }
  }

  console.log('🎉 Sample employees added successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
