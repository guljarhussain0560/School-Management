import { PrismaClient, RouteStatus, MaintenanceStatus, AlertType, AlertPriority, AlertStatus } from '@prisma/client'

export async function seedTransport(
  prisma: PrismaClient,
  context: { adminId: string; transportId: string; schoolId: string; studentIds: string[] }
) {
  const { transportId, schoolId, studentIds } = context

  const buses = await Promise.all([
    prisma.bus.upsert({
      where: { busNumber: 'ABCR01L001' },
      update: {},
      create: {
        id: 'bus-001',
        busNumber: 'ABCR01L001',
        busName: 'School Bus 1',
        capacity: 50,
        driverName: 'John Driver',
        driverPhone: '+1234567890',
        conductorName: 'Jane Conductor',
        conductorPhone: '+1234567891',
        status: 'ACTIVE',
        schoolId,
      },
    }),
    prisma.bus.upsert({
      where: { busNumber: 'ABCR02M001' },
      update: {},
      create: {
        id: 'bus-002',
        busNumber: 'ABCR02M001',
        busName: 'School Bus 2',
        capacity: 45,
        driverName: 'Mike Driver',
        driverPhone: '+1234567892',
        conductorName: 'Sarah Conductor',
        conductorPhone: '+1234567893',
        status: 'ACTIVE',
        schoolId,
      },
    }),
  ])

  const busRoutes = await Promise.all([
    prisma.busRoute.upsert({
      where: { id: 'route-a' },
      update: {},
      create: {
        id: 'route-a',
        routeName: 'Route A',
        busId: buses[0].id,
        status: RouteStatus.ON_TIME,
        managedBy: transportId,
        schoolId,
      },
    }),
    prisma.busRoute.upsert({
      where: { id: 'route-b' },
      update: {},
      create: {
        id: 'route-b',
        routeName: 'Route B',
        busId: buses[1].id,
        status: RouteStatus.DELAYED,
        delayReason: 'Traffic',
        managedBy: transportId,
        schoolId,
      },
    }),
  ])

  await prisma.maintenanceItem.upsert({
    where: { id: 'maintenance-1' },
    update: {},
    create: {
      id: 'maintenance-1',
      name: 'Library Air Conditioning',
      description: 'Central air conditioning system for the library',
      status: MaintenanceStatus.OK,
      lastChecked: new Date('2024-01-15'),
      schoolId,
    },
  })

  await prisma.safetyAlert.upsert({
    where: { id: 'alert-1' },
    update: {},
    create: {
      id: 'alert-1',
      alertId: 'ABCFD20240315001',
      type: AlertType.DELAY,
      priority: AlertPriority.MEDIUM,
      description: 'Bus #02 delayed due to traffic',
      status: AlertStatus.ACTIVE,
      createdBy: transportId,
      schoolId,
    },
  })

  if (studentIds[0]) {
    await prisma.student.update({
      where: { id: studentIds[0] },
      data: { busRouteId: busRoutes[0].id },
    })
  }

  if (studentIds[1]) {
    await prisma.student.update({
      where: { id: studentIds[1] },
      data: { busRouteId: busRoutes[1].id },
    })
  }

  return { buses, busRoutes }
}
