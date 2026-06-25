export interface BusItem {
  id: string
  busNumber: string
  busName?: string
  capacity: number
  driverName?: string
  driverPhone?: string
  conductorName?: string
  conductorPhone?: string
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'
  routes?: Array<{
    id: string
    routeName: string
    status: string
  }>
}

export interface BusRouteItem {
  id: string
  routeName: string
  busId: string
  status: 'ON_TIME' | 'DELAYED' | 'CANCELLED'
  delayReason?: string
  delayMinutes?: number
  lastUpdated?: string
  bus?: {
    id: string
    busNumber: string
    busName?: string
    driverName?: string
    capacity: number
  }
  manager?: {
    id: string
    name: string
    email: string
  }
  students?: Array<{
    id: string
    studentId: string
    name: string
    grade: string
  }>
}
